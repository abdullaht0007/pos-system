import { z } from "zod"

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  priceCents: z.number().int().min(0, "Price must be non-negative"),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// Inventory schemas
export const addInventorySchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1, "Quantity must be positive"),
})

export const setInventorySchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
})

// Sale schemas
export const saleItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1, "Quantity must be positive"),
  unitPriceCents: z.number().int().min(0, "Unit price must be non-negative"),
})

export const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  discountPercent: z.number().int().min(0).max(100).default(0),
  paymentMethod: z.enum(["CASH", "CARD", "OTHER"]),
})

// Types
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>
export type AddInventoryInput = z.infer<typeof addInventorySchema>
export type SetInventoryInput = z.infer<typeof setInventorySchema>
export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type SaleItemInput = z.infer<typeof saleItemSchema>
