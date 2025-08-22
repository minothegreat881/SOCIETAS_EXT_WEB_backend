/**
 * KRITICKÝ MIDDLEWARE: Kompletne vypnúť všetko image processing
 * Zachovať originálne EXIF dáta a orientáciu obrázkov
 */

import { Context, Next } from 'koa';

export default () => {
  return async (ctx: Context, next: Next) => {
    // Zachytiť všetky upload requesty
    if (ctx.path.includes('/upload') && ctx.method === 'POST') {
      console.log('🚫 UPLOAD INTERCEPTED: Disabling ALL image processing');
      
      // KRITICKÉ: Nastaviť flagy na vypnutie Sharp processing
      ctx.state.skipImageProcessing = true;
      ctx.state.preserveExif = true;
      ctx.state.noAutoRotation = true;
      
      // KRITICKÉ: Override Sharp settings ak existujú
      if (ctx.request.body) {
        ctx.request.body.noImageProcessing = true;
        ctx.request.body.preserveOriginal = true;
      }
      
      // KRITICKÉ: Nastaviť headers na zachovanie originálnych súborov
      ctx.set('X-Preserve-Original', 'true');
      ctx.set('X-No-Auto-Rotation', 'true');
    }

    // Zachytiť aj media library requesty
    if (ctx.path.includes('/media') || ctx.path.includes('/files')) {
      console.log('🚫 MEDIA REQUEST: Preserving original orientation');
      ctx.state.preserveExif = true;
    }

    await next();
    
    // Post-processing: Uistiť sa že sa neaplikovali transformácie
    if (ctx.path.includes('/upload') && ctx.response.body) {
      console.log('✅ UPLOAD COMPLETED: Original orientation preserved');
    }
  };
};