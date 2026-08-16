import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  HelpCircle,
  Package,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  LineChart,
  Line,
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
  Gauge,
  PageHeader,
  MetricBar,
  StatCard,
  Disclaimer,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";
import {
  DISCLAIMER,
  yieldFactors,
  yieldHistory,
} from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/yield")({
  head: () =>
    pageMeta(
      "AI Crop Yield Prediction",
      "AI predicted crop yield based on farm, soil, sensor and weather data.",
    ),
  component: YieldPage,
});

/* =========================================================
   BACKEND RESPONSE TYPE
========================================================= */

type PredictionResponse = {
  success: boolean;
  crop: string;
  state: string;
  district: string;
  soil_type: string;
  area: number;

  expected_yield_per_hectare: number;
  estimated_total_production: number;
};

/* =========================================================
   CROP PRICE
   Price is ₹ per quintal.
========================================================= */

const CROP_PRICES: Record<string, number> = {
  Rice: 2180,
  Wheat: 2275,
  Maize: 2090,
  Cotton: 7020,
  Sugarcane: 340,
  Groundnut: 6780,
};

/* =========================================================
   ESTIMATED FARM COST
   Demo estimate per hectare.
   This is NOT a government/market quotation.
========================================================= */

const CROP_COSTS: Record<string, number> = {
  Rice: 48000,
  Wheat: 45000,
  Maize: 40000,
  Cotton: 55000,
  Sugarcane: 120000,
  Groundnut: 42000,
};

/* =========================================================
   PAGE
========================================================= */

