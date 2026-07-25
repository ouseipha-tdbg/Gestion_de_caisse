const request = require("supertest");
const app = require("../src/app");

describe("Auth", () => {
  it("le premier compte enregistré devient ADMIN sans authentification", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Premier",
      email: "premier@test.local",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("ADMIN");
  });

  it("refuse toute inscription publique une fois un compte déjà existant, même avec un token admin", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Premier",
      email: "premier@test.local",
      password: "password123",
    });
    const login = await request(app).post("/api/auth/login").send({
      email: "premier@test.local",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Intrus", email: "intrus@test.local", password: "password123", role: "ADMIN" });

    expect(res.status).toBe(403);
  });

  it("refuse la connexion avec un mauvais mot de passe", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Premier",
      email: "premier@test.local",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "premier@test.local",
      password: "mauvais-mot-de-passe",
    });

    expect(res.status).toBe(401);
  });
});
