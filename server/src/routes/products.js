const express = require("express");
const prisma = require("../prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
    res.json(products);
  })
);

router.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { name, price, stock } = req.body;
    const numericPrice = Number(price);
    const numericStock = stock == null ? 0 : Number(stock);

    if (!name || price == null || Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "name requis, price doit être un nombre >= 0" });
    }
    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ error: "stock doit être un nombre >= 0" });
    }

    const product = await prisma.product.create({
      data: { name, price: numericPrice, stock: numericStock },
    });
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { name, price, stock } = req.body;
    const data = {};

    if (name != null) data.name = name;

    if (price != null) {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ error: "price doit être un nombre >= 0" });
      }
      data.price = numericPrice;
    }

    if (stock != null) {
      const numericStock = Number(stock);
      if (Number.isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: "stock doit être un nombre >= 0" });
      }
      data.stock = numericStock;
    }

    try {
      const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
      res.json(product);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Produit introuvable" });
      throw err;
    }
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    try {
      await prisma.product.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Produit introuvable" });
      const isForeignKeyViolation = err.code === "P2003" || /foreign key|violates/i.test(err.message || "");
      if (isForeignKeyViolation) {
        return res.status(409).json({ error: "Impossible de supprimer : ce produit a des ventes associées" });
      }
      throw err;
    }
  })
);

module.exports = router;
