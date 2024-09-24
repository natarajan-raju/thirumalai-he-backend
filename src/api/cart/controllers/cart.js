const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  // Custom method to create or update the user's cart (POST)
  async userCart(ctx) {
    const userId = ctx.state.user.id; // Get the authenticated user's ID
    const { items } = ctx.request.body; // Destructure the items from the request body

    // Check if `items` is provided and is an array
    if (!items || !Array.isArray(items)) {
        return ctx.badRequest('Items must be an array');
    }

    // Find the cart for the authenticated user
    let userCart = await strapi.entityService.findMany('api::cart.cart', {
        filters: { user: userId },
        populate: ['items', 'items.product'], // Populate product relation within items
    });

    if (!userCart.length) {
        // If no cart exists, create a new one for the user
        userCart = await strapi.entityService.create('api::cart.cart', {
            data: {
                user: userId, // Associate the cart with the authenticated user
                items: items.map(singleItem => ({
                    product: singleItem.product, // ID of the product
                    quantity: singleItem.quantity,
                })),
                publishedAt: new Date(), // Ensure publishedAt is set to publish immediately
            },
        });
    } else {
        // If a cart exists, update the existing cart with new items
        userCart = await strapi.entityService.update('api::cart.cart', userCart[0].id, {
            data: {
                items: items.map(singleItem => ({
                    product: singleItem.product,
                    quantity: singleItem.quantity,
                })),
            },
        });
    }

    // If the cart was just created, ensure it is published
    if (!userCart.publishedAt) {
        await strapi.entityService.update('api::cart.cart', userCart.id, {
            data: {
                publishedAt: new Date(), // Set publishedAt to publish immediately
            },
        });
    }

    return userCart;
},


  // Method to add items to an existing cart (PUT)
  async addItemsToCart(ctx) {
    const userId = ctx.state.user.id;
    const { items } = ctx.request.body;

    if (!items || !Array.isArray(items)) {
      return ctx.badRequest('Items must be an array');
    }

    // Find the cart for the authenticated user
    const userCart = await strapi.entityService.findMany('api::cart.cart', {
      filters: { user: userId },
      populate: ['items', 'items.product'], // Populate product relation within items
    });

    if (!userCart.length) {
      return ctx.notFound('Cart not found');
    }

    // Merge the new items with the existing ones
    const existingItems = userCart[0].items;
    const updatedItems = [
      ...existingItems,
      ...items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
    ];

    const updatedCart = await strapi.entityService.update('api::cart.cart', userCart[0].id, {
      data: { items: updatedItems },
    });

    return updatedCart;
  },

  // Method to remove a specific item from the cart (DELETE)
  async removeItemFromCart(ctx) {
    const userId = ctx.state.user.id;
    const { productId } = ctx.params;

    // Find the cart for the authenticated user
    const userCart = await strapi.entityService.findMany('api::cart.cart', {
      filters: { user: userId },
      populate: ['items', 'items.product'], // Populate product relation within items
    });

    if (!userCart.length) {
      return ctx.notFound('Cart not found');
    }

    // Filter out the item to be removed based on productId
    const updatedItems = userCart[0].items.filter(item => item.product.id !== parseInt(productId, 10));

    const updatedCart = await strapi.entityService.update('api::cart.cart', userCart[0].id, {
      data: { items: updatedItems },
    });

    return updatedCart;
  },
}));
