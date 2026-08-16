import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, PageHeader, Disclaimer } from "@/components/farm/ui-bits";
import { DISCLAIMER, recommendations as seed } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/app/recommendations")({
  head: () => pageMeta("AI Recommendation Center", "Today's AI action plan for irrigation, nutrients, weather and crop care — ordered by priority."),
  component: Recos,
});

const priorityTone = { High: "destructive", Medium: "secondary", Low: "outline" } as const;

function Recos() {
  const [items, setItems] = useState(seed);

  function advance(id: string) {
    setItems((list) =>
      list.map((r) =>
        r.id === id ? { ...r, status: r.status === "Pending" ? "In progress" : r.status === "In progress" ? "Done" : "Pending" } : r,
      ),
    );
    toast.success("Action status updated");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Today's AI Action Plan" subtitle="Five things the assistant noticed on your farm today" badge={<DemoBadge label="Demo AI Recommendations" />} />

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} className="gap-3 p-5 shadow-card transition-shadow hover:shadow-lift">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-xl">{r.icon}</span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold">{r.title}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status: {r.status}</p>
                </div>
              </div>
              <Badge variant={priorityTone[r.priority]} className="shrink-0 rounded-full">{r.priority}</Badge>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Why</p>
              <p className="mt-1 text-sm">{r.reason}</p>
            </div>
            <div className="rounded-2xl border border-leaf/35 bg-leaf/10 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">Suggested action</p>
              <p className="mt-1 text-sm">{r.action}</p>
            </div>
            <Button variant="secondary" className="w-fit rounded-full font-bold" onClick={() => advance(r.id)}>
              Mark as {r.status === "Pending" ? "in progress" : r.status === "In progress" ? "done" : "pending"}
            </Button>
          </Card>
        ))}
      </div>

      <Disclaimer text={DISCLAIMER} />
    </div>
  );
}
