/**
 * Event controller with auto-unfeaturing logic similar to Gallery Photos
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  
  // GET /events
  async find(ctx) {
    console.log('📅 Fetching events with enhanced data');
    
    const { data, meta } = await super.find(ctx);
    
    // Debug info o event categories
    const categories = data.reduce((acc, event) => {
      const category = event?.attributes?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🎭 Event category distribution:', categories);
    
    return { data, meta };
  },

  // POST /events  
  async create(ctx) {
    console.log('📤 Creating event with enhanced functionality');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured event naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers();
      console.log('🎯 Auto-unfeatured all other events - this one is now the only featured');
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
    
    console.log('✅ Event created with enhanced functionality');
    return result;
  },

  // PUT /events/:id
  async update(ctx) {
    console.log('📝 Updating event');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured event naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers(ctx.params.id);
      console.log('🎯 Auto-unfeatured all other events - this one is now the only featured');
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
    
    console.log('✅ Event updated');
    return result;
  },

  // Custom endpoint: GET /events/upcoming (3 najnovšie pridané eventy)
  async upcoming(ctx) {
    const events = await strapi.entityService.findMany('api::event.event', {
      sort: { createdAt: 'desc' },
      limit: 3,
      populate: {
        coverImage: true,
        coordinates: true
      }
    });
    
    console.log(`🆕 Found ${events.length} recent events for homepage`);
    return { data: events };
  },

  // Custom endpoint: GET /events/recent (3 najnovšie pridané eventy)
  async recent(ctx) {
    const events = await strapi.entityService.findMany('api::event.event', {
      sort: { createdAt: 'desc' },
      limit: 3,
      populate: {
        coverImage: true,
        coordinates: true
      }
    });
    
    console.log(`🆕 Found ${events.length} recent events`);
    return { data: events };
  },

  // Custom endpoint: GET /events/featured
  async featured(ctx) {
    const events = await strapi.entityService.findMany('api::event.event', {
      filters: {
        featured: true
      },
      populate: {
        coverImage: true,
        images: true,
        coordinates: true
      }
    });
    
    console.log(`⭐ Found ${events.length} featured events`);
    return { data: events };
  },

  // Helper function na odznačenie všetkých ostatných featured events
  async unfeaturedAllOthers(excludeId = null) {
    try {
      const whereCondition = excludeId 
        ? { featured: true, documentId: { $ne: excludeId } }
        : { featured: true };

      await strapi.db.query('api::event.event').updateMany({
        where: whereCondition,
        data: { featured: false }
      });
      
      console.log('🔄 Unfeatured all other events');
    } catch (error) {
      console.error('❌ Error unfeaturing other events:', error);
    }
  }
}));