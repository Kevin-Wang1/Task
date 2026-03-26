import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const modules = [
    { id: "power_v1", name: "Power Module V1", moduleType: "power", power: 100 },
    { id: "power_v2", name: "Power Module V2", moduleType: "power", power: 150 },
    { id: "power_v3", name: "Power Module V3", moduleType: "power", power: 180 },

    { id: "gas_a", name: "Gas Sensor A", moduleType: "sensor", power: 20 },
    { id: "gas_b", name: "Gas Sensor B", moduleType: "sensor", power: 30 },
    { id: "gas_c", name: "Gas Sensor C", moduleType: "sensor", power: 35 },

    { id: "comm_a", name: "Comm Module A", moduleType: "comm", power: 15 },
    { id: "comm_b", name: "Comm Module B", moduleType: "comm", power: 18 },
  ];

  for (const m of modules) {
    await prisma.module.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        moduleType: m.moduleType,
        power: m.power,
      },
      create: m,
    });
  }

  const rules = [
    { fromModuleId: "power_v1", toModuleId: "power_v2" },
    { fromModuleId: "power_v1", toModuleId: "power_v3" },
    { fromModuleId: "power_v2", toModuleId: "power_v1" },
    { fromModuleId: "power_v2", toModuleId: "power_v3" },
    { fromModuleId: "power_v3", toModuleId: "power_v1" },
    { fromModuleId: "power_v3", toModuleId: "power_v2" },

    { fromModuleId: "gas_a", toModuleId: "gas_b" },
    { fromModuleId: "gas_a", toModuleId: "gas_c" },
    { fromModuleId: "gas_b", toModuleId: "gas_a" },
    { fromModuleId: "gas_b", toModuleId: "gas_c" },
    { fromModuleId: "gas_c", toModuleId: "gas_a" },
    { fromModuleId: "gas_c", toModuleId: "gas_b" },

    { fromModuleId: "comm_a", toModuleId: "comm_b" },
    { fromModuleId: "comm_b", toModuleId: "comm_a" },
  ];

  for (const rule of rules) {
    await prisma.replaceRule.upsert({
      where: {
        fromModuleId_toModuleId: {
          fromModuleId: rule.fromModuleId,
          toModuleId: rule.toModuleId,
        },
      },
      update: {
        isAllowed: true,
      },
      create: {
        ...rule,
        isAllowed: true,
      },
    });
  }

  const devices = [
    {
      id: "device_001",
      name: "Mine Sensor 001",
      geoFeatureId: "point_001",
      stack: [
        { slotIndex: 1, moduleId: "power_v1" },
        { slotIndex: 2, moduleId: "gas_a" },
        { slotIndex: 3, moduleId: "comm_a" },
      ],
    },
    {
      id: "device_002",
      name: "Mine Sensor 002",
      geoFeatureId: "point_002",
      stack: [
        { slotIndex: 1, moduleId: "power_v2" },
        { slotIndex: 2, moduleId: "gas_c" },
        { slotIndex: 3, moduleId: "comm_b" },
      ],
    },
    {
      id: "device_003",
      name: "Mine Sensor 003",
      geoFeatureId: "point_003",
      stack: [
        { slotIndex: 1, moduleId: "power_v3" },
        { slotIndex: 2, moduleId: "gas_b" },
        { slotIndex: 3, moduleId: "comm_a" },
      ],
    },
  ];

  for (const d of devices) {
    await prisma.device.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        geoFeatureId: d.geoFeatureId,
      },
      create: {
        id: d.id,
        name: d.name,
        geoFeatureId: d.geoFeatureId,
      },
    });

    for (const item of d.stack) {
      await prisma.stackItem.upsert({
        where: {
          deviceId_slotIndex: {
            deviceId: d.id,
            slotIndex: item.slotIndex,
          },
        },
        update: {
          moduleId: item.moduleId,
        },
        create: {
          deviceId: d.id,
          slotIndex: item.slotIndex,
          moduleId: item.moduleId,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });