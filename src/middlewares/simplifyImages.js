'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Call the next middleware (which could be the controller)
    await next();

    // Ensure the middleware only processes JSON responses (avoid processing admin panel assets)
    if (!ctx.response.is('application/json')) {
      // Skip non-JSON responses (like HTML or static files)
      return;
    }

    // Recursive function to simplify image objects to { name, url }
    const simplifyImages = (data) => {
      if (Array.isArray(data)) {
        return data.map(simplifyImages); // Process arrays recursively
      } else if (data && typeof data === 'object') {
        const newObj = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'formats' && value) {
            // Simplify the 'formats' structure to contain only 'name' and 'url'
            const format = value.large || value.medium || value.thumbnail || value.small || value;
            newObj['name'] = format.name || null; // Include name if available
            newObj['url'] = format.url || null;  // Include url
          } else if (key === 'url') {
            // Include the 'url' field if it exists
            newObj['url'] = value;
          } else if (key === 'name') {
            // Include the 'name' field if it exists
            newObj['name'] = value;
          } else if (typeof value === 'object') {
            // Recursively process nested objects
            newObj[key] = simplifyImages(value);
          } else {
            // Include other fields
            newObj[key] = value;
          }
        });

        return newObj;
      }
      return data; // Return other data types (strings, numbers, etc.) as is
    };

    // Check if the response body exists and process it
    if (ctx.body) {
      // Handle arrays or objects and modify the image structure
      if (Array.isArray(ctx.body)) {
        ctx.body = ctx.body.map(simplifyImages);
      } else if (ctx.body.data) {
        // Handle structured responses with a 'data' field
        if (Array.isArray(ctx.body.data)) {
          ctx.body.data = ctx.body.data.map(simplifyImages);
        } else {
          ctx.body.data = simplifyImages(ctx.body.data);
        }
      } else {
        // Handle general objects
        ctx.body = simplifyImages(ctx.body);
      }
    } else {
      console.log('No response body found to process.');
    }
  };
};
