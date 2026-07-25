const request = require("supertest");
const app = require("../src/app");

async function createAdminAndLogin() {
  await request(app).post("/api/auth/register").send({
    name: "Admin Test",
    email: "admin@test.local",
    password: "adminpass123",
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@test.local",
    password: "adminpass123",
  });
  return res.body.token;
}

async function createCashierAndLogin() {
  const adminToken = await createAdminAndLogin();

  await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Caissier Test", email: "caissier@test.local", password: "password123", role: "CASHIER" });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "caissier@test.local", password: "password123" });

  return { token: login.body.token, adminToken };
}

module.exports = { createAdminAndLogin, createCashierAndLogin };
