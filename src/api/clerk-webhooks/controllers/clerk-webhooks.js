// clerk-webhook.js
module.exports = {
  async handleClerkWebhook(ctx) {
    const { emailAddress } = ctx.request.body.data; // Assurez-vous que le chemin est correct

    try {
      // Créer un nouveau 'Clerk-user' avec l'email reçu de Clerk
      // Assurez-vous que le service est nommé correctement. Il doit correspondre à votre modèle Strapi
      const newUser = await strapi.services["clerk-user"].create({
        email: emailAddress,
      });
      return ctx.created(newUser);
    } catch (error) {
      console.error(error); // Ajout pour le débogage
      return ctx.badRequest(
        "Une erreur est survenue lors de la création de l'utilisateur Clerk.",
        { error }
      );
    }
  },
};
