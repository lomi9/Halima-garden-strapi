"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::cart.cart", ({ strapi }) => ({
  /**
   * Nettoie les paniers expirés en réajustant les stocks des produits concernés.
   */
  async cleanupExpiredCarts() {
    // Définit la date limite
    const expirationTime = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
    const dateLimit = new Date(new Date().getTime() - expirationTime);

    console.log(`Recherche de paniers expirés avant : ${dateLimit}`);

    // Récupérer tous les paniers dont la date de mise à jour est antérieure à la limite
    const expiredCarts = await strapi.entityService.findMany("api::cart.cart", {
      filters: { addedAt: { $lt: dateLimit } },
      populate: { products: true }, // Bien peupler les produits si c'est une relation
    });

    console.log(`${expiredCarts.length} panier(s) expiré(s) trouvé(s).`);

    // Traiter chaque panier expiré
    for (const cart of expiredCarts) {
      console.log(
        `Traitement du panier ${cart.id} avec ${cart.products.length} produit(s).`
      );

      for (const product of cart.products) {
        console.log(
          `Mise à jour du stock pour le produit ${product.id}: stock actuel ${product.stock}, stockInCart ${product.stockInCart}.`
        );

        await strapi.entityService.update("api::product.product", product.id, {
          data: {
            stock: product.stock + 1,
            stockInCart: product.stockInCart - 1,
          },
        });

        console.log(
          `Produit ${product.id} mis à jour : +1 stock, -1 stockInCart.`
        );
      }

      await strapi.entityService.delete("api::cart.cart", cart.id);
      console.log(`Panier ${cart.id} supprimé ou marqué comme expiré.`);
    }
  },
}));
