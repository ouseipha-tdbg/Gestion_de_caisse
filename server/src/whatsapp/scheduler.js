const cron = require("node-cron");
const { getDailyReport } = require("../services/reports");
const { getSettings } = require("../services/settings");
const { sendMessage, isReady } = require("./client");
const { formatDailyReportMessage } = require("./message");

let lastSentDate = null;

function currentHHmm() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

async function sendDailyReportNow() {
  const settings = await getSettings();
  if (!settings.whatsappTarget) {
    console.warn("[WhatsApp] Aucun numéro cible configuré, envoi ignoré.");
    return;
  }
  if (!isReady()) {
    console.warn("[WhatsApp] Client non prêt, envoi ignoré.");
    return;
  }

  const report = await getDailyReport(new Date());
  await sendMessage(settings.whatsappTarget, formatDailyReportMessage(report));
  console.log(`[WhatsApp] Rapport du ${report.date} envoyé à ${settings.whatsappTarget}.`);
}

// Vérifie chaque minute si l'heure d'envoi configurée (modifiable depuis les paramètres,
// sans redémarrage du serveur) correspond à l'heure actuelle.
function startDailyReportScheduler() {
  cron.schedule("* * * * *", async () => {
    const settings = await getSettings();
    if (!settings.whatsappEnabled) return;

    const today = new Date().toISOString().slice(0, 10);
    if (currentHHmm() === settings.whatsappSendTime && lastSentDate !== today) {
      lastSentDate = today;
      sendDailyReportNow().catch((err) => console.error("[WhatsApp] Erreur envoi rapport :", err));
    }
  });
  console.log("[WhatsApp] Planificateur actif (vérifie l'heure configurée chaque minute).");
}

module.exports = { startDailyReportScheduler, sendDailyReportNow };
