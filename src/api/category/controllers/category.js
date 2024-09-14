'use strict';

/**
 * A set of functions called "actions" for `category`
 */

module.exports = {
  async findProductsByCategory(ctx) {
    const { categoryName } = ctx.params;

    // Find the category by name (assuming 'name' is a unique identifier)
    const categoryEntity = await strapi.db.query('api::category.category').findOne({
      where: { name: categoryName },
      populate: {
        products: {
          populate: {
            images: true,      // Populate images for products
            components: true,  // Populate components for products
          },
        },
        images: true,  // Populate images for the category
      },
    });

    if (!categoryEntity) {
      return ctx.notFound('Category not found');
    }

    // Return products associated with the category
    return ctx.send(categoryEntity.products);
  },

  async find(ctx) {
    const entities = await strapi.db.query('api::category.category').findMany({
      populate: {        
        image: true,  // Populate images for the category
      },
    });
    return ctx.send(entities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::category.category').findOne({
      where: { id },
      populate: {
        products: {
          populate: {
            images: true,      // Populate images for products
            components: true,  // Populate components for products
          },
        },
        images: true,  // Populate images for the category
      },
    });
    if (!entity) {
      return ctx.notFound('Category not found');
    }
    return ctx.send(entity);
  },

  async create(ctx) {
    const { body } = ctx.request;
    const entity = await strapi.db.query('api::category.category').create({ data: body });
    return ctx.send(entity);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    const entity = await strapi.db.query('api::category.category').update({ where: { id }, data: body });
    if (!entity) {
      return ctx.notFound('Category not found');
    }
    return ctx.send(entity);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::category.category').delete({ where: { id } });
    if (!entity) {
      return ctx.notFound('Category not found');
    }
    return ctx.send(entity);
  },
};
