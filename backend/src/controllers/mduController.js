const { z } = require("zod");
const prisma = require("../prismaClient");

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

async function eodSummary(req, res) {
  const schema = z.object({
    eodDate: z.string(),
    confirmedIp: z.string().optional(),
    confirmedDevice: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const dateStart = new Date(parsed.data.eodDate);
  const dateEnd = new Date(parsed.data.eodDate);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const trips = await prisma.mduTrip.findMany({
    where: { tripDate: { gte: dateStart, lt: dateEnd } },
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

  const eod = await prisma.mduEod.upsert({
    where: { eodDate: dateStart },
    update: {
      totalTrips: tripIds.length,
      totalClients: clientsAgg._count._all,
      totalSales: clientsAgg._sum.amount || 0,
      cashTotal: cashAgg._sum.amount || 0,
      onlineTotal: onlineAgg._sum.amount || 0,
      creditTotal: creditAgg._sum.amount || 0,
      confirmedById: req.user.userId,
      confirmedIp: parsed.data.confirmedIp,
      confirmedDevice: parsed.data.confirmedDevice
    },
    create: {
      eodDate: dateStart,
      totalTrips: tripIds.length,
      totalClients: clientsAgg._count._all,
      totalSales: clientsAgg._sum.amount || 0,
      cashTotal: cashAgg._sum.amount || 0,
      onlineTotal: onlineAgg._sum.amount || 0,
      creditTotal: creditAgg._sum.amount || 0,
      confirmedById: req.user.userId,
      confirmedIp: parsed.data.confirmedIp,
      confirmedDevice: parsed.data.confirmedDevice
    }
  });

  return res.json(eod);
}

module.exports = { startTrip, addClient, closeTrip, eodSummary };
