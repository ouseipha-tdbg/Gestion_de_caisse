const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const prisma = require("../src/prisma");

async function resetDb() {
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { resetDb };
