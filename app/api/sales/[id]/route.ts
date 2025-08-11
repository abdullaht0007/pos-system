export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";

const prisma = new PrismaClient();

async function getSaleHandler(request: NextRequest, context: ApiHandlerContext) {
  const { params } = context;
  const { id } = params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Sale not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(sale);
}

export const GET = withApiLogging(getSaleHandler, "getSale");
