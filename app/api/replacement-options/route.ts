import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    const slotIndexRaw = searchParams.get("slotIndex");

    if (!deviceId || !slotIndexRaw) {
      return NextResponse.json(
        { error: "deviceId and slotIndex are required" },
        { status: 400 }
      );
    }

    const slotIndex = Number(slotIndexRaw);

    if (Number.isNaN(slotIndex)) {
      return NextResponse.json(
        { error: "slotIndex must be a number" },
        { status: 400 }
      );
    }

    const stackItem = await prisma.stackItem.findUnique({
      where: {
        deviceId_slotIndex: {
          deviceId,
          slotIndex,
        },
      },
      include: {
        module: true,
      },
    });

    if (!stackItem) {
      return NextResponse.json(
        { error: "Stack item not found" },
        { status: 404 }
      );
    }

    const rules = await prisma.replaceRule.findMany({
      where: {
        fromModuleId: stackItem.moduleId,
        isAllowed: true,
      },
      include: {
        toModule: true,
      },
      orderBy: {
        toModuleId: "asc",
      },
    });

    return NextResponse.json({
      deviceId,
      slotIndex,
      currentModule: stackItem.module,
      options: rules.map((rule) => ({
        id: rule.toModule.id,
        name: rule.toModule.name,
        moduleType: rule.toModule.moduleType,
        power: rule.toModule.power,
      })),
    });
  } catch (error) {
    console.error("GET /api/replacement-options error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}