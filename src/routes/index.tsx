import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  FlaskConical,
  Droplets,
  CloudSun,
  Bot,
  Microscope,
  IndianRupee,
  MessageCircle,
  ArrowRight,
  Mic,
  Leaf,
  ShieldCheck,
  Gauge as GaugeIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Logo,
  DemoBadge,
  Disclaimer,
} from "@/components/farm/ui-bits";
import { LanguageSelector } from "@/components/farm/LanguageSelector";
import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

import heroFarm from "@/assets/hero-farm.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import soilImg from "@/assets/soil.jpg";
import irrigationImg from "@/assets/irrigation.jpg";
import droneImg from "@/assets/drone.jpg";
import diseasedLeaf from "@/assets/diseased-leaf.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "AI Farm Assistant — Smarter Farming. Higher Yield.",
      },
      {
        name: "description",
        content:
          "Your intelligent farming companion for crop yield prediction, soil monitoring, irrigation optimization and AI-powered agricultural insights.",
      },
      {
        property: "og:title",
        content:
          "AI Farm Assistant — Smart AgriTech Platform",
      },
      {
        property: "og:description",
        content:
          "Crop prediction, soil intelligence, smart irrigation and an AI farm assistant in four Indian languages.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Sparkles,
    title: "Crop Yield Prediction",
    text: "See how much your field can produce this season, in simple numbers.",
    emoji: "🌱",
  },
  {
    icon: FlaskConical,
    title: "Soil Intelligence",
    text: "NPK, pH, moisture and salinity explained without technical jargon.",
    emoji: "🧪",
  },
  {
    icon: Droplets,
    title: "Smart Irrigation",
    text: "Water only when the field needs it and save up to 18% water.",
    emoji: "💧",
  },
  {
    icon: CloudSun,
    title: "Weather Insights",
    text: "7-day forecast tied directly to your irrigation decisions.",
    emoji: "🌦️",
  },
  {
    icon: Bot,
    title: "AI Recommendations",
    text: "A short daily action plan, ordered by what matters most.",
    emoji: "🧠",
  },
  {
    icon: Microscope,
    title: "Disease Detection",
    text: "Photograph a leaf and get a preliminary AI indication.",
    emoji: "🔬",
  },
  {
    icon: IndianRupee,
    title: "Revenue Estimation",
    text: "Estimated revenue, cost and profit for your area and crop.",
    emoji: "💰",
  },
  {
    icon: MessageCircle,
    title: "AI Farm Assistant",
    text: "Ask by voice, text or photo — in your own language.",
    emoji: "💬",
  },
];

const FLOATING = [
  {
    title: "AI Yield Prediction",
    value: "87% Confidence",
    icon: "🔮",
    pos: "left-2 top-8 sm:left-4",
  },
  {
    title: "Soil Health",
    value: "Good",
    icon: "🧪",
    pos: "right-2 top-28 sm:right-4",
  },
  {
    title: "Water Optimization",
    value: "18% Saving Potential",
    icon: "💧",
    pos: "left-4 bottom-24",
  },
  {
    title: "Farm Health",
    value: "84 / 100",
    icon: "🌱",
    pos: "right-3 bottom-10",
  },
];

