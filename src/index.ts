// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Bootstrap: Setting up API permissions');
    
    // Find both public and authenticated roles
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    const authenticatedRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!publicRole || !authenticatedRole) {
      console.error('❌ Roles not found');
      return;
    }

    // Create permissions for activities (READ + WRITE operations)
    const activityActions = [
      'api::activity.activity.find',
      'api::activity.activity.findOne',
      'api::activity.activity.create',
      'api::activity.activity.update',
      'api::activity.activity.delete',
      'api::activity.activity.upcoming',
      'api::activity.activity.recent',
      'api::activity.activity.featured',
      'plugin::upload.content-api.upload',
      'plugin::upload.content-api.find',
      'plugin::upload.content-api.findOne'
    ];

    // Create permissions for gallery-photos (FULL CRUD operations)
    const galleryPhotoActions = [
      'api::gallery-photo.gallery-photo.find',
      'api::gallery-photo.gallery-photo.findOne',
      'api::gallery-photo.gallery-photo.create',
      'api::gallery-photo.gallery-photo.update',
      'api::gallery-photo.gallery-photo.delete',
    ];

    // Setup permissions for both public and authenticated roles
    for (const role of [publicRole, authenticatedRole]) {
      // Get current permissions for the role
      const currentPermissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: {
            role: role.id,
          },
        });

      // Setup Activities permissions
      const activityPermissions = currentPermissions.filter(
        (permission) => 
          activityActions.includes(permission.action)
      );

      if (activityPermissions.length < activityActions.length) {
        console.log(`⚙️ Creating Activities API permissions for ${role.type} role`);
        
        for (const action of activityActions) {
          const exists = currentPermissions.some(p => p.action === action);
          if (!exists) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                subject: null,
                properties: {},
                conditions: [],
                role: role.id,
              },
            });
          }
        }

        console.log(`✅ Activities API permissions created for ${role.type} role`);
      } else {
        console.log(`✅ Activities API permissions already exist for ${role.type} role`);
      }

      // Setup Gallery Photos permissions
      const galleryPermissions = currentPermissions.filter(
        (permission) => 
          galleryPhotoActions.includes(permission.action)
      );

      if (galleryPermissions.length < galleryPhotoActions.length) {
        console.log(`⚙️ Creating Gallery Photos API permissions for ${role.type} role`);
        
        for (const action of galleryPhotoActions) {
          const exists = currentPermissions.some(p => p.action === action);
          if (!exists) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                subject: null,
                properties: {},
                conditions: [],
                role: role.id,
              },
            });
          }
        }

        console.log(`✅ Gallery Photos API permissions created for ${role.type} role`);
      } else {
        console.log(`✅ Gallery Photos API permissions already exist for ${role.type} role`);
      }
    }
  },
};
