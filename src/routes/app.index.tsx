import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Droplets,
  CloudSun,
  HeartPulse,
  ArrowRight,
  Leaf,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DemoBadge,
  Gauge,
  PageHeader,
  StatCard,
  Disclaimer,
  MetricBar,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";

import {
  DISCLAIMER,
  healthBreakdown,
  recommendations,
  sustainability,
} from "@/lib/mock-data";

import { pageMeta } from "@/lib/meta";
import cropRice from "@/assets/crop-rice.jpg";

export const Route = createFileRoute("/app/")({
  head: () =>
    pageMeta(
      "Farm Dashboard",
      "Farm health score, predicted yield, soil moisture, weather and today's AI action plan in one place.",
    ),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();

  if (h < 12) {
    return "Good Morning";
  }

  if (h < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

/* =========================================================
   WEATHER TYPES
========================================================= */

interface LiveWeather {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  solar_radiation: number;
  weather_code: number;
}

/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky";

  if (code === 1 || code === 2) {
    return "Partly cloudy";
  }

  if (code === 3) {
    return "Cloudy";
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return "Foggy";
  }

  if (
    code >= 51 &&
    code <= 67
  ) {
    return "Rain";
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return "Snow";
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return "Rain showers";
  }

  if (
    code >= 95 &&
    code <= 99
  ) {
    return "Thunderstorm";
  }

  return "Weather data available";
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const {
    farm,
    crop,
    soil,
    areaLabel,
    sensor,
    sensors,
    prediction,
    predictionLoading,
    predictYield,
  } = useFarm();

  const moisture = sensor("moisture");

  const [weather, setWeather] =
    useState<LiveWeather | null>(null);

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState(false);

  /* =======================================================
     LOAD LIVE WEATHER + AI PREDICTION
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadWeatherAndPrediction() {
      try {
        setWeatherLoading(true);
        setWeatherError(false);

        /*
         * -------------------------------------------------
         * FIRST: use saved farm GPS if available
         * -------------------------------------------------
         */

        const farmWithLocation =
          farm as typeof farm & {
            latitude?: number | string;
            longitude?: number | string;
          };

        let latitude = Number(
          farmWithLocation.latitude,
        );

        let longitude = Number(
          farmWithLocation.longitude,
        );

        /*
         * -------------------------------------------------
         * IF GPS is not available in farm context,
         * use browser current location
         * -------------------------------------------------
         */

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          if (
            !navigator.geolocation
          ) {
            throw new Error(
              "Geolocation is not supported.",
            );
          }

          const position =
            await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000,
                  },
                );
              },
            );

          latitude =
            position.coords.latitude;

          longitude =
            position.coords.longitude;
        }

        console.log(
          "Dashboard GPS:",
          latitude,
          longitude,
        );

        /*
         * -------------------------------------------------
         * CALL BACKEND WEATHER API
         * -------------------------------------------------
         */

        const weatherResponse =
          await fetch(
            `https://ai-farm-backend-v57r.onrender.com/weather?latitude=${encodeURIComponent(
              latitude,
            )}&longitude=${encodeURIComponent(
              longitude,
            )}`,
          );

        if (!weatherResponse.ok) {
          throw new Error(
            `Weather API failed: ${weatherResponse.status}`,
          );
        }

        const weatherData =
          await weatherResponse.json();

        if (
          !weatherData?.success ||
          !weatherData?.weather
        ) {
          throw new Error(
            "Invalid weather response.",
          );
        }

        const liveWeather: LiveWeather = {
          temperature: Number(
            weatherData.weather.temperature ??
              0,
          ),

          humidity: Number(
            weatherData.weather.humidity ??
              0,
          ),

          rainfall: Number(
            weatherData.weather.precipitation ??
              0,
          ),

          wind_speed: Number(
            weatherData.weather.wind_speed ??
              0,
          ),

          solar_radiation: Number(
            weatherData.weather
              .solar_radiation_current ??
              0,
          ),

          weather_code: Number(
            weatherData.weather.weather_code ??
              0,
          ),
        };

        if (cancelled) {
          return;
        }

        setWeather(liveWeather);

        console.log(
          "Live dashboard weather:",
          liveWeather,
        );

        /*
         * -------------------------------------------------
         * CALL AI YIELD PREDICTION
         *
         * farm-context already prepares the 14 inputs:
         *
         * State
         * District
         * Crop
         * Area
         * N
         * P
         * K
         * Temperature
         * Humidity
         * pH
         * Rainfall
         * Wind Speed
         * Solar Radiation
         * Soil Type
         * -------------------------------------------------
         */

        const result =
          await predictYield({
            temperature:
              liveWeather.temperature,

            humidity:
              liveWeather.humidity,

            rainfall:
              liveWeather.rainfall,

            wind_speed:
              liveWeather.wind_speed,

            solar_radiation:
              liveWeather.solar_radiation,
          });

        if (!cancelled) {
          console.log(
            "Dashboard AI prediction:",
            result,
          );
        }
      } catch (error) {
        console.error(
          "Dashboard weather/prediction error:",
          error,
        );

        if (!cancelled) {
          setWeatherError(true);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    /*
     * Wait until farm data is available.
     */

    if (
      farm.state &&
      farm.district &&
      farm.cropId &&
      farm.soilId
    ) {
      void loadWeatherAndPrediction();
    }

    return () => {
      cancelled = true;
    };
  }, [
    farm.id,
    farm.state,
    farm.district,
    farm.cropId,
    farm.soilId,
    farm.area,
    farm.unit,
    sensors,
    predictYield,
  ]);

  /* =======================================================
     PREDICTION DISPLAY
  ======================================================= */

  const predictedYield =
    prediction?.success
      ? prediction.expected_yield_per_hectare
      : null;

  const totalProduction =
    prediction?.success
      ? prediction.estimated_total_production
      : null;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        title={`${greeting()}, ${farm.farmerName} 👋`}
        subtitle={`${farm.farmName} · ${farm.village}, ${farm.district}, ${farm.state} · ${crop.emoji} ${crop.name} · ${areaLabel} · ${soil.name} soil`}
        badge={
          <DemoBadge label="Demo Mode – Simulated Farm Data" />
        }
        action={
          <Button
            asChild
            className="h-11 rounded-full font-bold"
          >
            <Link to="/app/assistant">
              Ask the assistant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* =================================================
          TOP STAT CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* FARM HEALTH */}

        <StatCard
          tone="hero"
          icon={
            <HeartPulse className="h-5 w-5" />
          }
          label="Farm Health"
          value="84 / 100"
          hint="Healthy"
        />

        {/* PREDICTED YIELD */}

        <StatCard
          icon={
            <Sparkles className="h-5 w-5 text-primary" />
          }
          label="Predicted Yield"
          value={
            predictionLoading
              ? "Calculating..."
              : predictedYield !== null &&
                  predictedYield !== undefined
                ? `${predictedYield.toFixed(
                    2,
                  )} t/ha`
                : "Not available"
          }
          hint={
            totalProduction !== null &&
            totalProduction !== undefined
              ? `Total: ${totalProduction.toFixed(
                  2,
                )}`
              : prediction?.error ??
                "AI prediction"
          }
        />

        {/* SOIL MOISTURE */}

        <StatCard
          icon={
            <Droplets className="h-5 w-5 text-sky" />
          }
          label="Soil Moisture"
          value={`${Number(
            moisture?.value ?? 0,
          ).toFixed(1)}%`}
          hint="Live sensor"
        />

        {/* WEATHER */}

        <StatCard
          icon={
            <CloudSun className="h-5 w-5 text-warn" />
          }
          label="Weather"
          value={
            weatherLoading
              ? "Loading..."
              : weather
                ? `${weather.temperature.toFixed(
                    1,
                  )}°C`
                : "--"
          }
          hint={
            weather
              ? weatherDescription(
                  weather.weather_code,
                )
              : weatherError
                ? "Weather unavailable"
                : "Live weather"
          }
        />

      </div>

      {/* =================================================
          EXTRA LIVE WEATHER INFO
      ================================================= */}

      {weather && (
        <Card className="p-5 shadow-card sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="font-display text-xl font-bold">
                Live Weather Conditions
              </h2>

              <p className="text-sm text-muted-foreground">
                Weather fetched for your farm location
              </p>
            </div>

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              LIVE WEATHER
            </Badge>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs font-bold text-muted-foreground">
                Temperature
              </p>

              <p className="mt-1 font-display text-2xl font-extrabold">
                {weather.temperature.toFixed(1)}°C
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs font-bold text-muted-foreground">
                Humidity
              </p>

              <p className="mt-1 font-display text-2xl font-extrabold">
                {weather.humidity.toFixed(0)}%
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs font-bold text-muted-foreground">
                Rainfall
              </p>

              <p className="mt-1 font-display text-2xl font-extrabold">
                {weather.rainfall.toFixed(1)} mm
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs font-bold text-muted-foreground">
                Solar Radiation
              </p>

              <p className="mt-1 font-display text-2xl font-extrabold">
                {weather.solar_radiation.toFixed(0)}
              </p>
            </div>

          </div>

        </Card>
      )}

      {/* =================================================
          HEALTH + ACTION PLAN
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">

        {/* HEALTH SCORE */}

        <Card className="gap-5 p-5 shadow-card sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="font-display text-xl font-bold">
                AI Farm Health Score
              </h2>

              <p className="text-sm text-muted-foreground">
                Farm Status:{" "}
                <b className="text-primary">
                  Healthy
                </b>
              </p>
            </div>

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              Demo AI Prediction
            </Badge>

          </div>

          <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">

            <Gauge
              value={84}
              size={150}
              label="84"
              sub="out of 100"
            />

            <div className="space-y-3.5">

              {healthBreakdown.map((h) => (
                <MetricBar
                  key={h.key}
                  label={`${h.icon} ${h.label}`}
                  value={h.value}
                  tone={
                    h.value >= 85
                      ? "leaf"
                      : h.value >= 80
                        ? "primary"
                        : "warn"
                  }
                />
              ))}

            </div>

          </div>

        </Card>

        {/* ACTION PLAN */}

        <Card className="gap-4 p-5 shadow-card sm:p-6">

          <div className="flex items-center justify-between gap-3">

            <h2 className="font-display text-xl font-bold">
              Today's AI Action Plan
            </h2>

            <Link
              to="/app/recommendations"
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>

          </div>

          <ul className="space-y-3">

            {recommendations
              .slice(0, 4)
              .map((r) => (
                <li
                  key={r.id}
                  className="flex gap-3 rounded-2xl bg-secondary/50 p-3.5 transition-colors hover:bg-secondary"
                >

                  <span
                    aria-hidden
                    className="text-lg leading-none"
                  >
                    {r.icon}
                  </span>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold">

                      <span>
                        {r.title}
                      </span>

                      <Badge
                        variant={
                          r.priority === "High"
                            ? "destructive"
                            : "outline"
                        }
                        className="rounded-full text-[10px]"
                      >
                        {r.priority}
                      </Badge>

                    </div>

                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {r.action}
                    </p>

                  </div>

                </li>
              ))}

          </ul>

        </Card>

      </div>

      {/* =================================================
          PREDICTION RESULT
      ================================================= */}

      {prediction?.success && (
        <Card className="gap-5 p-5 shadow-card sm:p-6">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="font-display text-xl font-bold">
                🌾 AI Yield Prediction
              </h2>

              <p className="text-sm text-muted-foreground">
                Based on your farm, sensor and live weather data
              </p>
            </div>

            <Badge
              variant="secondary"
              className="rounded-full"
            >
              AI MODEL
            </Badge>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-secondary/50 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Expected Yield
              </p>

              <p className="mt-2 font-display text-3xl font-extrabold">
                {predictedYield?.toFixed(2)} t/ha
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Per hectare
              </p>

            </div>

            <div className="rounded-2xl bg-secondary/50 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Estimated Total Production
              </p>

              <p className="mt-2 font-display text-3xl font-extrabold">
                {totalProduction?.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                For {areaLabel}
              </p>

            </div>

          </div>

          <p className="rounded-2xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
            AI prediction uses your selected state, district, crop,
            farm area, NPK, pH, live weather, rainfall, wind speed,
            solar radiation and soil type.
          </p>

        </Card>
      )}

      {/* =================================================
          SUSTAINABILITY + CROP
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* SUSTAINABILITY */}

        <Card className="gap-3 p-5 shadow-card">

          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Sustainability Score
          </p>

          <div className="flex items-center gap-4">

            <Gauge
              value={sustainability.score}
              size={104}
              tone="leaf"
              label={String(
                sustainability.score,
              )}
              sub="/ 100"
              thickness={9}
            />

            <p className="text-xs leading-relaxed text-muted-foreground">
              {sustainability.tip}
            </p>

          </div>

        </Card>

        {/* CROP IMAGE */}

        <Card className="relative overflow-hidden p-0 shadow-card lg:col-span-2">

          <img
            src={cropRice}
            width={1024}
            height={700}
            loading="lazy"
            alt="Healthy green rice crop close up"
            className="h-full min-h-44 w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-forest/92 via-forest/60 to-forest/10" />

          <div className="absolute inset-0 flex flex-col justify-center gap-2 p-6">

            <Leaf className="h-6 w-6 text-forest-foreground" />

            <p className="font-display text-xl font-extrabold text-forest-foreground">
              Crop looks healthy — vegetative stage, day 48
            </p>

            <p className="max-w-md text-sm text-forest-foreground/80">
              Flowering is expected in about 17 days.
              Keep moisture above 45% through this stage.
            </p>

            <Button
              asChild
              size="sm"
              variant="secondary"
              className="mt-2 w-fit rounded-full font-bold"
            >
              <Link to="/app/farm">
                Open crop timeline
              </Link>
            </Button>

          </div>

        </Card>

      </div>

      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <Disclaimer text={DISCLAIMER} />

    </div>
  );
}