/**
 * CUSTOM UPLOAD ROUTES - Jednoduchý prístup
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/custom-upload',
      handler: 'custom-upload.upload',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};