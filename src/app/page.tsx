// app/page.tsx (or wherever your landing lives)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UploadCloud,
  MessageSquare,
  ShieldCheck,
  Link2,
  BadgeCheck,
  FileText,
  Sparkles,
} from "lucide-react";

export default function Landing() {
  return (
    <main className="relative mx-auto max-w-6xl px-4">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_-10%,hsl(var(--foreground)/0.06),transparent),radial-gradient(40%_30%_at_110%_10%,hsl(var(--primary)/0.05),transparent)]" />

      {/* HERO */}
      <section className="py-16 md:py-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Private beta • Instant setup</span>
        </div>

        <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
          Turn venue PDFs into a <span className="underline decoration-foreground/15">helpful chat widget</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Upload your brochure once. Guests ask about <strong>capacity, pricing, packages</strong>—and get
          accurate answers with <strong>citations</strong>. No staff juggling inboxes.
        </p>

        {/* <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/api/auth/signin">
            <Button size="lg" className="w-[200px]">Get started</Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline" className="w-[200px]">Live demo</Button>
          </Link>
        </div> */}

        <p className="mt-3 text-xs text-muted-foreground">
          No credit card in beta. You own your data.
        </p>
      </section>

      {/* VALUE PILLARS */}
      <section className="grid gap-4 md:grid-cols-3 pb-16">
        <FeatureCard
          icon={<UploadCloud className="h-5 w-5" />}
          title="Upload PDF"
          desc="Drag & drop your venue brochure. We auto-parse, chunk, and index securely."
        />
        <FeatureCard
          icon={<BadgeCheck className="h-5 w-5" />}
          title="Accurate answers"
          desc="Every reply is grounded in your document. Answers cite page/section."
        />
        <FeatureCard
          icon={<Link2 className="h-5 w-5" />}
          title="Easy embed"
          desc="Share a link or drop the widget on your site—no developer required."
        />
      </section>

      {/* HOW IT WORKS */}
      <section className="pb-20">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StepCard
            step="1"
            title="Upload your brochure"
            desc="PDFs work great—even long ones. We handle chunking and vector indexing."
            icon={<FileText className="h-4 w-4" />}
          />
          <StepCard
            step="2"
            title="Share or embed"
            desc="Generate a secure link or add the widget to your website in minutes."
            icon={<Link2 className="h-4 w-4" />}
          />
          <StepCard
            step="3"
            title="Guests chat, you convert"
            desc="Concise, friendly answers with citations—so couples can decide faster."
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Private & isolated per account. Delete/replace anytime.</span>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pb-20">
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold">Simple pricing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Free during beta</strong> — includes 1 brochure, unlimited chats, and basic analytics.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/api/auth/signin">
                <Button size="lg">Create my account</Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline">Try a live demo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="flex items-center justify-between border-t py-6 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} VenueBot</span>
        <nav className="flex gap-4">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <Link href="/api/auth/signin" className="hover:text-foreground">Sign in</Link>
        </nav>
      </footer>
    </main>
  );
}

/* ----------------------------- Tiny components ----------------------------- */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="p-6">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
          {icon}
        </div>
        <h3 className="mt-3 font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  title,
  desc,
  icon,
}: {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background font-medium">
            {step}
          </span>
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
