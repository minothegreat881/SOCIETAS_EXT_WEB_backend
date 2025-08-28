const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const LOCAL_API = 'http://localhost:1342/api';
const PROD_API = 'https://societas-backend.onrender.com/api';

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  try {
    // Get data from local backend
    console.log('📥 Fetching local data...');
    const [galleryResponse, eventsResponse] = await Promise.all([
      fetch(`${LOCAL_API}/gallery-photos?populate=*`),
      fetch(`${LOCAL_API}/events?populate=*`)
    ]);
    
    const localGallery = await galleryResponse.json();
    const localEvents = await eventsResponse.json();
    
    console.log(`📊 Found ${localGallery.data.length} gallery photos and ${localEvents.data.length} events locally`);
    
    // Migrate gallery photos
    console.log('📤 Migrating gallery photos...');
    for (const photo of localGallery.data) {
      const photoData = {
        data: {
          title: photo.title,
          alt: photo.alt,
          description: photo.description,
          location: photo.location,
          activity: photo.activity,
          category: photo.category,
          featured: photo.featured,
          sortOrder: photo.sortOrder,
          aspectRatio: photo.aspectRatio
        }
      };
      
      try {
        const response = await fetch(`${PROD_API}/gallery-photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(photoData)
        });
        
        if (response.ok) {
          console.log(`✅ Migrated photo: ${photo.title}`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to migrate photo ${photo.title}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error migrating photo ${photo.title}: ${error.message}`);
      }
    }
    
    // Migrate events
    console.log('📤 Migrating events...');
    for (const event of localEvents.data) {
      const eventData = {
        data: {
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          category: event.category,
          featured: event.featured,
          sortOrder: event.sortOrder,
          locationName: event.locationName,
          locationAddress: event.locationAddress,
          recurring: event.recurring,
          coordinates: event.coordinates ? {
            latitude: event.coordinates.latitude,
            longitude: event.coordinates.longitude,
            accuracy: event.coordinates.accuracy
          } : null
        }
      };
      
      try {
        const response = await fetch(`${PROD_API}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
          console.log(`✅ Migrated event: ${event.title}`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to migrate event ${event.title}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error migrating event ${event.title}: ${error.message}`);
      }
    }
    
    console.log('🎉 Data migration completed!');
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const [prodGalleryResponse, prodEventsResponse] = await Promise.all([
      fetch(`${PROD_API}/gallery-photos?populate=*`),
      fetch(`${PROD_API}/events?populate=*`)
    ]);
    
    const prodGallery = await prodGalleryResponse.json();
    const prodEvents = await prodEventsResponse.json();
    
    console.log(`📊 Production now has ${prodGallery.data.length} gallery photos and ${prodEvents.data.length} events`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

migrateData();