export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { logApiCall } from "@/lib/logger";

export async function GET(request: NextRequest) {
  console.log("🔍 Direct log test called");

  try {
    await logApiCall({
      userId: "test-user-id",
      username: "test-user",
      method: "GET",
      path: "/api/test-direct-log",
      function: "testDirectLog",
      statusCode: 200,
      userAgent: "test-agent",
      ipAddress: "127.0.0.1",
      duration: 100,
    });

    console.log("✅ Direct log call completed");

    return NextResponse.json({
      message: "Direct log test successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Direct log test failed:", error);
    return NextResponse.json(
      {
        error: "Direct log test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

