const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

async function ensureAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME || "bhalchandrard";
  const adminPassword = process.env.ADMIN_PASSWORD || "Bhalchandra@74";

  const existing = await prisma.user.findFirst({
    where: { role: "ADMIN", dsmCode: adminUsername }
  });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      role: "ADMIN",
      dsmCode: adminUsername,
      name: "Admin",
      passwordHash,
      isActive: true
    }
  });
}

module.exports = { ensureAdminUser };
