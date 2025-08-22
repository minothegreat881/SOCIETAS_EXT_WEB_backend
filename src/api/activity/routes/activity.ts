/**
 * Activity router with custom endpoints
 */

export default {
  routes: [
    // KRITICKÉ: Custom endpoints musia byť PRED štandardnými routes
    {
      method: 'GET',
      path: '/activities/upcoming',
      handler: 'activity.upcoming',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/activities/recent',
      handler: 'activity.recent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/activities/featured',
      handler: 'activity.featured',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    // Default CRUD routes
    {
      method: 'GET',
      path: '/activities',
      handler: 'activity.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/activities/:id',
      handler: 'activity.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/activities',
      handler: 'activity.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/activities/:id',
      handler: 'activity.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/activities/:id',
      handler: 'activity.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};