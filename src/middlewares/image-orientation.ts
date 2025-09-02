import { Context, Next } from 'koa';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: Context, next: Next) => {
    await next();

    // Only process image uploads
    if (ctx.request.url === '/api/upload' && ctx.request.method === 'POST') {
      // Process after upload but before response
      if (ctx.response.body && Array.isArray(ctx.response.body)) {
        console.log('🔄 Processing uploaded images for orientation correction...');
        
        for (const file of ctx.response.body) {
          if (file.mime && file.mime.startsWith('image/')) {
            try {
              const filePath = path.join(process.cwd(), 'public', 'uploads', file.name);
              
              // Check if file exists
              if (fs.existsSync(filePath)) {
                // Get actual image dimensions after any automatic EXIF rotation
                const metadata = await sharp(filePath).metadata();
                
                // Update dimensions to match visual orientation (after EXIF rotation)
                if (metadata.width && metadata.height) {
                  const oldWidth = file.width;
                  const oldHeight = file.height;
                  
                  file.width = metadata.width;
                  file.height = metadata.height;
                  
                  // Log dimension changes
                  if (oldWidth !== metadata.width || oldHeight !== metadata.height) {
                    console.log(`📐 Updated dimensions for ${file.name}:`);
                    console.log(`   Before: ${oldWidth}x${oldHeight}`);
                    console.log(`   After:  ${metadata.width}x${metadata.height}`);
                    console.log(`   Orientation: ${metadata.height > metadata.width ? 'vertical' : 'horizontal'}`);
                  }
                }
                
                // Log EXIF orientation if present
                if (metadata.orientation && metadata.orientation !== 1) {
                  console.log(`🔄 EXIF orientation ${metadata.orientation} detected for ${file.name}`);
                }
                
              } else {
                console.warn(`⚠️ File not found for dimension update: ${filePath}`);
              }
            } catch (error) {
              console.error(`❌ Error processing image ${file.name}:`, error);
            }
          }
        }
      }
    }
  };
};