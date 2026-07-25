const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// Le tout premier compte peut s'inscrire librement (bootstrap) et devient ADMIN.
// Une fois qu'au moins un utilisateur existe, seul un ADMIN authentifié peut en créer d'autres.
async function bootstrapOrAdminOnly(req, res, next) {
  const count = await prisma.user.count();
  if (count === 0) return next();
  return requireAuth(req, res, () => requireRole("ADMIN")(req, res, next));
}

router.post(
  "/register",
  asyncHandler(bootstrapOrAdminOnly),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email et password sont requis" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const isBootstrap = !req.user;
    const finalRole = isBootstrap ? "ADMIN" : role === "ADMIN" ? "ADMIN" : "CASHIER";

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: finalRole },
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email et password sont requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { sub: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  })
);

module.exports = router;
