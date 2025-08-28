// components/app-header.tsx
"use client";
import { LogoutButton } from "@/components/admin/LogoutButton";

export function AppHeader({ user }: { user?: { name?: string; image?: string } }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold">VB</span>
          </div>
          <span className="font-semibold tracking-tight">VenueBot</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          {user?.name && <span className="hidden sm:inline text-sm text-muted-foreground">{user.name}</span>}
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="avatar" className="h-7 w-7 rounded-full border object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full border bg-muted" />
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
