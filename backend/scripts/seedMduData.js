#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const vehicleNumbers = ["DL-01-AB-2024", "DL-02-AB-2024", "DL-03-AB-2024", "DL-04-AB-2024", "DL-05-AB-2024"];
const clientNames = [
  "Raj Petrol",
  "Express Fuel",
  "Sharma Transport",
  "Fleet Management Ltd",
  "Golden Logistics",
  "Speed Delivery",
  "Prime Transport",
  "Kumar Fuel Distributors",
  "Arjun Petroleum",
  "Shiva Logistics"
];

const paymentModes = ["CASH", "ONLINE", "CREDIT"];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

async function seedMduData() {
  try {
    console.log("🚀 Starting MDU trips seed...");

    // Get DSM user
    const dsmUser = await prisma.user.findFirst({
      where: { role: "DSM" }
    });

    if (!dsmUser) {
      console.error("❌ No DSM user found. Please ensure a DSM user exists.");
      process.exit(1);
    }

    console.log(`✓ Found DSM user: ${dsmUser.dsmCode}`);

    // Generate 30 days of MDU trips
    const tripData = [];
    const clientData = [];

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() - dayOffset);
      tripDate.setHours(0, 0, 0, 0);

      // Generate 2-4 trips per day
      const tripsPerDay = Math.floor(randomInRange(2, 5));

      for (let tripIdx = 0; tripIdx < tripsPerDay; tripIdx++) {
        const openingTime = new Date(tripDate);
        openingTime.setHours(Math.floor(randomInRange(6, 18)), Math.floor(randomInRange(0, 59)), 0, 0);

        const closingTime = new Date(openingTime);
        closingTime.setHours(closingTime.getHours() + Math.floor(randomInRange(2, 8)));

        const vehicleNo = vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)];
        const openingMeter = Math.floor(randomInRange(10000, 80000));
        const closingMeter = openingMeter + Math.floor(randomInRange(50, 500));
        const status = Math.random() > 0.1 ? "CLOSED" : "OPEN";

        const tripId = `mdu-trip-${dayOffset}-${tripIdx}-${Date.now()}`;

        // Generate 3-8 clients per trip
        const clientsPerTrip = Math.floor(randomInRange(3, 9));

        for (let clientIdx = 0; clientIdx < clientsPerTrip; clientIdx++) {
          const qty = Math.floor(randomInRange(10, 200));
          const rate = Math.floor(randomInRange(80, 120));
          const amount = qty * rate;
          const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

          clientData.push({
            tripId,
            clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
            qty,
            rate,
            amount,
            paymentMode
          });
        }

        tripData.push({
          id: tripId,
          tripDate,
          openingTime,
          closingTime: status === "CLOSED" ? closingTime : null,
          vehicleNo,
          openingMeter,
          closingMeter: status === "CLOSED" ? closingMeter : null,
          status,
          dsmId: dsmUser.id
        });
      }
    }

    console.log(`\n📋 Creating ${tripData.length} MDU trips...`);
    for (const trip of tripData) {
      await prisma.mduTrip.create({
        data: trip
      });
    }
    console.log(`✓ Created ${tripData.length} MDU trips`);

    console.log(`\n👥 Creating ${clientData.length} MDU clients...`);
    for (const client of clientData) {
      await prisma.mduClient.create({
        data: client
      });
    }
    console.log(`✓ Created ${clientData.length} MDU clients`);

    // Generate MDU EOD summary for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrips = tripData.filter(t => {
      const tDate = new Date(t.tripDate);
      tDate.setHours(0, 0, 0, 0);
      return tDate.getTime() === today.getTime();
    });

    const todayClients = clientData.filter(c => {
      const trip = tripData.find(t => t.id === c.tripId);
      const tDate = new Date(trip.tripDate);
      tDate.setHours(0, 0, 0, 0);
      return tDate.getTime() === today.getTime();
    });

    if (todayTrips.length > 0) {
      const cashTotal = todayClients
        .filter(c => c.paymentMode === "CASH")
        .reduce((sum, c) => sum + c.amount, 0);
      const onlineTotal = todayClients
        .filter(c => c.paymentMode === "ONLINE")
        .reduce((sum, c) => sum + c.amount, 0);
      const creditTotal = todayClients
        .filter(c => c.paymentMode === "CREDIT")
        .reduce((sum, c) => sum + c.amount, 0);
      const totalSales = cashTotal + onlineTotal + creditTotal;

      const eodExists = await prisma.mduEod.findUnique({
        where: { eodDate: today }
      });

      if (!eodExists) {
        await prisma.mduEod.create({
          data: {
            eodDate: today,
            totalTrips: todayTrips.length,
            totalClients: todayClients.length,
            totalSales,
            cashTotal,
            onlineTotal,
            creditTotal,
            confirmedById: dsmUser.id
          }
        });
        console.log(`\n✓ Created MDU EOD summary for today`);
      }
    }

    console.log(`\n✅ MDU seed completed successfully!`);
    console.log(`   - ${tripData.length} trips created`);
    console.log(`   - ${clientData.length} clients created`);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMduData();
