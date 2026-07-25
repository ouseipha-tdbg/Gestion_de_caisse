const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { isReady, sendMessage } = require("../whatsapp/client");
const { getDailyReport } = require("../services/reports");
const { getSettings } = require("../services/settings");
const { formatDailyReportMessage } = require("../whatsapp/message");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/status", (req, res) => {
  res.json({ ready: isReady() });
});

router.post(
  "/send-daily-report",
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const target = req.body.target || settings.whatsappTarget;
    if (!target) {
      return res.status(400).json({ error: "Aucun numéro cible configuré dans les paramètres" });
    }
    if (!isReady()) {
      return res.status(409).json({ error: "Client WhatsApp non connecté (QR code pas scanné ?)" });
    }

    const report = await getDailyReport(new Date());
    await sendMessage(target, formatDailyReportMessage(report));
    res.json({ ok: true, report });
  })
);

module.exports = router;
