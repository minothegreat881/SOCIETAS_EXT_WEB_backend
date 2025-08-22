/**
 * Event service with enhanced functionality
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::event.event', ({ strapi }) => ({
  
  async findWithPopulate(params = {}) {
    return await strapi.entityService.findMany('api::event.event', {
      ...params,
      populate: {
        coverImage: true,
        images: true,
        coordinates: true,
      },
    });
  },

  async findUpcoming(params: any = {}) {
    const now = new Date().toISOString();
    
    return await strapi.entityService.findMany('api::event.event', {
      ...params,
      filters: {
        eventDate: {
          $gte: now
        },
        ...(params.filters || {}),
      },
      sort: { eventDate: 'asc' },
      populate: {
        coverImage: true,
        images: true,
        coordinates: true,
      },
    });
  },

  async findFeatured(params: any = {}) {
    return await strapi.entityService.findMany('api::event.event', {
      ...params,
      filters: {
        featured: true,
        ...(params.filters || {}),
      },
      populate: {
        coverImage: true,
        images: true,
        coordinates: true,
      },
    });
  },

  async findByCategory(category: string, params: any = {}) {
    return await strapi.entityService.findMany('api::event.event', {
      ...params,
      filters: {
        category: category,
        ...(params.filters || {}),
      },
      populate: {
        coverImage: true,
        images: true,
        coordinates: true,
      },
    });
  },

}));