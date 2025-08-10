"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCents } from "@/lib/money"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ProductGridProps {
  products: any[]
  inventoryMap: Map<string, number>
  onAddToCart: (product: any, maxQuantity: number) => void
}

export function ProductGrid({ products, inventoryMap, onAddToCart }: ProductGridProps) {
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    const quantity = inventoryMap.get(product.id) || 0

    if (quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      })
      return
    }

    onAddToCart(product, quantity)
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const quantity = inventoryMap.get(product.id) || 0
        const isOutOfStock = quantity <= 0

        return (
          <Card key={product.id} className={`${isOutOfStock ? "opacity-50" : ""}`}>
            <CardContent className="p-4">
              <div className="aspect-square relative mb-4">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{formatCents(product.priceCents)}</span>
                <Badge
                  variant={isOutOfStock ? "destructive" : quantity < 10 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {quantity} in stock
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" size="sm" onClick={() => handleAddToCart(product)} disabled={isOutOfStock}>
                <Plus className="w-4 h-4 mr-2" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
