const { Webhook } = require("svix");

module.exports = {
  async handleClerkWebhook(ctx) {
    console.log("Début de la fonction handleClerkWebhook");
    const payload = ctx.request.body;
    const headers = ctx.request.headers;

    // Log du payload et des headers pour débogage
    console.log("Payload reçu:", payload);
    console.log("Headers reçus:", headers);

    // Création de l'instance Webhook avec votre clé secrète
    const webhook = new Webhook(process.env.WEBHOOK_SECRET);

    try {
      // Vérification de la signature du webhook
      webhook.verify(JSON.stringify(payload), {
        "svix-id": headers["svix-id"],
        "svix-timestamp": headers["svix-timestamp"],
        "svix-signature": headers["svix-signature"],
      });

      // Log après la vérification pour confirmer que la vérification a réussi
      console.log("Signature du webhook vérifiée avec succès");

      // Votre logique existante
      const { data } = payload;

      // Log pour vérifier que le payload contient bien les données attendues
      console.log("Données extraites du payload:", data);

      if (
        !data ||
        !data.email_addresses ||
        !data.email_addresses.length ||
        !data.email_addresses[0].email_address
      ) {
        console.log("Email manquant dans le payload reçu de Clerk.");
        return ctx.throw(400, "Email manquant dans le payload reçu de Clerk.");
      }

      const emailAddress = data.email_addresses[0].email_address;

      if (!emailAddress) {
        console.log("Email principal manquant dans le payload.");
        return ctx.throw(400, "Email principal manquant dans le payload.");
      }

      const existingUser = await strapi.services["clerk-user"].findOne({
        email: emailAddress,
      });

      if (existingUser) {
        const updatedUser = await strapi.services["clerk-user"].update(
          { id: existingUser.id },
          { email: emailAddress }
        );
        ctx.send({
          message: "Utilisateur mis à jour avec succès.",
          updatedUser,
        });
      } else {
        const newUser = await strapi.services["clerk-user"].create({
          email: emailAddress,
        });
        ctx.send({ message: "Nouvel utilisateur créé avec succès.", newUser });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification ou de la manipulation du webhook:",
        error
      );
      ctx.throw(
        500,
        `Erreur lors de la vérification ou de la manipulation du webhook: ${error.message}`
      );
    }
  },
};
