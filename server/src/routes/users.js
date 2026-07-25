const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { listUsers, createUser, updateUser, deleteUser, countAdmins } = require("../services/users");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await listUsers());
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email et password sont requis" });
    }
    const user = await createUser({ name, email, password, role });
    res.status(201).json(user);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, role, password } = req.body;

    // On empêche un admin de se retirer lui-même son propre rôle admin s'il est le dernier.
    if (role && role !== "ADMIN" && id === req.user.sub) {
      const admins = await countAdmins();
      if (admins <= 1) {
        return res.status(409).json({ error: "Impossible de retirer le rôle admin du dernier administrateur" });
      }
    }

    try {
      const user = await updateUser(id, { name, email, role, password });
      res.json(user);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Utilisateur introuvable" });
      if (err.code === "P2002") return res.status(409).json({ error: "Cet email est déjà utilisé" });
      throw err;
    }
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    // Seul un ADMIN peut atteindre cette route ; si un seul admin existe, c'est forcément
    // celui-ci, donc ce garde-fou suffit à empêcher de supprimer le dernier administrateur.
    if (id === req.user.sub) {
      return res.status(409).json({ error: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    try {
      await deleteUser(id);
      res.status(204).send();
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Utilisateur introuvable" });
      const isForeignKeyViolation = err.code === "P2003" || /foreign key|violates/i.test(err.message || "");
      if (isForeignKeyViolation) {
        return res.status(409).json({ error: "Impossible de supprimer : cet utilisateur a des ventes associées" });
      }
      throw err;
    }
  })
);

module.exports = router;
