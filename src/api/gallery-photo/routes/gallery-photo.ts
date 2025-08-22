/**
 * Gallery Photo routes - s podporou pre portrait orientáciu
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/gallery-photos',
      handler: 'gallery-photo.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET', 
      path: '/gallery-photos/:id',
      handler: 'gallery-photo.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/gallery-photos',
      handler: 'gallery-photo.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/gallery-photos/:id',
      handler: 'gallery-photo.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/gallery-photos/:id', 
      handler: 'gallery-photo.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};