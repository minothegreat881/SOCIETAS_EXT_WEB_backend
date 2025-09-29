export default ({ env }) => ({
  upload: {
    enabled: true,
    config: {
      // Cloudinary provider - requires API keys in .env
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_CLOUD_NAME'),
        api_key: env('CLOUDINARY_API_KEY'),
        api_secret: env('CLOUDINARY_API_SECRET'),
        secure: true,
        folder: 'societas_gallery',
        // KRITICKÉ: Zabránenie auto-rotácii v Cloudinary
        upload_preset: undefined, // Použiť default bez transformácií
        auto_rotation: false,
        exif: true, // Zachovať EXIF dáta
        angle: 0, // Žiadna rotácia
        flags: 'preserve_exif', // Zachovať orientáciu
      },
      sizeLimit: 50 * 1024 * 1024, // 50MB
      // KRITICKÉ: Vypnutie breakpoints ktoré môžu spôsobiť rotáciu
      breakpoints: {},
      // KRITICKÉ: Vypnutie automatického generovania formátov
      generateThumbnail: false,
      generateFormats: false,
      // KRITICKÉ: Vypnutie Sharp processing
      enableSharp: false,
      autoOrientation: false, // Zabráni auto-rotácii
    },
  }
});
