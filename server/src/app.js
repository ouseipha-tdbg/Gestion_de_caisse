const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const reportsRoutes = require("./routes/reports");
const whatsappRoutes = require("./routes/whatsapp");
const usersRoutes = require("./routes/users");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    exposedHeaders: ["Content-Disposition"],
  })
);
// Limite relevée : le logo de la boutique est envoyé en base64 dans les paramètres.
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// Filet de sécurité : capture toute erreur non gérée explicitement dans une route
// (évite qu'une exception async fasse planter tout le process Node).
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? "Erreur interne du serveur" : err.message });
});

module.exports = app;
