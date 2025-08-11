export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";

async function testLogHandler(
  request: NextRequest,
  context: ApiHandlerContext
) {
  console.log("🔍 Test log handler called with context:", context);

  return NextResponse.json({
    message: "Test log successful",
    context: context,
  });
}

export const GET = withApiLogging(testLogHandler, "testLog");

