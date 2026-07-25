const request = require("supertest");
const ExcelJS = require("exceljs");
const app = require("../src/app");
const { createAdminAndLogin } = require("./helpers");

describe("Export des ventes (Excel)", () => {
  it("refuse sans paramètre months", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app).get("/api/reports/export").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("refuse un format de mois invalide", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/reports/export")
      .query({ months: "2026-13" })
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("génère un fichier Excel avec le bon total pour le mois demandé", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 10 });

    await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: product.body.id, quantity: 3 }] });

    const currentMonth = new Date().toISOString().slice(0, 7);

    const res = await request(app)
      .get("/api/reports/export")
      .query({ months: currentMonth })
      .set("Authorization", `Bearer ${token}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("spreadsheetml");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(res.body);
    const sheet = workbook.getWorksheet("Ventes par mois");

    const totalRow = sheet.getRow(sheet.rowCount);
    expect(totalRow.getCell(1).value).toBe("TOTAL");
    expect(totalRow.getCell(2).value).toBe(1);
    expect(totalRow.getCell(3).value).toBe(1500);
  });
});
