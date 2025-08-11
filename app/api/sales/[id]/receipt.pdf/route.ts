export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateReceiptPDF } from "@/lib/pdf";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";

const prisma = new PrismaClient();

async function getReceiptPdfHandler(request: NextRequest, context: ApiHandlerContext) {
  const { params } = context;
  const { id } = params;

  const sale = await prisma.sale.findUnique({
    where: { id },
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
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${sale.receiptNumber}.pdf"`,
    },
  });
}

export const GET = withApiLogging(getReceiptPdfHandler, "getReceiptPdf");
