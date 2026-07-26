const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcodeTerminal = require("qrcode-terminal");
const QRCode = require("qrcode");

let client = null;
let ready = false;
let currentQrDataUrl = null;

function initWhatsApp() {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
    puppeteer: { headless: true },
  });

  client.on("qr", async (qr) => {
    console.log("\n[WhatsApp] Scanne ce QR code avec l'app WhatsApp (Appareils liés) :\n");
    qrcodeTerminal.generate(qr, { small: true });
    try {
      // Aussi affiché directement dans Paramètres > WhatsApp, pas besoin de regarder le terminal.
      currentQrDataUrl = await QRCode.toDataURL(qr, { width: 280, margin: 1 });
    } catch (err) {
      console.error("[WhatsApp] Impossible de générer l'image du QR code :", err.message);
    }
  });

  client.on("ready", () => {
    ready = true;
    currentQrDataUrl = null;
    console.log("[WhatsApp] Client connecté et prêt.");
  });

  client.on("auth_failure", (msg) => {
    console.error("[WhatsApp] Échec d'authentification :", msg);
  });

  client.on("disconnected", (reason) => {
    ready = false;
    currentQrDataUrl = null;
    console.warn("[WhatsApp] Déconnecté :", reason);
  });

  // Le bot est une fonctionnalité optionnelle : un souci Puppeteer/Chromium ne doit
  // jamais faire planter le reste du serveur (sinon la caisse s'arrête aussi).
  client.on("error", (err) => {
    ready = false;
    console.error("[WhatsApp] Erreur du client :", err);
  });

  client.initialize().catch((err) => {
    ready = false;
    client = null;
    currentQrDataUrl = null;
    console.error("[WhatsApp] Échec du démarrage du client :", err.message);
  });

  return client;
}

// Démarre le client à la volée si l'admin vient d'activer WhatsApp depuis les paramètres
// (sans avoir besoin de redémarrer le serveur).
async function syncWhatsappWithSettings(settings) {
  if (settings.whatsappEnabled && !client) {
    initWhatsApp();
  }
}

function isReady() {
  return ready;
}

function getQrCode() {
  return currentQrDataUrl;
}

async function sendMessage(to, text) {
  if (!client || !ready) {
    throw new Error("Le client WhatsApp n'est pas prêt (QR code pas encore scanné ?)");
  }
  return client.sendMessage(to, text);
}

module.exports = { initWhatsApp, syncWhatsappWithSettings, isReady, getQrCode, sendMessage };
