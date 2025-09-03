export default {
  routes: [
    {
      method: 'POST',
      path: '/raw-upload',
      handler: 'raw-upload.upload',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};