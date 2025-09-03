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
    // Set default permissions for activities
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: {
          type: 'public',
        },
      });

      if (publicRole) {
        console.log('🔑 Setting up Activities API permissions...');
        
        // Get existing permissions for activities
        const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: {
            role: publicRole.id,
            action: {
              $startsWith: 'api::activity',
            },
          },
        });

        // If no permissions exist, create them
        if (existingPermissions.length === 0) {
          await strapi.db.query('plugin::users-permissions.permission').createMany({
            data: [
              {
                action: 'api::activity.activity.find',
                role: publicRole.id,
                enabled: true,
              },
              {
                action: 'api::activity.activity.findOne',
                role: publicRole.id, 
                enabled: true,
              },
              {
                action: 'api::activity.activity.create',
                role: publicRole.id,
                enabled: true,
              },
              {
                action: 'api::activity.activity.update',
                role: publicRole.id,
                enabled: true,
              },
              {
                action: 'api::activity.activity.delete',
                role: publicRole.id,
                enabled: true,
              },
            ],
          });
        } else {
          // Enable existing permissions
          await strapi.db.query('plugin::users-permissions.permission').updateMany({
            where: {
              role: publicRole.id,
              action: {
                $startsWith: 'api::activity',
              },
            },
            data: {
              enabled: true,
            },
          });
        }

        console.log('✅ Activities API permissions enabled for public access');

        // Set up Gallery Photos API permissions with explicit cleanup
        console.log('🔧 Setting up Gallery Photos API permissions...');
        
        // First, delete any existing gallery-photo permissions to avoid conflicts
        await strapi.db.query('plugin::users-permissions.permission').deleteMany({
          where: {
            role: publicRole.id,
            action: {
              $startsWith: 'api::gallery-photo',
            },
          },
        });

        // Now create fresh permissions
        await strapi.db.query('plugin::users-permissions.permission').createMany({
          data: [
            {
              action: 'api::gallery-photo.gallery-photo.find',
              role: publicRole.id,
              enabled: true,
            },
            {
              action: 'api::gallery-photo.gallery-photo.findOne',
              role: publicRole.id, 
              enabled: true,
            },
            {
              action: 'api::gallery-photo.gallery-photo.create',
              role: publicRole.id,
              enabled: true,
            },
            {
              action: 'api::gallery-photo.gallery-photo.update',
              role: publicRole.id,
              enabled: true,
            },
            {
              action: 'api::gallery-photo.gallery-photo.delete',
              role: publicRole.id,
              enabled: true,
            },
          ],
        });

        console.log('✅ Gallery Photos API permissions enabled for public access');
        
        // Also enable raw-upload permissions for file uploads
        const rawUploadPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            role: publicRole.id,
            action: 'api::raw-upload.raw-upload.upload',
          },
        });

        if (!rawUploadPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: 'api::raw-upload.raw-upload.upload',
              role: publicRole.id,
              enabled: true,
            },
          });
          console.log('✅ Raw upload API permissions enabled');
        } else if (!rawUploadPermission.enabled) {
          await strapi.db.query('plugin::users-permissions.permission').update({
            where: { id: rawUploadPermission.id },
            data: { enabled: true },
          });
          console.log('✅ Raw upload API permissions enabled');
        }
      }
    } catch (error) {
      console.error('❌ Error setting up Activities permissions:', error);
    }
  },
};
