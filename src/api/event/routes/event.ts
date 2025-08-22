/**
 * Event router with custom endpoints
 */

export default {
  routes: [
    // KRITICKÉ: Custom endpoints musia byť PRED štandardnými routes
    {
      method: 'GET',
      path: '/events/upcoming',
      handler: 'event.upcoming',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/events/recent',
      handler: 'event.recent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/events/featured',
      handler: 'event.featured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    // Default CRUD routes
    {
      method: 'GET',
      path: '/events',
      handler: 'event.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/events/:id',
      handler: 'event.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/events',
      handler: 'event.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/events/:id',
      handler: 'event.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/events/:id',
      handler: 'event.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};