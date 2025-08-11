export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateReceiptPDF } from "@/lib/pdf";

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

    const doc = generateReceiptPDF(sale);

    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));

    const buffer: Buffer = await new Promise((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks as any));
      });
      doc.on("error", (err: unknown) => {
        reject(err as any);
      });
      doc.end();
    });

    // Copy Node Buffer into a new ArrayBuffer to avoid SharedArrayBuffer typing
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="receipt-${sale.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "PDF_ERROR",
          message: "Failed to generate receipt PDF",
          detail: (error as any)?.message,
        },
      },
      { status: 500 }
    );
  }
}
