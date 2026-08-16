import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Sprout, Map, FlaskConical, CloudSun, Sparkles, Bot, Droplets, TestTube2,
  Microscope, SlidersHorizontal, IndianRupee, CalendarDays, MessageCircle, BarChart3,
  Settings, Menu, Bell, FileText,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFarm } from "@/lib/farm-context";
import { Logo, DemoBadge } from "./ui-bits";
import { LanguageSelector } from "./LanguageSelector";
import { AskAiButton } from "./AskAiButton";

export const NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/farm", label: "My Farm", icon: Sprout },
  { to: "/app/map", label: "Farm Map", icon: Map },
  { to: "/app/sensors", label: "Soil & Sensors", icon: FlaskConical },
  { to: "/app/weather", label: "Weather", icon: CloudSun },
  { to: "/app/yield", label: "Yield Prediction", icon: Sparkles },
  { to: "/app/recommendations", label: "AI Recommendations", icon: Bot },
  { to: "/app/irrigation", label: "Irrigation", icon: Droplets },
  { to: "/app/fertilizer", label: "Fertilizer", icon: TestTube2 },
  { to: "/app/disease", label: "Disease Detection", icon: Microscope },
  { to: "/app/whatif", label: "What-If Analysis", icon: SlidersHorizontal },
  { to: "/app/revenue", label: "Revenue", icon: IndianRupee },
  { to: "/app/calendar", label: "Farm Calendar", icon: CalendarDays },
  { to: "/app/assistant", label: "AI Farm Assistant", icon: MessageCircle },
  { to: "/app/history", label: "History", icon: BarChart3 },
  { to: "/app/report", label: "Farm Report", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/sensors", label: "Sensors", icon: FlaskConical },
  { to: "/app/yield", label: "Yield", icon: Sparkles },
  { to: "/app/assistant", label: "Assistant", icon: MessageCircle },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AlertsBell() {
  const { alertList, unreadAlerts, markAlertsRead } = useFarm();
  return (
    <Popover onOpenChange={(o) => o && markAlertsRead()}>
      <PopoverTrigger className="relative grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card transition-colors hover:bg-secondary" aria-label="Alerts">
        <Bell className="h-[18px] w-[18px]" />
        {unreadAlerts > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadAlerts}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,360px)] rounded-2xl p-0">
        <div className="border-b p-4">
          <p className="font-display font-bold">Smart Alert Center</p>
          <p className="text-xs text-muted-foreground">Demo alerts generated from your farm data</p>
        </div>
        <ScrollArea className="max-h-80">
          <ul className="divide-y">
            {alertList.map((a) => (
              <li key={a.id} className="flex gap-3 p-4">
                <span aria-hidden className="text-base leading-none">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { demoMode, farm } = useFarm();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col bg-sidebar lg:flex">
        <div className="p-4 pb-2">
          <Link to="/">
            <Logo invert />
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <NavList />
        </ScrollArea>
        <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/70">
          {farm.farmName} · {farm.district}
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-md">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/70 lg:hidden" aria-label="Open menu">
                  <Menu className="h-[18px] w-[18px]" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="p-4">
                    <Logo invert />
                  </div>
                  <ScrollArea className="h-[calc(100vh-90px)]">
                    <NavList onNavigate={() => setOpen(false)} />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              {demoMode && <DemoBadge label="Demo Mode" className="hidden sm:inline-flex" />}
              <span className="truncate text-sm font-semibold sm:hidden">AI Farm Assistant</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSelector className="hidden w-[124px] sm:flex" />
              <AlertsBell />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] px-4 pb-32 pt-6 sm:px-6 lg:pb-16">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border/60 bg-card/95 backdrop-blur-md lg:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-muted-foreground [&.active]:text-primary" activeOptions={{ exact: true }} activeProps={{ className: "active" }}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <AskAiButton />
    </div>
  );
}
