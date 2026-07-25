const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin, createCashierAndLogin } = require("./helpers");

describe("Utilisateurs (CRUD admin)", () => {
  it("un admin peut créer un utilisateur", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Caissier", email: "caissier2@test.local", password: "password123", role: "CASHIER" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("CASHIER");
    expect(res.body.password).toBeUndefined();
  });

  it("refuse la création d'utilisateur à un compte non-admin", async () => {
    const { token } = await createCashierAndLogin();
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Autre", email: "autre@test.local", password: "password123" });

    expect(res.status).toBe(403);
  });

  it("liste les utilisateurs sans exposer les mots de passe", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].password).toBeUndefined();
  });

  it("un admin peut modifier un utilisateur", async () => {
    const token = await createAdminAndLogin();
    const created = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Caissier", email: "caissier2@test.local", password: "password123", role: "CASHIER" });

    const res = await request(app)
      .put(`/api/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Caissier Renommé" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Caissier Renommé");
  });

  it("empêche de supprimer son propre compte", async () => {
    const token = await createAdminAndLogin();
    const me = await request(app).post("/api/auth/login").send({
      email: "admin@test.local",
      password: "adminpass123",
    });
    const meId = JSON.parse(Buffer.from(me.body.token.split(".")[1], "base64").toString()).sub;

    const res = await request(app)
      .delete(`/api/users/${meId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it("empêche le dernier administrateur de se retirer lui-même son rôle admin", async () => {
    const token = await createAdminAndLogin();
    const me = await request(app).post("/api/auth/login").send({
      email: "admin@test.local",
      password: "adminpass123",
    });
    const meId = JSON.parse(Buffer.from(me.body.token.split(".")[1], "base64").toString()).sub;

    const res = await request(app)
      .put(`/api/users/${meId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "CASHIER" });

    expect(res.status).toBe(409);
  });

  it("un utilisateur ayant des ventes ne peut pas être supprimé (409, pas un crash)", async () => {
    const token = await createAdminAndLogin();
    const cashier = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Caissier", email: "caissier2@test.local", password: "password123", role: "CASHIER" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "caissier2@test.local", password: "password123" });

    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Café", price: 500, stock: 10 });

    await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ items: [{ productId: product.body.id, quantity: 1 }] });

    const res = await request(app)
      .delete(`/api/users/${cashier.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
  });
});
