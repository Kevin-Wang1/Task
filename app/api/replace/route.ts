import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, slotIndex, newModuleId } = body;

    if (!deviceId || slotIndex === undefined || !newModuleId) {
      return NextResponse.json(
        { error: "deviceId, slotIndex and newModuleId are required" },
        { status: 400 }
      );
    }

    const parsedSlotIndex = Number(slotIndex);

    if (Number.isNaN(parsedSlotIndex)) {
      return NextResponse.json(
        { error: "slotIndex must be a number" },
        { status: 400 }
      );
    }

    const currentStackItem = await prisma.stackItem.findUnique({
      where: {
        deviceId_slotIndex: {
          deviceId,
          slotIndex: parsedSlotIndex,
        },
      },
      include: {
        module: true,
      },
    });

    if (!currentStackItem) {
      return NextResponse.json(
        { error: "Stack item not found" },
        { status: 404 }
      );
    }

    if (currentStackItem.moduleId === newModuleId) {
      return NextResponse.json(
        { error: "New module is the same as current module" },
        { status: 400 }
      );
    }

    const targetModule = await prisma.module.findUnique({
      where: { id: newModuleId },
    });

    if (!targetModule) {
      return NextResponse.json(
        { error: "Target module not found" },
        { status: 404 }
      );
    }

    const allowedRule = await prisma.replaceRule.findUnique({
      where: {
        fromModuleId_toModuleId: {
          fromModuleId: currentStackItem.moduleId,
          toModuleId: newModuleId,
        },
      },
    });

    if (!allowedRule || !allowedRule.isAllowed) {
      return NextResponse.json(
        { error: "Replacement is not allowed by rules" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.stackItem.update({
        where: {
          deviceId_slotIndex: {
            deviceId,
            slotIndex: parsedSlotIndex,
          },
        },
        data: {
          moduleId: newModuleId,
        },
      }),
      prisma.stackHistory.create({
        data: {
          deviceId,
          slotIndex: parsedSlotIndex,
          oldModuleId: currentStackItem.moduleId,
          newModuleId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Module replaced successfully",
      fromModuleId: currentStackItem.moduleId,
      toModuleId: newModuleId,
    });
  } catch (error) {
    console.error("POST /api/replace error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}