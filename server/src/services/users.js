const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

const publicSelect = { id: true, name: true, email: true, role: true, createdAt: true };

async function listUsers() {
  return prisma.user.findMany({ select: publicSelect, orderBy: { name: "asc" } });
}

async function createUser({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashed, role: role === "ADMIN" ? "ADMIN" : "CASHIER" },
    select: publicSelect,
  });
}

async function updateUser(id, { name, email, role, password }) {
  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role === "ADMIN" ? "ADMIN" : "CASHIER";
  if (password) data.password = await bcrypt.hash(password, 10);

  return prisma.user.update({ where: { id }, data, select: publicSelect });
}

async function countAdmins() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = { listUsers, createUser, updateUser, deleteUser, countAdmins };
