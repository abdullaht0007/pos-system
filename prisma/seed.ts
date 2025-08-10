import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.product.deleteMany()

  // Create products
  const products = [
    {
      name: 'MacBook Pro 16"',
      sku: "MBP-16-001",
      priceCents: 249900, // $2499.00
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    },
    {
      name: "iPhone 15 Pro",
      sku: "IPH-15P-001",
      priceCents: 99900, // $999.00
      imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
    },
    {
      name: "AirPods Pro",
      sku: "APP-001",
      priceCents: 24900, // $249.00
      imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop",
    },
    {
      name: "iPad Air",
      sku: "IPA-001",
      priceCents: 59900, // $599.00
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    },
    {
      name: "Apple Watch Series 9",
      sku: "AWS-9-001",
      priceCents: 39900, // $399.00
      imageUrl: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=300&fit=crop",
    },
    {
      name: "Magic Keyboard",
      sku: "MKB-001",
      priceCents: 9900, // $99.00
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
    },
    {
      name: "Magic Mouse",
      sku: "MM-001",
      priceCents: 7900, // $79.00
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    },
    {
      name: "USB-C Cable",
      sku: "USBC-001",
      priceCents: 1900, // $19.00
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    },
    {
      name: "Wireless Charger",
      sku: "WC-001",
      priceCents: 4900, // $49.00
      imageUrl: "https://images.unsplash.com/photo-1609592806596-4d8b5b1d7e7e?w=400&h=300&fit=crop",
    },
    {
      name: "Phone Case",
      sku: "PC-001",
      priceCents: 2900, // $29.00
      imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
    },
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    })

    // Create inventory item with 0 quantity
    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        quantity: 0,
      },
    })
  }

  console.log("Seed data created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
