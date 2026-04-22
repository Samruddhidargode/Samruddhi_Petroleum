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

function buildDateRange(fromStr, toStr) {
  let start, end;

  if (fromStr) {
    start = new Date(fromStr);
    if (Number.isNaN(start.getTime())) return null;
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date();
    start.setHours(0, 0, 0, 0);
  }

  if (toStr) {
    end = new Date(toStr);
    if (Number.isNaN(end.getTime())) return null;
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

function getComparisonRange(periodStr, referenceDate) {
  // Returns date range for comparison period (e.g., "yesterday", "lastWeek", "lastMonth")
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  switch (periodStr) {
    case "yesterday": {
      const start = new Date(ref);
      start.setDate(start.getDate() - 1);
      const end = new Date(ref);
      return { start, end };
    }
    case "lastWeek": {
      const end = new Date(ref);
      const start = new Date(ref);
      start.setDate(start.getDate() - 7);
      return { start, end };
    }
    case "lastMonth": {
      const end = new Date(ref);
      const start = new Date(ref);
      start.setDate(start.getDate() - 30);
      return { start, end };
    }
    default:
      return null;
  }
}

async function getDashboard(req, res) {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Parse date range parameters
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const to = req.query.to || from;
    const compare = req.query.compare || "yesterday";

    const range = buildDateRange(from, to);
    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const comparisonRange = getComparisonRange(compare, range.start);

    const shiftWhere = { shiftDate: { gte: range.start, lt: range.end } };
    const relationShiftWhere = { shift: { shiftDate: { gte: range.start, lt: range.end } } };
    
    const comparisonShiftWhere = comparisonRange
      ? { shiftDate: { gte: comparisonRange.start, lt: comparisonRange.end } }
      : null;
    const comparisonRelationWhere = comparisonRange
      ? { shift: { shiftDate: { gte: comparisonRange.start, lt: comparisonRange.end } } }
      : null;

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
      pointWiseRaw,
      comparisonShiftsAgg,
      sparklineData
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
      prisma.nozzleEntry.groupBy({ where: relationShiftWhere, by: ["pointNo"], _sum: { amount: true } }),
      comparisonRelationWhere ? prisma.shift.aggregate({ where: comparisonShiftWhere, _sum: { totalSales: true, totalCollected: true } }) : null,
      // Sparkline data: daily totals for past 7 days
      prisma.shift.groupBy({
        where: { shiftDate: { gte: new Date(range.start.getTime() - 6 * 24 * 60 * 60 * 1000), lt: new Date(range.end.getTime() + 24 * 60 * 60 * 1000) } },
        by: ["shiftDate"],
        _sum: { totalSales: true, totalCollected: true }
      })
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

    // Calculate comparison deltas
    const comparisonSales = comparisonShiftsAgg ? Number(comparisonShiftsAgg._sum.totalSales || 0) : 0;
    const comparisonCollected = comparisonShiftsAgg ? Number(comparisonShiftsAgg._sum.totalCollected || 0) : 0;
    
    const salesDelta = comparisonSales > 0 ? ((totalSales - comparisonSales) / comparisonSales) * 100 : 0;
    const collectedDelta = comparisonCollected > 0 ? ((totalCollected - comparisonCollected) / comparisonCollected) * 100 : 0;

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

    // Build sparkline data (daily totals for past 7 days)
    const sparklineMap = {};
    (sparklineData || []).forEach((day) => {
      const dateStr = new Date(day.shiftDate).toISOString().slice(0, 10);
      sparklineMap[dateStr] = {
        sales: Number(day._sum.totalSales || 0),
        collected: Number(day._sum.totalCollected || 0)
      };
    });

    // Generate array for past 7 days
    const sparklineSales = [];
    const sparklineCollected = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(range.start);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayData = sparklineMap[dateStr] || { sales: 0, collected: 0 };
      sparklineSales.push(dayData.sales);
      sparklineCollected.push(dayData.collected);
    }

    // Build heatmap data: shifts × points
    const heatmapByShift = [];
    for (let shiftNum = 1; shiftNum <= 3; shiftNum++) {
      const shiftPoints = [];
      for (let pointNo = 1; pointNo <= 4; pointNo++) {
        const pointSales = (pointWiseRaw.find((p) => p.pointNo === pointNo)?._sum?.amount || 0);
        shiftPoints.push({
          pointNo,
          revenue: Number(pointSales || 0)
        });
      }
      heatmapByShift.push({
        shiftNumber: shiftNum,
        points: shiftPoints
      });
    }

    return res.json({
      date: from,
      dateRange: { from, to },
      kpis: {
        totalSales,
        totalCollected,
        difference,
        cashTotal,
        digitalTotal,
        partyCreditTotal,
        fleetTotal,
        pendingSubmissions,
        mismatchCount,
        salesDelta,
        collectedDelta
      },
      charts: {
        salesByShift,
        fuelSplit,
        paymentModes,
        pointWiseSales
      },
      sparklines: {
        totalSales: sparklineSales,
        totalCollected: sparklineCollected
      },
      heatmap: heatmapByShift
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error.stack || error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

module.exports = { getDashboard };
