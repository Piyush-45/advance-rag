

import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/lib/auth";

export const metadata = { title: "VenueBot", description: "AI chat for venue PDFs" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" >
<body className="min-h-screen bg-background text-foreground " suppressHydrationWarning>
        <SiteHeader signedIn={!!session} />
        {children}
      </body>
    </html>
  );
}