function Landing() {
  const { t } = useFarm();

  // -----------------------------------------
  // CHECK WHETHER USER IS ALREADY LOGGED IN
  // -----------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setIsLoggedIn(!!session);
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);

        if (mounted) {
          setIsLoggedIn(false);
          setCheckingAuth(false);
        }
      }
    }

    checkLogin();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------
  // WHERE SHOULD THE BUTTON GO?
  // -----------------------------------------
  const startDestination = isLoggedIn ? "/app" : "/login";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">

          <Logo />

          <div className="flex shrink-0 items-center gap-2">

            <LanguageSelector className="hidden sm:flex" />

            {/* --------------------------------------------- */}
            {/* LOGIN / DASHBOARD */}
            {/* --------------------------------------------- */}

            {checkingAuth ? (
              <Button
                disabled
                className="rounded-full opacity-70"
              >
                Loading...
              </Button>
            ) : (
              <Button asChild className="rounded-full">
                <Link to={startDestination}>
                  {isLoggedIn ? "Dashboard" : t("login")}
                </Link>
              </Button>
            )}

          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute inset-0 gradient-soft" />

        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-20">

          {/* LEFT SIDE */}

          <div className="min-w-0">

            <DemoBadge label="Demo Mode · Simulated Farm Data" />

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              AI FARM
              <br />
              <span className="text-gradient-leaf">
                ASSISTANT
              </span>
            </h1>

            <p className="mt-4 font-display text-lg font-bold text-secondary-foreground sm:text-xl">
              Smarter Farming. Better Decisions. Higher Yield.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Your intelligent farming companion for crop prediction,
              soil monitoring, irrigation optimization and AI-powered
              agricultural insights.
            </p>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-wrap gap-3">

              {/* START FARMING SMARTER */}

              <Button
                asChild
                size="lg"
                className="h-13 rounded-full px-7 text-base font-bold shadow-lift"
              >
                <Link to={startDestination}>
                  {isLoggedIn
                    ? "Open My Farm"
                    : t("getStarted")}

                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              {/* EXPLORE FEATURES */}

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-13 rounded-full px-7 text-base font-bold"
              >
                <a href="#features">
                  {t("exploreFeatures")}
                </a>
              </Button>

            </div>

            {/* SMALL FEATURES */}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">

              <span className="flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-primary" />
                Voice-first
              </span>

              <span className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-primary" />
                4 Indian languages
              </span>

              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Farmer-friendly
              </span>

            </div>
          </div>

          {/* RIGHT IMAGE */}

          <div className="relative min-w-0">

            <div className="overflow-hidden rounded-3xl shadow-lift">
              <img
                src={heroFarm}
                width={1600}
                height={1104}
                alt="Modern smart farm with AI sensor overlays at sunrise"
                className="h-full w-full object-cover"
              />
            </div>

            {FLOATING.map((f, i) => (
              <div
                key={f.title}
                className={`absolute ${f.pos} glass animate-float rounded-2xl px-3.5 py-2.5 shadow-card`}
                style={{
                  animationDelay: `${i * 800}ms`,
                }}
              >
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  <span aria-hidden>{f.icon}</span>
                  {f.title}
                </p>

                <p className="font-display text-sm font-extrabold text-forest">
                  {f.value}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FEATURES */}
      {/* ===================================================== */}

      <section
        id="features"
        className="mx-auto max-w-[1200px] scroll-mt-20 px-4 py-14 sm:px-6"
      >

        <div className="max-w-2xl">

          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Everything on one farm screen
          </p>

          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            Eight tools your field actually needs
          </h2>

        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {FEATURES.map(
            ({ icon: Icon, title, text, emoji }) => (
              <Card
                key={title}
                className="group gap-0 p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >

                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-xl transition-transform duration-300 group-hover:scale-110 group-hover:gradient-leaf">

                  <Icon className="h-5 w-5 text-primary transition-colors group-hover:text-forest" />

                </span>

                <p className="mt-4 font-display text-base font-bold">

                  <span
                    aria-hidden
                    className="mr-1"
                  >
                    {emoji}
                  </span>

                  {title}

                </p>

                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>

              </Card>
            ),
          )}

        </div>
      </section>

      {/* ===================================================== */}
      {/* VISUAL STORY */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1200px] px-4 pb-14 sm:px-6">

        <div className="grid gap-4 md:grid-cols-3">

          {[
            {
              img: cropRice,
              w: 1024,
              h: 700,
              title: "Healthy crop tracking",
              text: "Growth stage, crop health score and leaf-level checks.",
            },
            {
              img: soilImg,
              w: 1024,
              h: 700,
              title: "Soil that speaks",
              text: "Sensor readings turned into plain-language guidance.",
            },
            {
              img: irrigationImg,
              w: 1024,
              h: 700,
              title: "Precision irrigation",
              text: "Water schedules that respect tomorrow's rainfall.",
            },
          ].map((c) => (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-3xl shadow-card"
            >

              <img
                src={c.img}
                width={c.w}
                height={c.h}
                loading="lazy"
                alt={c.title}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">

                <h3 className="font-display text-lg font-extrabold text-forest-foreground">
                  {c.title}
                </h3>

                <p className="mt-1 text-sm text-forest-foreground/80">
                  {c.text}
                </p>

              </div>
            </article>
          ))}

        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          {/* FARM HEALTH */}

          <article className="relative overflow-hidden rounded-3xl shadow-card">

            <img
              src={droneImg}
              width={1024}
              height={700}
              loading="lazy"
              alt="Agricultural drone monitoring green crop rows"
              className="h-72 w-full object-cover"
            />

            <div className="absolute inset-0 gradient-hero opacity-75" />

            <div className="absolute inset-0 flex flex-col justify-end p-6">

              <GaugeIcon className="h-7 w-7 text-forest-foreground" />

              <h3 className="mt-3 font-display text-2xl font-extrabold text-forest-foreground">
                Farm Health Score
              </h3>

              <p className="mt-1 max-w-sm text-sm text-forest-foreground/85">
                One number — 84/100 — built from crop, soil,
                water and weather signals so you know where to
                look first.
              </p>

            </div>
          </article>

          {/* AI CROP DOCTOR */}

          <article className="relative overflow-hidden rounded-3xl shadow-card">

            <img
              src={diseasedLeaf}
              width={1024}
              height={700}
              loading="lazy"
              alt="Crop leaf with blight lesions used for AI disease detection"
              className="h-72 w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-forest/92 to-forest/25" />

            <div className="absolute inset-0 flex flex-col justify-end p-6">

              <Microscope className="h-7 w-7 text-forest-foreground" />

              <h3 className="mt-3 font-display text-2xl font-extrabold text-forest-foreground">
                AI Crop Doctor
              </h3>

              <p className="mt-1 max-w-sm text-sm text-forest-foreground/85">
                Photograph a leaf, get a preliminary indication
                with symptoms and preventive steps.
              </p>

            </div>
          </article>

        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL CTA */}
      {/* ===================================================== */}

      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">

        <Card className="gradient-hero items-center gap-5 border-transparent p-8 text-center text-forest-foreground shadow-lift sm:p-12">

          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Ready to farm smarter?
          </h2>

          <p className="max-w-xl text-forest-foreground/85">
            Set up your farm in under a minute — location,
            area, crop and soil — and the assistant takes it
            from there.
          </p>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-13 rounded-full px-8 text-base font-bold"
          >
            <Link to={startDestination}>
              {isLoggedIn
                ? "Open My Farm"
                : t("getStarted")}

              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

        </Card>
      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-border/60 bg-secondary/40">

        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.4fr]">

          <div>

            <Logo />

            <p className="mt-3 text-sm text-muted-foreground">
              Smarter Farming. Better Decisions. Higher Yield.
            </p>

          </div>

          <Disclaimer text={DISCLAIMER} />

        </div>
      </footer>

    </div>
  );
}