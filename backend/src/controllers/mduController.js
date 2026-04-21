const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../prismaClient");

function buildDayRange(dateString) {
  const dayStart = new Date(dateString);
  if (Number.isNaN(dayStart.getTime())) {
    return null;
  }
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

async function summarizeDay(dateString) {
  const range = buildDayRange(dateString);
  if (!range) {
    return null;
  }

  const trips = await prisma.mduTrip.findMany({
    where: { tripDate: { gte: range.dayStart, lt: range.dayEnd } },
    select: { id: true }
  });

  const tripIds = trips.map((t) => t.id);

  const [clientsAgg, cashAgg, onlineAgg, creditAgg] = await Promise.all([
    prisma.mduClient.aggregate({
      where: { tripId: { in: tripIds } },
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.mduClient.aggregate({
      where: { tripId: { in: tripIds }, paymentMode: "CASH" },
      _sum: { amount: true }
    }),
    prisma.mduClient.aggregate({
      where: { tripId: { in: tripIds }, paymentMode: "ONLINE" },
      _sum: { amount: true }
    }),
    prisma.mduClient.aggregate({
      where: { tripId: { in: tripIds }, paymentMode: "CREDIT" },
      _sum: { amount: true }
    })
  ]);

  return {
    dayStart: range.dayStart,
    totalTrips: tripIds.length,
    totalClients: clientsAgg._count._all,
    totalSales: Number(clientsAgg._sum.amount || 0),
    cashTotal: Number(cashAgg._sum.amount || 0),
    onlineTotal: Number(onlineAgg._sum.amount || 0),
    creditTotal: Number(creditAgg._sum.amount || 0)
  };
}

async function startTrip(req, res) {
  const schema = z.object({
    tripDate: z.string(),
    openingTime: z.string(),
    vehicleNo: z.string().min(2),
    openingMeter: z.number().nonnegative().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const trip = await prisma.mduTrip.create({
    data: {
      tripDate: new Date(parsed.data.tripDate),
      openingTime: new Date(parsed.data.openingTime),
      vehicleNo: parsed.data.vehicleNo,
      openingMeter: parsed.data.openingMeter,
      dsmId: req.user.userId
    }
  });

  return res.json(trip);
}

async function addClient(req, res) {
  const schema = z.object({
    tripId: z.string(),
    clientName: z.string().min(2),
    qty: z.number().positive(),
    rate: z.number().nonnegative(),
    paymentMode: z.enum(["CASH", "ONLINE", "CREDIT"]),
    receiptUrl: z.string().url().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const amount = parsed.data.qty * parsed.data.rate;

  const client = await prisma.mduClient.create({
    data: {
      tripId: parsed.data.tripId,
      clientName: parsed.data.clientName,
      qty: parsed.data.qty,
      rate: parsed.data.rate,
      amount,
      paymentMode: parsed.data.paymentMode,
      receiptUrl: parsed.data.receiptUrl
    }
  });

  return res.json(client);
}

async function closeTrip(req, res) {
  const schema = z.object({
    tripId: z.string(),
    closingTime: z.string(),
    closingMeter: z.number().nonnegative().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const trip = await prisma.mduTrip.update({
    where: { id: parsed.data.tripId },
    data: {
      closingTime: new Date(parsed.data.closingTime),
      closingMeter: parsed.data.closingMeter,
      status: "CLOSED"
    }
  });

  return res.json(trip);
}

async function getTrips(req, res) {
  try {
    if (!["ADMIN", "MANAGER", "DSM"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const where = {};
    if (req.user.role === "DSM") {
      where.dsmId = req.user.userId;
    }

    const { date, status } = req.query;
    if (date) {
      const range = buildDayRange(date);
      if (!range) {
        return res.status(400).json({ message: "Invalid date" });
      }
      where.tripDate = { gte: range.dayStart, lt: range.dayEnd };
    }

    if (["OPEN", "CLOSED"].includes(status)) {
      where.status = status;
    }

    const trips = await prisma.mduTrip.findMany({
      where,
      orderBy: [{ tripDate: "desc" }, { openingTime: "desc" }],
      include: {
        dsm: { select: { name: true, dsmCode: true } },
        clients: {
          select: {
            amount: true,
            paymentMode: true
          }
        }
      }
    });

    const items = trips.map((trip) => {
      const totalSales = trip.clients.reduce((sum, client) => sum + Number(client.amount || 0), 0);
      const cashTotal = trip.clients
        .filter((client) => client.paymentMode === "CASH")
        .reduce((sum, client) => sum + Number(client.amount || 0), 0);
      const onlineTotal = trip.clients
        .filter((client) => client.paymentMode === "ONLINE")
        .reduce((sum, client) => sum + Number(client.amount || 0), 0);
      const creditTotal = trip.clients
        .filter((client) => client.paymentMode === "CREDIT")
        .reduce((sum, client) => sum + Number(client.amount || 0), 0);

      return {
        ...trip,
        clientCount: trip.clients.length,
        totalSales,
        cashTotal,
        onlineTotal,
        creditTotal
      };
    });

    return res.json({ items });
  } catch (error) {
    console.error("Get MDU trips error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function getEodPreview(req, res) {
  try {
    if (!["ADMIN", "MANAGER", "DSM"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { date } = req.params;
    const summary = await summarizeDay(date);
    if (!summary) {
      return res.status(400).json({ message: "Invalid date" });
    }

    return res.json({
      date,
      totalTrips: summary.totalTrips,
      totalClients: summary.totalClients,
      totalSales: summary.totalSales,
      cashTotal: summary.cashTotal,
      onlineTotal: summary.onlineTotal,
      creditTotal: summary.creditTotal
    });
  } catch (error) {
    console.error("Get MDU preview error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function eodSummary(req, res) {
  const schema = z.object({
    eodDate: z.string(),
    confirmPassword: z.string().min(4),
    confirmedIp: z.string().optional(),
    confirmedDevice: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const summary = await summarizeDay(parsed.data.eodDate);
  if (!summary) {
    return res.status(400).json({ message: "Invalid date" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.confirmPassword, user.passwordHash || "");
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const eod = await prisma.mduEod.upsert({
    where: { eodDate: summary.dayStart },
    update: {
      totalTrips: summary.totalTrips,
      totalClients: summary.totalClients,
      totalSales: summary.totalSales,
      cashTotal: summary.cashTotal,
      onlineTotal: summary.onlineTotal,
      creditTotal: summary.creditTotal,
      confirmedById: req.user.userId,
      confirmedIp: parsed.data.confirmedIp,
      confirmedDevice: parsed.data.confirmedDevice
    },
    create: {
      eodDate: summary.dayStart,
      totalTrips: summary.totalTrips,
      totalClients: summary.totalClients,
      totalSales: summary.totalSales,
      cashTotal: summary.cashTotal,
      onlineTotal: summary.onlineTotal,
      creditTotal: summary.creditTotal,
      confirmedById: req.user.userId,
      confirmedIp: parsed.data.confirmedIp,
      confirmedDevice: parsed.data.confirmedDevice
    }
  });

  return res.json(eod);
}

module.exports = { startTrip, addClient, closeTrip, getTrips, getEodPreview, eodSummary };
