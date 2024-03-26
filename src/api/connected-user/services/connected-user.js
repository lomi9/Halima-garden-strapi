'use strict';

/**
 * connected-user service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::connected-user.connected-user');
