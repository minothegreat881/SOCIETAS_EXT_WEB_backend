export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
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