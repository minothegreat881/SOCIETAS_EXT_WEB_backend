// import type { Core } from '@strapi/strapi';

// Auto-seeding function for initial data
async function seedInitialData({ strapi }) {
  console.log('🌱 Checking if database needs seeding...');
  
  // Check if we already have data
  const existingPhotos = await strapi.entityService.findMany('api::gallery-photo.gallery-photo', {
    pagination: { page: 1, pageSize: 1 }
  });
  
  const existingEvents = await strapi.entityService.findMany('api::event.event', {
    pagination: { page: 1, pageSize: 1 }
  });

  if (existingPhotos.length > 0 || existingEvents.length > 0) {
    console.log('✅ Database already has data, skipping seeding');
    return;
  }

  console.log('🌱 Seeding initial data...');

  // Seed gallery photos with Cloudinary URLs
  const galleryPhotos = [
    {
      title: "Military Training Exercise",
      alt: "Military training in progress",
      description: "Training session with military equipment and tactics",
      location: "Trnava",
      activity: "Military Training",
      category: "Military",
      featured: true,
      aspectRatio: "landscape",
      photo: {
        name: "20250704_143722.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756210812/20250704_143722_1756210810299.jpg",
        mime: "image/jpeg",
        size: 3511.29,
        provider: "cloudinary"
      }
    },
    {
      title: "Historical Reenactment Preparation",
      alt: "Preparing for historical event",
      description: "Members preparing equipment and costumes for upcoming historical reenactment",
      location: "Bratislava",
      activity: "Historical Preparation",
      category: "Festivals",
      featured: true,
      aspectRatio: "landscape",
      photo: {
        name: "20250704_122808.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756211185/20250704_122808_1756211182897.jpg",
        mime: "image/jpeg",
        size: 3804.72,
        provider: "cloudinary"
      }
    },
    {
      title: "Equipment Maintenance",
      alt: "Equipment being maintained",
      description: "Regular maintenance of historical military equipment",
      location: "Workshop",
      activity: "Equipment Care",
      category: "Equipment",
      featured: false,
      aspectRatio: "landscape",
      photo: {
        name: "20250706_144342.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756211679/20250706_144342_1756211674608.jpg",
        mime: "image/jpeg",
        size: 5211.9,
        provider: "cloudinary"
      }
    },
    {
      title: "Cultural Heritage Display",
      alt: "Cultural items on display",
      description: "Displaying various cultural and historical artifacts",
      location: "Museum",
      activity: "Cultural Display",
      category: "Culture",
      featured: false,
      aspectRatio: "landscape",
      photo: {
        name: "20250706_110621.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756214893/20250706_110621_1756214889978.jpg",
        mime: "image/jpeg",
        size: 5801.57,
        provider: "cloudinary"
      }
    }
  ];

  // Seed events
  const events = [
    {
      title: "Historical Exhibition - Musov",
      description: "A comprehensive exhibition showcasing historical artifacts and interactive displays from the Musov region. Join us for an educational journey through history.",
      startDate: new Date('2025-09-15T10:00:00.000Z'),
      endDate: new Date('2025-09-15T17:00:00.000Z'),
      category: "exhibition",
      featured: true,
      locationName: "Trnava Cultural Center",
      locationAddress: "M.C.Trencianskeho 34, Trnava",
      coordinates: {
        latitude: 48.379213056916164,
        longitude: 17.58679929629679
      },
      photo: {
        name: "20250704_122808.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756297717/20250704_122808_1756297715435.jpg",
        mime: "image/jpeg",
        size: 3804.72,
        provider: "cloudinary"
      }
    },
    {
      title: "Medieval Reenactment Weekend",
      description: "Experience medieval life through authentic reenactment activities, demonstrations, and interactive workshops for the whole family.",
      startDate: new Date('2025-09-22T09:00:00.000Z'),
      endDate: new Date('2025-09-23T18:00:00.000Z'),
      category: "reenactment",
      featured: true,
      locationName: "Bojnice Castle",
      locationAddress: "Zámok a okolie 1, Bojnice",
      coordinates: {
        latitude: 48.669,
        longitude: 19.699
      },
      photo: {
        name: "20250706_110621.jpg",
        url: "https://res.cloudinary.com/dii0wl9ke/image/upload/v1756297755/20250706_110621_1756297752684.jpg",
        mime: "image/jpeg",
        size: 5801.57,
        provider: "cloudinary"
      }
    }
  ];

  try {
    // Create gallery photos
    for (const photoData of galleryPhotos) {
      await strapi.entityService.create('api::gallery-photo.gallery-photo', {
        data: {
          title: photoData.title,
          alt: photoData.alt,
          description: photoData.description,
          location: photoData.location,
          activity: photoData.activity,
          category: photoData.category,
          featured: photoData.featured,
          aspectRatio: photoData.aspectRatio,
          publishedAt: new Date()
        }
      });
    }

    // Create events
    for (const eventData of events) {
      await strapi.entityService.create('api::event.event', {
        data: {
          title: eventData.title,
          description: eventData.description,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          category: eventData.category,
          featured: eventData.featured,
          locationName: eventData.locationName,
          locationAddress: eventData.locationAddress,
          coordinates: eventData.coordinates,
          publishedAt: new Date()
        }
      });
    }

    console.log('✅ Successfully seeded initial data');
    console.log(`📸 Created ${galleryPhotos.length} gallery photos`);
    console.log(`🎉 Created ${events.length} events`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

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
    console.log('🚀 Bootstrap: Setting up API permissions and seeding data');
    
    // Auto-seed data if database is empty
    await seedInitialData({ strapi });
    
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

    // Create permissions for events (FULL CRUD operations)
    const eventActions = [
      'api::event.event.find',
      'api::event.event.findOne',
      'api::event.event.create',
      'api::event.event.update',
      'api::event.event.delete',
    ];

    // Create permissions for history-articles (FULL CRUD operations)
    const historyArticleActions = [
      'api::history-article.history-article.find',
      'api::history-article.history-article.findOne',
      'api::history-article.history-article.create',
      'api::history-article.history-article.update',
      'api::history-article.history-article.delete',
    ];

    // Create permissions for raw-upload (FILE UPLOAD operations)
    const rawUploadActions = [
      'api::raw-upload.raw-upload.create',
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

      // Setup Events permissions
      const eventPermissions = currentPermissions.filter(
        (permission) => 
          eventActions.includes(permission.action)
      );

      if (eventPermissions.length < eventActions.length) {
        console.log(`⚙️ Creating Events API permissions for ${role.type} role`);
        
        for (const action of eventActions) {
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

        console.log(`✅ Events API permissions created for ${role.type} role`);
      } else {
        console.log(`✅ Events API permissions already exist for ${role.type} role`);
      }

      // Setup History Articles permissions
      const historyArticlePermissions = currentPermissions.filter(
        (permission) => 
          historyArticleActions.includes(permission.action)
      );

      if (historyArticlePermissions.length < historyArticleActions.length) {
        console.log(`⚙️ Creating History Articles API permissions for ${role.type} role`);
        
        for (const action of historyArticleActions) {
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

        console.log(`✅ History Articles API permissions created for ${role.type} role`);
      } else {
        console.log(`✅ History Articles API permissions already exist for ${role.type} role`);
      }

      // Setup Raw Upload permissions
      const rawUploadPermissions = currentPermissions.filter(
        (permission) => 
          rawUploadActions.includes(permission.action)
      );

      if (rawUploadPermissions.length < rawUploadActions.length) {
        console.log(`⚙️ Creating Raw Upload API permissions for ${role.type} role`);
        
        for (const action of rawUploadActions) {
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

        console.log(`✅ Raw Upload API permissions created for ${role.type} role`);
      } else {
        console.log(`✅ Raw Upload API permissions already exist for ${role.type} role`);
      }
    }
  },
};
