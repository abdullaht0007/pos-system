"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/lib/api";
import { InventoryTable } from "@/components/InventoryTable";
import { AddToInventoryDialog } from "@/components/AddToInventoryDialog";
import { SetQuantityDialog } from "@/components/SetQuantityDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StockPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });

  const handleSetQuantity = (productId: string) => {
    setSelectedProduct(productId);
    setIsSetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Stock Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Inventory
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500">
          Error loading inventory: {error.message}
        </div>
      )}

      <InventoryTable
        data={data}
        isLoading={isLoading}
        onSetQuantity={handleSetQuantity}
      />

      <AddToInventoryDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      <SetQuantityDialog
        open={isSetOpen}
        onOpenChange={setIsSetOpen}
        productId={selectedProduct}
      />
    </div>
  );
}
