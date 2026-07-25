const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// Créer une vente : { items: [{ productId, quantity }] }
router.post("/", async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items est requis (tableau non vide)" });
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItemsData = [];

      for (const { productId, quantity } of items) {
        if (!productId || !quantity || quantity <= 0) {
          throw new Error("Chaque item nécessite productId et quantity > 0");
        }

        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error(`Produit ${productId} introuvable`);
        if (product.stock < quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }

        const unitPrice = product.price;
        total += Number(unitPrice) * quantity;

        saleItemsData.push({ productId, quantity, unitPrice });

        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
      }

      return tx.sale.create({
        data: {
          total,
          userId: req.user.sub,
          items: { create: saleItemsData },
        },
        include: { items: { include: { product: true } } },
      });
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
  });
  res.json(sales);
});

module.exports = router;
