"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; // ✅ actual logout
import { Menu, X, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-xl">VenueBot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#features"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/#features"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/#pricing"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Pricing
          </Link>

          {/* Desktop Auth Section */}
          <div className="flex items-center gap-2">
            {signedIn ? (
              <>
                <Link href="/admin">
                  <Button size="sm" variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4">
            <Link
              href="/#features"
              onClick={closeMobileMenu}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/#features"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={closeMobileMenu}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/#pricing"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Pricing
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t flex flex-col gap-3">
              {signedIn ? (
                <>
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      closeMobileMenu();
                    }}
                    className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/api/auth/signin" onClick={closeMobileMenu}>
                  <Button size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default SiteHeader;
