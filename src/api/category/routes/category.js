'use strict';

/**
 * category router
 */
const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'category.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/categories/:id',
      handler: 'category.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/categories',
      handler: 'category.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/categories/:id',
      handler: 'category.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/categories/:id',
      handler: 'category.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/categories/:categoryName/products',
      handler: 'category.findProductsByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
