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
  },

  async update(ctx) {
    // Log incoming request data for debugging contentImages issue
    console.log('🔥 STRAPI UPDATE REQUEST - ID:', ctx.params.id);

    if (ctx.request.body?.data?.contentImages) {
      console.log('🖼️ STRAPI: Received contentImages count:', ctx.request.body.data.contentImages.length);
      ctx.request.body.data.contentImages.forEach((img: any, i: number) => {
        console.log(`  Image ${i}: ID=${img.image}, caption="${img.caption}"`);
      });
    }

    // CRITICAL FIX: Set populate configuration to include contentImages in the response
    const { query } = ctx;
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
        populate: '*'
      }
    };

    // Apply populate configuration to the query
    if (query.populate) {
      if (query.populate === '*' || query.populate === 'deep') {
        query.populate = populateConfig;
      }
    } else {
      query.populate = populateConfig;
    }

    // Call the default update method with populate configuration
    const response = await super.update(ctx);

    // Log what was returned in the response
    if (response?.data?.contentImages) {
      console.log('✅ STRAPI: Response contentImages count:', response.data.contentImages.length);
      response.data.contentImages.forEach((img: any, i: number) => {
        console.log(`  Response Image ${i}: ID=${img.image?.id || img.image}, caption="${img.caption}"`);
      });
    } else {
      console.log('❌ STRAPI: contentImages NOT in response');
    }

    return response;
  }
}));
