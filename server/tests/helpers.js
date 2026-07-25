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

module.exports = { createAdminAndLogin };
