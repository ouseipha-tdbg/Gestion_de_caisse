const express = require("express");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { getDailyReport, getMonthlyReport } = require("../services/reports");
const { buildMonthlySalesWorkbook } = require("../utils/salesExport");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/daily",
  asyncHandler(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const report = await getDailyReport(date);
    res.json(report);
  })
);

// GET /api/reports/export?months=2026-01,2026-02
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const monthsParam = req.query.months;
    if (!monthsParam) {
      return res.status(400).json({ error: "Paramètre months requis (ex: 2026-01,2026-02)" });
    }

    const months = String(monthsParam)
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (months.length === 0) {
      return res.status(400).json({ error: "Au moins un mois doit être sélectionné" });
    }

    for (const m of months) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) {
        return res.status(400).json({ error: `Format de mois invalide : "${m}" (attendu YYYY-MM)` });
      }
    }

    const reports = [];
    for (const m of months) {
      const [year, month] = m.split("-").map(Number);
      reports.push(await getMonthlyReport(year, month));
    }

    const workbook = await buildMonthlySalesWorkbook(reports);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="ventes_${months.join("_")}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  })
);

module.exports = router;
