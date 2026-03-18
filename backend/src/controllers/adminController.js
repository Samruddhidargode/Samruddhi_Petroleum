const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../prismaClient");

async function createUser(req, res) {
  try {
    if (!req.body || typeof req.body !== "object") {
      console.error("Create user invalid body:", req.body);
      return res.status(400).json({ message: "Invalid request body" });
    }

    try {
      console.log("Create user request body:", JSON.stringify(req.body));
    } catch {
      console.log("Create user request body:", req.body);
    }

    const schema = z.object({
      role: z.enum(["DSM", "MANAGER"]),
      dsmCode: z.string().min(2),
      name: z.string().min(2),
      password: z.string().min(6)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error?.issues || [];
      console.error("Validation error:", issues.length ? issues : parsed.error?.message);
      return res.status(400).json({ message: "Invalid input", errors: issues });
    }

    if (!parsed.data.dsmCode || !parsed.data.name || !parsed.data.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({
      where: { dsmCode: parsed.data.dsmCode }
    });

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        role: parsed.data.role,
        dsmCode: parsed.data.dsmCode,
        name: parsed.data.name,
        passwordHash,
        isActive: true,
        isDeleted: false
      }
    });

    console.log(`User created: ${user.dsmCode} (${user.role})`);
    return res.json({
      id: user.id,
      role: user.role,
      dsmCode: user.dsmCode,
      name: user.name
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      return res.status(409).json({ message: "User already exists" });
    }
    console.error("Create user error:", error.stack || error.message);
    return res.status(500).json({
      message: `Server error: ${error.message}`,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack
    });
  }
}

async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: { id: true, role: true, dsmCode: true, name: true, isActive: true, isDeleted: true }
    });
    return res.json(users);
  } catch (error) {
    console.error("List users error:", error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function resetUserPassword(req, res) {
  try {
    const schema = z.object({
      password: z.string().min(6)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error });
    }

    const { id } = req.params;
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    return res.json({ id: user.id, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function deactivateUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
    return res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    console.error("Deactivate user error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function activateUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });
    return res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    console.error("Activate user error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false }
    });
    return res.json({ id: user.id, isDeleted: user.isDeleted });
  } catch (error) {
    console.error("Delete user error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

module.exports = { createUser, listUsers, resetUserPassword, deactivateUser, activateUser, deleteUser };
