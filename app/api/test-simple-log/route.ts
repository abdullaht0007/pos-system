export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log("🔍 Simple log test called");

  try {
    const result = await prisma.apiLog.create({
      data: {
        id: `test-${Date.now()}`,
        username: "simple-test",
        method: "GET",
        path: "/api/test-simple-log",
        function: "testSimpleLog",
        statusCode: 200,
        createdAt: new Date(),
      },
    });

    console.log("✅ Simple log created:", result.id);

    return NextResponse.json({
      message: "Simple log test successful",
      logId: result.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Simple log test failed:", error);
    return NextResponse.json(
      {
        error: "Simple log test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

