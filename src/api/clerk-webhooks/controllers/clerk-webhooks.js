module.exports = {
  async handleClerkWebhook(ctx) {
    // Log du contenu reçu par Clerk
    console.log("Payload reçu:", ctx.request.body);

    const { data } = ctx.request.body;

    // S'assurer que l'email est présent dans le payload
    if (
      !data ||
      !data.email_addresses ||
      data.email_addresses.length === 0 ||
      !data.email_addresses[0].email_address
    ) {
      console.log("Email manquant dans le payload reçu de Clerk.");
      return ctx.throw(400, "Email manquant dans le payload reçu de Clerk.");
    }

    // Extraire l'adresse e-mail
    const emailAddress = data.email_addresses[0].email_address;

    if (!emailAddress) {
      console.log("Email principal manquant dans le payload.");
      return ctx.throw(400, "Email principal manquant dans le payload.");
    }

    try {
      // Vérifiez si un utilisateur existe avec cette adresse email
      const existingUser = await strapi.services["clerk-user"].findOne({
        email: emailAddress,
      });

      if (existingUser) {
        // Si l'utilisateur existe déjà, mettez à jour les informations (si nécessaire)
        const updatedUser = await strapi.services["clerk-user"].update(
          { id: existingUser.id },
          { email: emailAddress }
        );
        ctx.send({
          message: "Utilisateur mis à jour avec succès.",
          updatedUser,
        });
      } else {
        // Si l'utilisateur n'existe pas, créez-en un nouveau
        const newUser = await strapi.services["clerk-user"].create({
          email: emailAddress,
        });
        ctx.send({ message: "Nouvel utilisateur créé avec succès.", newUser });
      }
    } catch (error) {
      console.error("Erreur lors de la manipulation du webhook:", error);
      ctx.throw(500, "Erreur lors de la manipulation du webhook");
    }
  },
};
