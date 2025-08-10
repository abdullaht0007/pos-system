export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            priceCents: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    })

    return NextResponse.json({ data: inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: { code: "FETCH_ERROR", message: "Failed to fetch inventory" } }, { status: 500 })
  }
}
