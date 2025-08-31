// app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingPage from "@/components/landing-page";
// your landing page component

export default async function Home() {
  const session = await auth();

  // If logged in, redirect to admin
  if (session?.user) {
    redirect("/admin");
  }

  // Otherwise show landing page
  return <LandingPage/>;
}
