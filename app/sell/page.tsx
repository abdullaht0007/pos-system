"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getInventory } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";
import { CartPanel } from "@/components/CartPanel";
import { ReceiptModal } from "@/components/ReceiptModal";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  priceCents: number;
  imageUrl?: string;
  quantity: number;
  maxQuantity: number;
};

export default function SellPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleId, setSaleId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: productsData } = useQuery({
    queryKey: ["products", { q: search, page: 1, limit: 100 }],
    queryFn: () => getProducts({ q: search, page: 1, limit: 100 }),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });

  const addToCart = (product: any, maxQuantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity < maxQuantity) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prev;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          quantity: 1,
          maxQuantity,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSaleComplete = (id: string) => {
    setSaleId(id);
    setIsReceiptOpen(true);
    clearCart();
  };

  // Create a map of inventory quantities
  const inventoryMap = new Map();
  if (inventoryData?.data) {
    inventoryData.data.forEach((item: any) => {
      inventoryMap.set(item.productId, item.quantity);
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Point of Sale</h1>

      {/* Mobile cart opener */}
      <div className="flex justify-end lg:hidden">
        <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DrawerTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              <ShoppingCart className="h-4 w-4" />
              Cart ({cart.reduce((n, i) => n + i.quantity, 0)})
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Cart</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <CartPanel
                items={cart}
                onUpdateQuantity={updateCartQuantity}
                onClearCart={clearCart}
                onSaleComplete={(id) => {
                  handleSaleComplete(id);
                  setIsCartOpen(false);
                }}
              />
            </div>
            <div className="p-4 pt-0">
              <DrawerClose asChild>
                <button className="w-full rounded-md border px-4 py-2">
                  Close
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <ProductGrid
            products={productsData?.data || []}
            inventoryMap={inventoryMap}
            onAddToCart={addToCart}
          />
        </div>

        <div className="hidden lg:block">
          <CartPanel
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onClearCart={clearCart}
            onSaleComplete={handleSaleComplete}
          />
        </div>
      </div>

      <ReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        saleId={saleId}
      />
    </div>
  );
}
