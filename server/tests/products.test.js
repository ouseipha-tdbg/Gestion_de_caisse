const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin } = require("./helpers");

describe("Produits", () => {
  it("rejette un prix négatif", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test", price: -5, stock: 10 });

    expect(res.status).toBe(400);
  });

  it("crée un produit valide", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 2.5, stock: 20 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Café");
  });

  it("refuse la création de produit à un compte non-admin", async () => {
    const adminToken = await createAdminAndLogin();
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Caissier", email: "caissier@test.local", password: "password123" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "caissier@test.local", password: "password123" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Test", price: 5, stock: 10 });

    expect(res.status).toBe(403);
  });

  it("renvoie 409 (pas un crash) si on supprime un produit ayant des ventes associées", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 2.5, stock: 20 });

    await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: product.body.id, quantity: 1 }] });

    const res = await request(app)
      .delete(`/api/products/${product.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it("renvoie 404 si le produit à supprimer n'existe pas", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/products/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
