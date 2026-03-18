const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../prismaClient");

const loginSchema = z.object({
  dsmCode: z.string().min(2),
  password: z.string().min(4),
  role: z.enum(["DSM", "MANAGER", "ADMIN"])
});

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const { dsmCode, password, role } = parsed.data;
  const user = await prisma.user.findFirst({ where: { dsmCode, role } });

  if (!user || !user.isActive || user.isDeleted) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    user: { id: user.id, role: user.role, name: user.name, dsmCode: user.dsmCode }
  });
}

async function changePassword(req, res) {
  const schema = z.object({
    currentPassword: z.string().min(4),
    newPassword: z.string().min(6)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash }
  });

  return res.json({ ok: true });
}

module.exports = { login, changePassword };
