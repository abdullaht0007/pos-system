export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { setInventorySchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = setInventorySchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Manually upsert inventory item by productId
    const existing = await prisma.inventoryItem.findFirst({
      where: { productId: data.productId },
    });

    let inventoryItem;
    if (existing) {
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: data.quantity,
        },
      });
    } else {
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
        },
      });
    }

    return NextResponse.json(inventoryItem);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "UPDATE_ERROR", message: "Failed to set inventory" } },
      { status: 500 }
    );
  }
}
