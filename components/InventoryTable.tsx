"use client"

import { formatCents } from "@/lib/money"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
import Image from "next/image"

interface InventoryTableProps {
  data: any
  isLoading: boolean
  onSetQuantity: (productId: string) => void
}

export function InventoryTable({ data, isLoading, onSetQuantity }: InventoryTableProps) {
  if (isLoading) {
    return <div>Loading inventory...</div>
  }

  const inventory = data?.data || []

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl || "/placeholder.svg"}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.product.sku}</Badge>
                </TableCell>
                <TableCell>{formatCents(item.product.priceCents)}</TableCell>
                <TableCell>
                  <span className="font-mono">{item.quantity}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={item.quantity === 0 ? "destructive" : item.quantity < 10 ? "secondary" : "default"}>
                    {item.quantity === 0 ? "Out of Stock" : item.quantity < 10 ? "Low Stock" : "In Stock"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onSetQuantity(item.productId)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Set Quantity
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
