const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { getSettings, updateSettings, toPublicSettings } = require("../services/settings");
const { syncWhatsappWithSettings } = require("../whatsapp/client");

const router = express.Router();

router.use(requireAuth);

// Accessible à tous les comptes connectés : nécessaire pour l'impression des tickets
// et pour savoir si la boutique gère le stock (masquage des champs côté UI).
router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    res.json(toPublicSettings(settings));
  })
);

router.get(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    res.json(settings);
  })
);

router.put(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const {
      companyName,
      companyLogo,
      companyAddress,
      companyPhone,
      receiptFooter,
      shopType,
      whatsappEnabled,
      whatsappTarget,
      whatsappSendTime,
    } = req.body;

    if (shopType && !["COMMERCE", "SERVICE"].includes(shopType)) {
      return res.status(400).json({ error: "shopType doit être COMMERCE ou SERVICE" });
    }
    if (whatsappSendTime && !/^\d{2}:\d{2}$/.test(whatsappSendTime)) {
      return res.status(400).json({ error: "whatsappSendTime doit être au format HH:mm" });
    }

    const settings = await updateSettings({
      ...(companyName !== undefined && { companyName }),
      ...(companyLogo !== undefined && { companyLogo }),
      ...(companyAddress !== undefined && { companyAddress }),
      ...(companyPhone !== undefined && { companyPhone }),
      ...(receiptFooter !== undefined && { receiptFooter }),
      ...(shopType !== undefined && { shopType }),
      ...(whatsappEnabled !== undefined && { whatsappEnabled }),
      ...(whatsappTarget !== undefined && { whatsappTarget }),
      ...(whatsappSendTime !== undefined && { whatsappSendTime }),
    });

    // Si le bot vient d'être activé et n'était pas encore initialisé, on le démarre à la volée.
    await syncWhatsappWithSettings(settings);

    res.json(settings);
  })
);

module.exports = router;
