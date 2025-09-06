export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',  // Current frontend port
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007',
        'http://localhost:3008',
        'http://localhost:3009',
        'http://localhost:3010',
        'http://localhost:3020',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3004',  // Current frontend port
        'http://127.0.0.1:3020',
        'https://v0-s-c-e-a-r-website-design.vercel.app',  // Current Vercel deployment
        'https://scear-frontend.vercel.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  // KRITICKÉ: Middleware na zabránenie auto-rotation
  {
    name: 'global::prevent-image-rotation',
    config: {},
  },
  'strapi::public',
];
