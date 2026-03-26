import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        stackItems: {
          orderBy: { slotIndex: "asc" },
          include: {
            module: true,
          },
        },
        histories: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      deviceId: device.id,
      deviceName: device.name,
      geoFeatureId: device.geoFeatureId,
      stack: device.stackItems,
      history: device.histories,
    });
  } catch (error) {
    console.error("GET /api/stack error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}