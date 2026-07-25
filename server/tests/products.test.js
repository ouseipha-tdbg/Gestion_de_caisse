const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin, createCashierAndLogin } = require("./helpers");

describe("Produits", () => {
  it("rejette un prix négatif", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test", price: -5, stock: 10 });

    expect(res.status).toBe(400);
  });

  it("rejette un prix non entier (la devise F CFA n'a pas de sous-unité)", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test", price: 2.5, stock: 10 });

    expect(res.status).toBe(400);
  });

  it("crée un produit valide", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 20 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Café");
    expect(res.body.price).toBe(500);
  });

  it("enregistre et met à jour l'image d'un produit", async () => {
    const token = await createAdminAndLogin();
    const fakeDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD";

    const created = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 20, image: fakeDataUrl });

    expect(created.body.image).toBe(fakeDataUrl);

    const updated = await request(app)
      .put(`/api/products/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ image: null });

    expect(updated.body.image).toBeNull();
  });

  it("refuse la création de produit à un compte non-admin", async () => {
    const { token } = await createCashierAndLogin();

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test", price: 500, stock: 10 });

    expect(res.status).toBe(403);
  });

  it("renvoie 409 (pas un crash) si on supprime un produit ayant des ventes associées", async () => {
    const token = await createAdminAndLogin();
    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 20 });

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
