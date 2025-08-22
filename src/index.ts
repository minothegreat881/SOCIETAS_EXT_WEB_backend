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
    console.log('🚀 Bootstrap: Setting up Activities API permissions');
    
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

      // Check if activities permissions already exist
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
    }
  },
};
