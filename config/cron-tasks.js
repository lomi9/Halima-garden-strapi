console.log("Initialisation des tâches cron...");

module.exports = {
  /**
   * Tâche Cron pour nettoyer les paniers expirés toutes les 2 minutes.
   */
  "*/2 * * * *": async ({ strapi }) => {
    try {
      console.log(
        "Exécution de la tâche cron pour nettoyer les paniers expirés."
      );
      await strapi.service("api::cart.cart").cleanupExpiredCarts();
      console.log("Services chargés:", Object.keys(strapi.services));
    } catch (e) {
      console.error(
        "Erreur lors de la tâche cron de nettoyage des paniers :",
        e
      );
    }
  },
};
