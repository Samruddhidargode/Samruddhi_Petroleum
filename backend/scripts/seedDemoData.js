/**
 * Seed Demo Data Script
 * Generates 30 days of realistic shift data with:
 * - 3 shifts per day × 4 nozzle points = 360 shifts
 * - Realistic sales patterns (10-20% daily variance, peak/off-peak cycles)
 * - Realistic payment mix (40% cash, 30% digital, 20% fleet, 10% credit)
 * - Intentional variance/mismatches on 15% of shifts
 * - Draft/pending shifts on last 2 days
 *
 * Run: node backend/scripts/seedDemoData.js
 */

const prisma = require("../src/prismaClient");

// Helper: Random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Helper: Random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate realistic sales variance for a day of week
function getSalesVariance(dayOfWeek) {
  // Day 0 = Sunday (low), 1-5 = Weekdays (medium), 6 = Saturday (high)
  const dayFactors = {
    0: 0.85, // Sunday: -15%
    1: 1.0,  // Monday: baseline
    2: 1.05, // Tuesday: +5%
    3: 1.08, // Wednesday: +8%
    4: 1.1,  // Thursday: +10%
    5: 1.08, // Friday: +8%
    6: 1.15  // Saturday: +15%
  };
  return dayFactors[dayOfWeek] || 1.0;
}

// Helper: Base sales for a shift (realistic for fuel station)
function getBaseShiftSales(shiftNumber) {
  // Shift 1 (6-14): ~45k, Shift 2 (14-22): ~55k, Shift 3 (22-6): ~30k
  const baseByShift = {
    1: 45000,
    2: 55000,
    3: 30000
  };
  return baseByShift[shiftNumber] || 40000;
}

// Helper: Generate nozzle point sales breakdown (4 points)
function generateNozzleBreakdown(totalSales, fuelSplit = 0.6) {
  // HSD: ~60%, MS: ~40%
  const hsdTotal = totalSales * fuelSplit;
  const msTotal = totalSales * (1 - fuelSplit);

  // Distribute across 4 points (some variation between points)
  const points = [];
  for (let i = 1; i <= 4; i++) {
    const pointVariance = random(0.8, 1.2);
    const hsdAmount = (hsdTotal / 4) * pointVariance * 0.65;
    const msAmount = (msTotal / 4) * pointVariance * 0.35;
    points.push({
      pointNo: i,
      hsd: Math.round(hsdAmount),
      ms: Math.round(msAmount),
      total: Math.round(hsdAmount + msAmount)
    });
  }
  return points;
}

// Helper: Generate payment mix breakdown
function generatePaymentBreakdown(totalSales) {
  // 40% cash, 30% digital (QR+card), 20% fleet, 10% credit
  const cash = totalSales * 0.4;
  const qr = (totalSales * 0.3) * 0.6;
  const card = (totalSales * 0.3) * 0.4;
  const fleet = totalSales * 0.2;
  const credit = totalSales * 0.1;

  return {
    cash: Math.round(cash),
    qr: Math.round(qr),
    card: Math.round(card),
    fleet: Math.round(fleet),
    credit: Math.round(credit)
  };
}

