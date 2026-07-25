const express = require("express");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { createSale, listSales } = require("../services/sales");

const router = express.Router();

router.use(requireAuth);

// Créer une vente : { items: [{ productId, quantity }] }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const sale = await createSale(req.user.sub, req.body.items);
      res.status(201).json(sale);
    } catch (err) {
      // Erreurs de validation métier attendues (stock insuffisant, produit introuvable, etc.)
      res.status(400).json({ error: err.message });
    }
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await listSales());
  })
);

module.exports = router;
