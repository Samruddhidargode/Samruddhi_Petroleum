const { z } = require("zod");
const prisma = require("../prismaClient");

async function uploadNozzlePhoto(req, res) {
  try {
    const schema = z.object({
      shiftId: z.string().min(1),
      pointNo: z.number().int().min(1).max(4),
      fuelType: z.enum(["HSD", "MS"]),
      photoType: z.enum(["OPENING", "CLOSING"]),
      imageData: z.string().min(10)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues || [] });
    }

    const { shiftId, pointNo, fuelType, photoType, imageData } = parsed.data;
    const entityType = `NOZZLE_${photoType}`;
    const entityId = `${shiftId}:${pointNo}:${fuelType}`;

    const existing = await prisma.image.findFirst({
      where: { entityType, entityId }
    });

    const image = existing
      ? await prisma.image.update({
          where: { id: existing.id },
          data: { url: imageData }
        })
      : await prisma.image.create({
          data: { entityType, entityId, url: imageData }
        });

    return res.json({
      id: image.id,
      url: image.url,
      entityType,
      entityId
    });
  } catch (error) {
    console.error("Upload nozzle photo error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function listNozzlePhotos(req, res) {
  try {
    const schema = z.object({ shiftId: z.string().min(1) });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues || [] });
    }

    const { shiftId } = parsed.data;
    const images = await prisma.image.findMany({
      where: {
        entityType: { in: ["NOZZLE_OPENING", "NOZZLE_CLOSING"] },
        entityId: { startsWith: `${shiftId}:` }
      },
      select: { id: true, entityType: true, entityId: true, url: true, createdAt: true }
    });

    return res.json(images);
  } catch (error) {
    console.error("List nozzle photos error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function deleteNozzlePhoto(req, res) {
  try {
    const schema = z.object({
      shiftId: z.string().min(1),
      pointNo: z.string().min(1),
      fuelType: z.enum(["HSD", "MS"]),
      photoType: z.enum(["OPENING", "CLOSING"])
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues || [] });
    }

    const { shiftId, pointNo, fuelType, photoType } = parsed.data;
    const entityType = `NOZZLE_${photoType}`;
    const entityId = `${shiftId}:${pointNo}:${fuelType}`;

    await prisma.image.deleteMany({ where: { entityType, entityId } });
    return res.json({ deleted: true });
  } catch (error) {
    console.error("Delete nozzle photo error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

module.exports = { uploadNozzlePhoto, listNozzlePhotos, deleteNozzlePhoto };
