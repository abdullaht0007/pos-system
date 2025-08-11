export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";
import { z } from "zod";

const prisma = new PrismaClient();

const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    unitPriceCents: z.number().positive(),
  })),
  discountPercent: z.number().min(0).max(100).default(0),
  paymentMethod: z.string(),
});

async function getSalesHandler(request: NextRequest, context: ApiHandlerContext) {
  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ data: sales });
}

async function createSaleHandler(request: NextRequest, context: ApiHandlerContext) {
  const body = await request.json();
  const { items, discountPercent, paymentMethod } = createSaleSchema.parse(body);

  // Calculate totals
  const subtotalCents = items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0);
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const totalCents = subtotalCents - discountCents;

  // Generate receipt number
  const receiptNumber = `R${Date.now()}`;

  // Create sale with items
  const sale = await prisma.sale.create({
    data: {
      receiptNumber,
      subtotalCents,
      discountPercent,
      discountCents,
      totalCents,
      paymentMethod,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.unitPriceCents * item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Update inventory
  for (const item of items) {
    await prisma.inventoryItem.updateMany({
      where: { productId: item.productId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });
  }

  return NextResponse.json(sale, { status: 201 });
}

export const GET = withApiLogging(getSalesHandler, "getSales");
export const POST = withApiLogging(createSaleHandler, "createSale");
