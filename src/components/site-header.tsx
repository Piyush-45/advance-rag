"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">VenueBot</Link>
        <nav className="flex items-center gap-4">
          <Link href="/#features" className={pathname === "/#features" ? "font-medium" : ""}>Features</Link>
          <Link href="/#pricing">Pricing</Link>
          {signedIn ? (
            <Link href="/admin"><Button size="sm">Dashboard</Button></Link>
          ) : (
            <Link href="/api/auth/signin"><Button size="sm">Sign in</Button></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
