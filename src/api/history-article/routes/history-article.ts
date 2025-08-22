/**
 * History Article routes with custom endpoints
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/history-articles',
      handler: 'history-article.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/history-articles/featured',
      handler: 'history-article.featured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/history-articles/recent',
      handler: 'history-article.recent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/history-articles/category/:category',
      handler: 'history-article.byCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/history-articles/:id',
      handler: 'history-article.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/history-articles',
      handler: 'history-article.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/history-articles/:id',
      handler: 'history-article.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/history-articles/:id',
      handler: 'history-article.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};