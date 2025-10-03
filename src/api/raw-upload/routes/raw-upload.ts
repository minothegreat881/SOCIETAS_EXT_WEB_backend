/**
 * RAW UPLOAD ROUTES: Custom upload bez Strapi processing
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/raw-upload',
      handler: 'raw-upload.upload',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};