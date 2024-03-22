module.exports = {
  async handleClerkWebhook(ctx) {
    // Obtenir les données de l'événement Clerk envoyées dans le corps de la requête
    const eventData = ctx.request.body;

    // Extraire l'adresse email principale
    const emailAddress = eventData.data.email_addresses.find(
      (email) => email.id === eventData.data.primary_email_address_id
    ).email_address;

    try {
      // Vérifiez si un utilisateur existe avec cette adresse email
      const existingUser = await strapi
        .query("clerk-user")
        .findOne({ email: emailAddress });

      if (existingUser) {
        // Si l'utilisateur existe déjà, mettez à jour les informations (si nécessaire)
        await strapi
          .query("clerk-user")
          .update({ id: existingUser.id }, { email: emailAddress });
        ctx.send({ message: "Utilisateur mis à jour avec succès." });
      } else {
        // Si l'utilisateur n'existe pas, créez-en un nouveau
        await strapi.query("clerk-user").create({ email: emailAddress });
        ctx.send({ message: "Nouvel utilisateur créé avec succès." });
      }
    } catch (error) {
      // Gérer les erreurs
      ctx.throw(
        500,
        "Une erreur est survenue lors de la création ou la mise à jour de l'utilisateur Clerk."
      );
    }
  },
};
