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
  },
  // E-mail: Gmail SMTP cez port 587 STARTTLS — port 465 hosting blokuje
  // a spojenie visí niekoľko minút, kým padne.
  email: {
    config: {
      provider: 'nodemailer',
      // Bez SMTP údajov (lokálny vývoj) sa e-maily neodosielajú, iba vypíšu
      // do konzoly — inak by registrácia padala na 500 pri odosielaní overenia.
      providerOptions: env('SMTP_USER')
        ? {
            host: env('SMTP_HOST', 'smtp.gmail.com'),
            port: env.int('SMTP_PORT', 587),
            secure: env.bool('SMTP_SECURE', false),
            auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
          }
        : { jsonTransport: true },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'scear@scear.sk'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'scear@scear.sk'),
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: { expiresIn: env('JWT_EXPIRES_IN', '30d') },
      ratelimit: { interval: 60000, max: 20 },
      // Bez tohto zoznamu Strapi registráciu s údajmi navyše odmietne.
      // Zámerne tu nie sú „approved" ani „role" — tie patria vedeniu.
      register: {
        allowedFields: ['displayName', 'phone', 'unitPosition'],
      },
    },
  },
});
