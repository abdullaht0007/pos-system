export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createSaleSchema } from "@/lib/schemas"

const prisma = new PrismaClient()

function generateReceiptNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
  const timeStr = now.getTime().toString().slice(-4)
  return `SAL-${dateStr}-${timeStr.padStart(4, "0")}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createSaleSchema.parse(body)

    // Calculate totals
    const subtotalCents = data.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0)
    const discountCents = Math.floor((subtotalCents * data.discountPercent) / 100)
    const totalCents = subtotalCents - discountCents

    // Use transaction to create sale and update inventory
    const result = await prisma.$transaction(async (tx) => {
      // Check inventory availability
      const inventoryChecks = await Promise.all(
        data.items.map(async (item) => {
          const inventory = await tx.inventoryItem.findUnique({
            where: { productId: item.productId },
            include: { product: true },
          })

          if (!inventory) {
            throw new Error(`Product ${item.productId} not found in inventory`)
          }

          if (inventory.quantity < item.quantity) {
            throw new Error(
              `Insufficient stock for ${inventory.product.name}. Available: ${inventory.quantity}, Required: ${item.quantity}`,
            )
          }

          return { inventory, item }
        }),
      )

      // Create sale
      const sale = await tx.sale.create({
        data: {
          receiptNumber: generateReceiptNumber(),
          subtotalCents,
          discountPercent: data.discountPercent,
          discountCents,
          totalCents,
          paymentMethod: data.paymentMethod,
        },
      })

      // Create sale items and update inventory
      const saleItems = await Promise.all(
        inventoryChecks.map(async ({ inventory, item }) => {
          // Create sale item
          const saleItem = await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              lineTotalCents: item.quantity * item.unitPriceCents,
            },
          })

          // Update inventory
          await tx.inventoryItem.update({
            where: { productId: item.productId },
            data: {
              quantity: inventory.quantity - item.quantity,
            },
          })

          return saleItem
        }),
      )

      return { sale, saleItems }
    })

    // Fetch complete sale data
    const completeSale = await prisma.sale.findUnique({
      where: { id: result.sale.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(completeSale, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)

    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return NextResponse.json({ error: { code: "INSUFFICIENT_STOCK", message: error.message } }, { status: 409 })
    }

    return NextResponse.json({ error: { code: "CREATE_ERROR", message: "Failed to create sale" } }, { status: 500 })
  }
}
