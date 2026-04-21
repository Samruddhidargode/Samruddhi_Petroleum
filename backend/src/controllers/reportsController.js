const prisma = require("../prismaClient");

function parseDateRange(from, to) {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 7);

  const fromDate = from ? new Date(from) : defaultFrom;
  const toDate = to ? new Date(to) : now;

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return null;
  }

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return { fromDate, toDate };
}

function asNumber(value) {
  return Number(value || 0);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function listReceipts(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { from, to, type, dsm = "" } = req.query;
    const range = parseDateRange(from, to);
    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const dsmFilter = String(dsm).trim();
    const shiftRelation = {
      shiftDate: { gte: range.fromDate, lte: range.toDate },
      ...(dsmFilter
        ? {
            dsm: {
              OR: [
                { name: { contains: dsmFilter, mode: "insensitive" } },
                { dsmCode: { contains: dsmFilter, mode: "insensitive" } }
              ]
            }
          }
        : {})
    };

    const mduTripRelation = {
      tripDate: { gte: range.fromDate, lte: range.toDate },
      ...(dsmFilter
        ? {
            dsm: {
              OR: [
                { name: { contains: dsmFilter, mode: "insensitive" } },
                { dsmCode: { contains: dsmFilter, mode: "insensitive" } }
              ]
            }
          }
        : {})
    };

    const normalizedType = String(type || "ALL").toUpperCase();

    const [qr, card, fleet, party, mdu] = await Promise.all([
      normalizedType === "ALL" || normalizedType === "QR"
        ? prisma.qrEntry.findMany({
            where: { receiptUrl: { not: null }, shift: shiftRelation },
            include: { shift: { include: { dsm: { select: { name: true, dsmCode: true } } } } }
          })
        : Promise.resolve([]),
      normalizedType === "ALL" || normalizedType === "CARD"
        ? prisma.cardEntry.findMany({
            where: { receiptUrl: { not: null }, shift: shiftRelation },
            include: { shift: { include: { dsm: { select: { name: true, dsmCode: true } } } } }
          })
        : Promise.resolve([]),
      normalizedType === "ALL" || normalizedType === "FLEET"
        ? prisma.fleetEntry.findMany({
            where: { receiptUrl: { not: null }, shift: shiftRelation },
            include: { shift: { include: { dsm: { select: { name: true, dsmCode: true } } } } }
          })
        : Promise.resolve([]),
      normalizedType === "ALL" || normalizedType === "PARTY_CREDIT"
        ? prisma.partyCreditEntry.findMany({
            where: { receiptUrl: { not: null }, shift: shiftRelation },
            include: { shift: { include: { dsm: { select: { name: true, dsmCode: true } } } } }
          })
        : Promise.resolve([]),
      normalizedType === "ALL" || normalizedType === "MDU"
        ? prisma.mduClient.findMany({
            where: { receiptUrl: { not: null }, trip: mduTripRelation },
            include: { trip: { include: { dsm: { select: { name: true, dsmCode: true } } } } }
          })
        : Promise.resolve([])
    ]);

    const items = [
      ...qr.map((row) => ({
        id: row.id,
        type: "QR",
        url: row.receiptUrl,
        amount: asNumber(row.amount),
        createdAt: row.createdAt,
        dsmName: row.shift?.dsm?.name || "",
        dsmCode: row.shift?.dsm?.dsmCode || "",
        reference: row.shiftId,
        shiftId: row.shiftId
      })),
      ...card.map((row) => ({
        id: row.id,
        type: "CARD",
        url: row.receiptUrl,
        amount: asNumber(row.amount),
        createdAt: row.createdAt,
        dsmName: row.shift?.dsm?.name || "",
        dsmCode: row.shift?.dsm?.dsmCode || "",
        reference: row.cardType,
        shiftId: row.shiftId
      })),
      ...fleet.map((row) => ({
        id: row.id,
        type: "FLEET",
        url: row.receiptUrl,
        amount: asNumber(row.amount),
        createdAt: row.createdAt,
        dsmName: row.shift?.dsm?.name || "",
        dsmCode: row.shift?.dsm?.dsmCode || "",
        reference: row.shiftId,
        shiftId: row.shiftId
      })),
      ...party.map((row) => ({
        id: row.id,
        type: "PARTY_CREDIT",
        url: row.receiptUrl,
        amount: asNumber(row.amount),
        createdAt: row.createdAt,
        dsmName: row.shift?.dsm?.name || "",
        dsmCode: row.shift?.dsm?.dsmCode || "",
        reference: row.partyName,
        shiftId: row.shiftId
      })),
      ...mdu.map((row) => ({
        id: row.id,
        type: "MDU",
        url: row.receiptUrl,
        amount: asNumber(row.amount),
        createdAt: row.createdAt,
        dsmName: row.trip?.dsm?.name || "",
        dsmCode: row.trip?.dsm?.dsmCode || "",
        reference: row.clientName,
        shiftId: row.tripId
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ items, total: items.length });
  } catch (error) {
    console.error("List receipts error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function exportShiftCsv(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { from, to } = req.query;
    const range = parseDateRange(from, to);
    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const shifts = await prisma.shift.findMany({
      where: { shiftDate: { gte: range.fromDate, lte: range.toDate } },
      include: { dsm: { select: { name: true, dsmCode: true } } },
      orderBy: [{ shiftDate: "desc" }, { shiftNumber: "asc" }]
    });

    const headers = [
      "Shift ID",
      "Date",
      "Shift Number",
      "DSM Name",
      "DSM Code",
      "Status",
      "Total Sales",
      "Total Collected",
      "Difference"
    ];

    const rows = shifts.map((s) => [
      s.id,
      new Date(s.shiftDate).toISOString(),
      s.shiftNumber,
      s.dsm?.name || "",
      s.dsm?.dsmCode || "",
      s.status,
      asNumber(s.totalSales).toFixed(2),
      asNumber(s.totalCollected).toFixed(2),
      asNumber(s.difference).toFixed(2)
    ]);

    const csv = [headers, ...rows].map((line) => line.map(csvEscape).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=shifts_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Export shifts csv error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

async function exportMduCsv(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { from, to } = req.query;
    const range = parseDateRange(from, to);
    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const trips = await prisma.mduTrip.findMany({
      where: { tripDate: { gte: range.fromDate, lte: range.toDate } },
      include: {
        dsm: { select: { name: true, dsmCode: true } },
        clients: true
      },
      orderBy: [{ tripDate: "desc" }, { openingTime: "asc" }]
    });

    const headers = [
      "Trip ID",
      "Trip Date",
      "Vehicle No",
      "DSM Name",
      "DSM Code",
      "Status",
      "Total Clients",
      "Total Sales"
    ];

    const rows = trips.map((trip) => {
      const totalSales = trip.clients.reduce((sum, client) => sum + asNumber(client.amount), 0);
      return [
        trip.id,
        new Date(trip.tripDate).toISOString(),
        trip.vehicleNo,
        trip.dsm?.name || "",
        trip.dsm?.dsmCode || "",
        trip.status,
        trip.clients.length,
        totalSales.toFixed(2)
      ];
    });

    const csv = [headers, ...rows].map((line) => line.map(csvEscape).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=mdu_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Export MDU csv error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

module.exports = { listReceipts, exportShiftCsv, exportMduCsv };
