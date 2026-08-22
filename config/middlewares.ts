export default [
  // Vlastný force-cors tu zámerne nie je: spolu so strapi::cors posielal
  // hlavičku Access-Control-Allow-Origin dvakrát a prehliadač takú odpoveď
  // odmietne. Doteraz to nebolo vidieť, lebo web ťahá obsah zo servera —
  // členská zóna je prvá časť, ktorá volá API priamo z prehliadača.
  // Origins sú nižšie v strapi::cors, pridávať ich treba tam.
  'strapi::logger',
  'strapi::errors',
  // zrozumiteľné hlášky na /api/auth/* namiesto holého 500
  { name: 'global::auth-errors', config: {} },
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
        'http://localhost:3005',
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
