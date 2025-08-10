export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { addInventorySchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = addInventorySchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 })
    }

    // Update or create inventory item
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: { productId: data.productId },
      update: {
        quantity: {
          increment: data.quantity,
        },
      },
      create: {
        productId: data.productId,
        quantity: data.quantity,
      },
    })

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error adding inventory:", error)
    return NextResponse.json({ error: { code: "UPDATE_ERROR", message: "Failed to add inventory" } }, { status: 500 })
  }
}
