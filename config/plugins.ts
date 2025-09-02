export default () => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
      actionOptions: {
        upload: {
          // KRITICKÉ: Prevent Cloudinary auto-rotation
          use_filename: true,
          unique_filename: false,
          overwrite: false,
          angle: 0,
          flags: "preserve_transparency.immutable_cache"
        },
        uploadStream: {},
        delete: {},
      },
      
      // KRITICKÉ: UNIVERZÁLNE SHARP DISABLING
      sizeLimit: 50 * 1024 * 1024, // 50MB
      breakpoints: false,
      responsiveDimensions: false,
      formats: false,
      
      // KRITICKÉ: Disable ALL image processing
      sharp: false,
      autoOrientation: false,
      forceFormat: false,
      
      // KRITICKÉ: Custom overrides
      enhanceImage: false,
      generateThumbnail: false,
      generateFormats: false,
      sizeOptimization: false
    },
  },
});
