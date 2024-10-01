const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  // Custom method to create or update the cart for the authenticated user
  async userCart(ctx) {
    // @ts-ignore
    if (!ctx.request.body || !ctx.request.body.item) {
        return ctx.badRequest('Invalid request. Item details missing.');
      }
    // @ts-ignore
    const { item } = ctx.request.body;
      
    const { productId, variantId, quantity } = item[0];

    if(!productId || !variantId || !quantity) {
        return ctx.badRequest('Invalid request. Item details missing.');
    }

    const {product,variant,isSuccess,fetchMessage} = await fetchProductVariant(productId,variantId);
    
      if (!isSuccess) {
        // Return error if the product does not exist
        return ctx.badRequest(fetchMessage);
      }
      let url = variant[0]?.images?.[0]?.url || '';
    // Step 3: Product and variant are valid; Proceed with cart logic
    // Fetch the user's cart or create a new one if not present
    const userId = ctx.state.user.id;
    let userCart = await strapi.entityService.findMany('api::cart.cart', {
      // @ts-ignore
      filters: { user: userId },
      populate: ['item'],
    });
    // If no cart exists, create a new one
    if (userCart.length === 0) {    
      
      // @ts-ignore
      userCart = await strapi.entityService.create('api::cart.cart', {
        data: {
          user: userId,
          item: [{ product,variantId, quantity,"price": variant[0].price,image: url }],
            totalQuantity: quantity,
            totalPrice: variant[0].price * quantity,
            publishedAt: new Date().toISOString(),
          },
      });
    } else {
      //A cart already exist. Check if the variant is already in the cart
      // @ts-ignore
      let itemIndex = userCart[0].item.findIndex(
        (singleItem) => singleItem.variantId === variantId
      );
      if (itemIndex === -1) {
        // The item with the specified variant is not in the cart, so add it.
        // let url = `${variant[0].images[0].url}`;
        const newItem = { product, variantId, quantity, price: variant[0].price,image: url };
      
        // Calculate updated totalQuantity and totalPrice
        const updatedQuantity = userCart[0].totalQuantity + quantity;
        const updatedPrice = userCart[0].totalPrice + variant[0].price * quantity;
      
        // Update the cart with the new item and new totals
        // @ts-ignore
        userCart = await strapi.entityService.update('api::cart.cart', userCart[0].id, {
          data: {
            // @ts-ignore
            item: [...userCart[0].item, newItem], // Add the new item to the existing array
            totalQuantity: updatedQuantity,
            totalPrice: updatedPrice,
          },
        });
      } else{
        //Variant already exist. So lets update the quantity and price of the existing variant and recalculate total price and total quantity
        const existingCart = userCart[0];
        // @ts-ignore
        const existingItem = existingCart.item[itemIndex];
        // Update existingItem quantity and price
        // @ts-ignore
        existingItem.quantity += quantity;
        // @ts-ignore
        existingItem.price += variant[0].price * quantity;
        // Calculate updated totalQuantity and totalPrice
        const updatedQuantity = existingCart.totalQuantity + quantity;
        const updatedPrice = existingCart.totalPrice + variant[0].price * quantity;
        // Update the cart with the new item and new totals
        // @ts-ignore
        userCart = await strapi.entityService.update('api::cart.cart', existingCart.id, {
          data: {
            // @ts-ignore
            item: [...existingCart.item], // Add the new item to the existing array
            totalQuantity: updatedQuantity,
            totalPrice: updatedPrice,
          },
        });
        
      }
     
    }
    //Sanitize output and return
    // @ts-ignore
    return {
      userCart,
      message: 'Cart updated successfully',
    }
  },

  // Remove a product from the cart (using payload)
  async removeItemFromCart(ctx) {
    const { productId, quantity } = ctx.query; // Get productId and quantity from query parameters
    console.log(productId);
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

    // Find the index of the item in the cart
    // @ts-ignore
    const itemIndex = cart.item.findIndex(singleItem => singleItem.product.id === parseInt(productId));

    if (itemIndex === -1) {
        return ctx.notFound('Product not found in cart');
    }

    // If quantity is specified, reduce it; otherwise, remove the item completely
    if (quantity) {
        // @ts-ignore
        cart.item[itemIndex].quantity -= parseInt(quantity);

        // If the quantity goes to zero or below, remove the item
        // @ts-ignore
        if (cart.item[itemIndex].quantity <= 0) {
            // @ts-ignore
            cart.item.splice(itemIndex, 1);
        }
    } else {
        // Remove the item if no quantity is specified
        // @ts-ignore
        cart.item.splice(itemIndex, 1);
    }

    // Update the cart with the new item array
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
      populate: ['item', 'item.product','item.product.variant','item.product.variant.images'],
    });

    if (!cart.length) {
      return ctx.notFound('Cart not found');
    }

    return cart[0];
  },
}));

async function fetchProductVariant(productId,variantId){
  let isSuccess = false;
  let fetchMessage = 'fetching';
  const product = await strapi.entityService.findOne('api::product.product', productId, {
    // @ts-ignore      
    populate: ['variant','variant.images'],
  })
  
    if (!product) {
      fetchMessage = `Product with the given Id: ${productId} not found`;
      // Return error if the product does not exist
      return {product,variant: null,isSuccess,fetchMessage};
    }
    
    // Step 2: Check if the variant exists inside the product
    // @ts-ignore
    const variant = product.variant.filter((v) => v.id === variantId);
    

    if (variant.length === 0) {
      // Return error if the variant is not found in the product
      fetchMessage = `Variant with the given Id: ${variantId} not found`;
      return {product,variant,isSuccess,fetchMessage};
    }

    isSuccess = true;
    return {
      product,
      variant,
      isSuccess,
      fetchMessage: 'Product with variant successfully fetched'
    }
}
