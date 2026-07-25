const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let client = null;
let ready = false;

function initWhatsApp() {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
    puppeteer: { headless: true },
  });

  client.on("qr", (qr) => {
    console.log("\n[WhatsApp] Scanne ce QR code avec l'app WhatsApp (Appareils liés) :\n");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    ready = true;
    console.log("[WhatsApp] Client connecté et prêt.");
  });

  client.on("auth_failure", (msg) => {
    console.error("[WhatsApp] Échec d'authentification :", msg);
  });

  client.on("disconnected", (reason) => {
    ready = false;
    console.warn("[WhatsApp] Déconnecté :", reason);
  });

  client.initialize();
  return client;
}

function isReady() {
  return ready;
}

async function sendMessage(to, text) {
  if (!client || !ready) {
    throw new Error("Le client WhatsApp n'est pas prêt (QR code pas encore scanné ?)");
  }
  return client.sendMessage(to, text);
}

module.exports = { initWhatsApp, isReady, sendMessage };
