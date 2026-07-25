const express = require("express");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { getDailyReport } = require("../services/reports");

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

module.exports = router;
