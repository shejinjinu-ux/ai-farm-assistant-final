import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CloudRain,
  Droplets,
  RefreshCw,
  Sprout,
  Thermometer,
  Wind,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  PageHeader,
  Disclaimer,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/app/recommendations",
)({
  head: () =>
    pageMeta(
      "AgriGenie Recommendations",
      "Smart farm recommendations using farm data and live weather.",
    ),
  component: Recommendations,
});

/* =========================================================
   BACKEND
========================================================= */

const BACKEND_URL = "http://127.0.0.1:8000";

/* =========================================================
   TYPES
========================================================= */

type WeatherData = {
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  weather_code?: number;
  solar_radiation?: number;
};

type WeatherResponse = {
  success: boolean;

  weather?: WeatherData;

  location?: {
    latitude: number;
    longitude: number;
  };

  updated_at?: string;
  timezone?: string;
  message?: string;
};

type RecommendationItem = {
  category: string;
  priority: string;
  recommendation: string;
};

type RecommendationResponse = {
  success: boolean;

  status?: string;

  farm?: {
    crop?: string;
    soil?: string;
    area_acres?: number;
    growth_stage?: string;
  };

  current_conditions?: {
    soil_moisture?: number;
    temperature?: number;
    rainfall?: number;
    humidity?: number;
    wind_speed?: number;
    solar_radiation?: number;
  };

  summary?: string;

  what_to_do_now?: string;

  priority_actions?: string[];

  recommendations?: RecommendationItem[];
};

/* =========================================================
   CATEGORY ICON
========================================================= */

function CategoryIcon({
  category,
}: {
  category: string;
}) {
  const name = category.toLowerCase();

  if (name.includes("irrigation")) {
    return <Droplets className="h-5 w-5" />;
  }

  if (name.includes("rain")) {
    return <CloudRain className="h-5 w-5" />;
  }

  if (name.includes("weather")) {
    return <Thermometer className="h-5 w-5" />;
  }

  if (name.includes("wind")) {
    return <Wind className="h-5 w-5" />;
  }

  if (
    name.includes("pest") ||
    name.includes("disease")
  ) {
    return <AlertCircle className="h-5 w-5" />;
  }

  return <Sprout className="h-5 w-5" />;
}

/* =========================================================
   PRIORITY
========================================================= */

function getPriorityVariant(
  priority: string,
) {
  if (priority === "High") {
    return "destructive" as const;
  }

  if (priority === "Low") {
    return "outline" as const;
  }

  return "secondary" as const;
}

/* =========================================================
   MAIN
========================================================= */

