import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Droplets,
  Sparkles,
  CloudRain,
  Thermometer,
  Sprout,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DemoBadge,
  PageHeader,
  StatCard,
  Disclaimer,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";
import { DISCLAIMER, weatherNow } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

import irrigationImg from "@/assets/irrigation.jpg";

export const Route = createFileRoute("/app/irrigation")({
  head: () =>
    pageMeta(
      "Smart Irrigation",
      "AI-powered irrigation recommendation based on farm conditions."
    ),
  component: Irrigation,
});

/* =========================================================
   TYPES
========================================================= */

type WeatherResponse = {
  success: boolean;

  location?: {
    latitude: number;
    longitude: number;
  };

  weather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
    weather_code: number;
    solar_radiation_current: number;
  };

  timezone?: string;
  updated_at?: string;
};

type IrrigationResponse = {
  success: boolean;

  crop: string;
  soil: string;
  area_acres: number;

  soil_moisture: number;
  temperature: number;
  rainfall: number;

  growth_stage: string;

  status: string;
  urgency?: string;

  recommended_action?: string;

  recommendation: string;

  temperature_note: string;
  stage_note: string;

  area_note?: string;
  soil_note?: string;

  decision_basis?: string[];

  disclaimer?: string;
};

/* =========================================================
   CHART DATA
========================================================= */

