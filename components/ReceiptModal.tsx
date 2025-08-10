"use client"

import { useQuery } from "@tanstack/react-query"
import { getSale, getReceiptPdfUrl } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCents } from "@/lib/money"
import { Download, Printer } from "lucide-react"

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string | null
}

export function ReceiptModal({ open, onOpenChange, saleId }: ReceiptModalProps) {
  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => getSale(saleId!),
    enabled: open && !!saleId,
  })

  const handleDownloadPdf = () => {
    if (saleId) {
      const url = getReceiptPdfUrl(saleId)
      window.open(url, "_blank")
    }
  }

  const handlePrint = () => {
    if (saleId) {
      const url = getReceiptPdfUrl(saleId)
      const printWindow = window.open(url, "_blank")
      printWindow?.addEventListener("load", () => {
        printWindow.print()
      })
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex items-center justify-center py-8">Loading receipt...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!sale) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sale Complete</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">TechStore POS</h2>
            <p className="text-sm text-muted-foreground">123 Main Street, City, State 12345</p>
            <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-mono">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span>{sale.paymentMethod}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Price</span>
              <span className="text-right">Total</span>
            </div>
            <Separator />
            {sale.items.map((item: any) => (
              <div key={item.id} className="grid grid-cols-4 gap-2 text-sm">
                <span className="truncate">{item.product.name}</span>
                <span className="text-center">{item.quantity}</span>
                <span className="text-right">{formatCents(item.unitPriceCents)}</span>
                <span className="text-right">{formatCents(item.lineTotalCents)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCents(sale.subtotalCents)}</span>
            </div>
            {sale.discountPercent > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({sale.discountPercent}%):</span>
                <span>-{formatCents(sale.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCents(sale.totalCents)}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>Please come again!</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPdf} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
