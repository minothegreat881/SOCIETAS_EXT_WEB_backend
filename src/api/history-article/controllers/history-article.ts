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
    console.log('🔥 Request body keys:', Object.keys(ctx.request.body));

    if (ctx.request.body?.data) {
      console.log('🔥 Request body.data keys:', Object.keys(ctx.request.body.data));

      if (ctx.request.body.data.contentImages) {
        console.log('🖼️ STRAPI: Received contentImages count:', ctx.request.body.data.contentImages.length);
        ctx.request.body.data.contentImages.forEach((img: any, i: number) => {
          console.log(`  Image ${i}: ID=${img.image}, caption="${img.caption}"`);
        });
      }

      // Log title changes to verify updates are being received
      if (ctx.request.body.data.title_sk) {
        console.log('📝 STRAPI: Received title_sk:', ctx.request.body.data.title_sk);
      }
    }

    // Call the default update method
    const response = await super.update(ctx);

    // Log the ENTIRE response structure to see what we're getting
    console.log('📦 STRAPI: Response type:', typeof response);
    console.log('📦 STRAPI: Response keys:', response ? Object.keys(response) : 'null');
    console.log('📦 STRAPI: response.data exists?', !!response?.data);

    if (response?.data) {
      console.log('📦 STRAPI: response.data keys:', Object.keys(response.data));
      console.log('📦 STRAPI: response.data.id:', response.data.id);
      console.log('📦 STRAPI: response.data.contentImages exists?', !!response.data.contentImages);

      if (response.data.contentImages) {
        console.log('🖼️ STRAPI: Saved contentImages count:', response.data.contentImages.length);
        response.data.contentImages.forEach((img: any, i: number) => {
          console.log(`  Saved Image ${i}: ID=${img.image?.id || img.image}, caption="${img.caption}"`);
        });
      } else {
        console.log('❌ STRAPI: contentImages NOT in response.data');
      }

      // Log title to verify what was saved
      if (response.data.title_sk) {
        console.log('📝 STRAPI: Saved title_sk:', response.data.title_sk);
      }
    }

    return response;
  }
}));
