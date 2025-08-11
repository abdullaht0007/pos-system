export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";
import { updateProductSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

async function getProductHandler(request: NextRequest, context: ApiHandlerContext) {
  const { params } = context as any;
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

async function updateProductHandler(request: NextRequest, context: ApiHandlerContext) {
  const { params } = context as any;
  const { id } = params;
  const body = await request.json();
  const validatedData = updateProductSchema.parse(body);

  const product = await prisma.product.update({
    where: { id },
    data: validatedData,
  });

  return NextResponse.json(product);
}

async function deleteProductHandler(request: NextRequest, context: ApiHandlerContext) {
  const { params } = context as any;
  const { id } = params;

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Product deleted successfully" });
}

export const GET = withApiLogging(getProductHandler, "getProduct");
export const PUT = withApiLogging(updateProductHandler, "updateProduct");
export const DELETE = withApiLogging(deleteProductHandler, "deleteProduct");
