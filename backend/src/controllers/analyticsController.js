const prisma = require("../prismaClient");

function buildDayRange(dateInput) {
  const start = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function getDashboard(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const range = buildDayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const shiftWhere = { shiftDate: { gte: range.start, lt: range.end } };
    const relationShiftWhere = { shift: { shiftDate: { gte: range.start, lt: range.end } } };

    const [
      shiftsAgg,
      cashAgg,
      qrAgg,
      cardAgg,
      fleetAgg,
      partyAgg,
      pendingSubmissions,
      mismatchCount,
      salesByShiftRaw,
      fuelSplitRaw,
      pointWiseRaw
    ] = await Promise.all([
      prisma.shift.aggregate({ where: shiftWhere, _sum: { totalSales: true, totalCollected: true } }),
      prisma.cashDrop.aggregate({ where: relationShiftWhere, _sum: { totalAmount: true } }),
      prisma.qrEntry.aggregate({ where: relationShiftWhere, _sum: { amount: true } }),
      prisma.cardEntry.aggregate({ where: relationShiftWhere, _sum: { amount: true } }),
      prisma.fleetEntry.aggregate({ where: relationShiftWhere, _sum: { amount: true } }),
      prisma.partyCreditEntry.aggregate({ where: relationShiftWhere, _sum: { amount: true } }),
      prisma.shift.count({ where: { ...shiftWhere, status: "DRAFT" } }),
      prisma.shift.count({ where: { ...shiftWhere, difference: { not: 0 } } }),
      prisma.shift.groupBy({ where: shiftWhere, by: ["shiftNumber"], _sum: { totalSales: true } }),
      prisma.nozzleEntry.groupBy({ where: relationShiftWhere, by: ["fuelType"], _sum: { amount: true } }),
      prisma.nozzleEntry.groupBy({ where: relationShiftWhere, by: ["pointNo"], _sum: { amount: true } })
    ]);

    const totalSales = Number(shiftsAgg._sum.totalSales || 0);
    const totalCollected = Number(shiftsAgg._sum.totalCollected || 0);
    const difference = totalCollected - totalSales;
    const cashTotal = Number(cashAgg._sum.totalAmount || 0);
    const qrTotal = Number(qrAgg._sum.amount || 0);
    const cardTotal = Number(cardAgg._sum.amount || 0);
    const fleetTotal = Number(fleetAgg._sum.amount || 0);
    const partyCreditTotal = Number(partyAgg._sum.amount || 0);
    const digitalTotal = qrTotal + cardTotal;

    const salesByShift = salesByShiftRaw
      .map((item) => ({ shiftNumber: item.shiftNumber, value: Number(item._sum.totalSales || 0) }))
      .sort((a, b) => a.shiftNumber - b.shiftNumber);

    const fuelSplit = fuelSplitRaw
      .map((item) => ({ fuelType: item.fuelType, value: Number(item._sum.amount || 0) }))
      .sort((a, b) => String(a.fuelType).localeCompare(String(b.fuelType)));

    const pointWiseSales = pointWiseRaw
      .map((item) => ({ pointNo: item.pointNo, value: Number(item._sum.amount || 0) }))
      .sort((a, b) => a.pointNo - b.pointNo);

    const paymentModes = [
      { mode: "CASH", value: cashTotal },
      { mode: "QR", value: qrTotal },
      { mode: "CARD", value: cardTotal },
      { mode: "FLEET", value: fleetTotal },
      { mode: "PARTY_CREDIT", value: partyCreditTotal }
    ];

    return res.json({
      date,
      kpis: {
        totalSales,
        totalCollected,
        difference,
        cashTotal,
        digitalTotal,
        partyCreditTotal,
        fleetTotal,
        pendingSubmissions,
        mismatchCount
      },
      charts: {
        salesByShift,
        fuelSplit,
        paymentModes,
        pointWiseSales
      }
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

module.exports = { getDashboard };
