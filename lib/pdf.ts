import PDFDocument from "pdfkit"
// Force-load built-in fonts to avoid ENOENT for AFM files in some bundling modes
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("pdfkit/js/data/Helvetica.afm")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("pdfkit/js/data/Helvetica-Bold.afm")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("pdfkit/js/data/Helvetica-Oblique.afm")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("pdfkit/js/data/Helvetica-BoldOblique.afm")
} catch {}
import type { Sale, SaleItem, Product } from "@prisma/client"

type SaleWithItems = Sale & {
  items: (SaleItem & {
    product: Product
  })[]
}

export function generateReceiptPDF(sale: SaleWithItems): PDFDocument {
  const doc = new PDFDocument({ margin: 50 })

  // Header
  doc.fontSize(20).text("TechStore POS", { align: "center" })
  doc.fontSize(12).text("123 Main Street, City, State 12345", { align: "center" })
  doc.text("Phone: (555) 123-4567", { align: "center" })
  doc.moveDown()

  // Receipt info
  doc.text(`Receipt #: ${sale.receiptNumber}`)
  doc.text(`Date: ${sale.createdAt.toLocaleString()}`)
  doc.text(`Payment: ${sale.paymentMethod}`)
  doc.moveDown()

  // Items table header
  const tableTop = doc.y
  doc.text("Item", 50, tableTop)
  doc.text("Qty", 250, tableTop)
  doc.text("Price", 300, tableTop)
  doc.text("Total", 400, tableTop)

  // Draw line under header
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(500, tableTop + 15)
    .stroke()

  let currentY = tableTop + 25

  // Items
  sale.items.forEach((item) => {
    doc.text(item.product.name, 50, currentY)
    doc.text(item.quantity.toString(), 250, currentY)
    doc.text(`$${(item.unitPriceCents / 100).toFixed(2)}`, 300, currentY)
    doc.text(`$${(item.lineTotalCents / 100).toFixed(2)}`, 400, currentY)
    currentY += 20
  })

  // Totals
  currentY += 10
  doc.moveTo(50, currentY).lineTo(500, currentY).stroke()

  currentY += 15
  doc.text(`Subtotal: $${(sale.subtotalCents / 100).toFixed(2)}`, 300, currentY)

  if (sale.discountPercent > 0) {
    currentY += 15
    doc.text(`Discount (${sale.discountPercent}%): -$${(sale.discountCents / 100).toFixed(2)}`, 300, currentY)
  }

  currentY += 15
  doc.fontSize(14).text(`Total: $${(sale.totalCents / 100).toFixed(2)}`, 300, currentY)

  // Footer
  doc.fontSize(12).moveDown(2)
  doc.text("Thank you for your business!", { align: "center" })
  doc.text("Please come again!", { align: "center" })

  return doc
}
