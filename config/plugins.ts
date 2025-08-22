export default ({ env }) => ({
  upload: {
    enabled: true,
    config: {
      // Cloudinary provider pre všetky uploady
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_CLOUD_NAME'),
        api_key: env('CLOUDINARY_API_KEY'),
        api_secret: env('CLOUDINARY_API_SECRET'),
        // Cloudinary optimalizácie
        secure: true,
        folder: 'societas_ext_web', // Organizovať súbory do priečinku
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
        transformation: [
          {
            quality: 'auto:best',
            fetch_format: 'auto'
          }
        ]
      },
      sizeLimit: 50 * 1024 * 1024, // 50MB
      
      // Zachovať základné nastavenia, ale necháme Cloudinary optimalizovať
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      }
    },
  }
});