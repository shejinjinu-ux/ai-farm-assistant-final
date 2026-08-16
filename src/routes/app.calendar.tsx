import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, PageHeader } from "@/components/farm/ui-bits";
import { calendarItems } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/calendar")({
  head: () => pageMeta("Farm Calendar", "A simple crop-care calendar with irrigation, weather, sensor and harvest reminders."),
  component: FarmCalendar,
});

function FarmCalendar() {
  const [selected, setSelected] = useState("Today");
  const selectedItem = calendarItems.find((item) => item.date === selected) ?? calendarItems[0];
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Farm Calendar" subtitle="Keep irrigation, crop care and field checks on schedule" badge={<DemoBadge label="Demo Farm Schedule" />} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="gap-5 p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-display text-xl font-bold">August 2026</h2><p className="text-sm text-muted-foreground">Demo monthly schedule</p></div>
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <span key={d} className="p-2">{d}</span>)}
            {Array.from({ length: 6 }).map((_, i) => <span key={`blank-${i}`} />)}
            {days.map((day) => {
              const hasEvent = [16, 17, 19, 22, 28].includes(day);
              return (
                <button key={day} onClick={() => setSelected(hasEvent ? (day === 16 ? "Today" : day === 17 ? "Tomorrow" : day === 19 ? "In 3 days" : day === 22 ? "In 6 days" : "In 12 days") : "Today")}
                  className={`min-h-12 rounded-xl border p-2 text-sm font-semibold transition-colors ${hasEvent ? "border-leaf/50 bg-leaf/10 text-secondary-foreground hover:bg-leaf/20" : "border-transparent hover:bg-secondary"}`}>
                  {day}{hasEvent && <span className="mt-1 block text-[9px]">●</span>}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="gap-4 p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Selected reminder</h2>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <Badge variant="secondary" className="rounded-full">{selectedItem.type}</Badge>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{selectedItem.date}</p>
            <p className="mt-1 font-display text-lg font-extrabold">{selectedItem.icon} {selectedItem.title}</p>
          </div>
          <p className="text-sm text-muted-foreground">Tap an event day to view its reminder. These are demo scheduling events and can later be connected to real notifications.</p>
        </Card>
      </div>

      <Card className="gap-3 p-5 shadow-card">
        <h2 className="font-display text-xl font-bold">Upcoming farm activities</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {calendarItems.map((item) => (
            <button key={item.date} onClick={() => setSelected(item.date)} className="flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-secondary/50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-lg">{item.icon}</span>
              <span><span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.date}</span><span className="mt-1 block text-sm font-bold">{item.title}</span><span className="mt-1 block text-xs text-muted-foreground">{item.type}</span></span>
              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
