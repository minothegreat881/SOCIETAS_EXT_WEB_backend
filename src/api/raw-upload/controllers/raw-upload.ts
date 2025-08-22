/**
 * RAW UPLOAD CONTROLLER: Úplne bypass Strapi image processing
 */

import { Context } from 'koa';
import fs from 'fs';
import path from 'path';

export default {
  
  async upload(ctx: Context) {
    console.log('🔥 RAW UPLOAD: Kompletne bypass Strapi processing');
    
    const { files } = ctx.request;
    
    if (!files || !files.files) {
      return ctx.badRequest('No files provided');
    }
    
    // Normalizovať files do array
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];
    console.log('📂 Files to process:', fileArray.length);
    
    const uploadedFiles = [];
    
    for (const file of fileArray) {
      try {
        console.log('📄 Processing HIGH-QUALITY upload:', {
          name: (file as any).originalFilename || (file as any).name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          type: (file as any).mimetype || (file as any).type,
          quality: 'Preserving original'
        });
        
        // KRITICKÉ: Generovať unique filename ale ZACHOVAŤ extension
        const originalName = (file as any).originalFilename || (file as any).name || 'unknown';
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);
        const uniqueName = `${nameWithoutExt}_${Date.now()}${ext}`;
        
        let finalUrl = `/uploads/${uniqueName}`;
        
        // CLOUDINARY INTEGRATION: Upload to Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            const tempPath = (file as any).filepath || (file as any).path;
            
            // KRITICKÉ: Upload to Cloudinary s najvyššou kvalitou
            const result = await cloudinary.uploader.upload(tempPath, {
              public_id: path.basename(uniqueName, ext),
              use_filename: true,
              unique_filename: false,
              overwrite: false,
              resource_type: 'auto',
              // KRITICKÉ: Žiadne transformácie = žiadna rotation/compression
              transformation: [],
              flags: 'preserve_transparency.immutable_cache',
              // High quality settings
              quality: 'auto:best',
              // Preserve original dimensions and quality
              crop: 'limit'
            });
            
            finalUrl = result.secure_url;
            console.log('☁️ Uploaded to Cloudinary without transformation:', result.secure_url);
            
          } catch (cloudinaryError) {
            console.error('❌ Cloudinary upload failed, falling back to local:', cloudinaryError);
            
            // FALLBACK: Local storage
            const uploadsDir = path.join(strapi.dirs.static.public, 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const filePath = path.join(uploadsDir, uniqueName);
            const tempPath = (file as any).filepath || (file as any).path;
            fs.copyFileSync(tempPath, filePath);
          }
        } else {
          // LOCAL STORAGE: Original behavior
          const uploadsDir = path.join(strapi.dirs.static.public, 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, uniqueName);
          
          // KRITICKÉ: RAW file copy bez akéhokoľvek processing
          if ((file as any).filepath) {
            fs.copyFileSync((file as any).filepath, filePath);
          } else if ((file as any).path) {
            fs.copyFileSync((file as any).path, filePath);
          } else if ((file as any).buffer) {
            fs.writeFileSync(filePath, (file as any).buffer);
          } else {
            throw new Error('No file data found');
          }
        }
        
        // KRITICKÉ: Vytvoriť databázový záznam BEZ width/height
        const fileRecord = await strapi.db.query('plugin::upload.file').create({
          data: {
            name: originalName,
            alternativeText: null,
            caption: null,
            width: null,  // KRITICKÉ: Žiadne dimensions = žiadna auto-rotation
            height: null,
            formats: null,
            hash: path.basename(uniqueName, ext),
            ext: ext,
            mime: (file as any).mimetype || (file as any).type || 'application/octet-stream',
            size: parseFloat((file.size / 1024).toFixed(2)),
            url: finalUrl,
            previewUrl: null,
            provider: 'local',
            provider_metadata: null,
            createdBy: ctx.state.user?.id,
            updatedBy: ctx.state.user?.id,
          },
        });
        
        console.log('✅ RAW file saved:', {
          id: fileRecord.id,
          name: fileRecord.name,
          url: fileRecord.url,
          width: fileRecord.width, // should be null
          height: fileRecord.height // should be null
        });
        
        uploadedFiles.push(fileRecord);
        
        // Cleanup temp file ak existuje
        const tempPath = (file as any).filepath || (file as any).path;
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
        
      } catch (error) {
        console.error('❌ RAW upload failed for file:', (file as any).originalFilename, error);
      }
    }
    
    console.log('🎯 RAW upload completed:', uploadedFiles.length, 'of', fileArray.length, 'files');
    
    ctx.body = uploadedFiles;
  }
  
};