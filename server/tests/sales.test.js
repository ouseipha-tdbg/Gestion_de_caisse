const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin } = require("./helpers");

describe("Ventes", () => {
  it("refuse une vente si le stock est insuffisant", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 2 });

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: product.body.id, quantity: 5 }] });

    expect(res.status).toBe(400);
  });

  it("décrémente le stock et calcule le bon total (en F CFA, montants entiers)", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 10 });

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: product.body.id, quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(1500);

    const products = await request(app).get("/api/products").set("Authorization", `Bearer ${token}`);
    expect(products.body.find((p) => p.id === product.body.id).stock).toBe(7);
  });

  // Régression : avant correction, deux ventes concurrentes pouvaient toutes les deux
  // passer la vérification de stock avant que l'une d'elles ne commite (survente).
  it("empêche la survente lors de ventes concurrentes sur le même produit", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 5 });

    const requests = Array.from({ length: 5 }, () =>
      request(app)
        .post("/api/sales")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: product.body.id, quantity: 2 }] })
    );
    const results = await Promise.all(requests);
    const successCount = results.filter((r) => r.status === 201).length;

    expect(successCount).toBe(2); // 5 en stock / 2 par vente = 2 ventes max possibles

    const products = await request(app).get("/api/products").set("Authorization", `Bearer ${token}`);
    const stock = products.body.find((p) => p.id === product.body.id).stock;
    expect(stock).toBe(1);
    expect(stock).toBeGreaterThanOrEqual(0);
  });

  it("ne vérifie ni ne décrémente le stock quand la boutique est de type SERVICE", async () => {
    const token = await createAdminAndLogin();
    await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ shopType: "SERVICE" });

    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Coupe de cheveux", price: 1000, stock: 0 });

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: product.body.id, quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(3000);
  });
});
