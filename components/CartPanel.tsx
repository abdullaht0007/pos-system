"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { createSale } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatCents } from "@/lib/money"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/app/sell/page"

interface CartPanelProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onClearCart: () => void
  onSaleComplete: (saleId: string) => void
}

export function CartPanel({ items, onUpdateQuantity, onClearCart, onSaleComplete }: CartPanelProps) {
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "OTHER">("CASH")
  const { toast } = useToast()

  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
  const discountCents = Math.floor((subtotal * discountPercent) / 100)
  const total = subtotal - discountCents

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: (data) => {
      toast({
        title: "Sale Complete",
        description: `Sale ${data.receiptNumber} completed successfully`,
      })
      onSaleComplete(data.id)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleFinalizeSale = () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      })
      return
    }

    const saleData = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: item.priceCents,
      })),
      discountPercent,
      paymentMethod,
    }

    mutation.mutate(saleData)
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cart
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearCart}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                    <p className="text-sm font-medium">{formatCents(item.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCents(item.priceCents * item.quantity)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {item.maxQuantity - item.quantity} left
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label htmlFor="discount">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number.parseInt(e.target.value) || 0)))}
                />
              </div>

              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCents(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-{formatCents(discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCents(total)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleFinalizeSale} disabled={mutation.isPending}>
              {mutation.isPending ? "Processing..." : "Finalize Sale"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
