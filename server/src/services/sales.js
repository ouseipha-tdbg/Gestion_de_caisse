const prisma = require("../prisma");
const { getSettings } = require("./settings");

async function createSale(userId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items est requis (tableau non vide)");
  }

  const settings = await getSettings();
  const trackStock = settings.shopType === "COMMERCE";

  return prisma.$transaction(async (tx) => {
    let total = 0;
    const saleItemsData = [];

    for (const { productId, quantity } of items) {
      if (!productId || !quantity || quantity <= 0) {
        throw new Error("Chaque item nécessite productId et quantity > 0");
      }

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error(`Produit ${productId} introuvable`);

      if (trackStock) {
        // Mise à jour conditionnelle atomique : évite la survente en cas de ventes concurrentes
        // (la simple lecture puis écriture du stock est vulnérable à une race condition).
        const decremented = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (decremented.count === 0) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }
      }

      total += product.price * quantity;
      saleItemsData.push({ productId, quantity, unitPrice: product.price });
    }

    return tx.sale.create({
      data: {
        total,
        userId,
        items: { create: saleItemsData },
      },
      include: { items: { include: { product: true } } },
    });
  });
}

async function listSales() {
  return prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: { include: { product: true } }, user: { select: { id: true, name: true } } },
  });
}

module.exports = { createSale, listSales };
