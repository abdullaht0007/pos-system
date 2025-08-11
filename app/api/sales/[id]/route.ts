export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
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
  } catch (error) {
    return NextResponse.json(
      { error: { code: "FETCH_ERROR", message: "Failed to fetch sale" } },
      { status: 500 }
    );
  }
}
