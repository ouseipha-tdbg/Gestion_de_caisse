const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin, createCashierAndLogin } = require("./helpers");

describe("WhatsApp", () => {
  it("refuse l'accès au statut/QR à un compte non-admin", async () => {
    const { token } = await createCashierAndLogin();
    const res = await request(app).get("/api/whatsapp/qr").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("renvoie qr=null quand le client n'est pas initialisé", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app).get("/api/whatsapp/qr").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.qr).toBeNull();
  });
});
