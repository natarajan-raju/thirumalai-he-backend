'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/userCart', // Custom route for creating or updating the cart
      handler: 'cart.userCart', 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/userCart', // Custom route for adding items to existing cart
      handler: 'cart.addItemsToCart', 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/userCart/item/:productId', // Custom route for removing a specific item
      handler: 'cart.removeItemFromCart', 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/carts',
      handler: 'cart.find', // Corrected handler to 'cart.find'
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/carts',
      handler: 'cart.create', // Corrected handler to 'cart.create'
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/carts/:id',
      handler: 'cart.update', // Corrected handler to 'cart.update'
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/carts/:id',
      handler: 'cart.delete', // Corrected handler to 'cart.delete'
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
        method: 'GET',
        path: '/carts/:id',  // Make sure this path exists
        handler: 'cart.findOne', 
        config: {
            policies: [],
            middlewares: [],
          },
    },
  ],
};
