/**
 * custom history-article routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/history-articles/by-slug/:slug',
      handler: 'api::history-article.history-article.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};