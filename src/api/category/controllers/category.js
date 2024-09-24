'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  // Override the `find` function
  async find(ctx) {
    const entities = await strapi.db.query('api::category.category').findMany({
      populate: {
        image: true,  // Only populate images for the category
      },
    });
    return ctx.send(entities);
  },

  // Override the `findOne` function
  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::category.category').findOne({
      where: { id },
      populate: {
        image: true,  // Only populate images for the category
      },
    });
    if (!entity) {
      return ctx.notFound('Category not found');
    }
    return ctx.send(entity);
  },

  // New function to find category by name
  async findProductsByCategoryName(ctx) {
    const { categoryName } = ctx.params;
  
    // Step 1: Use Knex to perform a case-insensitive search for the category
    const categoryEntity = await strapi.db.connection('categories')
      .whereRaw('LOWER(name) = ?', categoryName.toLowerCase())
      .first();
  
    if (!categoryEntity) {
      return ctx.notFound('Category not found');
    }
  
    // Step 2: Fetch the category and populate the image (using Strapi's query)
    const category = await strapi.db.query('api::category.category').findOne({
      where: { id: categoryEntity.id },
      populate: {
        image: true, // Populate category image
      },
    });
  
    // Step 3: Fetch products related to the category
    const products = await strapi.db.query('api::product.product').findMany({
      where: {
        categories: category.id, // Assuming categories is the correct relation field
      },
      populate: ['company','variant.images','feature'],
    });
  
    // Step 4: Return combined result
    const result = {
      category,
      products,
    };
  
    return ctx.send(result);
  },  
  
  

}));