const compare = [
  {
    day: "Mon",
    current: 1600,
    optimized: 1200,
  },
  {
    day: "Tue",
    current: 1600,
    optimized: 0,
  },
  {
    day: "Wed",
    current: 1600,
    optimized: 400,
  },
  {
    day: "Thu",
    current: 1600,
    optimized: 1100,
  },
  {
    day: "Fri",
    current: 1600,
    optimized: 1500,
  },
  {
    day: "Sat",
    current: 1600,
    optimized: 1500,
  },
  {
    day: "Sun",
    current: 1600,
    optimized: 1300,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function Irrigation() {
  /*
   * IMPORTANT:
   * We use SAVED FARM LOCATION.
   *
   * We DO NOT use:
   * navigator.geolocation
   *
   * Therefore:
   * Farmer can be at home or somewhere else.
   * Weather still comes from the farm location.
   */

  const {
    farm,
    crop,
    soil,
    sensor,
    areaLabel,
  } = useFarm();

  /* =======================================================
     SENSOR
  ======================================================= */

  const moisture = sensor("moisture");

  /* =======================================================
     GROWTH STAGE
  ======================================================= */

  const [growthStage, setGrowthStage] =
    useState("Tillering");

  /* =======================================================
     IRRIGATION RESULT
  ======================================================= */

  const [result, setResult] =
    useState<IrrigationResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     LIVE WEATHER
  ======================================================= */

  const [liveWeather, setLiveWeather] =
    useState<WeatherResponse | null>(null);

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  /* =======================================================
     SAVED FARM LOCATION
  ======================================================= */

  const latitude =
    farm.latitude ?? null;

  const longitude =
    farm.longitude ?? null;

  /* =======================================================
     AREA
  ======================================================= */

  const areaAcres =
    Number(
      String(areaLabel).replace(
        /[^0-9.]/g,
        ""
      )
    ) || 1;

  /* =======================================================
     FALLBACK WEATHER
  ======================================================= */

  const fallbackTemperature =
    Number(weatherNow.temperature) || 27.3;

  const fallbackRainfall =
    Number(weatherNow.rainfall) || 0;

  /* =======================================================
     FETCH LIVE FARM WEATHER
  ======================================================= */

  const fetchLiveWeather = async () => {
    if (
      latitude === null ||
      longitude === null
    ) {
      toast.error(
        "Farm location is not available. Please set your farm location first."
      );

      return null;
    }

    setWeatherLoading(true);

    try {
      /*
       * Weather is fetched using SAVED FARM coordinates.
       *
       * NOT the farmer's current device location.
       */

      const response = await fetch(
        `http://127.0.0.1:8000/weather?latitude=${latitude}&longitude=${longitude}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Weather service failed."
        );
      }

      const data: WeatherResponse =
        await response.json();

      if (
        !data.success ||
        !data.weather
      ) {
        throw new Error(
          "Invalid weather response."
        );
      }

      setLiveWeather(data);

      toast.success(
        "Farm live weather updated"
      );

      return data;
    } catch (error) {
      console.error(
        "Live weather error:",
        error
      );

      toast.error(
        "Live farm weather unavailable. Using fallback weather."
      );

      return null;
    } finally {
      setWeatherLoading(false);
    }
  };

  /* =======================================================
     LOAD WEATHER WHEN PAGE OPENS
  ======================================================= */

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null
    ) {
      fetchLiveWeather();
    }
  }, [latitude, longitude]);

  /* =======================================================
     WEATHER VALUES
  ======================================================= */

  const temperature =
    liveWeather?.weather?.temperature ??
    fallbackTemperature;

  const rainfall =
    liveWeather?.weather?.precipitation ??
    fallbackRainfall;

  const humidity =
    liveWeather?.weather?.humidity ??
    null;

  const windSpeed =
    liveWeather?.weather?.wind_speed ??
    null;

  const solarRadiation =
    liveWeather?.weather
      ?.solar_radiation_current ??
    null;

  /* =======================================================
     OPTIMIZE IRRIGATION
  ======================================================= */

  const optimizeIrrigation = async () => {
    setLoading(true);
    setResult(null);

    try {
      /*
       * First refresh farm weather.
       */

      let currentWeather =
        liveWeather;

      const refreshedWeather =
        await fetchLiveWeather();

      if (refreshedWeather) {
        currentWeather =
          refreshedWeather;
      }

      /* ===================================================
         CURRENT WEATHER VALUES
      =================================================== */

      const currentTemperature =
        currentWeather?.weather
          ?.temperature ??
        fallbackTemperature;

      const currentRainfall =
        currentWeather?.weather
          ?.precipitation ??
        fallbackRainfall;

      /* ===================================================
         BACKEND REQUEST
      =================================================== */

      const requestBody = {
        crop:
          crop.name,

        soil:
          soil.name,

        area_acres:
          areaAcres,

        soil_moisture:
          Number(
            moisture.value
          ),

        temperature:
          Number(
            currentTemperature
          ),

        rainfall:
          Number(
            currentRainfall
          ),

        growth_stage:
          growthStage,
      };

      console.log(
        "AGRIGENIE irrigation request:",
        requestBody
      );

      /* ===================================================
         CALL FASTAPI
      =================================================== */

      const response =
        await fetch(
          "http://127.0.0.1:8000/irrigation",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      /* ===================================================
         ERROR HANDLING
      =================================================== */

      if (!response.ok) {
        let errorMessage =
          "Irrigation service failed.";

        try {
          const errorData =
            await response.json();

          if (
            errorData?.detail
          ) {
            errorMessage =
              errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(
          errorMessage
        );
      }

      /* ===================================================
         RESPONSE
      =================================================== */

      const data:
        IrrigationResponse =
        await response.json();

      console.log(
        "AGRIGENIE irrigation response:",
        data
      );

      setResult(data);

      toast.success(
        "AGRIGENIE irrigation recommendation generated"
      );
    } catch (error) {
      console.error(
        "Irrigation API error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to connect to irrigation service."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const getStatusClass = (
    status: string
  ) => {
    const value =
      status.toLowerCase();

    if (
      value.includes(
        "skip"
      ) ||
      value.includes(
        "no irrigation"
      )
    ) {
      return "bg-green-100 text-green-800";
    }

    if (
      value.includes(
        "required"
      ) ||
      value.includes(
        "irrigation may"
      )
    ) {
      return "bg-orange-100 text-orange-800";
    }

    return "bg-yellow-100 text-yellow-800";
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <PageHeader
        title="Smart Irrigation"
        subtitle={`${areaLabel} · ${farm.farmName} · farm-location weather`}
        badge={
          <DemoBadge label="AI IRRIGATION" />
        }
        action={
          <div className="flex flex-wrap gap-2">

            {/* Refresh weather */}

            <Button
              variant="secondary"
              className="h-11 rounded-full px-5 font-bold"
              onClick={
                fetchLiveWeather
              }
              disabled={
                weatherLoading
              }
            >

              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  weatherLoading
                    ? "animate-spin"
                    : ""
                }`}
              />

              {weatherLoading
                ? "Updating..."
                : "Refresh Farm Weather"}

            </Button>

            {/* Optimize */}

            <Button
              className="h-11 rounded-full px-6 font-bold"
              onClick={
                optimizeIrrigation
              }
              disabled={
                loading
              }
            >

              <Sparkles className="mr-2 h-4 w-4" />

              {loading
                ? "AGRIGENIE is thinking..."
                : "Optimize Irrigation"}

            </Button>

          </div>
        }
      />

      {/* ===================================================
          FARM LIVE WEATHER
      =================================================== */}

      <Card className="gap-4 p-5 shadow-card">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <div className="flex items-center gap-2">

              <CloudRain className="h-5 w-5 text-sky" />

              <h2 className="font-display text-xl font-bold">
                Farm Live Weather
              </h2>

              <Badge
                variant="secondary"
                className="rounded-full"
              >
                {liveWeather
                  ? "LIVE"
                  : "FALLBACK"}
              </Badge>

            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Weather is fetched for your saved
              farm location, not your current device location.
            </p>

          </div>

          {/* FARM COORDINATES */}

          {latitude !== null &&
            longitude !== null && (
              <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs">

                <MapPin className="h-4 w-4 text-primary" />

                <span>
                  Farm:{" "}
                  {latitude.toFixed(4)},
                  {" "}
                  {longitude.toFixed(4)}
                </span>

              </div>
            )}

        </div>

        {/* NO FARM LOCATION */}

        {(
          latitude === null ||
          longitude === null
        ) && (

          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">

            <div className="flex items-center gap-2">

              <AlertCircle className="h-5 w-5" />

              <p className="font-semibold">
                Farm location not available
              </p>

            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Please set and save your farm
              location before using live weather
              and irrigation optimization.
            </p>

          </div>
        )}

        {/* WEATHER CARDS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* Temperature */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <div className="flex items-center gap-2">

              <Thermometer className="h-4 w-4 text-orange-500" />

              <p className="text-sm text-muted-foreground">
                Temperature
              </p>

            </div>

            <p className="mt-2 text-2xl font-bold">
              {temperature}°C
            </p>

          </div>

          {/* Rainfall */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <div className="flex items-center gap-2">

              <CloudRain className="h-4 w-4 text-sky" />

              <p className="text-sm text-muted-foreground">
                Rainfall
              </p>

            </div>

            <p className="mt-2 text-2xl font-bold">
              {rainfall} mm
            </p>

          </div>

          {/* Humidity */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Humidity
            </p>

            <p className="mt-2 text-2xl font-bold">
              {humidity !== null
                ? `${humidity}%`
                : "--"}
            </p>

          </div>

          {/* Wind */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Wind Speed
            </p>

            <p className="mt-2 text-2xl font-bold">
              {windSpeed !== null
                ? `${windSpeed} km/h`
                : "--"}
            </p>

          </div>

          {/* Solar */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Solar Radiation
            </p>

            <p className="mt-2 text-2xl font-bold">
              {solarRadiation !== null
                ? `${solarRadiation}`
                : "--"}
            </p>

          </div>

        </div>

        {/* UPDATED TIME */}

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">

          <span>
            {liveWeather?.updated_at
              ? `Updated: ${liveWeather.updated_at}`
              : "Waiting for live farm weather"}
          </span>

          <span>
            Farm: {farm.farmName}
          </span>

        </div>

      </Card>

      {/* ===================================================
          IRRIGATION INPUTS
      =================================================== */}

      <Card className="gap-5 p-6 shadow-card">

        <div>

          <h2 className="font-display text-2xl font-bold">
            Irrigation Inputs
          </h2>

          <p className="mt-1 text-muted-foreground">
            AGRIGENIE uses your saved farm information,
            soil moisture and live weather from the farm
            location.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Crop */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Crop
            </p>

            <p className="mt-2 text-xl font-bold">
              {crop.name}
            </p>

          </div>

          {/* Soil */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Soil
            </p>

            <p className="mt-2 text-xl font-bold">
              {soil.name}
            </p>

          </div>

          {/* Area */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Farm Area
            </p>

            <p className="mt-2 text-xl font-bold">
              {areaLabel}
            </p>

          </div>

          {/* Moisture */}

          <div className="rounded-3xl bg-secondary/60 p-5">

            <p className="text-sm text-muted-foreground">
              Soil Moisture
            </p>

            <p className="mt-2 text-xl font-bold">
              {moisture.value}%
            </p>

          </div>

        </div>

        {/* =================================================
            GROWTH STAGE
        ================================================= */}

        <div className="max-w-xl">

          <label
            htmlFor="growth-stage"
            className="mb-2 block text-sm font-semibold"
          >
            Crop Growth Stage
          </label>

          <select
            id="growth-stage"
            value={growthStage}
            onChange={(e) =>
              setGrowthStage(
                e.target.value
              )
            }
            className="h-14 w-full rounded-full border border-border bg-background px-5 text-base outline-none focus:ring-2 focus:ring-primary"
          >

            <option value="Unknown">
              Unknown
            </option>

            <option value="Germination">
              Germination
            </option>

            <option value="Vegetative">
              Vegetative
            </option>

            <option value="Tillering">
              Tillering
            </option>

            <option value="Flowering">
              Flowering
            </option>

            <option value="Grain Filling">
              Grain Filling
            </option>

            <option value="Maturity">
              Maturity
            </option>

          </select>

        </div>

      </Card>

      {/* ===================================================
          CURRENT CONDITIONS
      =================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            <Droplets className="h-5 w-5 text-sky" />
          }
          label="Current moisture"
          value={`${moisture.value}%`}
          hint="Farm sensor value"
        />

        <StatCard
          icon={
            <Thermometer className="h-5 w-5 text-orange-500" />
          }
          label="Live temperature"
          value={`${temperature}°C`}
          hint={
            liveWeather
              ? "Farm live weather"
              : "Fallback weather"
          }
        />

        <StatCard
          icon={
            <CloudRain className="h-5 w-5 text-sky" />
          }
          label="Live rainfall"
          value={`${rainfall} mm`}
          hint={
            liveWeather
              ? "Farm live weather"
              : "Fallback weather"
          }
        />

        <StatCard
          tone="hero"
          icon={
            <Sprout className="h-5 w-5" />
          }
          label="Growth stage"
          value={growthStage}
          hint="Selected crop stage"
        />

      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (

        <Card className="p-6 shadow-card">

          <div className="flex items-center gap-4">

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">

              <Sparkles className="h-6 w-6 animate-pulse text-primary" />

            </div>

            <div>

              <h2 className="font-display text-lg font-bold">
                AGRIGENIE is analyzing your farm...
              </h2>

              <p className="text-sm text-muted-foreground">
                Checking soil moisture, farm weather,
                rainfall, temperature and crop growth stage.
              </p>

            </div>

          </div>

        </Card>
      )}

      {/* ===================================================
          BACKEND RESULT
      =================================================== */}

      {result && !loading && (

        <Card className="gap-5 p-6 shadow-card">

          {/* RESULT HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="font-display text-2xl font-bold">
                AGRIGENIE Irrigation Recommendation
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Generated using farm conditions and
                live farm weather.
              </p>

            </div>

            <Badge
              variant="secondary"
              className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                result.status
              )}`}
            >
              {result.status}
            </Badge>

          </div>

          {/* URGENCY */}

          {result.urgency && (

            <div className="rounded-2xl border p-4">

              <p className="text-xs text-muted-foreground">
                Urgency
              </p>

              <p className="mt-1 text-lg font-bold">
                {result.urgency}
              </p>

            </div>
          )}

          {/* RECOMMENDATION */}

          <div className="rounded-3xl bg-secondary/50 p-5">

            <div className="mb-3 flex items-center gap-2">

              {result.status
                .toLowerCase()
                .includes("irrig") ? (

                <CheckCircle2 className="h-5 w-5 text-primary" />

              ) : (

                <AlertCircle className="h-5 w-5 text-primary" />

              )}

              <h3 className="font-bold">
                Recommendation
              </h3>

            </div>

            <p className="text-base leading-7">
              {result.recommendation}
            </p>

          </div>

          {/* RECOMMENDED ACTION */}

          {result.recommended_action && (

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">

              <div className="flex items-center gap-2">

                <CheckCircle2 className="h-5 w-5 text-primary" />

                <h3 className="font-bold">
                  What to do now
                </h3>

              </div>

              <p className="mt-2 text-sm leading-6">
                {result.recommended_action}
              </p>

            </div>
          )}

          {/* RESULT VALUES */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Crop */}

            <div className="rounded-2xl border p-4">

              <p className="text-xs text-muted-foreground">
                Crop
              </p>

              <p className="mt-1 text-xl font-bold">
                {result.crop}
              </p>

            </div>

            {/* Moisture */}

            <div className="rounded-2xl border p-4">

              <p className="text-xs text-muted-foreground">
                Soil Moisture
              </p>

              <p className="mt-1 text-xl font-bold">
                {result.soil_moisture}%
              </p>

            </div>

            {/* Temperature */}

            <div className="rounded-2xl border p-4">

              <p className="text-xs text-muted-foreground">
                Temperature
              </p>

              <p className="mt-1 text-xl font-bold">
                {result.temperature}°C
              </p>

            </div>

            {/* Rainfall */}

            <div className="rounded-2xl border p-4">

              <p className="text-xs text-muted-foreground">
                Rainfall
              </p>

              <p className="mt-1 text-xl font-bold">
                {result.rainfall} mm
              </p>

            </div>

          </div>

          {/* CROP STAGE */}

          <div className="rounded-2xl bg-secondary/40 p-4">

            <p className="font-semibold">
              Crop Stage
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {result.growth_stage}
            </p>

          </div>

          {/* TEMPERATURE NOTE */}

          <div className="rounded-2xl bg-secondary/40 p-4">

            <p className="font-semibold">
              Temperature Note
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {result.temperature_note}
            </p>

          </div>

          {/* STAGE NOTE */}

          <div className="rounded-2xl bg-secondary/40 p-4">

            <p className="font-semibold">
              Crop Stage Note
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {result.stage_note}
            </p>

          </div>

          {/* AREA NOTE */}

          {result.area_note && (

            <div className="rounded-2xl bg-secondary/40 p-4">

              <p className="font-semibold">
                Farm Area
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {result.area_note}
              </p>

            </div>
          )}

          {/* SOIL NOTE */}

          {result.soil_note && (

            <div className="rounded-2xl bg-secondary/40 p-4">

              <p className="font-semibold">
                Soil
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {result.soil_note}
              </p>

            </div>
          )}

          {/* DISCLAIMER */}

          {result.disclaimer && (

            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">

              <p className="text-xs leading-5 text-muted-foreground">
                {result.disclaimer}
              </p>

            </div>
          )}

        </Card>
      )}

      {/* ===================================================
          HOW AGRIGENIE DECIDES
      =================================================== */}

      <Card className="gap-5 p-6 shadow-card">

        <div>

          <h2 className="font-display text-xl font-bold">
            How AGRIGENIE decides
          </h2>

          <p className="mt-1 text-muted-foreground">
            The irrigation recommendation considers
            multiple farm conditions instead of using
            a fixed watering schedule.
          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Moisture */}

          <div className="rounded-3xl bg-secondary/50 p-5">

            <Droplets className="mb-4 h-7 w-7 text-sky" />

            <h3 className="font-bold">
              Soil Moisture
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Checks the current soil moisture
              before suggesting irrigation.
            </p>

          </div>

          {/* Rainfall */}

          <div className="rounded-3xl bg-secondary/50 p-5">

            <CloudRain className="mb-4 h-7 w-7 text-sky" />

            <h3 className="font-bold">
              Farm Live Rainfall
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Uses rainfall from the saved farm
              location before recommending
              additional watering.
            </p>

          </div>

          {/* Temperature */}

          <div className="rounded-3xl bg-secondary/50 p-5">

            <Thermometer className="mb-4 h-7 w-7 text-orange-500" />

            <h3 className="font-bold">
              Farm Temperature
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Uses current temperature at the
              saved farm location.
            </p>

          </div>

          {/* Growth */}

          <div className="rounded-3xl bg-secondary/50 p-5">

            <Sprout className="mb-4 h-7 w-7 text-primary" />

            <h3 className="font-bold">
              Crop Stage
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Provides growth-stage-specific
              irrigation guidance.
            </p>

          </div>

        </div>

      </Card>

      {/* ===================================================
          COMPARISON CHART
      =================================================== */}

      <Card className="gap-4 p-5 shadow-card">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <h2 className="font-display text-xl font-bold">
            Irrigation comparison
          </h2>

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            Litres per day
          </Badge>

        </div>

        <div className="h-64 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart data={compare}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />

              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border:
                    "1px solid var(--border)",
                  background:
                    "var(--card)",
                }}
              />

              <Legend />

              <Bar
                dataKey="current"
                name="Current practice"
                fill="var(--chart-5)"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />

              <Bar
                dataKey="optimized"
                name="Optimized"
                fill="var(--chart-2)"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <p className="text-xs text-muted-foreground">
          This comparison is a planning visualization.
          The actual irrigation recommendation comes
          from the AGRIGENIE backend.
        </p>

      </Card>

      {/* ===================================================
          IMAGE
      =================================================== */}

      <div className="relative overflow-hidden rounded-3xl shadow-card">

        <img
          src={irrigationImg}
          width={1024}
          height={700}
          loading="lazy"
          alt="Sprinkler irrigating a green field"
          className="h-52 w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 to-forest/10" />

        <p className="absolute inset-y-0 left-0 flex max-w-xl items-center p-6 font-display text-lg font-extrabold text-forest-foreground">
          AGRIGENIE combines soil moisture,
          live farm weather and crop growth
          stage to support better irrigation decisions.
        </p>

      </div>

      {/* ===================================================
          DISCLAIMER
      =================================================== */}

      <Disclaimer text={DISCLAIMER} />

    </div>
  );
}