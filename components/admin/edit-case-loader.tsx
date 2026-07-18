"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { CaseStudy } from "@/lib/cases/types";
import { CaseForm } from "./case-form";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EditCaseLoader({ id }: { id: string }) {
  const [state, setState] = useState<{ status: "loading" } | { status: "ready"; item: CaseStudy } | { status: "error" }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/cases/${id}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((item) => { if (!cancelled) setState({ status: "ready", item }); })
      .catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <Card className="h-64" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center text-sm text-muted-foreground">
        <p>未找到该案例</p>
        <Link href="/admin/cases" className="font-medium text-primary hover:underline">返回案例列表</Link>
      </Card>
    );
  }
  return <CaseForm initialCase={state.item} />;
}
