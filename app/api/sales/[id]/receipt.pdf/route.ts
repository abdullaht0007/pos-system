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

    // Convert PDF to buffer
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", (err) => {
        console.error("PDF generation stream error:", err);
        reject(err);
      });
      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="receipt-${sale.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
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
