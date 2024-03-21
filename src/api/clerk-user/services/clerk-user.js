'use strict';

/**
 * clerk-user service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::clerk-user.clerk-user');
