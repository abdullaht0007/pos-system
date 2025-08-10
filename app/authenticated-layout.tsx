"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen bg-background">
      {!isLoginPage && <Header />}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/stock" className="text-xl font-bold">
              POS System
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/stock"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Stock
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Products
              </Link>
              <Link
                href="/sell"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sell
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Admin</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
