/**
 * History Article controller with enhanced functionality similar to Events and Gallery
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::history-article.history-article', ({ strapi }) => ({
  
  // GET /history-articles
  async find(ctx) {
    console.log('📚 Fetching history articles with enhanced data');
    
    const { data, meta } = await super.find(ctx);
    
    // Debug info o history categories
    const categories = data.reduce((acc, article) => {
      const category = article?.attributes?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🎯 History category distribution:', categories);
    
    return { data, meta };
  },

  // POST /history-articles  
  async create(ctx) {
    console.log('📝 Creating history article with enhanced functionality');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured article naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers();
      console.log('🎯 Auto-unfeatured all other articles - this one is now the only featured');
    }

    // Auto-generate readTime based on content
    if (data.mainContent && data.intro) {
      const wordCount = this.calculateWordCount(data.intro, data.mainContent);
      data.readTime = Math.ceil(wordCount / 200); // Average reading speed 200 words/minute
      console.log(`⏱️ Auto-calculated reading time: ${data.readTime} minutes (${wordCount} words)`);
    }

    // Auto-generate SEO fields if not provided
    if (!data.seoTitle && data.title) {
      data.seoTitle = data.title.substring(0, 60);
    }
    if (!data.seoDescription && data.description) {
      data.seoDescription = data.description.substring(0, 160);
    }
    
    const result = await super.create(ctx);
    
    console.log('✅ History article created with enhanced functionality');
    return result;
  },

  // PUT /history-articles/:id
  async update(ctx) {
    console.log('📝 Updating history article');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured article naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers(ctx.params.id);
      console.log('🎯 Auto-unfeatured all other articles - this one is now the only featured');
    }

    // Auto-update readTime if content changed
    if (data.mainContent || data.intro) {
      // Get current article to merge content
      const currentArticle = await strapi.entityService.findOne('api::history-article.history-article', ctx.params.id);
      const intro = data.intro || currentArticle.intro;
      const mainContent = data.mainContent || currentArticle.mainContent;
      
      const wordCount = this.calculateWordCount(intro, mainContent);
      data.readTime = Math.ceil(wordCount / 200);
      console.log(`⏱️ Auto-updated reading time: ${data.readTime} minutes`);
    }
    
    const result = await super.update(ctx);
    
    console.log('✅ History article updated');
    return result;
  },

  // Custom endpoint: GET /history-articles/featured
  async featured(ctx) {
    const articles = await strapi.entityService.findMany('api::history-article.history-article', {
      filters: {
        featured: true
      },
      populate: {
        heroImage: true,
        mainImage: true,
        images: true
      }
    });
    
    console.log(`⭐ Found ${articles.length} featured history articles`);
    return { data: articles };
  },

  // Custom endpoint: GET /history-articles/by-category/:category
  async byCategory(ctx) {
    const { category } = ctx.params;
    
    const articles = await strapi.entityService.findMany('api::history-article.history-article', {
      filters: {
        category: category
      },
      populate: {
        heroImage: true,
        mainImage: true
      },
      sort: { publishedDate: 'desc' }
    });
    
    console.log(`📂 Found ${articles.length} articles in category: ${category}`);
    return { data: articles };
  },

  // Custom endpoint: GET /history-articles/recent (3 najnovšie)
  async recent(ctx) {
    const articles = await strapi.entityService.findMany('api::history-article.history-article', {
      sort: { publishedDate: 'desc' },
      limit: 3,
      populate: {
        heroImage: true,
        mainImage: true
      }
    });
    
    console.log(`🆕 Found ${articles.length} recent history articles`);
    return { data: articles };
  },

  // Helper function na odznačenie všetkých ostatných featured articles
  async unfeaturedAllOthers(excludeId = null) {
    try {
      const whereCondition = excludeId 
        ? { featured: true, documentId: { $ne: excludeId } }
        : { featured: true };

      await strapi.db.query('api::history-article.history-article').updateMany({
        where: whereCondition,
        data: { featured: false }
      });
      
      console.log('🔄 Unfeatured all other history articles');
    } catch (error) {
      console.error('❌ Error unfeaturing other articles:', error);
    }
  },

  // Helper function na počítanie slov
  calculateWordCount(intro, content) {
    let wordCount = 0;
    
    // Count words in intro (richtext)
    if (intro) {
      const introText = intro.replace(/<[^>]*>/g, ''); // Remove HTML tags
      wordCount += introText.split(/\s+/).filter(word => word.length > 0).length;
    }
    
    // Count words in content (JSON structure)
    if (content && typeof content === 'object' && content !== null) {
      if ((content as any).sections) {
        (content as any).sections.forEach((section: any) => {
          if (section.content) {
            wordCount += section.content.split(/\s+/).filter(word => word.length > 0).length;
          }
          if (section.quote) {
            wordCount += section.quote.split(/\s+/).filter(word => word.length > 0).length;
          }
          if (section.additionalContent) {
            section.additionalContent.forEach(additional => {
              wordCount += additional.split(/\s+/).filter(word => word.length > 0).length;
            });
          }
        });
      }
    }
    
    return wordCount;
  }
}));