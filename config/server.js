module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
  cron: {
    enabled: true,
    jobs: {
      // Exécute la fonction cleanupExpiredCarts toutes les minutes pour les tests
      "*/1 * * * *": async () => {
        try {
          console.log("Running cleanupExpiredCarts task");
          await strapi.services.cart.cleanupExpiredCarts();
        } catch (error) {
          console.error("Error during cleanupExpiredCarts task", error);
        }
      },
    },
  },
});
