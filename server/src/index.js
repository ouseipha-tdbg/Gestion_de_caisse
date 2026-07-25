require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));

if (process.env.ENABLE_WHATSAPP === "true") {
  const { initWhatsApp } = require("./whatsapp/client");
  const { startDailyReportScheduler } = require("./whatsapp/scheduler");
  initWhatsApp();
  startDailyReportScheduler();
} else {
  console.log("[WhatsApp] Désactivé (ENABLE_WHATSAPP=false). Bot non démarré.");
}
