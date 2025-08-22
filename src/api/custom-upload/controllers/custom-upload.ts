/**
 * CUSTOM UPLOAD CONTROLLER - Jednoduchý prístup bez rotation
 */

import { factories } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default factories.createCoreController('api::custom-upload.custom-upload', ({ strapi }) => ({
  
  async upload(ctx) {
    console.log('🚫 CUSTOM UPLOAD: Bypassing auto-rotation');
    
    try {
      const files = ctx.request.files;
      
      if (!files || !files.files) {
        return ctx.badRequest('No files provided');
      }
      
      const filesToProcess = Array.isArray(files.files) ? files.files : [files.files];
      const savedFiles = [];
      
      for (const file of filesToProcess) {
        console.log(`📁 Processing: ${(file as any).originalFilename || (file as any).name}`);
        
        if ((file as any).mimetype?.startsWith('image/')) {
          const savedFile = await this.saveImageWithoutRotation(file as any);
          savedFiles.push(savedFile);
        }
      }
      
      ctx.body = savedFiles;
      
    } catch (error) {
      console.error('❌ Custom upload error:', error);
      ctx.throw(500, 'Upload failed');
    }
  },
  
  async saveImageWithoutRotation(file: any) {
    try {
      // Čítaj súbor
      const buffer = fs.readFileSync(file.filepath);
      
      // KRITICKÉ: Použiť Sharp BEZ auto-rotation
      const image = sharp(buffer, {
        limitInputPixels: false,
        sequentialRead: true,
      });
      
      const metadata = await image.metadata();
      
      console.log(`📐 Original: ${metadata.width}×${metadata.height}, EXIF: ${metadata.orientation}`);
      
      // KRITICKÉ: Použiť originálne rozmery bez EXIF transformation
      const finalWidth = metadata.width;
      const finalHeight = metadata.height;
      
      // Generate filename
      const timestamp = Date.now();
      const ext = path.extname(file.originalFilename || file.name);
      const hash = `norotation_${timestamp}`;
      const filename = `${hash}${ext}`;
      
      // Save bez processing
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const finalPath = path.join(uploadDir, filename);
      
      // KRITICKÉ: Kopírovať originálny buffer BEZ transformácie
      fs.writeFileSync(finalPath, buffer);
      
      console.log(`💾 Saved without rotation: ${filename} (${finalWidth}×${finalHeight})`);
      
      // Save to Strapi database
      const savedFile = await strapi.query('plugin::upload.file').create({
        data: {
          name: filename,
          alternativeText: null,
          caption: null,
          width: finalWidth,
          height: finalHeight,
          formats: null,
          hash: hash,
          ext: ext,
          mime: file.mimetype,
          size: file.size,
          url: `/uploads/${filename}`,
          previewUrl: `/uploads/${filename}`,
          provider: 'local',
          provider_metadata: null,
          folderPath: '/',
        },
      });
      
      // Clean temp file
      fs.unlinkSync(file.filepath);
      
      return savedFile;
      
    } catch (error) {
      console.error('❌ Error saving image:', error);
      throw error;
    }
  }
}));