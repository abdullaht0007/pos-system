export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";
import { z } from "zod";

const prisma = new PrismaClient();

const setInventorySchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0),
});

async function setInventoryHandler(request: NextRequest, context: ApiHandlerContext) {
  const body = await request.json();
  const { productId, quantity } = setInventorySchema.parse(body);

  // Check if inventory item exists
  const existingItem = await prisma.inventoryItem.findFirst({
    where: { productId },
  });

  if (existingItem) {
    // Update existing inventory
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updatedItem);
  } else {
    // Create new inventory item
    const newItem = await prisma.inventoryItem.create({
      data: { productId, quantity },
      include: { product: true },
    });

    return NextResponse.json(newItem, { status: 201 });
  }
}

export const POST = withApiLogging(setInventoryHandler, "setInventory");
