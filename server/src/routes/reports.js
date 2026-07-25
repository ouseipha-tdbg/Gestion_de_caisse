const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getDailyReport } = require("../services/reports");

const router = express.Router();

router.use(requireAuth);

router.get("/daily", async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const report = await getDailyReport(date);
  res.json(report);
});

module.exports = router;
