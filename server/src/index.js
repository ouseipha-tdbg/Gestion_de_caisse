require("dotenv").config();
const app = require("./app");
const { getSettings } = require("./services/settings");
const { initWhatsApp } = require("./whatsapp/client");
const { startDailyReportScheduler } = require("./whatsapp/scheduler");

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));

// La config WhatsApp (activé, numéro, heure d'envoi) vit désormais en base
// (Paramètres, modifiable par l'admin depuis l'UI) plutôt que dans .env.
getSettings()
  .then((settings) => {
    startDailyReportScheduler();
    if (settings.whatsappEnabled) {
      initWhatsApp();
    } else {
      console.log("[WhatsApp] Désactivé dans les paramètres. Bot non démarré.");
    }
  })
  .catch((err) => console.error("[WhatsApp] Impossible de charger les paramètres :", err));
