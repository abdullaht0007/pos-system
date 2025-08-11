export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";

const prisma = new PrismaClient();

async function getLogsHandler(
  request: NextRequest,
  context: ApiHandlerContext
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const method = searchParams.get("method") || undefined;
  const functionName = searchParams.get("function") || undefined;
  const statusCode = searchParams.get("statusCode")
    ? parseInt(searchParams.get("statusCode")!)
    : undefined;
  const username = searchParams.get("username") || undefined;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (method) where.method = method;
  if (functionName)
    where.function = { contains: functionName, mode: "insensitive" };
  if (statusCode) where.statusCode = statusCode;
  if (username) where.username = { contains: username, mode: "insensitive" };

  const [logs, total] = await Promise.all([
    prisma.apiLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        method: true,
        path: true,
        function: true,
        statusCode: true,
        duration: true,
        ipAddress: true,
        createdAt: true,
      },
    }),
    prisma.apiLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

export const GET = withApiLogging(getLogsHandler, "getAdminLogs");

