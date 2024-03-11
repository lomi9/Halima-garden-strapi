"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::cart.cart", ({ strapi }) => ({
  async cleanupExpiredCarts() {
    // Définir la date limite (5 minutes avant l'heure actuelle)
    const dateLimit = new Date(new Date().getTime() - 5 * 60 * 1000);

    // Rechercher les entrées de panier expirées
    const expiredCarts = await strapi.entityService.findMany("api::cart.cart", {
      filters: { addedAt: { $lt: dateLimit } },
      fields: ["id"], // Seuls les identifiants sont nécessaires pour la suppression
    });

    // Boucler sur les paniers expirés et les supprimer
    for (let cart of expiredCarts) {
      if (cart && cart.id) {
        await strapi.entityService.delete("api::cart.cart", { id: cart.id });
      }
    }
  },
}));
