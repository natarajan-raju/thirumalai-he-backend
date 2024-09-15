'use strict';

//Product router
module.exports = {
  routes: [
    // Fetch all products (with optional query params)
    {
      method: 'GET',
      path: '/products',
      handler: 'product.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Fetch a single product by ID
    {
      method: 'GET',
      path: '/products/:id',
      handler: 'product.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom route to fetch a product by pid
    {
      method: 'GET',
      path: '/products/pid/:pid',
      handler: 'product.findByPid',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Create a new product
    {
      method: 'POST',
      path: '/products',
      handler: 'product.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Update an existing product by ID
    {
      method: 'PUT',
      path: '/products/:id',
      handler: 'product.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Delete a product by ID
    {
      method: 'DELETE',
      path: '/products/:id',
      handler: 'product.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
