const prisma = require("../prisma");

// Paramètres globaux de la boutique : une seule ligne en base.
// À la toute première lecture, on la crée en reprenant d'éventuelles valeurs
// WhatsApp historiques définies dans .env, pour ne pas casser une config existante.
async function getSettings() {
  const existing = await prisma.settings.findFirst();
  if (existing) return existing;

  return prisma.settings.create({
    data: {
      whatsappEnabled: process.env.ENABLE_WHATSAPP === "true",
      whatsappTarget: process.env.WHATSAPP_TARGET || null,
      whatsappSendTime: process.env.WHATSAPP_SEND_TIME || "20:00",
    },
  });
}

async function updateSettings(data) {
  const current = await getSettings();
  return prisma.settings.update({
    where: { id: current.id },
    data,
  });
}

function toPublicSettings(settings) {
  return {
    companyName: settings.companyName,
    companyLogo: settings.companyLogo,
    companyAddress: settings.companyAddress,
    companyPhone: settings.companyPhone,
    receiptFooter: settings.receiptFooter,
    shopType: settings.shopType,
    trackStock: settings.shopType === "COMMERCE",
  };
}

module.exports = { getSettings, updateSettings, toPublicSettings };
