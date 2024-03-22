module.exports = {
  async handleClerkWebhook(ctx) {
    const { emailAddress } = ctx.request.body.data;

    try {
      // Créer un nouveau 'Clerk-user' avec l'email reçu de Clerk
      const newUser = await strapi.services["clerk_users"].create({
        email: emailAddress,
      });
      return ctx.created(newUser);
    } catch (error) {
      return ctx.badRequest(
        "Une erreur est survenue lors de la création de l'utilisateur Clerk."
      );
    }
  },
};
