const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../prismaClient");

async function recalcShiftTotals(shiftId) {
  const [nozzles, cashDrops, qr, card, fleet, party] = await Promise.all([
    prisma.nozzleEntry.aggregate({
      where: { shiftId },
      _sum: { amount: true }
    }),
    prisma.cashDrop.aggregate({
      where: { shiftId },
      _sum: { totalAmount: true }
    }),
    prisma.qrEntry.aggregate({
      where: { shiftId },
      _sum: { amount: true }
    }),
    prisma.cardEntry.aggregate({
      where: { shiftId },
      _sum: { amount: true }
    }),
    prisma.fleetEntry.aggregate({
      where: { shiftId },
      _sum: { amount: true }
    }),
    prisma.partyCreditEntry.aggregate({
      where: { shiftId },
      _sum: { amount: true }
    })
  ]);

  const totalSales = nozzles._sum.amount || 0;
  const totalCollected =
    (cashDrops._sum.totalAmount || 0) +
    (qr._sum.amount || 0) +
    (card._sum.amount || 0) +
    (fleet._sum.amount || 0) +
    (party._sum.amount || 0);

  const difference = Number(totalCollected) - Number(totalSales);

  await prisma.shift.update({
    where: { id: shiftId },
    data: { totalSales, totalCollected, difference }
  });
}

