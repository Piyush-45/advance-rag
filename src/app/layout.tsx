import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";

export const metadata = { title: "VenueBot", description: "AI chat for venue PDFs" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen text-foreground">
        <SiteHeader signedIn={!!session} />
        {children}
        <footer className="border-t mt-10">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} VenueBot
          </div>
        </footer>
      </body>
    </html>
  );
}
