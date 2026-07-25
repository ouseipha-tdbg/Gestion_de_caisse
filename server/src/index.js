require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const reportsRoutes = require("./routes/reports");
const whatsappRoutes = require("./routes/whatsapp");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/whatsapp", whatsappRoutes);

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));

if (process.env.ENABLE_WHATSAPP === "true") {
  const { initWhatsApp } = require("./whatsapp/client");
  const { startDailyReportScheduler } = require("./whatsapp/scheduler");
  initWhatsApp();
  startDailyReportScheduler();
} else {
  console.log("[WhatsApp] Désactivé (ENABLE_WHATSAPP=false). Bot non démarré.");
}
