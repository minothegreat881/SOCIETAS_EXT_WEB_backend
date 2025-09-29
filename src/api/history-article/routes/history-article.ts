/**
 * History Article router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::history-article.history-article', {
  config: {
    find: {
      policies: [],
      middlewares: [],
    },
    findOne: {
      policies: [],
      middlewares: [],
    },
    create: {
      policies: [],
      middlewares: [],
    },
    update: {
      policies: [],
      middlewares: [],
    },
    delete: {
      policies: [],
      middlewares: [],
    }
  }
});
