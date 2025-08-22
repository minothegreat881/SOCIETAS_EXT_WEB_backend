/**
 * Activity controller with auto-unfeaturing logic similar to Events
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::activity.activity', ({ strapi }) => ({
  
  // GET /activities
  async find(ctx) {
    console.log('📅 Fetching activities with enhanced data');
    
    const { data, meta } = await super.find(ctx);
    
    // Debug info o activity categories
    const categories = data.reduce((acc, activity) => {
      const category = activity?.attributes?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🎭 Activity category distribution:', categories);
    
    return { data, meta };
  },

  // POST /activities  
  async create(ctx) {
    console.log('📤 Creating activity with enhanced functionality');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured activity naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers();
      console.log('🎯 Auto-unfeatured all other activities - this one is now the only featured');
    }
    
    // Validácia dátumov
    if (data.eventDate && data.endDate) {
      const startDate = new Date(data.eventDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        return ctx.badRequest('End date must be after start date');
      }
    }
    
    const result = await super.create(ctx);
    
    console.log('✅ Activity created with enhanced functionality');
    return result;
  },

  // PUT /activities/:id
  async update(ctx) {
    console.log('📝 Updating activity');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured activity naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers(ctx.params.id);
      console.log('🎯 Auto-unfeatured all other activities - this one is now the only featured');
    }
    
    // Validácia dátumov
    if (data.eventDate && data.endDate) {
      const startDate = new Date(data.eventDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        return ctx.badRequest('End date must be after start date');
      }
    }
    
    const result = await super.update(ctx);
    
    console.log('✅ Activity updated');
    return result;
  },

  // Custom endpoint: GET /activities/upcoming (3 najnovšie pridané aktivity)
  async upcoming(ctx) {
    const activities = await strapi.entityService.findMany('api::activity.activity', {
      sort: { createdAt: 'desc' },
      limit: 3,
      populate: {
        coverImage: true,
        coordinates: true
      }
    });
    
    console.log(`🆕 Found ${activities.length} recent activities for homepage`);
    return { data: activities };
  },

  // Custom endpoint: GET /activities/recent (3 najnovšie pridané aktivity)
  async recent(ctx) {
    const activities = await strapi.entityService.findMany('api::activity.activity', {
      sort: { createdAt: 'desc' },
      limit: 3,
      populate: {
        coverImage: true,
        coordinates: true
      }
    });
    
    console.log(`🆕 Found ${activities.length} recent activities`);
    return { data: activities };
  },

  // Custom endpoint: GET /activities/featured
  async featured(ctx) {
    const activities = await strapi.entityService.findMany('api::activity.activity', {
      filters: {
        featured: true
      },
      populate: {
        coverImage: true,
        images: true,
        coordinates: true
      }
    });
    
    console.log(`⭐ Found ${activities.length} featured activities`);
    return { data: activities };
  },

  // Helper function na odznačenie všetkých ostatných featured activities
  async unfeaturedAllOthers(excludeId = null) {
    try {
      const whereCondition = excludeId 
        ? { featured: true, documentId: { $ne: excludeId } }
        : { featured: true };

      await strapi.db.query('api::activity.activity').updateMany({
        where: whereCondition,
        data: { featured: false }
      });
      
      console.log('🔄 Unfeatured all other activities');
    } catch (error) {
      console.error('❌ Error unfeaturing other activities:', error);
    }
  }
}));