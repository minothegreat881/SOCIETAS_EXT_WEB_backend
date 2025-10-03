export default [
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
        'https://v0-s-c-e-a-r-website-design-ljmav4tve.vercel.app',
        'https://api.autoweb.store',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
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