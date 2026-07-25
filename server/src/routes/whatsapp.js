const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { isReady, sendMessage } = require("../whatsapp/client");
const { getDailyReport } = require("../services/reports");
const { formatDailyReportMessage } = require("../whatsapp/message");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/status", (req, res) => {
  res.json({ ready: isReady() });
});

router.post("/send-daily-report", async (req, res) => {
  const target = req.body.target || process.env.WHATSAPP_TARGET;
  if (!target) {
    return res.status(400).json({ error: "Aucun numéro cible (WHATSAPP_TARGET ou body.target)" });
  }
  if (!isReady()) {
    return res.status(409).json({ error: "Client WhatsApp non connecté (QR code pas scanné ?)" });
  }

  try {
    const report = await getDailyReport(new Date());
    await sendMessage(target, formatDailyReportMessage(report));
    res.json({ ok: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
