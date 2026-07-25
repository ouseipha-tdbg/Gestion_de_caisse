const request = require("supertest");
const app = require("../src/app");
const { createAdminAndLogin, createCashierAndLogin } = require("./helpers");

describe("Paramètres", () => {
  it("crée des paramètres par défaut au premier accès", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app).get("/api/settings").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.shopType).toBe("COMMERCE");
    expect(res.body.companyName).toBeTruthy();
  });

  it("un caissier peut lire les paramètres publics mais pas les paramètres complets", async () => {
    const { token } = await createCashierAndLogin();

    const publicRes = await request(app).get("/api/settings/public").set("Authorization", `Bearer ${token}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.whatsappTarget).toBeUndefined();

    const fullRes = await request(app).get("/api/settings").set("Authorization", `Bearer ${token}`);
    expect(fullRes.status).toBe(403);
  });

  it("un admin peut modifier les paramètres de la boutique", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ companyName: "Ma Super Boutique", shopType: "SERVICE" });

    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe("Ma Super Boutique");
    expect(res.body.shopType).toBe("SERVICE");
  });

  it("rejette un shopType invalide", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ shopType: "AUTRE" });

    expect(res.status).toBe(400);
  });
});
