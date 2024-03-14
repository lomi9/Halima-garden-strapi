"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::cart.cart", ({ strapi }) => ({
  /**
   * Nettoie les paniers expirés en réajustant les stocks des produits concernés.
   */
  async cleanupExpiredCarts() {
    // Définir la date limite, par exemple pour une expiration après 30 minutes
    const expirationTime = 30 * 60 * 1000; // 30 minutes en millisecondes
    const dateLimit = new Date(new Date().getTime() - expirationTime);

    // Récupérer tous les paniers dont la date de mise à jour est antérieure à la limite
    const expiredCarts = await strapi.entityService.findMany("api::cart.cart", {
      filters: { addedAt: { $lt: dateLimit } },
      populate: { products: true }, // Assurez-vous de peupler les produits si c'est une relation
    });

    // Traiter chaque panier expiré
    for (const cart of expiredCarts) {
      if (cart.products && cart.products.length > 0) {
        for (const product of cart.products) {
          // Réajuster le stock des produits
          await strapi.entityService.update(
            "api::product.product",
            product.id,
            {
              data: {
                stock: product.stock + 1,
                stockInCart: product.stockInCart - 1,
              },
            }
          );
        }
      }

      // Optionnel : supprimer le panier ou marquer comme expiré
      await strapi.entityService.delete("api::cart.cart", cart.id);
    }
  },
}));
