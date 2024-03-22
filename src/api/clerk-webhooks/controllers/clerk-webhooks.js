module.exports = {
  async handleClerkWebhook(ctx) {
    const { data } = ctx.request.body; // Les données envoyées par Clerk.

    const email = data.email_addresses[0].email_address; // Email principal de l'utilisateur.

    try {
      // Rechercher s'il existe déjà un utilisateur avec cet email.
      const existingUser = await strapi.query("clerk-user").findOne({ email });

      if (existingUser) {
        // Mettre à jour l'utilisateur si nécessaire.
        await strapi
          .query("clerk-user")
          .update({ id: existingUser.id }, { email });
        ctx.send({ message: "Utilisateur mis à jour avec succès." });
      } else {
        // Créer un nouvel utilisateur.
        await strapi.query("clerk-user").create({ email });
        ctx.send({ message: "Nouvel utilisateur créé avec succès." });
      }
    } catch (error) {
      ctx.send(
        { message: "Erreur lors de la gestion du webhook.", error },
        500
      );
    }
  },
};
