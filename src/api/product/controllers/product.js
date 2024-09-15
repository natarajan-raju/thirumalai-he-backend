'use strict';

module.exports = {
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


  // Override the create method
  async create(ctx) {
    const { body } = ctx.request;

    const product = await strapi.db.query('api::product.product').create({
      data: body,
      populate: ['company','variant.images','feature'],
    });

    return ctx.send(product);
  },

  // Override the update method
  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;

    const product = await strapi.db.query('api::product.product').update({
      where: { id },
      data: body,
      populate: ['company','variant.images','feature'],
    });

    if (!product) {
      return ctx.notFound('Product not found');
    }

    return ctx.send(product);
  },

  // Override the delete method
  async delete(ctx) {
    const { id } = ctx.params;

    const product = await strapi.db.query('api::product.product').delete({
      where: { id },
    });

    if (!product) {
      return ctx.notFound('Product not found');
    }

    return ctx.send(product);
  },
};
