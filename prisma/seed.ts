import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create initial admin user
  try {
    const existingUser = await prisma.user.findFirst();
    if (!existingUser) {
      const passwordHash = await bcrypt.hash("admin123", 12);
      await prisma.user.create({
        data: {
          username: "admin",
          passwordHash,
        },
      });
      console.log("✅ Initial user created: admin/admin123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error creating initial user:", error);
  }

  // Create sample products
  const products = [
    {
      name: "Laptop",
      sku: "LAP001",
      priceCents: 99999,
      imageUrl:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    },
    {
      name: "Smartphone",
      sku: "PHN001",
      priceCents: 59999,
      imageUrl:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    },
    {
      name: "Headphones",
      sku: "HP001",
      priceCents: 19999,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    },
    {
      name: "Tablet",
      sku: "TAB001",
      priceCents: 39999,
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    },
    {
      name: "Wireless Mouse",
      sku: "MS001",
      priceCents: 2999,
      imageUrl:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  // Create inventory items
  const inventoryItems = [
    { productSku: "LAP001", quantity: 10 },
    { productSku: "PHN001", quantity: 25 },
    { productSku: "HP001", quantity: 50 },
    { productSku: "TAB001", quantity: 15 },
    { productSku: "MS001", quantity: 100 },
  ];

  for (const item of inventoryItems) {
    const product = await prisma.product.findUnique({
      where: { sku: item.productSku },
    });

    if (product) {
      const existing = await prisma.inventoryItem.findFirst({
        where: { productId: product.id },
      });
      if (existing) {
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: { quantity: item.quantity },
        });
      } else {
        await prisma.inventoryItem.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
          },
        });
      }
    }
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
