/**
 * Gallery Photo controller s podporou pre portrait orientáciu
 */

import { factories } from '@strapi/strapi';

// Helper funkcia na detekciu aspect ratio
function detectAspectRatio(width: number, height: number): 'portrait' | 'landscape' | 'square' {
  if (!width || !height) return 'landscape';
  
  const ratio = width / height;
  
  if (ratio > 1.2) {
    return 'landscape';
  } else if (ratio < 0.8) {
    return 'portrait';
  } else {
    return 'square';
  }
}

export default factories.createCoreController('api::gallery-photo.gallery-photo', ({ strapi }) => ({
  
  // GET /gallery-photos
  async find(ctx) {
    console.log('📸 Fetching gallery photos with preserved orientation');
    
    const { data, meta } = await super.find(ctx);
    
    // Pridať debug info o aspect ratios - s bezpečnostným checkingom
    const aspectRatios = data.reduce((acc, photo) => {
      const ratio = photo?.attributes?.aspectRatio || 'unknown';
      acc[ratio] = (acc[ratio] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📐 Aspect ratio distribution:', aspectRatios);
    
    return { data, meta };
  },

  // POST /gallery-photos  
  async create(ctx) {
    console.log('📤 Creating gallery photo with preserved orientation');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Ak je nahrávaný súbor s photo, analyzuj rozmery
    if (data.photo) {
      const photoId = data.photo;
      
      try {
        // Získaj informácie o nahranom súbore
        const uploadedFile = await strapi.query('plugin::upload.file').findOne({
          where: { id: photoId },
        });
        
        if (uploadedFile) {
          console.log('📏 Original file dimensions:', {
            width: uploadedFile.width,
            height: uploadedFile.height,
            name: uploadedFile.name
          });
          
          // KRITICKÉ: Použiť originálne rozmery pre aspect ratio detekciu
          const aspectRatio = detectAspectRatio(uploadedFile.width, uploadedFile.height);
          
          // Doplniť metadata
          data.originalWidth = uploadedFile.width;
          data.originalHeight = uploadedFile.height;
          data.aspectRatio = aspectRatio;
          
          console.log(`🎯 Detected aspect ratio: ${aspectRatio} (${uploadedFile.width}×${uploadedFile.height})`);
        }
      } catch (error) {
        console.error('❌ Error analyzing uploaded file:', error);
      }
    }
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers();
      console.log('🎯 Auto-unfeatured all other photos - this one is now the only featured');
    }
    
    const result = await super.create(ctx);
    
    console.log('✅ Gallery photo created with preserved orientation');
    return result;
  },

  // PUT /gallery-photos/:id
  async update(ctx) {
    console.log('📝 Updating gallery photo');
    
    const { data } = ctx.request.body;
    
    // KRITICKÉ: Pri update photo tiež analyzuj rozmery
    if (data.photo) {
      const photoId = data.photo;
      
      try {
        const uploadedFile = await strapi.query('plugin::upload.file').findOne({
          where: { id: photoId },
        });
        
        if (uploadedFile) {
          const aspectRatio = detectAspectRatio(uploadedFile.width, uploadedFile.height);
          
          data.originalWidth = uploadedFile.width;
          data.originalHeight = uploadedFile.height; 
          data.aspectRatio = aspectRatio;
          
          console.log(`🎯 Updated aspect ratio: ${aspectRatio} (${uploadedFile.width}×${uploadedFile.height})`);
        }
      } catch (error) {
        console.error('❌ Error analyzing updated file:', error);
      }
    }
    
    // KRITICKÉ: Auto-unfeatured logic - iba jeden featured naraz
    if (data.featured === true) {
      await this.unfeaturedAllOthers(ctx.params.id);
      console.log('🎯 Auto-unfeatured all other photos - this one is now the only featured');
    }
    
    const result = await super.update(ctx);
    
    console.log('✅ Gallery photo updated');
    return result;
  },

  // Helper function na odznačenie všetkých ostatných featured fotiek
  async unfeaturedAllOthers(excludeId = null) {
    try {
      const whereCondition = excludeId 
        ? { featured: true, documentId: { $ne: excludeId } }
        : { featured: true };

      await strapi.db.query('api::gallery-photo.gallery-photo').updateMany({
        where: whereCondition,
        data: { featured: false }
      });
      
      console.log('🔄 Unfeatured all other gallery photos');
    } catch (error) {
      console.error('❌ Error unfeaturing other photos:', error);
    }
  }
}));