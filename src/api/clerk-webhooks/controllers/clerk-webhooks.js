module.exports = {
  async handleClerkWebhook(ctx) {
    // Log le contenu pour voir ce que nous recevons de Clerk
    console.log("Payload reçu:", ctx.request.body);

    // Assurez-vous que nous avons les bonnes données dans le payload
    const { data } = ctx.request.body;
    if (!data || !data.email_addresses || data.email_addresses.length === 0) {
      return ctx.throw(
        400,
        "Données de webhook invalides ou adresse e-mail manquante."
      );
    }

    // Puisque le payload montre que l'adresse email est dans email_addresses[0].email_address
    // Nous utilisons cette valeur pour l'email
    const emailAddress = data.email_addresses[0].email_address;

    if (!emailAddress) {
      return ctx.throw(
        400,
        "Email principal manquant dans les données de webhook"
      );
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