async function createShift(req, res) {
  const schema = z.object({
    shiftDate: z.string(),
    timeIn: z.string(),
    shiftNumber: z.number().int().min(1).max(3),
    qrScannerNo: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const shift = await prisma.shift.create({
    data: {
      shiftDate: new Date(parsed.data.shiftDate),
      timeIn: new Date(parsed.data.timeIn),
      shiftNumber: parsed.data.shiftNumber,
      qrScannerNo: parsed.data.qrScannerNo,
      dsmId: req.user.userId
    }
  });

  return res.json(shift);
}

async function getShiftDetails(req, res) {
  try {
    const { id } = req.params;
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        dsm: { select: { id: true, name: true, dsmCode: true } },
        nozzleEntries: true
      }
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    const images = await prisma.image.findMany({
      where: {
        entityType: { in: ["NOZZLE_OPENING", "NOZZLE_CLOSING"] },
        entityId: { startsWith: `${id}:` }
      },
      select: { id: true, entityType: true, entityId: true, url: true }
    });

    return res.json({ shift, images });
  } catch (error) {
    console.error("Get shift details error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function getShiftDraft(req, res) {
  try {
    const { id } = req.params;
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        dsm: { select: { id: true, name: true, dsmCode: true, role: true } },
        nozzleEntries: true,
        cashDrops: true,
        qrEntries: true,
        cardEntries: true,
        fleetEntries: true,
        partyCredits: true
      }
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    const isOwner = shift.dsmId === req.user.userId;
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({ shift });
  } catch (error) {
    console.error("Get shift draft error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}


async function getShifts(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      date,
      dsm,
      shiftNumber,
      status,
      search,
      page = "1",
      limit = "50"
    } = req.query;

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(200, Math.max(1, Number(limit) || 50));

    const where = {};

    if (date) {
      const dayStart = new Date(date);
      if (!Number.isNaN(dayStart.getTime())) {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        where.shiftDate = { gte: dayStart, lt: dayEnd };
      }
    }

    if (shiftNumber && !Number.isNaN(Number(shiftNumber))) {
      where.shiftNumber = Number(shiftNumber);
    }

    if (["DRAFT", "SUBMITTED"].includes(status)) {
      where.status = status;
    }

    if (dsm && String(dsm).trim()) {
      const dsmValue = String(dsm).trim();
      where.dsm = {
        OR: [
          { dsmCode: { contains: dsmValue, mode: "insensitive" } },
          { name: { contains: dsmValue, mode: "insensitive" } }
        ]
      };
    }

    if (search && String(search).trim()) {
      const searchValue = String(search).trim();
      where.OR = [
        { id: { contains: searchValue, mode: "insensitive" } },
        {
          dsm: {
            OR: [
              { dsmCode: { contains: searchValue, mode: "insensitive" } },
              { name: { contains: searchValue, mode: "insensitive" } }
            ]
          }
        }
      ];
    }

    const [total, items] = await prisma.$transaction([
      prisma.shift.count({ where }),
      prisma.shift.findMany({
        where,
        orderBy: [{ shiftDate: "desc" }, { timeIn: "desc" }],
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
        select: {
          id: true,
          shiftDate: true,
          shiftNumber: true,
          status: true,
          totalSales: true,
          totalCollected: true,
          difference: true,
          dsm: { select: { name: true, dsmCode: true } }
        }
      })
    ]);

    return res.json({ items, total, page: parsedPage, limit: parsedLimit });
  } catch (error) {
    console.error("Get shifts error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function getShiftsByDate(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { date } = req.params;
    const dayStart = new Date(date);
    if (Number.isNaN(dayStart.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const items = await prisma.shift.findMany({
      where: { shiftDate: { gte: dayStart, lt: dayEnd } },
      orderBy: [{ shiftNumber: "asc" }, { timeIn: "asc" }],
      select: {
        id: true,
        shiftDate: true,
        shiftNumber: true,
        status: true,
        totalSales: true,
        totalCollected: true,
        difference: true,
        dsm: { select: { name: true, dsmCode: true } }
      }
    });

    const summary = items.reduce(
      (acc, item) => {
        acc.totalSales += Number(item.totalSales || 0);
        acc.totalCollected += Number(item.totalCollected || 0);
        acc.totalDifference += Number(item.difference || 0);
        return acc;
      },
      { totalSales: 0, totalCollected: 0, totalDifference: 0 }
    );

    return res.json({ date, summary, items });
  } catch (error) {
    console.error("Get shifts by date error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}
async function addNozzleEntry(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    pointNo: z.number().int().min(1).max(4),
    fuelType: z.enum(["HSD", "MS"]),
    openingReading: z.number().nonnegative(),
    closingReading: z.number().nonnegative(),
    rate: z.number().nonnegative(),
    pumpTestLiters: z.number().nonnegative().default(0),
    ownUseLiters: z.number().nonnegative().default(0)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const dispensedQty = parsed.data.closingReading - parsed.data.openingReading;
  const effectiveQty = dispensedQty - parsed.data.ownUseLiters + parsed.data.pumpTestLiters;
  const amount = effectiveQty * parsed.data.rate;

  const entry = await prisma.nozzleEntry.create({
    data: {
      shiftId: parsed.data.shiftId,
      pointNo: parsed.data.pointNo,
      fuelType: parsed.data.fuelType,
      openingReading: parsed.data.openingReading,
      closingReading: parsed.data.closingReading,
      rate: parsed.data.rate,
      pumpTestLiters: parsed.data.pumpTestLiters,
      ownUseLiters: parsed.data.ownUseLiters,
      dispensedQty,
      effectiveQty,
      amount
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(entry);
}

async function saveNozzleDraft(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    entries: z.array(
      z.object({
        pointNo: z.number().int().min(1).max(4),
        fuelType: z.enum(["HSD", "MS"]),
        openingReading: z.number().nonnegative(),
        closingReading: z.number().nonnegative(),
        rate: z.number().nonnegative(),
        pumpTestLiters: z.number().nonnegative().default(0),
        ownUseLiters: z.number().nonnegative().default(0)
      })
    )
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues || [] });
  }

  const { shiftId, entries } = parsed.data;

  await prisma.nozzleEntry.deleteMany({ where: { shiftId } });

  const payload = entries.map((entry) => {
    const dispensedQty = entry.closingReading - entry.openingReading;
    const effectiveQty = dispensedQty - entry.ownUseLiters + entry.pumpTestLiters;
    const amount = effectiveQty * entry.rate;

    return {
      shiftId,
      pointNo: entry.pointNo,
      fuelType: entry.fuelType,
      openingReading: entry.openingReading,
      closingReading: entry.closingReading,
      rate: entry.rate,
      pumpTestLiters: entry.pumpTestLiters,
      ownUseLiters: entry.ownUseLiters,
      dispensedQty,
      effectiveQty,
      amount
    };
  });

  if (payload.length) {
    await prisma.nozzleEntry.createMany({ data: payload });
  }

  await recalcShiftTotals(shiftId);
  return res.json({ saved: payload.length });
}

async function addCashDrop(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    den500: z.number().int().nonnegative().default(0),
    den200: z.number().int().nonnegative().default(0),
    den100: z.number().int().nonnegative().default(0),
    den50: z.number().int().nonnegative().default(0),
    den20: z.number().int().nonnegative().default(0),
    den10: z.number().int().nonnegative().default(0),
    coins: z.number().nonnegative().default(0)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const totalAmount =
    parsed.data.den500 * 500 +
    parsed.data.den200 * 200 +
    parsed.data.den100 * 100 +
    parsed.data.den50 * 50 +
    parsed.data.den20 * 20 +
    parsed.data.den10 * 10 +
    parsed.data.coins;

  const drop = await prisma.cashDrop.create({
    data: {
      shiftId: parsed.data.shiftId,
      den500: parsed.data.den500,
      den200: parsed.data.den200,
      den100: parsed.data.den100,
      den50: parsed.data.den50,
      den20: parsed.data.den20,
      den10: parsed.data.den10,
      coins: parsed.data.coins,
      totalAmount
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(drop);
}

async function addQr(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    amount: z.number().nonnegative(),
    receiptUrl: z.string().url().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const entry = await prisma.qrEntry.create({
    data: {
      shiftId: parsed.data.shiftId,
      amount: parsed.data.amount,
      receiptUrl: parsed.data.receiptUrl
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(entry);
}

async function addCard(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    amount: z.number().nonnegative(),
    cardType: z.enum(["DEBIT", "CREDIT"]),
    receiptUrl: z.string().url().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const entry = await prisma.cardEntry.create({
    data: {
      shiftId: parsed.data.shiftId,
      amount: parsed.data.amount,
      cardType: parsed.data.cardType,
      receiptUrl: parsed.data.receiptUrl
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(entry);
}

async function addFleet(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    amount: z.number().nonnegative(),
    receiptUrl: z.string().url().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const entry = await prisma.fleetEntry.create({
    data: {
      shiftId: parsed.data.shiftId,
      amount: parsed.data.amount,
      receiptUrl: parsed.data.receiptUrl
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(entry);
}

async function addPartyCredit(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    partyName: z.string().min(2),
    amount: z.number().nonnegative(),
    receiptUrl: z.string().url().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const entry = await prisma.partyCreditEntry.create({
    data: {
      shiftId: parsed.data.shiftId,
      partyName: parsed.data.partyName,
      amount: parsed.data.amount,
      receiptUrl: parsed.data.receiptUrl
    }
  });

  await recalcShiftTotals(parsed.data.shiftId);
  return res.json(entry);
}

async function submitShift(req, res) {
  const schema = z.object({
    shiftId: z.string(),
    timeOut: z.string(),
    confirmPassword: z.string().min(4),
    confirmedIp: z.string().optional(),
    confirmedDevice: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const shift = await prisma.shift.findUnique({
    where: { id: parsed.data.shiftId }
  });
  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }

  if (shift.dsmId !== req.user.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (shift.status === "SUBMITTED") {
    return res.status(400).json({ message: "Shift already submitted" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.confirmPassword, user.passwordHash || "");
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  await recalcShiftTotals(parsed.data.shiftId);

  const updatedShift = await prisma.shift.update({
    where: { id: parsed.data.shiftId },
    data: {
      timeOut: new Date(parsed.data.timeOut),
      status: "SUBMITTED",
      confirmedAt: new Date(),
      confirmedIp: parsed.data.confirmedIp,
      confirmedDevice: parsed.data.confirmedDevice
    }
  });

  return res.json(updatedShift);
}

module.exports = {
  createShift,
  getShifts,
  getShiftsByDate,
  getShiftDetails,
  getShiftDraft,
  addNozzleEntry,
  saveNozzleDraft,
  addCashDrop,
  addQr,
  addCard,
  addFleet,
  addPartyCredit,
  submitShift
};

