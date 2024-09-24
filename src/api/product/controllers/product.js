'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  // Override the find method
  async find(ctx) {
    const products = await strapi.db.query('api::product.product').findMany({
        populate: ['company','variant.images','feature'],
    });

    return ctx.send(products);
  },

  // Override the findOne method
  async findOne(ctx) {
    const { id } = ctx.params;

    const product = await strapi.db.query('api::product.product').findOne({
      where: { id },
      populate: ['company','variant.images','feature'],
    });

    if (!product) {
      return ctx.notFound('Product not found');
    }

    return ctx.send(product);
  },

  //Fetch a product with Uniquw slud called pid

  async findByPid(ctx) {
    const { pid } = ctx.params;
    
    if (!pid) {
      return ctx.badRequest('pid is required');
    }

    // Fetch product based on the pid query parameter
    const product = await strapi.db.query('api::product.product').findOne({
      where: { pid },  // Assuming pid is a field in your product content type
      populate: ['company','variant.images','feature'],
    });

    if (!product) {
      return ctx.notFound('Product not found');
    }

    return ctx.send(product);
  },


}));
