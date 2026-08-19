import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Droplets,
  Sparkles,
  CloudRain,
  Thermometer,
  RefreshCw,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DemoBadge,
  PageHeader,
  StatCard,
  Gauge,
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
      "AI-powered irrigation optimization using soil moisture, weather and crop stage."
    ),
  component: Irrigation,
});


// =========================================================
// BACKEND
// =========================================================

const BACKEND_URL = "http://127.0.0.1:8000";


// =========================================================
// TYPES
// =========================================================

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

  recommendation: string;

  temperature_note: string;

  stage_note: string;
};


// =========================================================
// COMPONENT
// =========================================================

function Irrigation() {
  const farmContext = useFarm();

  const {
    farm,
    crop,
    soil,
    areaLabel,
    sensor,
  } = farmContext;

  const moistureSensor = sensor("moisture");

  const moisture = Number(
    moistureSensor?.value ?? 42
  );

  const [growthStage, setGrowthStage] =
    useState("Tillering");

  const [result, setResult] =
    useState<IrrigationResponse | null>(null);

  const [loading, setLoading] =
    useState(false);


  // =======================================================
  // GET FARM AREA
  // =======================================================

  const getAreaAcres = () => {
    const text = String(areaLabel ?? "");

    const match = text.match(
      /[\d.]+/
    );

    if (!match) {
      return 1;
    }

    const value = Number(
      match[0]
    );

    if (!Number.isFinite(value)) {
      return 1;
    }

    if (
      text.toLowerCase().includes("acre")
    ) {
      return value;
    }

    if (
      text.toLowerCase().includes("hectare") ||
      text.toLowerCase().includes("ha")
    ) {
      return value * 2.47105;
    }

    if (
      text.toLowerCase().includes("sqm") ||
      text.toLowerCase().includes("m²") ||
      text.toLowerCase().includes("square meter")
    ) {
      return value / 4046.856;
    }

    return value;
  };


  // =======================================================
  // GET LIVE WEATHER
  // =======================================================

  const getWeather = async () => {

    try {

      /*
       * If farm coordinates are available,
       * use the backend live weather API.
       */

      const farmData =
        farm as typeof farm & {
          latitude?: number;
          longitude?: number;
        };

      if (
        farmData?.latitude !== undefined &&
        farmData?.longitude !== undefined
      ) {

        const response =
          await fetch(
            `${BACKEND_URL}/weather?latitude=${farmData.latitude}&longitude=${farmData.longitude}`
          );

        if (
          response.ok
        ) {

          const data =
            await response.json();

          return {

            temperature:
              Number(
                data.weather?.temperature ?? 27.3
              ),

            rainfall:
              Number(
                data.weather?.precipitation ?? 0
              ),
          };
        }
      }

    } catch (error) {

      console.error(
        "Live weather error:",
        error
      );
    }

    /*
     * Fallback only when coordinates/live
     * weather are unavailable.
     */

    return {

      temperature:
        Number(
          weatherNow.temperature ?? 27.3
        ),

      rainfall:
        Number(
          weatherNow.rainfall ?? 0
        ),
    };
  };


  // =======================================================
  // OPTIMIZE IRRIGATION
  // =======================================================

  const optimizeIrrigation =
    async () => {

      setLoading(true);

      try {

        const weather =
          await getWeather();

        const areaAcres =
          getAreaAcres();

        const response =
          await fetch(
            `${BACKEND_URL}/irrigation`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                crop:
                  crop?.name ??
                  "Rice",

                soil:
                  soil?.name ??
                  "Alluvial",

                area_acres:
                  areaAcres,

                soil_moisture:
                  moisture,

                temperature:
                  weather.temperature,

                rainfall:
                  weather.rainfall,

                growth_stage:
                  growthStage,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data.detail ??
              "Irrigation service unavailable"
          );
        }

        setResult(data);

        toast.success(
          "Irrigation recommendation generated"
        );

      } catch (error) {

        console.error(
          "Irrigation error:",
          error
        );

        toast.error(
          "Unable to generate irrigation recommendation"
        );

      } finally {

        setLoading(false);
      }
    };


  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusClass = (
    status: string
  ) => {

    const value =
      status.toLowerCase();

    if (
      value.includes("no irrigation")
    ) {

      return "bg-green-100 text-green-700";
    }

    if (
      value.includes("monitor")
    ) {

      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <PageHeader
        title="Smart Irrigation"
        subtitle={`${areaLabel} · AI-powered irrigation optimization`}
        badge={
          <DemoBadge
            label="AI Irrigation"
          />
        }

        action={

          <Button
            className="h-11 rounded-full font-bold"
            onClick={
              optimizeIrrigation
            }
            disabled={loading}
          >

            {loading ? (

              <>

                <RefreshCw
                  className="h-4 w-4 animate-spin"
                />

                Checking...

              </>

            ) : (

              <>

                <Sparkles
                  className="h-4 w-4"
                />

                Optimize Irrigation

              </>
            )}

          </Button>
        }
      />


      {/* ================================================= */}
      {/* FARM INPUTS */}
      {/* ================================================= */}

      <Card
        className="gap-5 p-5 shadow-card"
      >

        <div>

          <h2 className="font-display text-xl font-bold">
            Irrigation Inputs
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            AGRIGENIE uses your current farm
            information to generate an irrigation
            recommendation.
          </p>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


          {/* CROP */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs text-muted-foreground">
              Crop
            </p>

            <p className="mt-1 font-bold">
              {crop?.name ?? "Rice"}
            </p>

          </div>


          {/* SOIL */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs text-muted-foreground">
              Soil
            </p>

            <p className="mt-1 font-bold">
              {soil?.name ?? "Alluvial"}
            </p>

          </div>


          {/* AREA */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs text-muted-foreground">
              Farm Area
            </p>

            <p className="mt-1 font-bold">
              {areaLabel}
            </p>

          </div>


          {/* MOISTURE */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs text-muted-foreground">
              Soil Moisture
            </p>

            <p className="mt-1 font-bold">
              {moisture}%
            </p>

          </div>

        </div>


        {/* GROWTH STAGE */}

        <div className="max-w-sm">

          <label className="text-sm font-semibold">
            Crop Growth Stage
          </label>

          <select
            value={growthStage}
            onChange={(e) =>
              setGrowthStage(
                e.target.value
              )
            }
            className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none"
          >

            <option value="Seedling">
              Seedling
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


      {/* ================================================= */}
      {/* CURRENT STATUS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


        <StatCard
          icon={
            <Droplets className="h-5 w-5 text-sky" />
          }
          label="Current moisture"
          value={`${moisture}%`}
          hint="Current farm value"
        />


        <StatCard
          icon={
            <Thermometer className="h-5 w-5 text-orange-500" />
          }
          label="Temperature"
          value={
            result
              ? `${result.temperature}°C`
              : "Check"
          }
          hint="Weather"
        />


        <StatCard
          icon={
            <CloudRain className="h-5 w-5 text-sky" />
          }
          label="Rainfall"
          value={
            result
              ? `${result.rainfall} mm`
              : "Check"
          }
          hint="Current weather"
        />


        <StatCard
          tone="hero"
          icon={
            <Sparkles className="h-5 w-5" />
          }
          label="Irrigation status"
          value={
            result
              ? result.status
              : "Not checked"
          }
          hint="AI recommendation"
        />

      </div>


      {/* ================================================= */}
      {/* GAUGE + RESULT */}
      {/* ================================================= */}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">


        {/* GAUGE */}

        <Card
          className="items-center gap-4 p-5 text-center shadow-card"
        >

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            Soil Moisture
          </Badge>

          <Gauge
            value={Math.min(
              Math.max(
                moisture,
                0
              ),
              100
            )}
            max={100}
            size={180}
            tone="sky"
            label={`${moisture}%`}
            sub="current moisture"
            thickness={13}
          />

          <p className="text-sm text-muted-foreground">

            Use the AI recommendation together
            with direct field observation before
            starting irrigation.

          </p>

        </Card>


        {/* RESULT */}

        <Card
          className="gap-5 p-5 shadow-card"
        >

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="font-display text-xl font-bold">
                AI Irrigation Recommendation
              </h2>

              <p className="text-sm text-muted-foreground">
                Based on current supplied farm
                and weather conditions.
              </p>

            </div>


            {result && (

              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                  result.status
                )}`}
              >
                {result.status}
              </span>

            )}

          </div>


          {!result ? (

            <div className="rounded-2xl bg-secondary/50 p-6 text-center">

              <Sparkles className="mx-auto h-8 w-8 text-primary" />

              <p className="mt-3 font-bold">
                Ready to analyze irrigation
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Select the crop growth stage and
                click Optimize Irrigation.
              </p>

            </div>

          ) : (

            <div className="space-y-4">


              {/* RECOMMENDATION */}

              <div className="rounded-2xl bg-secondary/50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recommendation
                </p>

                <p className="mt-2 text-sm leading-6">
                  {result.recommendation}
                </p>

              </div>


              {/* TEMPERATURE */}

              <div className="rounded-2xl bg-secondary/50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Temperature Advice
                </p>

                <p className="mt-2 text-sm leading-6">
                  {result.temperature_note}
                </p>

              </div>


              {/* GROWTH STAGE */}

              <div className="rounded-2xl bg-secondary/50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Growth Stage Advice
                </p>

                <p className="mt-2 text-sm leading-6">
                  {result.stage_note}
                </p>

              </div>


              {/* VALUES */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">


                <div className="rounded-xl border p-3">

                  <p className="text-xs text-muted-foreground">
                    Crop
                  </p>

                  <p className="font-bold">
                    {result.crop}
                  </p>

                </div>


                <div className="rounded-xl border p-3">

                  <p className="text-xs text-muted-foreground">
                    Soil
                  </p>

                  <p className="font-bold">
                    {result.soil}
                  </p>

                </div>


                <div className="rounded-xl border p-3">

                  <p className="text-xs text-muted-foreground">
                    Moisture
                  </p>

                  <p className="font-bold">
                    {result.soil_moisture}%
                  </p>

                </div>


                <div className="rounded-xl border p-3">

                  <p className="text-xs text-muted-foreground">
                    Growth Stage
                  </p>

                  <p className="font-bold">
                    {result.growth_stage}
                  </p>

                </div>

              </div>

            </div>
          )}

        </Card>

      </div>


      {/* ================================================= */}
      {/* HOW IT WORKS */}
      {/* ================================================= */}

      <Card
        className="gap-4 p-5 shadow-card"
      >

        <div>

          <h2 className="font-display text-xl font-bold">
            How AGRIGENIE decides
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The irrigation recommendation considers
            multiple conditions instead of using a
            fixed watering schedule.
          </p>

        </div>


        <div className="grid gap-3 md:grid-cols-4">


          <div className="rounded-2xl bg-secondary/50 p-4">

            <Droplets className="h-5 w-5 text-sky" />

            <p className="mt-3 font-bold">
              Soil Moisture
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Checks the supplied current
              moisture value.
            </p>

          </div>


          <div className="rounded-2xl bg-secondary/50 p-4">

            <CloudRain className="h-5 w-5 text-sky" />

            <p className="mt-3 font-bold">
              Rainfall
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Considers current rainfall before
              recommending irrigation.
            </p>

          </div>


          <div className="rounded-2xl bg-secondary/50 p-4">

            <Thermometer className="h-5 w-5 text-orange-500" />

            <p className="mt-3 font-bold">
              Temperature
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Highlights higher temperature
              and possible water stress.
            </p>

          </div>


          <div className="rounded-2xl bg-secondary/50 p-4">

            <Sparkles className="h-5 w-5 text-primary" />

            <p className="mt-3 font-bold">
              Crop Stage
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Gives stage-specific irrigation
              guidance.
            </p>

          </div>

        </div>

      </Card>


      {/* ================================================= */}
      {/* IMAGE */}
      {/* ================================================= */}

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

        <p className="absolute inset-y-0 left-0 flex max-w-md items-center p-6 font-display text-lg font-extrabold text-forest-foreground">

          AGRIGENIE combines soil moisture,
          weather and crop stage to support
          better irrigation decisions.

        </p>

      </div>


      {/* ================================================= */}
      {/* DISCLAIMER */}
      {/* ================================================= */}

      <Disclaimer
        text={DISCLAIMER}
      />

    </div>
  );
}