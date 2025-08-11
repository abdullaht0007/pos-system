export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      product: true,
    },
  });

  // Direct logging for this API call
  try {
    await (prisma as any).apiLog.create({
      data: {
        id: `inventory-${Date.now()}`,
        userId: "admin-user-id",
        username: "admin",
        method: "GET",
        path: "/api/inventory",
        function: "getInventory",
        statusCode: 200,
        userAgent: request.headers.get("user-agent") || "unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        duration: 100,
        createdAt: new Date(),
      },
    });
    console.log("✅ Direct log created for getInventory");
  } catch (error) {
    console.error("❌ Failed to create direct log:", error);
  }

  return NextResponse.json({ data: inventoryItems });
}
