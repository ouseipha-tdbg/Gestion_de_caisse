const express = require("express");
const prisma = require("../prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  res.json(products);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: "name et price sont requis" });
  }
  const product = await prisma.product.create({
    data: { name, price, stock: stock ?? 0 },
  });
  res.status(201).json(product);
});

router.put("/:id", requireRole("ADMIN"), async (req, res) => {
  const { name, price, stock } = req.body;
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { name, price, stock },
  });
  res.json(product);
});

router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

module.exports = router;
