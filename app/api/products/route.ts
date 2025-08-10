export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createProductSchema, productQuerySchema } from "@/lib/schemas"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = productQuerySchema.parse({
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    })

    const skip = (query.page - 1) * query.limit

    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" as const } },
            { sku: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return NextResponse.json({
      data: products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: { code: "FETCH_ERROR", message: "Failed to fetch products" } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingProduct) {
      return NextResponse.json({ error: { code: "DUPLICATE_SKU", message: "SKU already exists" } }, { status: 400 })
    }

    const product = await prisma.product.create({
      data,
    })

    // Create inventory item with 0 quantity
    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        quantity: 0,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: { code: "CREATE_ERROR", message: "Failed to create product" } }, { status: 500 })
  }
}
