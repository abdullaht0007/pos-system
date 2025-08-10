# POS System

A complete Point of Sale (POS) system built with Next.js 14, Prisma, SQLite, and modern React technologies.

## Features

- **Product Management**: Add, edit, delete products with image upload support
- **Inventory Management**: Track stock levels, add/set quantities
- **Sales Processing**: Complete checkout flow with discount support
- **Receipt Generation**: PDF receipts with download/print functionality
- **Real-time Updates**: Optimistic UI updates with TanStack Query
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Node.js runtime
- **Database**: Prisma ORM with SQLite
- **UI**: shadcn/ui components, Tailwind CSS
- **Forms**: react-hook-form with Zod validation
- **State Management**: TanStack Query
- **PDF Generation**: PDFKit

## Setup & Installation

1. **Clone and install dependencies**:
   \`\`\`bash
   git clone <repository-url>
   cd pos-system
   npm install
   # or
   pnpm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. **Set up the database**:
   \`\`\`bash
   # Generate Prisma client
   pnpm dlx prisma generate
   
   # Run database migrations
   pnpm dlx prisma migrate dev --name init
   
   # Seed the database with sample data
   pnpm dlx prisma db seed
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   pnpm dev
   \`\`\`

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## Usage

### Products Page (`/products`)
- View all products in a searchable table
- Add new products with image upload or URL
- Edit existing products
- Delete products (with confirmation)
- Pagination support

### Stock Page (`/stock`)
- View inventory levels for all products
- Add quantity to existing inventory
- Set absolute quantities
- Visual stock status indicators (In Stock, Low Stock, Out of Stock)

### Sell Page (`/sell`)
- Browse products in a responsive grid
- Search products by name or SKU
- Add items to cart (respects stock levels)
- Adjust quantities with +/- buttons
- Apply percentage discounts (0-100%)
- Choose payment method (Cash, Card, Other)
- Complete sales with automatic inventory updates
- Generate and download PDF receipts

## API Endpoints

### Products
- `GET /api/products` - List products with search and pagination
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory` - List all inventory items
- `POST /api/inventory/add` - Add quantity to inventory
- `POST /api/inventory/set` - Set absolute quantity

### Sales
- `POST /api/sales` - Create new sale (with inventory updates)
- `GET /api/sales/:id` - Get sale details
- `GET /api/sales/:id/receipt.pdf` - Download PDF receipt

### Uploads
- `POST /api/uploads` - Upload product images

## Database Schema

The system uses four main models:

- **Product**: Basic product information (name, SKU, price, image)
- **InventoryItem**: Stock quantities linked to products
- **Sale**: Sales transactions with totals and payment info
- **SaleItem**: Individual line items within sales

## Key Features

### Transaction Safety
- Sales creation uses database transactions to ensure inventory is properly decremented
- Prevents overselling with stock validation
- Atomic operations for data consistency

### Image Handling
- Support for both URL-based and uploaded images
- File validation (type, size limits)
- Automatic UUID-based filename generation

### PDF Receipts
- Server-side PDF generation with PDFKit
- Professional receipt layout with store branding
- Downloadable and printable receipts

### Error Handling
- Comprehensive error handling with user-friendly messages
- Toast notifications for success/error states
- Proper HTTP status codes and error responses

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## Development

The application follows Next.js 14 App Router conventions with:
- Server Components for optimal performance
- Client Components for interactive features
- API Routes with proper validation
- TypeScript for type safety
- ESLint for code quality

## Production Deployment

1. Build the application:
   \`\`\`bash
   pnpm build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   pnpm start
   \`\`\`

For deployment to platforms like Vercel, ensure you:
- Set up environment variables
- Configure database connection for production
- Set up file storage for uploads (consider cloud storage)

## License

This project is licensed under the MIT License.
# pos-system
