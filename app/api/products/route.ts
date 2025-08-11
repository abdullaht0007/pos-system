export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";
import { createProductSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

async function getProductsHandler(
  request: NextRequest,
  context: ApiHandlerContext
) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const q = searchParams.get("q") || "";

  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Direct logging for this API call
  try {
    await (prisma as any).apiLog.create({
      data: {
        id: `products-${Date.now()}`,
        userId: context.userId,
        username: context.username,
        method: "GET",
        path: "/api/products",
        function: "getProducts",
        statusCode: 200,
        userAgent: request.headers.get("user-agent") || "unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        duration: 100,
        createdAt: new Date(),
      },
    });
    console.log("✅ Direct log created for getProducts");
  } catch (error) {
    console.error("❌ Failed to create direct log:", error);
  }

  return NextResponse.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

async function createProductHandler(
  request: NextRequest,
  context: ApiHandlerContext
) {
  const body = await request.json();
  const validatedData = createProductSchema.parse(body);

  const product = await prisma.product.create({
    data: validatedData,
  });

  // Direct logging for this API call
  try {
    await (prisma as any).apiLog.create({
      data: {
        id: `products-create-${Date.now()}`,
        userId: context.userId,
        username: context.username,
        method: "POST",
        path: "/api/products",
        function: "createProduct",
        statusCode: 201,
        userAgent: request.headers.get("user-agent") || "unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        duration: 100,
        createdAt: new Date(),
      },
    });
    console.log("✅ Direct log created for createProduct");
  } catch (error) {
    console.error("❌ Failed to create direct log:", error);
  }

  return NextResponse.json(product, { status: 201 });
}

export const GET = withApiLogging(getProductsHandler, "getProducts");
export const POST = withApiLogging(createProductHandler, "createProduct");
