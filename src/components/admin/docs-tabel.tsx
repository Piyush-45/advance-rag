"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Doc = { id: string; title: string | null; file_name: string | null; created_at: string };

export function DocsTable() {
  const [items, setItems] = useState<Doc[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/docs");
        const data = await res.json();
        if (data.error) setErr(data.error);
        else setItems(data.items || []);
      } catch {
        setErr("Failed to load documents.");
      }
    })();
  }, []);

  if (err) return <div className="text-sm text-red-600">{err}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow><TableCell colSpan={3} className="text-muted-foreground">No documents yet</TableCell></TableRow>
        ) : items.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-medium">{d.title || "(untitled)"}</TableCell>
            <TableCell>{d.file_name}</TableCell>
            <TableCell>{new Date(d.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
