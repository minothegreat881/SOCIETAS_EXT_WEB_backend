export default [
  // KRITICKÉ: Force CORS middleware - MUSÍ BYŤ PRVÝ!
  {
    name: 'global::force-cors',
    config: {},
  },
  
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: [
        'https://www.autoweb.store',
        'https://autoweb.store',
        'https://www.scear.sk',
        'https://scear.sk',
        'https://*.vercel.app',
        'https://api.autoweb.store',
        'https://api.scear.sk',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',

  // KRITICKÉ: Custom middleware na úplné vypnutie image processing
  {
    name: 'global::disable-image-processing',
    config: {},
  },

  // KRITICKÉ: Ultimate prevention middleware
  {
    name: 'global::prevent-image-rotation',
    config: {},
  },

  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
