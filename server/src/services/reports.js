const prisma = require("../prisma");

async function getDailyReport(dateInput = new Date()) {
  const date = new Date(dateInput);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: { include: { product: true } } },
  });

  const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  const parProduit = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.product.name;
      parProduit[key] = (parProduit[key] || 0) + item.quantity;
    }
  }

  return {
    date: start.toISOString().slice(0, 10),
    nombreVentes: sales.length,
    totalRecettes: total,
    parProduit,
  };
}

// year: ex. 2026, month: 1-12
async function getMonthlyReport(year, month) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999); // dernier jour du mois

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: { include: { product: true } } },
  });

  const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  // Liste des articles vendus dans le mois, agrégés par produit.
  const parProduit = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.product.name;
      if (!parProduit[key]) parProduit[key] = { quantite: 0, total: 0 };
      parProduit[key].quantite += item.quantity;
      parProduit[key].total += item.unitPrice * item.quantity;
    }
  }

  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    nombreVentes: sales.length,
    totalRecettes: total,
    parProduit,
  };
}

module.exports = { getDailyReport, getMonthlyReport };
