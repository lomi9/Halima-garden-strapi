module.exports = {
  async handleClerkWebhook(ctx) {
    // Vérifier que le corps de la requête contient le bon format
    const eventData = ctx.request.body;

    // Assurer que eventData contient 'data' et 'email_addresses' avant de continuer
    if (!eventData || !eventData.data || !eventData.data.email_addresses) {
      return ctx.throw(400, "Requête invalide - données manquantes.");
    }

    // Trouver l'email vérifié (ou le premier email si vous n'avez pas d'email vérifié)
    const verifiedEmailObject = eventData.data.email_addresses.find(
      (email) => email.verification && email.verification.status === "verified"
    );
    let primaryEmail = verifiedEmailObject
      ? verifiedEmailObject.email_address
      : null;

    if (!primaryEmail) {
      // Si aucun email vérifié n'est trouvé, utilisez le premier email dans la liste à la place
      const firstEmailObject = eventData.data.email_addresses[0];
      primaryEmail = firstEmailObject ? firstEmailObject.email_address : null;
    }
    if (!primaryEmail) {
      return ctx.throw(
        400,
        "Email principal manquant dans les données de webhook"
      );
    }

    try {
      // Vérifiez si un utilisateur existe avec cette adresse email
      const existingUser = await strapi.services["clerk-user"].findOne({
        email: primaryEmail,
      });

      if (existingUser) {
        // Si l'utilisateur existe déjà, mettez à jour les informations (si nécessaire)
        const updatedUser = await strapi.services["clerk-user"].update(
          { id: existingUser.id },
          { email: primaryEmail }
        );
        ctx.send({
          message: "Utilisateur mis à jour avec succès.",
          updatedUser,
        });
      } else {
        // Si l'utilisateur n'existe pas, créez-en un nouveau
        const newUser = await strapi.services["clerk-user"].create({
          email: primaryEmail,
        });
        ctx.send({ message: "Nouvel utilisateur créé avec succès.", newUser });
      }
    } catch (error) {
      ctx.throw(
        500,
        `Erreur lors de la création ou la mise à jour de l'utilisateur : ${error.message}`
      );
    }
  },
};
