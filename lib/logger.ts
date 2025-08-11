import { NextRequest } from "next/server";

export interface LogData {
  userId?: string;
  username?: string;
  method: string;
  path: string;
  function: string;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  userAgent?: string;
  ipAddress?: string;
  duration?: number;
  error?: string;
}

export async function logApiCall(data: LogData): Promise<void> {
  console.log("🔍 Attempting to log API call:", {
    username: data.username,
    method: data.method,
    path: data.path,
    function: data.function,
    statusCode: data.statusCode,
  });

  try {
    // Use the same pattern as the working simple test
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const result = await prisma.apiLog.create({
      data: {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        username: data.username,
        method: data.method,
        path: data.path,
        function: data.function,
        statusCode: data.statusCode,
        requestBody: data.requestBody ? JSON.stringify(data.requestBody) : null,
        responseBody: data.responseBody
          ? JSON.stringify(data.responseBody)
          : null,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        duration: data.duration,
        error: data.error,
        createdAt: new Date(),
      },
    });

    console.log("✅ API call logged successfully:", result.id);

    // Disconnect the Prisma client
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Failed to log API call:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export function sanitizeRequestBody(body: any): any {
  if (!body) return null;

  // Create a copy to avoid modifying the original
  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "auth-token", "authorization"];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
}

export function sanitizeResponseBody(body: any): any {
  if (!body) return null;

  // Create a copy to avoid modifying the original
  const sanitized = { ...body };

  // Remove sensitive fields from response
  const sensitiveFields = ["token", "password", "passwordHash"];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
}
