export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";
import { z } from "zod";

const prisma = new PrismaClient();

const addInventorySchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
});

async function addInventoryHandler(request: NextRequest, context: ApiHandlerContext) {
  const body = await request.json();
  const { productId, quantity } = addInventorySchema.parse(body);

  // Check if inventory item exists
  const existingItem = await prisma.inventoryItem.findFirst({
    where: { productId },
  });

  if (existingItem) {
    // Update existing inventory
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
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

export const POST = withApiLogging(addInventoryHandler, "addInventory");
