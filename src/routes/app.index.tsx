import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/")({
  head: () =>
    pageMeta(
      "AI Farm Assistant",
      "AI-powered crop yield prediction, soil monitoring, weather insights and farm recommendations.",
    ),
  component: HomePage,
});

const floatingStats = [
  {
    title: "Farm Health",
    value: "AI Score",
    icon: "🌱",
    pos: "right-3 bottom-10",
  },
  {
    title: "Soil Moisture",
    value: "Live",
    icon: "💧",
    pos: "left-3 top-20",
  },
  {
    title: "Weather",
    value: "Live",
    icon: "🌦️",
    pos: "right-8 top-12",
  },
];

const features = [
  {
    icon: <Sprout className="h-6 w-6" />,
    title: "AI Yield Prediction",
    description:
      "Predict expected crop yield using crop, soil, weather and farm data.",
  },
  {
    icon: <Droplets className="h-6 w-6" />,
    title: "Smart Irrigation",
    description:
      "Use soil moisture and weather conditions to decide when and how much to irrigate.",
  },
  {
    icon: <CloudSun className="h-6 w-6" />,
    title: "Live Weather",
    description:
      "Get weather information for your selected farm location.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Revenue & Profit",
    description:
      "Estimate production, revenue, cultivation cost and expected profit.",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>

            <div>
              <p className="font-display text-lg font-extrabold">
                AI Farm Assistant
              </p>

              <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:block">
                Smart Farming
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">

            {/* ALREADY INSIDE /APP → DASHBOARD */}
            <Button
              asChild
              variant="ghost"
              className="rounded-full"
            >
              <Link to="/app">
                Dashboard
              </Link>
            </Button>

            {/* SETUP FARM */}
            <Button
              asChild
              className="rounded-full font-bold"
            >
              <Link to="/setup">
                Set Up Farm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background decorations */}

        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-secondary blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">

          {/* LEFT */}

          <div className="space-y-7">

            <Badge
              variant="secondary"
              className="rounded-full px-4 py-2"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Agriculture
            </Badge>

            <div className="space-y-5">

              <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">

                Grow Smarter.

                <span className="block text-primary">
                  Harvest Better.
                </span>

              </h1>

              <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                An intelligent farm assistant that combines
                AI yield prediction, soil information, live
                weather and smart irrigation insights to help
                farmers make better decisions.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              {/* START FARMING → SETUP */}

              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 font-bold"
              >
                <Link to="/setup">
                  Start Farming Smarter
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {/* EXPLORE DASHBOARD → APP */}

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6 font-bold"
              >
                <Link to="/app">
                  Explore Dashboard
                </Link>
              </Button>

            </div>

            {/* Trust points */}

            <div className="grid gap-3 pt-2 sm:grid-cols-3">

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                AI Predictions
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Live Weather
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Smart Irrigation
              </div>

            </div>

          </div>

          {/* RIGHT - FARM VISUAL */}

          <div className="relative mx-auto w-full max-w-xl">

            <div className="relative overflow-hidden rounded-[2rem] border bg-card p-4 shadow-card">

              <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary/15 via-background to-secondary">

                <div className="grid min-h-[420px] place-items-center p-8">

                  <div className="text-center">

                    <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-primary/15">
                      <Sprout className="h-20 w-20 text-primary" />
                    </div>

                    <h2 className="mt-7 font-display text-2xl font-extrabold">
                      Your Farm. Your Data.
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                      Connect farm location, crop,
                      soil and sensor information to
                      get intelligent recommendations.
                    </p>

                  </div>

                </div>

                {/* Floating stats */}

                {floatingStats.map((stat) => (
                  <div
                    key={stat.title}
                    className={`absolute ${stat.pos} rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur`}
                  >

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        {stat.icon}
                      </span>

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {stat.title}
                        </p>

                        <p className="text-sm font-extrabold">
                          {stat.value}
                        </p>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

            {/* Decorative dots */}

            <div className="absolute -bottom-5 -left-5 grid h-16 w-16 grid-cols-4 gap-1.5 opacity-40">

              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                />
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="border-y bg-secondary/30">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              Smart Farm Tools
            </Badge>

            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              Everything you need to manage your farm smarter
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              From yield prediction to irrigation planning,
              get useful farm insights in one place.
            </p>

          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => (
              <Card
                key={feature.title}
                className="gap-4 p-5 shadow-card transition-transform hover:-translate-y-1"
              >

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>

                <div>

                  <h3 className="font-display text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>

                </div>

              </Card>
            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          FARM HEALTH SECTION
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

          {/* LEFT */}

          <div>

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              AI Farm Health
            </Badge>

            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              Understand your farm at a glance.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              AI-powered farm health scoring can combine
              crop, soil, water and weather signals so you
              know where to look first.
            </p>

            <div className="mt-7 space-y-4">

              <div className="flex gap-3">

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sprout className="h-5 w-5" />
                </div>

                <div>

                  <p className="font-bold">
                    Crop & Yield
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Understand expected yield and production.
                  </p>

                </div>

              </div>

              <div className="flex gap-3">

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Droplets className="h-5 w-5" />
                </div>

                <div>

                  <p className="font-bold">
                    Soil & Water
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Monitor moisture and soil conditions.
                  </p>

                </div>

              </div>

              <div className="flex gap-3">

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CloudSun className="h-5 w-5" />
                </div>

                <div>

                  <p className="font-bold">
                    Weather
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Use weather conditions when planning farm activities.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <Card className="overflow-hidden p-0 shadow-card">

            <div className="border-b p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Farm Health
                  </p>

                  <p className="mt-1 font-display text-3xl font-extrabold">
                    AI Score
                  </p>

                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                  <Leaf className="h-7 w-7 text-primary" />
                </div>

              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Your personalised health score will be
                calculated after you select and configure
                your farm.
              </p>

            </div>

            <div className="space-y-4 p-5">

              <HealthPreview
                icon="🌱"
                label="Crop condition"
              />

              <HealthPreview
                icon="💧"
                label="Soil moisture"
              />

              <HealthPreview
                icon="🌦️"
                label="Weather conditions"
              />

              <HealthPreview
                icon="🧪"
                label="Soil condition"
              />

            </div>

          </Card>

        </div>
      </section>

      {/* =====================================================
          LOCATION / FARM SETUP
      ===================================================== */}

      <section className="bg-primary/5">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>

                <Badge
                  variant="secondary"
                  className="rounded-full"
                >
                  Location-based Farming
                </Badge>

              </div>

              <h2 className="mt-4 font-display text-3xl font-extrabold">
                Start with your actual farm location.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Select your state and district or use your
                current GPS location. The system can then use
                location-specific weather and farm information
                for your analysis.
              </p>

            </div>

            {/* SETUP → /setup */}

            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 font-bold"
            >
              <Link to="/setup">
                Set Up My Farm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

          </div>

        </div>

      </section>

      {/* =====================================================
          SECURITY / TRUST
      ===================================================== */}

      <section>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="grid gap-5 md:grid-cols-3">

            <TrustCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Your Farm Data"
              description="Keep your farm information organised in one place."
            />

            <TrustCard
              icon={<Sparkles className="h-5 w-5" />}
              title="AI Assisted"
              description="Use AI predictions and recommendations to support decisions."
            />

            <TrustCard
              icon={<MapPin className="h-5 w-5" />}
              title="Location Aware"
              description="Use farm location and weather conditions for more relevant insights."
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <Card className="overflow-hidden bg-primary p-8 text-primary-foreground shadow-card sm:p-10">

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-primary-foreground/70">
                Ready to get started?
              </p>

              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Turn your farm data into useful decisions.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/75">
                Set up your farm and explore AI-powered yield,
                soil, weather, irrigation and farm health insights.
              </p>

            </div>

            {/* ENTER DASHBOARD → /app */}

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-7 font-bold"
            >
              <Link to="/app">
                Enter Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

          </div>

        </Card>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <div className="flex items-center gap-2">

            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Leaf className="h-4 w-4" />
            </span>

            <span className="font-semibold">
              AI Farm Assistant
            </span>

          </div>

          <p>
            AI-assisted farming insights for smarter decisions.
          </p>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   HEALTH PREVIEW
========================================================= */

function HealthPreview({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3.5">

      <span className="text-lg">
        {icon}
      </span>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <span className="text-sm font-semibold">
            {label}
          </span>

          <span className="text-xs font-bold text-muted-foreground">
            Available in dashboard
          </span>

        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">

          <div className="h-full w-2/3 rounded-full bg-primary/40" />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TRUST CARD
========================================================= */

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="gap-3 p-5 shadow-card">

      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="font-display text-lg font-bold">
        {title}
      </h3>

      <p className="text-sm leading-6 text-muted-foreground">
        {description}
      </p>

    </Card>
  );
}