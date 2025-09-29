/**
 * History Article controller - with enhanced population for sidebar components
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::history-article.history-article', ({ strapi }) => ({
  async find(ctx) {
    // Override default find to ensure deep population of sidebar components
    const { query } = ctx;

    // For polymorphic structures (dynamic zones), Strapi requires using '*' for nested population
    // We'll use the '*' population and let Strapi handle it automatically
    const populateConfig = {
      heroImage: true,
      seoImage: true,
      mainImage: true,
      contentImages: {
        populate: {
          image: true
        }
      },
      sidebarComponents: {
        populate: '*'  // Use '*' for dynamic zone population
      }
    };

    // Merge with existing populate if any
    if (query.populate) {
      if (query.populate === '*' || query.populate === 'deep') {
        query.populate = populateConfig;
      }
    } else {
      query.populate = populateConfig;
    }

    // Call the default core controller's find method with enhanced populate
    return await super.find(ctx);
  },

  async findOne(ctx) {
    // Override findOne to ensure deep population of sidebar components
    const { id } = ctx.params;
    const { query } = ctx;

    // For polymorphic structures (dynamic zones), Strapi requires using '*' for nested population
    // We'll use the '*' population and let Strapi handle it automatically
    const populateConfig = {
      heroImage: true,
      seoImage: true,
      mainImage: true,
      contentImages: {
        populate: {
          image: true
        }
      },
      sidebarComponents: {
        populate: '*'  // Use '*' for dynamic zone population
      }
    };

    // Merge with existing populate if any
    if (query.populate) {
      if (query.populate === '*' || query.populate === 'deep') {
        query.populate = populateConfig;
      }
    } else {
      query.populate = populateConfig;
    }

    // Call the default core controller's findOne method with enhanced populate
    return await super.findOne(ctx);
  }
}));
