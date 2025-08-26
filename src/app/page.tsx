import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Turn venue PDFs into a helpful chat widget
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Upload your brochure. Let customers ask anything—prices, capacity, packages—with citations.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/api/auth/signin"><Button size="lg">Get started</Button></Link>
          <Link href="/chat"><Button size="lg" variant="outline">Live demo</Button></Link>
        </div>
      </section>

      <section id="features" className="grid md:grid-cols-3 gap-4 pb-16">
        {[
          ["Upload PDF", "Drag & drop, auto-indexing."],
          ["Accurate answers", "Grounded in your documents with citations."],
          ["Easy embed", "Drop the widget on any website."],
        ].map(([title, desc]) => (
          <Card key={title}><CardContent className="p-6">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </CardContent></Card>
        ))}
      </section>

      <section id="pricing" className="pb-20">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Simple pricing</h3>
            <p className="mt-2 text-sm text-muted-foreground">Free during beta.</p>
          </CardContent>
        </Card>
      </section>
    </main>
    
  );
}
