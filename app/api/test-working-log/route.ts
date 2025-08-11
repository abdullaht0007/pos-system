export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log("🔍 Working log test called");

  try {
    const result = await prisma.apiLog.create({
      data: {
        id: `working-${Date.now()}`,
        username: "working-test",
        method: "GET",
        path: "/api/test-working-log",
        function: "testWorkingLog",
        statusCode: 200,
        createdAt: new Date(),
      },
    });

    console.log("✅ Working log created:", result.id);

    return NextResponse.json({
      message: "Working log test successful",
      logId: result.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Working log test failed:", error);
    return NextResponse.json(
      {
        error: "Working log test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

