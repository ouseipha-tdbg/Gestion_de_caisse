const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// Inscription publique réservée au tout premier compte (bootstrap), qui devient ADMIN.
// Une fois qu'un utilisateur existe, la création de comptes passe par /api/users (admin uniquement).
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const count = await prisma.user.count();
    if (count > 0) {
      return res.status(403).json({
        error: "Inscription publique fermée. Un administrateur doit créer les comptes via /api/users.",
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email et password sont requis" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "ADMIN" },
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