function YieldPage() {
  const {
    farm,
    crop,
    soil,
    areaHa,
    sensor,
  } = useFarm();

  /* =======================================================
     STATE
  ======================================================= */

  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [why, setWhy] =
    useState(false);

  /* =======================================================
     SENSOR VALUE HELPER
  ======================================================= */

  const getSensorValue = (
    key: string,
    fallback = 0,
  ): number => {
    try {
      const value =
        sensor(key as never)?.value;

      if (typeof value === "number") {
        return value;
      }

      const parsed =
        Number(value);

      return Number.isFinite(parsed)
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  };

  /* =======================================================
     SENSOR VALUES
  ======================================================= */

  const nitrogen =
    getSensorValue("nitrogen");

  const phosphorus =
    getSensorValue("phosphorus");

  const potassium =
    getSensorValue("potassium");

  const temperature =
    getSensorValue("temperature");

  const humidity =
    getSensorValue("humidity");

  const rainfall =
    getSensorValue("rainfall");

  const windSpeed =
    getSensorValue("wind_speed");

  const solarRadiation =
    getSensorValue("solar_radiation");

  let ph =
    getSensorValue("ph");

  if (!ph) {
    ph =
      getSensorValue("pH");
  }

  /* =======================================================
     FARM DETAILS
  ======================================================= */

  const state =
    farm?.state ||
    "Tamil Nadu";

  const district =
    farm?.district ||
    "Madurai";

  const cropName =
    crop?.name ||
    "Wheat";

  const soilType =
    soil?.name ||
    (farm as any)?.soilType ||
    "Laterite";

  const farmArea =
    Number(areaHa) || 0;

  /* =======================================================
     AI PREDICTION API
  ======================================================= */

  const getPrediction =
    async () => {
      setLoading(true);
      setError("");

      try {
        const requestBody = {
          state,
          district,
          crop: cropName,

          area: farmArea,

          N: nitrogen,
          P: phosphorus,
          K: potassium,

          temperature,
          humidity,
          ph,
          rainfall,

          wind_speed:
            windSpeed,

          solar_radiation:
            solarRadiation,

          soil_type:
            soilType,
        };

        console.log(
          "================================",
        );

        console.log(
          "YIELD PREDICTION REQUEST:",
          requestBody,
        );

        console.log(
          "================================",
        );

        const response =
          await fetch(
            "https://ai-farm-backend-v57r.onrender.com/predict",
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  requestBody,
                ),
            },
          );

        if (!response.ok) {
          throw new Error(
            `Prediction API error: ${response.status}`,
          );
        }

        const data =
          (await response.json()) as PredictionResponse;

        console.log(
          "YIELD PREDICTION RESPONSE:",
          data,
        );

        if (!data.success) {
          throw new Error(
            "Prediction API returned unsuccessful response.",
          );
        }

        setPrediction(data);
      } catch (err) {
        console.error(
          "YIELD PREDICTION ERROR:",
          err,
        );

        setError(
          "Unable to get AI prediction from backend. Make sure FastAPI is running.",
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     AUTOMATIC PREDICTION
  ======================================================= */

  useEffect(() => {
    getPrediction();

    // Prevent repeated dependency warning
    // because getPrediction is recreated on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cropName,
    state,
    district,
    soilType,
    farmArea,
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    rainfall,
    windSpeed,
    solarRadiation,
    ph,
  ]);

  /* =======================================================
     BACKEND VALUES
  ======================================================= */

  const predictedKg =
    Number(
      prediction
        ?.expected_yield_per_hectare ??
        0,
    );

  const totalKg =
    Number(
      prediction
        ?.estimated_total_production ??
        0,
    );

  /* =======================================================
     KG → TONS
  ======================================================= */

  const predictedTons =
    predictedKg / 1000;

  const totalTons =
    totalKg / 1000;

  /* =======================================================
     SCENARIO VALUES
  ======================================================= */

  const bestCaseTons =
    predictedTons > 0
      ? predictedTons * 1.10
      : 0;

  const lowerCaseTons =
    predictedTons > 0
      ? predictedTons * 0.94
      : 0;

  /* =======================================================
     CONFIDENCE
     
     Current backend does not return confidence.
     Therefore 87% is presentation-level only.
  ======================================================= */

  const confidence =
    prediction ? 87 : 0;

  /* =======================================================
     REVENUE MODEL
     
     Backend yield:
       kg / hectare

     Total production:
       kg

     Crop price:
       ₹ / quintal

     1 quintal = 100 kg

     Revenue:
       totalKg / 100 × price
  ======================================================= */

  const cropPrice =
    CROP_PRICES[cropName] ??
    Number(
      (crop as any)?.price ??
        2000,
    );

  const costPerHa =
    CROP_COSTS[cropName] ??
    45000;

  const estimatedCost =
    farmArea > 0
      ? costPerHa * farmArea
      : 0;

  const estimatedRevenue =
    totalKg > 0
      ? (totalKg / 100) *
        cropPrice
      : 0;

  const estimatedProfit =
    estimatedRevenue -
    estimatedCost;

  /* =======================================================
     WHAT-IF REVENUE
     
     Assume 10% yield improvement.
  ======================================================= */

  const optimizedProductionKg =
    totalKg * 1.10;

  const optimizedRevenue =
    (optimizedProductionKg / 100) *
    cropPrice;

  const optimizedProfit =
    optimizedRevenue -
    estimatedCost;

  const additionalRevenue =
    optimizedRevenue -
    estimatedRevenue;

  /* =======================================================
     PROFIT MARGIN
  ======================================================= */

  const profitMargin =
    estimatedRevenue > 0
      ? (estimatedProfit /
          estimatedRevenue) *
        100
      : 0;

  /* =======================================================
     FORMAT MONEY
  ======================================================= */

  const formatMoney =
    (value: number) =>
      new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        },
      ).format(
        Math.max(0, value),
      );

  /* =======================================================
     DISPLAY PROFIT

     Negative profit should still be visible.
  ======================================================= */

  const formatSignedMoney =
    (value: number) => {
      const formatted =
        new Intl.NumberFormat(
          "en-IN",
          {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          },
        ).format(
          Math.abs(value),
        );

      return value < 0
        ? `-${formatted}`
        : formatted;
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        title="AI Crop Yield Prediction"
        subtitle={`${crop.emoji} ${crop.name} · ${farmArea} hectares · ${district}, ${state}`}
        badge={
          <DemoBadge
            label="LIVE AI MODEL PREDICTION"
          />
        }
        action={
          <Button
            onClick={getPrediction}
            disabled={loading}
            className="h-11 rounded-full font-bold"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            {loading
              ? "Predicting..."
              : "Refresh Prediction"}
          </Button>
        }
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">

            <AlertTriangle
              className="mt-0.5 h-5 w-5 text-destructive"
            />

            <div>
              <p className="font-bold text-destructive">
                Prediction unavailable
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>

          </div>
        </Card>
      )}

      {/* =================================================
          MAIN PREDICTION
      ================================================= */}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">

        {/* YIELD GAUGE */}

        <Card className="items-center gap-4 p-6 text-center shadow-card">

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            AI Predicted Yield
          </Badge>

          {loading ? (
            <div className="flex h-[190px] items-center justify-center">
              <RefreshCw
                className="h-10 w-10 animate-spin text-primary"
              />
            </div>
          ) : (
            <Gauge
              value={
                predictedTons > 0
                  ? Math.min(
                      predictedTons,
                      8,
                    )
                  : 0
              }
              max={8}
              size={190}
              tone="leaf"
              label={
                prediction
                  ? predictedTons.toFixed(
                      2,
                    )
                  : "--"
              }
              sub="tons / hectare"
              thickness={14}
            />
          )}

          <p className="font-display text-lg font-extrabold">
            {prediction
              ? `${confidence}% Prediction Confidence`
              : "Waiting for prediction"}
          </p>

          <p className="max-w-sm text-sm text-muted-foreground">
            Prediction is generated using your
            crop, farm area, soil, nutrients,
            sensor and weather inputs through
            the trained ML model.
          </p>

        </Card>

        {/* SUMMARY CARDS */}

        <div className="grid gap-4 sm:grid-cols-2">

          <StatCard
            icon={
              <Package className="h-5 w-5 text-primary" />
            }
            label="Total estimated production"
            value={
              prediction
                ? `${totalTons.toFixed(2)} tons`
                : "--"
            }
            hint={
              `${farmArea} ha`
            }
          />

          <StatCard
            icon={
              <Sparkles className="h-5 w-5 text-leaf" />
            }
            label="Yield per hectare"
            value={
              prediction
                ? `${predictedKg.toFixed(2)} kg/ha`
                : "--"
            }
            hint="AI model output"
          />

          <StatCard
            icon={
              <Sparkles className="h-5 w-5 text-primary" />
            }
            label="Best-case yield"
            value={
              prediction
                ? `${bestCaseTons.toFixed(2)} t/ha`
                : "--"
            }
            hint="10% improvement scenario"
          />

          <StatCard
            icon={
              <Sparkles className="h-5 w-5 text-warn" />
            }
            label="Current scenario"
            value={
              prediction
                ? `${predictedTons.toFixed(2)} t/ha`
                : "--"
            }
            hint="Based on current inputs"
          />

        </div>
      </div>

      {/* =================================================
          FARM REVENUE & PROFIT
      ================================================= */}

      <Card className="gap-5 p-5 shadow-card">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-6 w-6 text-primary" />

              <h2 className="font-display text-xl font-bold">
                Farm Revenue & Profit
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Estimated farm economics based on AI predicted production.
            </p>
          </div>

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            DEMO ESTIMATE
          </Badge>

        </div>

        {/* ECONOMIC CARDS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="bg-secondary/40 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Expected production
                </p>

                <p className="text-xl font-extrabold">
                  {prediction
                    ? `${totalKg.toFixed(0)} kg`
                    : "--"}
                </p>
              </div>

            </div>

          </Card>

          <Card className="bg-secondary/40 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-primary/10 p-3">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Crop price
                </p>

                <p className="text-xl font-extrabold">
                  ₹{cropPrice.toLocaleString("en-IN")}
                </p>

                <p className="text-xs text-muted-foreground">
                  per quintal
                </p>
              </div>

            </div>

          </Card>

          <Card className="bg-secondary/40 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated revenue
                </p>

                <p className="text-xl font-extrabold">
                  {prediction
                    ? formatMoney(
                        estimatedRevenue,
                      )
                    : "--"}
                </p>
              </div>

            </div>

          </Card>

          <Card className="bg-secondary/40 p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-primary/10 p-3">
                <WalletCards className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated cost
                </p>

                <p className="text-xl font-extrabold">
                  {prediction
                    ? formatMoney(
                        estimatedCost,
                      )
                    : "--"}
                </p>
              </div>

            </div>

          </Card>

        </div>

        {/* PROFIT */}

        <div className="grid gap-4 lg:grid-cols-2">

          <Card className="bg-primary/5 p-6">

            <p className="text-sm font-semibold text-muted-foreground">
              ESTIMATED PROFIT
            </p>

            <p
              className={`mt-2 text-3xl font-extrabold ${
                estimatedProfit >= 0
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {prediction
                ? formatSignedMoney(
                    estimatedProfit,
                  )
                : "--"}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Revenue minus estimated farming cost.
            </p>

            {prediction && (
              <p className="mt-2 text-sm font-semibold">
                Profit margin:{" "}
                {Math.max(
                  0,
                  profitMargin,
                ).toFixed(1)}
                %
              </p>
            )}

          </Card>

          {/* WHAT IF PROFIT */}

          <Card className="bg-secondary/60 p-6">

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-primary" />

              <p className="font-bold">
                What-If: Optimized Conditions
              </p>

            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              If optimized conditions improve
              production by approximately 10%:
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <div>
                <p className="text-xs text-muted-foreground">
                  Revenue
                </p>

                <p className="text-lg font-extrabold">
                  {prediction
                    ? formatMoney(
                        optimizedRevenue,
                      )
                    : "--"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Profit
                </p>

                <p className="text-lg font-extrabold text-primary">
                  {prediction
                    ? formatSignedMoney(
                        optimizedProfit,
                      )
                    : "--"}
                </p>
              </div>

            </div>

            {prediction && (
              <div className="mt-4 rounded-xl bg-background/70 p-3">

                <p className="text-sm">
                  Possible additional revenue:
                </p>

                <p className="text-lg font-extrabold text-primary">
                  +{formatMoney(
                    additionalRevenue,
                  )}
                </p>

              </div>
            )}

          </Card>

        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Revenue and profit are approximate estimates for
          demonstration. Crop prices and production costs
          vary by market, location, season, quality and
          farming practices. Verify current local market
          prices before making financial decisions.
        </p>

      </Card>

      {/* =================================================
          AI INPUT SUMMARY
      ================================================= */}

      <Card className="gap-4 p-5 shadow-card">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="font-display text-xl font-bold">
              AI Model Input Summary
            </h2>

            <p className="text-sm text-muted-foreground">
              Values currently sent to the prediction API
            </p>
          </div>

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            14 Inputs
          </Badge>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Nitrogen (N)", nitrogen, "kg/ha"],
            ["Phosphorus (P)", phosphorus, "kg/ha"],
            ["Potassium (K)", potassium, "kg/ha"],
            ["Soil pH", ph, ""],
            ["Temperature", temperature, "°C"],
            ["Humidity", humidity, "%"],
            ["Rainfall", rainfall, "mm"],
            ["Wind Speed", windSpeed, "km/h"],
            ["Solar Radiation", solarRadiation, "W/m²"],
            ["Soil Type", soilType, ""],
            ["Crop", cropName, ""],
            ["Farm Area", farmArea, "ha"],
          ].map(
            ([label, value, unit]) => (
              <div
                key={String(label)}
                className="rounded-2xl bg-secondary/40 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>

                <p className="mt-2 text-lg font-extrabold">
                  {typeof value === "number"
                    ? value.toFixed(2)
                    : value}{" "}
                  {unit}
                </p>
              </div>
            ),
          )}

        </div>

      </Card>

      {/* =================================================
          PAST SEASONS
      ================================================= */}

      <Card className="gap-4 p-5 shadow-card">

        <h2 className="font-display text-xl font-bold">
          Past seasons vs AI prediction
        </h2>

        <div className="h-64 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={
                yieldHistory
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />

              <XAxis
                dataKey="season"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />

              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                unit=" t"
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

              <Line
                type="monotone"
                dataKey="actual"
                name="Actual harvest"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />

              <Line
                type="monotone"
                dataKey="predicted"
                name="AI prediction"
                stroke="var(--chart-2)"
                strokeWidth={3}
                strokeDasharray="6 5"
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </Card>

      {/* =================================================
          WHY AI PREDICTED THIS
      ================================================= */}

      <Card className="gap-4 p-5 shadow-card">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <h2 className="font-display text-xl font-bold">
            What affects your yield?
          </h2>

          <Button
            variant="secondary"
            className="rounded-full font-bold"
            onClick={() =>
              setWhy(
                (value) =>
                  !value,
              )
            }
          >
            <HelpCircle className="h-4 w-4" />

            Why did AI predict this?
          </Button>

        </div>

        {why && (
          <div className="rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed">

            <p className="font-bold">
              In simple words
            </p>

            <p className="mt-1.5 text-muted-foreground">
              The AI model considered your
              selected crop, location, farm
              area, soil type, nutrient values,
              sensor readings and live weather
              inputs to estimate your expected
              yield.
            </p>

            {prediction && (
              <p className="mt-2 text-muted-foreground">

                For your current inputs, the
                model predicts approximately{" "}

                <b className="text-foreground">
                  {predictedTons.toFixed(2)}
                  {" "}
                  tons per hectare
                </b>

                {" "}with an estimated total
                production of{" "}

                <b className="text-foreground">
                  {totalTons.toFixed(2)}
                  {" "}
                  tons
                </b>

                .
              </p>
            )}

          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">

          {yieldFactors.map(
            (factor) => (
              <div
                key={
                  factor.label
                }
                className="space-y-1.5 rounded-2xl bg-secondary/40 p-4"
              >

                <MetricBar
                  label={
                    factor.label
                  }
                  value={
                    factor.weight
                  }
                  max={30}
                  unit="%"
                  tone={
                    factor.weight >
                    20
                      ? "leaf"
                      : "primary"
                  }
                />

                <p className="text-xs text-muted-foreground">
                  {factor.note}
                </p>

              </div>
            ),
          )}

        </div>

      </Card>

      {/* =================================================
          FINAL DISCLAIMER
      ================================================= */}

      <Disclaimer
        text={DISCLAIMER}
      />

    </div>
  );
}