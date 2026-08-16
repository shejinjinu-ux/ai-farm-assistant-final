import { createFileRoute } from "@tanstack/react-router";
import {
  Droplets,
  CloudRain,
  Sprout,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  DemoBadge,
  PageHeader,
  StatCard,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";

export const Route = createFileRoute("/irrigation")({
  component: Irrigation,
});

function Irrigation() {
  const { farm, crop, areaLabel, sensor } = useFarm();

  const moistureSensor = sensor("moisture");

  const moisture = Number(moistureSensor.value) || 0;

  /*
   * Current demo irrigation calculation.
   *
   * Later we can improve this using:
   * crop water requirement,
   * soil type,
   * evapotranspiration,
   * rainfall forecast,
   * farm area.
   */

  let recommendation = "WAIT";
  let status = "Good";
  let message =
    "Current soil moisture is sufficient. No immediate irrigation is required.";

  if (moisture < 30) {
    recommendation = "IRRIGATE NOW";
    status = "Low Soil Moisture";
    message =
      "Soil moisture is low. Irrigation is recommended to prevent crop stress.";
  } else if (moisture < 45) {
    recommendation = "IRRIGATE SOON";
    status = "Moderate Soil Moisture";
    message =
      "Soil moisture is moderate. Plan irrigation soon and continue monitoring.";
  }

  /*
   * Simple demo water calculation.
   *
   * This is intentionally a preliminary estimate.
   * We will connect crop-specific water requirement
   * and live forecast data next.
   */
  const areaAcres = Number(farm?.area) || 0;

  const waterPerAcre = 1000;

  const estimatedWater =
    recommendation === "WAIT"
      ? 0
      : Math.round(areaAcres * waterPerAcre);

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <PageHeader
        title="Irrigation Optimization"
        subtitle={`${farm?.farmName || "Farm"} · ${crop?.name || "Crop"} · ${areaLabel}`}
        badge={
          <DemoBadge label="AI IRRIGATION RECOMMENDATION" />
        }
      />

      {/* MAIN RECOMMENDATION */}

      <Card className="gap-6 overflow-hidden border-transparent bg-gradient-to-r from-emerald-900 to-green-700 p-6 text-white shadow-lift">

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div>

            <p className="text-sm font-bold uppercase tracking-wide text-white/70">
              Today's Irrigation Decision
            </p>

            <h1 className="mt-2 font-display text-4xl font-extrabold">
              {recommendation}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
              {message}
            </p>

          </div>

          {recommendation === "WAIT" ? (
            <CheckCircle2 className="h-16 w-16 shrink-0 text-white/80" />
          ) : (
            <Droplets className="h-16 w-16 shrink-0 text-white/80" />
          )}

        </div>

      </Card>

      {/* SENSOR + FARM DATA */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={<Droplets className="h-5 w-5 text-sky" />}
          label="Soil Moisture"
          value={`${moisture.toFixed(1)}%`}
          hint={status}
        />

        <StatCard
          icon={<Sprout className="h-5 w-5 text-primary" />}
          label="Crop"
          value={crop?.name || "--"}
          hint="Current crop"
        />

        <StatCard
          icon={<Gauge className="h-5 w-5 text-primary" />}
          label="Farm Area"
          value={areaLabel}
          hint="Saved farm area"
        />

        <StatCard
          icon={<Droplets className="h-5 w-5 text-sky" />}
          label="Estimated Water"
          value={
            estimatedWater > 0
              ? `${estimatedWater.toLocaleString()} L`
              : "0 L"
          }
          hint="Preliminary estimate"
        />

      </div>

      {/* IRRIGATION STATUS */}

      <div className="grid gap-4 lg:grid-cols-2">

        <Card className="gap-4 p-5 shadow-card sm:p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-secondary p-3">
              <Droplets className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold">
                Soil Moisture Status
              </h2>

              <p className="text-sm text-muted-foreground">
                Based on current sensor reading
              </p>
            </div>

          </div>

          <div className="mt-2">

            <div className="mb-2 flex justify-between text-sm font-bold">
              <span>Moisture</span>
              <span>{moisture.toFixed(1)}%</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-secondary">

              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(moisture, 0),
                    100,
                  )}%`,
                }}
              />

            </div>

          </div>

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-sm font-bold">
              {status}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {message}
            </p>

          </div>

        </Card>

        {/* ACTION */}

        <Card className="gap-4 p-5 shadow-card sm:p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-secondary p-3">
              {recommendation === "WAIT" ? (
                <Clock className="h-6 w-6 text-primary" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-warn" />
              )}
            </div>

            <div>
              <h2 className="font-display text-xl font-bold">
                Recommended Action
              </h2>

              <p className="text-sm text-muted-foreground">
                What the farmer should do now
              </p>
            </div>

          </div>

          <div className="rounded-2xl bg-secondary/50 p-5">

            <p className="font-display text-2xl font-extrabold">
              {recommendation}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>

            {estimatedWater > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary">
                <Droplets className="h-4 w-4" />
                Estimated water:{" "}
                {estimatedWater.toLocaleString()} L
              </div>
            )}

          </div>

        </Card>

      </div>

      {/* IMPORTANT DISCLAIMER */}

      <Card className="border-dashed p-4">

        <p className="text-xs leading-relaxed text-muted-foreground">
          💡 This irrigation recommendation currently uses the
          live soil-moisture sensor reading. Weather forecast,
          crop water requirement and farm area will be combined
          in the next optimization step for a more accurate
          irrigation recommendation.
        </p>

      </Card>

    </div>
  );
}