module.exports = {
  async handleClerkWebhook(ctx) {
    // Log du contenu reçu par Clerk
    console.log("Payload reçu:", ctx.request.body);

    const { data } = ctx.request.body;

    if (
      !data ||
      !Array.isArray(data.email_addresses) ||
      data.email_addresses.length === 0
    ) {
      console.log("Aucune adresse e-mail trouvée dans le payload.");
      return ctx.throw(400, "Aucune adresse e-mail trouvée dans le payload.");
    }

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
      ctx.throw(
        500,
        `Erreur lors de la création ou la mise à jour de l'utilisateur : ${error.message}`
      );
    }
  },
};
