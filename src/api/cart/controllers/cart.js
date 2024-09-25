const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  // Custom method to create or update the cart for the authenticated user
  async userCart(ctx) {
    // @ts-ignore
    const { item } = ctx.request.body; // Destructure the item from the request body

    // Check if `item` is provided and is an array
    if (!item || !Array.isArray(item)) {
      return ctx.badRequest('Item must be an array');
    }

    // Find the cart for the authenticated user (without user relation logic)
    let userCart = await strapi.entityService.findMany('api::cart.cart', {
      populate: ['item', 'item.product'], // Populate product relation within items
    });

    if (!userCart.length) {
      // If no cart exists, create a new one with the provided item
      // @ts-ignore
      userCart = await strapi.entityService.create('api::cart.cart', {
        data: {
          item: item.map(singleItem => ({
            product: singleItem.product, // ID of the product
            quantity: singleItem.quantity,
          })),
          publishedAt: new Date(), // Publish immediately
        },
      });
    } else {
      // Cart exists, check if the product is already in the cart
      const existingCart = userCart[0];
      // @ts-ignore
      const updatedItems = [...existingCart.item];

      item.forEach(singleItem => {
        const existingItemIndex = updatedItems.findIndex(cartItem => cartItem.product.id === singleItem.product);

        if (existingItemIndex !== -1) {
          // If the product exists, update its quantity
          updatedItems[existingItemIndex].quantity += singleItem.quantity;
        } else {
          // If the product does not exist, add it to the cart
          updatedItems.push({
            product: singleItem.product,
            quantity: singleItem.quantity,
          });
        }
      });

      // Update the cart with new or updated items
      // @ts-ignore
      userCart = await strapi.entityService.update('api::cart.cart', existingCart.id, {
        data: {
          item: updatedItems,
        },
      });
    }

    return userCart;
  },

  // Remove a product from the cart (using payload)
  async removeItemFromCart(ctx) {
    // @ts-ignore
    const { productId } = ctx.request.body; // Product ID in payload
    const userId = ctx.state.user.id;

    let cart = await strapi.entityService.findMany('api::cart.cart', {
      // @ts-ignore
      filters: { userId },
      populate: ['item', 'item.product'],
    });

    if (!cart.length) {
      return ctx.notFound('Cart not found');
    }

    // @ts-ignore
    cart = cart[0];
    // @ts-ignore
    cart.item = cart.item.filter(singleItem => singleItem.product !== productId);

    // @ts-ignore
    const updatedCart = await strapi.entityService.update('api::cart.cart', cart.id, {
      data: {
        // @ts-ignore
        item: cart.item,
      },
    });

    return updatedCart;
  },

  // Fetch the user's cart
  async find(ctx) {
    const userId = ctx.state.user.id;

    const cart = await strapi.entityService.findMany('api::cart.cart', {
      // @ts-ignore
      filters: { userId },
      populate: ['item', 'item.product'],
    });

    if (!cart.length) {
      return ctx.notFound('Cart not found');
    }

    return cart[0];
  },
}));