function Recommendations() {
  const {
    farm,
    crop,
    soil,
    sensor,
    areaLabel,
  } = useFarm();

  /* =======================================================
     STATE
  ======================================================= */

  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     SENSOR
  ======================================================= */

  const moisture = Number(
    sensor("moisture")?.value ?? 0,
  );

  /* =======================================================
     AREA
  ======================================================= */

  const getAreaAcres = useCallback(() => {
    const text = String(
      areaLabel ?? "",
    ).toLowerCase();

    const match =
      text.match(/[\d.]+/);

    if (!match) {
      return 1;
    }

    const value =
      Number(match[0]);

    if (!Number.isFinite(value)) {
      return 1;
    }

    if (text.includes("acre")) {
      return value;
    }

    if (
      text.includes("hectare") ||
      text.includes("ha")
    ) {
      return value * 2.47105;
    }

    if (
      text.includes("sqm") ||
      text.includes("m²") ||
      text.includes("square meter")
    ) {
      return value / 4046.856;
    }

    return value;
  }, [areaLabel]);

  /* =======================================================
     SAVED FARM LOCATION

     IMPORTANT:
     We DO NOT use navigator.geolocation.

     Weather is always based on the saved farm location.
  ======================================================= */

  const getSavedFarmLocation =
    useCallback(() => {
      const data = farm as any;

      if (!data) {
        return null;
      }

      const latitude =
        data?.latitude ??
        data?.lat ??
        data?.location?.latitude ??
        data?.location?.lat ??
        data?.coordinates?.latitude ??
        data?.coordinates?.lat ??
        data?.location?.coordinates?.latitude ??
        data?.location?.coordinates?.lat;

      const longitude =
        data?.longitude ??
        data?.lng ??
        data?.lon ??
        data?.location?.longitude ??
        data?.location?.lng ??
        data?.location?.lon ??
        data?.coordinates?.longitude ??
        data?.coordinates?.lng ??
        data?.location?.coordinates?.longitude ??
        data?.location?.coordinates?.lng;

      const lat = Number(latitude);
      const lon = Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        return null;
      }

      return {
        latitude: lat,
        longitude: lon,
      };
    }, [farm]);

  /* =======================================================
     SAVED LOCATION KEY

     This lets us wait until Farm Context has loaded.
  ======================================================= */

  const savedLocation =
    getSavedFarmLocation();

  const locationKey =
    savedLocation
      ? `${savedLocation.latitude},${savedLocation.longitude}`
      : "";

  /* =======================================================
     LIVE WEATHER
  ======================================================= */

  const fetchWeather =
    useCallback(async () => {
      const location =
        getSavedFarmLocation();

      if (!location) {
        throw new Error(
          "Saved farm location is not available yet.",
        );
      }

      const url =
        `${BACKEND_URL}/weather` +
        `?latitude=${location.latitude}` +
        `&longitude=${location.longitude}`;

      const response =
        await fetch(url, {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
        });

      if (!response.ok) {
        throw new Error(
          "Live weather could not be loaded.",
        );
      }

      const data =
        (await response.json()) as WeatherResponse;

      if (
        !data.success ||
        !data.weather
      ) {
        throw new Error(
          data.message ??
            "Invalid weather response.",
        );
      }

      setWeather(data);

      return data;
    }, [getSavedFarmLocation]);

  /* =======================================================
     RECOMMENDATION API
  ======================================================= */

  const fetchRecommendations =
    useCallback(
      async (
        weatherData: WeatherResponse,
      ) => {
        if (!weatherData.weather) {
          throw new Error(
            "Weather data is unavailable.",
          );
        }

        const current =
          weatherData.weather;

        const body = {
          crop:
            crop?.name ?? "Rice",

          soil:
            soil?.name ?? "Alluvial",

          area_acres:
            getAreaAcres(),

          soil_moisture:
            moisture,

          temperature:
            Number(
              current.temperature,
            ),

          rainfall:
            Number(
              current.precipitation,
            ),

          growth_stage:
            "Tillering",

          humidity:
            Number(
              current.humidity,
            ),

          wind_speed:
            Number(
              current.wind_speed,
            ),

          solar_radiation:
            Number(
              current.solar_radiation ?? 0,
            ),
        };

        console.log(
          "AgriGenie Recommendation Request:",
          body,
        );

        const response =
          await fetch(
            `${BACKEND_URL}/recommendations`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(body),
            },
          );

        if (!response.ok) {
          let message =
            "Recommendation service failed.";

          try {
            const errorData =
              await response.json();

            message =
              errorData?.detail ??
              errorData?.message ??
              message;
          } catch {
            // Ignore invalid error response
          }

          throw new Error(message);
        }

        const data =
          (await response.json()) as RecommendationResponse;

        if (!data.success) {
          throw new Error(
            "AgriGenie recommendation failed.",
          );
        }

        setRecommendations(data);

        return data;
      },
      [
        crop,
        soil,
        moisture,
        getAreaAcres,
      ],
    );

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadPage =
    useCallback(
      async (
        showToast = false,
      ) => {
        /*
         * IMPORTANT:
         * If farm location is not loaded yet,
         * simply wait.
         *
         * Do NOT show error.
         */

        const location =
          getSavedFarmLocation();

        if (!location) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          /*
           * STEP 1
           * Live weather using SAVED FARM LOCATION
           */

          const weatherData =
            await fetchWeather();

          /*
           * STEP 2
           * Send weather + sensor + farm data
           */

          await fetchRecommendations(
            weatherData,
          );

          /*
           * Only manual refresh shows toast.
           */

          if (showToast) {
            toast.success(
              "AgriGenie recommendations updated",
            );
          }
        } catch (err) {
          console.error(
            "AgriGenie error:",
            err,
          );

          const message =
            err instanceof Error
              ? err.message
              : "Unable to load recommendations.";

          setError(message);

          /*
           * Only manual refresh shows error toast.
           *
           * This prevents continuous popup messages.
           */

          if (showToast) {
            toast.error(message);
          }
        } finally {
          setLoading(false);
        }
      },
      [
        getSavedFarmLocation,
        fetchWeather,
        fetchRecommendations,
      ],
    );

  /* =======================================================
     INITIAL LOAD

     IMPORTANT FIX:
     No firstLoadDone ref.

     The page waits until saved farm location
     actually exists.
  ======================================================= */

  useEffect(() => {
    if (!locationKey) {
      return;
    }

    void loadPage(false);
  }, [
    locationKey,
    loadPage,
  ]);

  /* =======================================================
     UI DATA
  ======================================================= */

  const currentWeather =
    weather?.weather;

  const items =
    recommendations?.recommendations ??
    [];

  /* =======================================================
     WHAT TO DO NOW

     We show:
     1. what_to_do_now
     2. additional priority_actions
     3. remove duplicate text
  ======================================================= */

  const mainAction =
    recommendations?.what_to_do_now ||
    recommendations?.priority_actions?.[0] ||
    "";

  const additionalActions =
    (
      recommendations?.priority_actions ??
      []
    ).filter(
      (action) =>
        action !== mainAction,
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        title="AgriGenie Recommendations"
        subtitle={`${areaLabel} · farm conditions + live weather`}
        badge={
          <Badge
            variant="secondary"
            className="rounded-full"
          >
            <Bot className="mr-1 h-3.5 w-3.5" />
            AgriGenie
          </Badge>
        }
        action={
          <Button
            variant="secondary"
            className="rounded-full font-bold"
            disabled={loading}
            onClick={() =>
              void loadPage(true)
            }
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            {loading
              ? "Updating..."
              : "Refresh"}
          </Button>
        }
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

            <div>
              <p className="font-bold">
                AgriGenie could not update
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* =================================================
          CURRENT CONDITIONS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* CROP */}

        <Card className="gap-2 p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sprout className="h-4 w-4" />

            <span className="text-xs font-semibold">
              Crop
            </span>
          </div>

          <p className="font-display text-xl font-bold">
            {crop?.name ?? "Rice"}
          </p>

          <p className="text-xs text-muted-foreground">
            {soil?.name ?? "Alluvial"}
          </p>
        </Card>

        {/* MOISTURE */}

        <Card className="gap-2 p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-4 w-4" />

            <span className="text-xs font-semibold">
              Soil moisture
            </span>
          </div>

          <p className="font-display text-xl font-bold">
            {moisture}%
          </p>

          <p className="text-xs text-muted-foreground">
            Farm sensor
          </p>
        </Card>

        {/* TEMPERATURE */}

        <Card className="gap-2 p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Thermometer className="h-4 w-4" />

            <span className="text-xs font-semibold">
              Live temperature
            </span>
          </div>

          <p className="font-display text-xl font-bold">
            {currentWeather
              ? `${currentWeather.temperature}°C`
              : "—"}
          </p>

          <p className="text-xs text-muted-foreground">
            Saved farm location
          </p>
        </Card>

        {/* RAIN */}

        <Card className="gap-2 p-4 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CloudRain className="h-4 w-4" />

            <span className="text-xs font-semibold">
              Rainfall
            </span>
          </div>

          <p className="font-display text-xl font-bold">
            {currentWeather
              ? `${currentWeather.precipitation} mm`
              : "—"}
          </p>

          <p className="text-xs text-muted-foreground">
            Live weather
          </p>
        </Card>
      </div>

      {/* =================================================
          WHAT TO DO NOW
      ================================================= */}

      {(mainAction ||
        additionalActions.length >
          0) && (
        <Card className="gap-4 border-primary/20 bg-primary/5 p-5 shadow-card">

          <div className="flex items-center gap-3">

            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </span>

            <div>
              <h2 className="font-display text-xl font-bold">
                What to do now
              </h2>

              <p className="text-xs text-muted-foreground">
                AgriGenie priority actions
              </p>
            </div>

          </div>

          {/* MAIN ACTION */}

          {mainAction && (
            <div className="rounded-2xl bg-background p-4">
              <p className="text-sm font-semibold leading-6">
                {mainAction}
              </p>
            </div>
          )}

          {/* ADDITIONAL ACTIONS */}

          {additionalActions.length >
            0 && (
            <div className="space-y-2">

              {additionalActions.map(
                (action, index) => (
                  <div
                    key={`${action}-${index}`}
                    className="flex items-start gap-3 rounded-2xl bg-background/70 p-3"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6">
                      {action}
                    </p>
                  </div>
                ),
              )}

            </div>
          )}

        </Card>
      )}

      {/* =================================================
          RECOMMENDATIONS
      ================================================= */}

      <div className="space-y-4">

        <div>
          <h2 className="font-display text-2xl font-bold">
            AgriGenie Recommendations
          </h2>

          <p className="text-sm text-muted-foreground">
            Practical actions based on your current farm data
          </p>
        </div>

        {/* LOADING */}

        {loading &&
          items.length === 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />

                <p className="text-sm">
                  AgriGenie is analysing your farm...
                </p>
              </div>
            </Card>
          )}

        {/* EMPTY */}

        {!loading &&
          items.length === 0 &&
          !error && (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                No recommendation data is available yet.
                Click Refresh to try again.
              </p>
            </Card>
          )}

        {/* CARDS */}

        <div className="grid gap-4 md:grid-cols-2">

          {items.map(
            (item, index) => (
              <Card
                key={`${item.category}-${index}`}
                className="gap-4 p-5 shadow-card transition-shadow hover:shadow-lift"
              >

                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary">
                      <CategoryIcon
                        category={
                          item.category
                        }
                      />
                    </span>

                    <div className="min-w-0">

                      <p className="truncate font-display text-lg font-bold">
                        {item.category}
                      </p>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        AgriGenie recommendation
                      </p>

                    </div>

                  </div>

                  <Badge
                    variant={getPriorityVariant(
                      item.priority,
                    )}
                    className="rounded-full"
                  >
                    {item.priority}
                  </Badge>

                </div>

                <div className="rounded-2xl bg-secondary/45 p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Recommendation
                  </p>

                  <p className="mt-1 text-sm leading-6">
                    {item.recommendation}
                  </p>

                </div>

              </Card>
            ),
          )}

        </div>
      </div>

      {/* =================================================
          LIVE WEATHER DETAILS
      ================================================= */}

      {currentWeather && (
        <Card className="gap-4 p-5 shadow-card">

          <h2 className="font-display text-xl font-bold">
            Current Farm Weather
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs text-muted-foreground">
                Temperature
              </p>

              <p className="mt-1 font-bold">
                {currentWeather.temperature}°C
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs text-muted-foreground">
                Humidity
              </p>

              <p className="mt-1 font-bold">
                {currentWeather.humidity}%
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs text-muted-foreground">
                Rainfall
              </p>

              <p className="mt-1 font-bold">
                {currentWeather.precipitation} mm
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/45 p-4">
              <p className="text-xs text-muted-foreground">
                Wind speed
              </p>

              <p className="mt-1 font-bold">
                {currentWeather.wind_speed} km/h
              </p>
            </div>

          </div>

        </Card>
      )}

      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <Disclaimer text={DISCLAIMER} />

    </div>
  );
}