/**
 * ULTIMATE PREVENT IMAGE ROTATION MIDDLEWARE
 * Blokuje auto-rotation PRED akýmkoľvek image processing
 */

import { Context, Next } from 'koa';

export default () => {
  return async (ctx: Context, next: Next) => {
    
    // KRITICKÉ: Zachytiť upload requesty PRED spracovaním
    if (ctx.path === '/api/upload' && ctx.method === 'POST') {
      console.log('🚫 INTERCEPTING UPLOAD: Preventing ALL auto-rotation');
      
      // KRITICKÉ: Nastaviť globálne flagy pre vypnutie image processing
      ctx.state.skipImageProcessing = true;
      ctx.state.preserveExif = true;
      ctx.state.noAutoRotation = true;
      ctx.state.disableSharp = true;
      
      // KRITICKÉ: Override plugin upload settings v runtime
      if (strapi.plugins?.upload?.config) {
        const originalConfig = strapi.plugins.upload.config;
        
        // Backup a override
        ctx.state.originalUploadConfig = { ...originalConfig };
        
        // TypeScript safe override
        Object.assign(strapi.plugins.upload.config, {
          autoOrientation: false,
          responsiveDimensions: false,
          breakpoints: false,
          formats: false,
          sharp: false,
          sizeOptimization: false,
          enhanceImage: false,
          generateThumbnail: false,
          generateFormats: false
        });
        
        console.log('🔧 Temporarily disabled all image processing for this upload');
      }
      
      // KRITICKÉ: Set headers to prevent processing
      ctx.set('X-Skip-Image-Processing', 'true');
      ctx.set('X-Preserve-Original', 'true');
    }

    await next();
    
    // KRITICKÉ: Restore original config po uploade
    if (ctx.state.originalUploadConfig && strapi.plugins?.upload) {
      strapi.plugins.upload.config = ctx.state.originalUploadConfig;
      console.log('✅ Restored original upload config');
    }
    
    // Log výsledku
    if (ctx.path === '/api/upload' && ctx.response.body) {
      console.log('📤 Upload completed with rotation prevention');
      
      if (Array.isArray(ctx.response.body)) {
        ctx.response.body.forEach((file: any) => {
          console.log(`📄 File: ${file.name} (${file.width}×${file.height})`);
        });
      }
    }
  };
};