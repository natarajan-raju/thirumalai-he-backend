const { createCoreController } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
  // Custom method to create or update the cart for the authenticated user
  // @ts-ignore
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
      filters: { users_permissions_user: userId },
      populate: ['item'],
    });
    // If no cart exists, create a new one
    if (userCart.length === 0) {    
      
      // @ts-ignore
      userCart = await strapi.entityService.create('api::cart.cart', {
        data: {
          users_permissions_user: userId,
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
  // @ts-ignore
  async removeItemFromCart(ctx) {
    const { productId, quantity, variantId } = ctx.query; // Get productId, quantity, and variantId from query parameters
  
    // Fetch the product variant to ensure it exists and is valid
    const { isSuccess, fetchMessage } = await fetchProductVariant(productId, variantId);
    if (!isSuccess) {
      return ctx.badRequest(fetchMessage);
    }
  
    const userId = ctx.state.user.id;
  
    // Find the user's cart and populate the items and related product data
    let cart = await strapi.entityService.findMany('api::cart.cart', {
      // @ts-ignore
      filters: { users_permissions_user: userId }, // Ensure we filter by the correct user
      populate: ['item', 'item.product'],
    });
  
    if (!cart.length) {
      return ctx.notFound('Cart not found');
    }
  
    // Get the first cart (since each user should have only one)
    // @ts-ignore
    cart = cart[0];
  
    // Find the index of the item in the cart using the variantId
    // @ts-ignore
    const itemIndex = cart.item.findIndex(singleItem => singleItem.variantId === parseInt(variantId));
  
    if (itemIndex === -1) {
      return ctx.notFound('Product not found in cart');
    }
  
    // Get the existing item to adjust its quantity and price values
    // @ts-ignore
    const existingItem = cart.item[itemIndex];
  
    // If quantity is specified in the request, reduce it; otherwise, remove the item completely
    if (quantity) {
      // @ts-ignore
      const quantityToRemove = parseInt(quantity);
      if(quantityToRemove > existingItem.quantity){
        console.log(quantity,quantityToRemove,existingItem.quantity);
        return ctx.badRequest('Quantity to remove is greater than quantity in cart');
      }
      // Decrease the quantity of the existing item
      existingItem.quantity -= quantityToRemove;
      // @ts-ignore
      cart.totalQuantity -= quantityToRemove;
      // @ts-ignore
      cart.totalPrice -= quantityToRemove * existingItem.price;
      // If the quantity goes to zero or below, remove the item from the cart
      if (existingItem.quantity <= 0) {
        // @ts-ignore
        cart.item.splice(itemIndex, 1);
      } 
    } else {
      // Remove the item from the cart if no quantity is specified
      // @ts-ignore
      cart.item.splice(itemIndex, 1);
      
    }
  

  
    // Update the cart with the new item array and the recalculated totals
    // @ts-ignore
    const updatedCart = await strapi.entityService.update('api::cart.cart', cart.id, {
      data: {
        // @ts-ignore
        item: cart.item, // Update the items array
        // @ts-ignore
        totalQuantity: cart.totalQuantity, // Set the new total quantity
        // @ts-ignore
        totalPrice: cart.totalPrice, // Set the new total price
      },
    });
    
    return {
      updatedCart,
      // @ts-ignore
      item: cart.item,
      message: 'Item removed successfully',
    };
  }
  ,

  // Fetch the user's cart
  // @ts-ignore
  async find(ctx) {
    const userId = ctx.state.user.id;

    const cart = await strapi.entityService.findMany('api::cart.cart', {
      // @ts-ignore
      filters: { users_permissions_user: userId },
      populate: ['item', 'item.product','users_permissions_user'],
    });

    if (!cart.length) {
      return ctx.notFound('Cart not found');
    }
    // @ts-ignore
    const { id, totalQuantity, totalPrice, item, users_permissions_user} = cart[0];
    return {
      id,
      totalQuantity,
      totalPrice,
      item,
      // @ts-ignore
      userID: users_permissions_user.id,
      // @ts-ignore
      userName: users_permissions_user.username
    }
  // @ts-ignore
  },

  //Override core findOne
  //Restrict cart access to own cart
  // @ts-ignore
  async findOne(ctx) {
    // @ts-ignore
    const { userId } = ctx.state.user;
    // @ts-ignore
    
    const { id: cartId } = ctx.params;
    
    const cart = await strapi.entityService.findOne('api::cart.cart', parseInt(cartId), {
      filters: { users_permissions_user: userId },
      populate: {
        item: {
          populate: ['product'], // Populate product inside item
        },
        users_permissions_user: {
          fields: ['id', 'username'], // Select specific fields in users_permissions_user
        },
      },
    });
    console.log(cart.id,cartId);
    const { id, totalQuantity, totalPrice, item, users_permissions_user} = cart;
    // @ts-ignore
    if (!cart || parseInt(cart.id) !== parseInt(cartId)) {
      return ctx.forbidden('You do not have permission to access this cart.');
    }

    return {
      id,
      totalQuantity,
      totalPrice,
      item,
      // @ts-ignore
      userID: users_permissions_user.id,
      // @ts-ignore
      userName: users_permissions_user.username   
    };
  // @ts-ignore
  },
// @ts-ignore
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
    
    const variant = product.variant.filter((v) => v.id === parseInt(variantId));
    

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
