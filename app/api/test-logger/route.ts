export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { logApiCall } from "@/lib/logger";

export async function GET(request: NextRequest) {
  console.log("🔍 Logger test called");

  try {
    // Call the logger function directly with the same data structure
    await logApiCall({
      userId: "test-user-id",
      username: "test-user",
      method: "GET",
      path: "/api/test-logger",
      function: "testLogger",
      statusCode: 200,
      userAgent: "test-agent",
      ipAddress: "127.0.0.1",
      duration: 100,
    });

    console.log("✅ Logger test completed");

    return NextResponse.json({
      message: "Logger test successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Logger test failed:", error);
    return NextResponse.json(
      {
        error: "Logger test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

