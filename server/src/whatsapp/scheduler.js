const cron = require("node-cron");
const { getDailyReport } = require("../services/reports");
const { sendMessage, isReady } = require("./client");
const { formatDailyReportMessage } = require("./message");

// Format attendu pour WHATSAPP_SEND_TIME : "HH:mm" (heure locale du serveur)
function buildCronExpression(time) {
  const [hour, minute] = (time || "20:00").split(":").map(Number);
  return `${minute} ${hour} * * *`;
}

async function sendDailyReportNow() {
  const target = process.env.WHATSAPP_TARGET;
  if (!target) {
    console.warn("[WhatsApp] WHATSAPP_TARGET n'est pas défini, envoi ignoré.");
    return;
  }
  if (!isReady()) {
    console.warn("[WhatsApp] Client non prêt, envoi ignoré.");
    return;
  }

  const report = await getDailyReport(new Date());
  await sendMessage(target, formatDailyReportMessage(report));
  console.log(`[WhatsApp] Rapport du ${report.date} envoyé à ${target}.`);
}

function startDailyReportScheduler() {
  const cronExpr = buildCronExpression(process.env.WHATSAPP_SEND_TIME);
  cron.schedule(cronExpr, () => {
    sendDailyReportNow().catch((err) => console.error("[WhatsApp] Erreur envoi rapport :", err));
  });
  console.log(`[WhatsApp] Planificateur actif (cron: "${cronExpr}").`);
}

module.exports = { startDailyReportScheduler, sendDailyReportNow };
