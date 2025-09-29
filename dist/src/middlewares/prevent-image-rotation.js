"use strict";
/**
 * ULTIMATE PREVENT IMAGE ROTATION MIDDLEWARE
 * Blokuje auto-rotation PRED akýmkoľvek image processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return async (ctx, next) => {
        var _a, _b, _c;
        // KRITICKÉ: Zachytiť upload requesty PRED spracovaním (vrátane raw-upload)
        if ((ctx.path === '/api/upload' || ctx.path === '/api/raw-upload') && ctx.method === 'POST') {
            console.log('🚫 INTERCEPTING UPLOAD: Preventing ALL auto-rotation');
            // KRITICKÉ: Nastaviť globálne flagy pre vypnutie image processing
            ctx.state.skipImageProcessing = true;
            ctx.state.preserveExif = true;
            ctx.state.noAutoRotation = true;
            ctx.state.disableSharp = true;
            // KRITICKÉ: Override plugin upload settings v runtime
            if ((_b = (_a = strapi.plugins) === null || _a === void 0 ? void 0 : _a.upload) === null || _b === void 0 ? void 0 : _b.config) {
                const originalConfig = strapi.plugins.upload.config;
                // Backup a override
                ctx.state.originalUploadConfig = { ...originalConfig };
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
        if (ctx.state.originalUploadConfig && ((_c = strapi.plugins) === null || _c === void 0 ? void 0 : _c.upload)) {
            strapi.plugins.upload.config = ctx.state.originalUploadConfig;
            console.log('✅ Restored original upload config');
        }
        // Log výsledku
        if ((ctx.path === '/api/upload' || ctx.path === '/api/raw-upload') && ctx.response.body) {
            console.log('📤 Upload completed with rotation prevention');
            if (Array.isArray(ctx.response.body)) {
                ctx.response.body.forEach((file) => {
                    console.log(`📄 File: ${file.name} (${file.width}×${file.height})`);
                });
            }
        }
    };
};
