"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { setInventory, getInventory } from "@/lib/api"
import { setInventorySchema, type SetInventoryInput } from "@/lib/schemas"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface SetQuantityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
}

export function SetQuantityDialog({ open, onOpenChange, productId }: SetQuantityDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    enabled: open && !!productId,
  })

  const form = useForm<SetInventoryInput>({
    resolver: zodResolver(setInventorySchema),
    defaultValues: {
      productId: "",
      quantity: 0,
    },
  })

  useEffect(() => {
    if (productId && inventoryData?.data) {
      const item = inventoryData.data.find((item: any) => item.productId === productId)
      form.setValue("productId", productId)
      form.setValue("quantity", item?.quantity || 0)
    }
  }, [productId, inventoryData, form])

  const mutation = useMutation({
    mutationFn: setInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast({
        title: "Success",
        description: "Inventory quantity updated successfully",
      })
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: SetInventoryInput) => {
    mutation.mutate(data)
  }

  const currentItem = inventoryData?.data?.find((item: any) => item.productId === productId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Quantity</DialogTitle>
        </DialogHeader>
        {currentItem && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">{currentItem.product.name}</h3>
            <p className="text-sm text-muted-foreground">Current quantity: {currentItem.quantity}</p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Set Quantity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