async function seedDemoData() {
  try {
    console.log("🌱 Starting demo data seed...");

    // Step 1: Ensure DSM user exists (or create one)
    let dsm = await prisma.user.findUnique({
      where: { dsmCode: "DSM001" }
    });

    if (!dsm) {
      console.log("  Creating DSM user DSM001...");
      dsm = await prisma.user.create({
        data: {
          role: "DSM",
          dsmCode: "DSM001",
          name: "Demo DSM User",
          passwordHash: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lm", // "DSM@123"
          isActive: true
        }
      });
      console.log(`  ✓ DSM created: ${dsm.id}`);
    } else {
      console.log(`  ✓ DSM exists: ${dsm.id}`);
    }

    // Step 2: Generate 30 days of shifts (starting 30 days ago, ending today)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let shiftCount = 0;
    let createdCount = 0;

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const currentDate = new Date(thirtyDaysAgo);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().slice(0, 10);
      const dayOfWeek = currentDate.getDay();

      const dayVariance = getSalesVariance(dayOfWeek);

      // Create 3 shifts per day
      for (let shiftNum = 1; shiftNum <= 3; shiftNum++) {
        shiftCount++;

        // Determine status (last 2 days have some DRAFT shifts for pending workflow)
        const daysFromEnd = 30 - dayOffset;
        const status = daysFromEnd <= 2 && randomInt(1, 100) <= 30 ? "DRAFT" : "SUBMITTED";

        // Generate base sales with daily and shift-level variance
        const baseShiftSales = getBaseShiftSales(shiftNum);
        const dailyVariance = random(0.9, 1.1) * dayVariance;
        const totalSales = Math.round(baseShiftSales * dailyVariance);

        // Generate payment breakdown
        const payments = generatePaymentBreakdown(totalSales);
        const totalCollected = payments.cash + payments.qr + payments.card + payments.fleet + payments.credit;

        // Generate intentional variance on 15% of shifts for alert showcase
        let variance = totalCollected - totalSales;
        if (randomInt(1, 100) <= 15) {
          // Create intentional mismatch: add random variance between -5000 to +3000
          variance = randomInt(-5000, 3000);
        }
        const finalCollected = totalSales + variance;

        // Set shift times
        const shiftTimes = {
          1: { start: 6, end: 14 },   // 6 AM - 2 PM
          2: { start: 14, end: 22 },  // 2 PM - 10 PM
          3: { start: 22, end: 30 }   // 10 PM - 6 AM (next day)
        };
        const times = shiftTimes[shiftNum];
        const timeIn = new Date(currentDate);
        timeIn.setHours(times.start, 0, 0, 0);
        const timeOut = new Date(currentDate);
        timeOut.setHours(times.end % 24, 0, 0, 0);
        if (times.end >= 24) {
          timeOut.setDate(timeOut.getDate() + 1);
        }

        // Create Shift record
        const shift = await prisma.shift.create({
          data: {
            shiftDate: currentDate,
            timeIn,
            timeOut: status === "SUBMITTED" ? timeOut : null,
            shiftNumber: shiftNum,
            qrScannerNo: `QR-${shiftNum}`,
            status,
            totalSales: totalSales,
            totalCollected: finalCollected,
            difference: variance,
            confirmedAt: status === "SUBMITTED" ? new Date() : null,
            dsmId: dsm.id
          }
        });

        createdCount++;

        // Create NozzleEntries (4 points × 2 fuel types each)
        const nozzleBreakdown = generateNozzleBreakdown(totalSales);
        for (const point of nozzleBreakdown) {
          // HSD entry
          await prisma.nozzleEntry.create({
            data: {
              shiftId: shift.id,
              pointNo: point.pointNo,
              fuelType: "HSD",
              openingReading: randomInt(1000, 9999),
              closingReading: randomInt(10000, 99999),
              rate: 93,
              pumpTestLiters: randomInt(0, 100),
              ownUseLiters: randomInt(0, 50),
              dispensedQty: Math.round(point.hsd / 93),
              effectiveQty: Math.round(point.hsd / 93),
              amount: point.hsd
            }
          });

          // MS entry
          await prisma.nozzleEntry.create({
            data: {
              shiftId: shift.id,
              pointNo: point.pointNo,
              fuelType: "MS",
              openingReading: randomInt(1000, 9999),
              closingReading: randomInt(10000, 99999),
              rate: 86,
              pumpTestLiters: randomInt(0, 100),
              ownUseLiters: randomInt(0, 50),
              dispensedQty: Math.round(point.ms / 86),
              effectiveQty: Math.round(point.ms / 86),
              amount: point.ms
            }
          });
        }

        // Create CashDrop
        const cashAmount = payments.cash;
        await prisma.cashDrop.create({
          data: {
            shiftId: shift.id,
            den500: Math.floor(cashAmount / 500) * randomInt(1, 3),
            den200: Math.floor((cashAmount % 500) / 200) * randomInt(1, 2),
            den100: Math.floor((cashAmount % 200) / 100) * randomInt(1, 2),
            den50: randomInt(1, 10),
            den20: randomInt(1, 15),
            den10: randomInt(1, 20),
            coins: Math.round(random(0, 500)),
            totalAmount: cashAmount
          }
        });

        // Create QrEntry
        if (payments.qr > 0) {
          await prisma.qrEntry.create({
            data: {
              shiftId: shift.id,
              amount: payments.qr,
              receiptUrl: null
            }
          });
        }

        // Create CardEntry
        if (payments.card > 0) {
          await prisma.cardEntry.create({
            data: {
              shiftId: shift.id,
              cardType: randomInt(1, 2) === 1 ? "DEBIT" : "CREDIT",
              amount: payments.card,
              receiptUrl: null
            }
          });
        }

        // Create FleetEntry
        if (payments.fleet > 0) {
          await prisma.fleetEntry.create({
            data: {
              shiftId: shift.id,
              amount: payments.fleet,
              receiptUrl: null
            }
          });
        }

        // Create PartyCreditEntry
        if (payments.credit > 0) {
          await prisma.partyCreditEntry.create({
            data: {
              shiftId: shift.id,
              partyName: `Party ${randomInt(1, 5)}`,
              amount: payments.credit,
              receiptUrl: null
            }
          });
        }

        // Progress indicator
        if (createdCount % 30 === 0) {
          console.log(`  ✓ Created ${createdCount} shifts...`);
        }
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created ${createdCount} shifts across 30 days`);
    console.log(`   ${createdCount * 8} nozzle entries (4 points × 2 fuel types)`);
    console.log(`   ${createdCount} cash drops`);
    console.log(`   ~${Math.round(createdCount * 0.8)} payment entries (QR, Card, Fleet, Credit)`);
    console.log(`\n📊 Data ready for dashboard visualization!`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Seed error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the seed
seedDemoData();
