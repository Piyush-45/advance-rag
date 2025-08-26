import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UploadPanel } from "@/components/admin/upload-panel";
// import { DocsTable } from "@/components/admin/docs-table";
import { Badge } from "@/components/ui/badge";

export default async function Admin() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  // fake stats (later load from DB)
  const stats = [
    { label: "PDFs Uploaded", value: 3 },
    { label: "Chunks Indexed", value: 742 },
    { label: "Queries Answered", value: 128 },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Badge variant="secondary">Beta</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-medium mb-4">Your Documents</h2>
            {/* <DocsTable /> */}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-medium mb-4">Upload PDF</h2>
            <UploadPanel />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


// Wedding@venue12
