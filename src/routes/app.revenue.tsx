import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  ReceiptText,
  Wheat,
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
} from "recharts";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  DemoBadge,
  PageHeader,
  StatCard,
  Disclaimer,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/revenue")({
  head: () =>
    pageMeta(
      "Revenue & Profit",
      "Estimated farm revenue, costs and profit based on AI predicted yield."
    ),

  component: Revenue,
});

function Revenue() {
  const { farm, crop, areaHa } = useFarm();

  const [predictedYield, setPredictedYield] =
    useState<number>(0);

  const [loading, setLoading] =
    useState(false);

  /*
   * ========================================================
   * AI YIELD PREDICTION
   * ========================================================
   */

  const getPrediction = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://ai-farm-backend-v57r.onrender.com/predict",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            state: farm?.state ?? "Tamil Nadu",

            district:
              farm?.district ?? "Madurai",

            crop:
              crop?.name ?? "Wheat",

            area:
              Number(areaHa) || 1,

            /*
             * Demo sensor values.
             * These can later be replaced by
             * actual sensor values.
             */

            N: 40,
            P: 30,
            K: 35,

            temperature: 27.7,
            humidity: 65,
            ph: 6.5,
            rainfall: 500,
            wind_speed: 20.6,
            solar_radiation: 0,

            soil_type: "Laterite",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Prediction API failed"
        );
      }

      const data =
        await response.json();

      console.log(
        "REVENUE PREDICTION RESPONSE:",
        data
      );

      if (
        data?.success &&
        data?.expected_yield_per_hectare != null
      ) {
        /*
         * Backend returns KG / hectare.
         *
         * Convert:
         *
         * KG / ha
         *      ↓
         * Tons / ha
         */

        const yieldTonsPerHa =
          Number(
            data.expected_yield_per_hectare
          ) / 1000;

        setPredictedYield(
          yieldTonsPerHa
        );
      } else {
        setPredictedYield(2.5);
      }
    } catch (error) {
      console.error(
        "Revenue prediction error:",
        error
      );

      /*
       * Safe demo fallback.
       */

      setPredictedYield(2.5);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * RUN AI PREDICTION
   * ========================================================
   */

  useEffect(() => {
    getPrediction();
  }, [
    areaHa,
    crop?.name,
    farm?.state,
    farm?.district,
  ]);

  /*
   * ========================================================
   * TOTAL PRODUCTION
   * ========================================================
   *
   * predictedYield = tons / hectare
   *
   * production =
   * tons / hectare × hectares
   */

  const production = useMemo(() => {
    return (
      predictedYield *
      Number(areaHa || 0)
    );
  }, [
    predictedYield,
    areaHa,
  ]);

  /*
   * ========================================================
   * CROP PRICE
   * ========================================================
   *
   * crop.price = ₹ / quintal
   *
   * 1 ton = 10 quintals
   *
   * Revenue =
   *
   * production × 10 × price
   */

  const cropPrice = Number(
    crop?.price || 0
  );

  const revenue = useMemo(() => {
    return Math.round(
      production *
        10 *
        cropPrice
    );
  }, [
    production,
    cropPrice,
  ]);

  /*
   * ========================================================
   * ESTIMATED FARM COST
   * ========================================================
   *
   * Instead of a fixed ₹34,000 / hectare,
   * we estimate the total farming cost based
   * on the expected revenue.
   *
   * This keeps the demo economics proportional
   * to the actual predicted production.
   *
   * Total estimated cost = 60% of revenue
   */

  const totalCost = useMemo(() => {
    if (revenue <= 0) {
      return 0;
    }

    return Math.round(
      revenue * 0.60
    );
  }, [revenue]);

  /*
   * ========================================================
   * COST BREAKDOWN
   * ========================================================
   *
   * Total cost is divided into practical
   * farming expense categories.
   */

  const costs = useMemo(() => {
    return {
      Seeds: Math.round(
        totalCost * 0.20
      ),

      Fertilizer: Math.round(
        totalCost * 0.25
      ),

      Irrigation: Math.round(
        totalCost * 0.20
      ),

      "Crop care": Math.round(
        totalCost * 0.20
      ),

      "Other costs": Math.round(
        totalCost * 0.15
      ),
    };
  }, [totalCost]);

  /*
   * ========================================================
   * PROFIT
   * ========================================================
   */

  const profit = useMemo(() => {
    return revenue - totalCost;
  }, [
    revenue,
    totalCost,
  ]);

  /*
   * ========================================================
   * PROFIT MARGIN
   * ========================================================
   */

  const profitMargin = useMemo(() => {
    if (revenue <= 0) {
      return 0;
    }

    return (
      (profit / revenue) *
      100
    );
  }, [
    profit,
    revenue,
  ]);

  /*
   * ========================================================
   * WHAT-IF OPTIMIZATION
   * ========================================================
   *
   * Assume optimized farming practices
   * improve production by 10%.
   */

  const optimizedProduction =
    production * 1.10;

  const optimizedRevenue =
    Math.round(
      optimizedProduction *
        10 *
        cropPrice
    );

  /*
   * Optimized cost is slightly higher because
   * better irrigation / fertilizer / crop care
   * may require additional input.
   */

  const optimizedCost =
    Math.round(
      optimizedRevenue * 0.62
    );

  const optimizedProfit =
    optimizedRevenue -
    optimizedCost;

  const additionalRevenue =
    optimizedRevenue -
    revenue;

  const additionalProfit =
    optimizedProfit -
    profit;

  /*
   * ========================================================
   * CHART DATA
   * ========================================================
   */

  const costData =
    Object.entries(costs).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

  /*
   * ========================================================
   * MONEY FORMAT
   * ========================================================
   */

  const money = (
    value: number
  ) =>
    `₹${Math.round(
      value
    ).toLocaleString(
      "en-IN"
    )}`;

  /*
   * ========================================================
   * UI
   * ========================================================
   */

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <PageHeader
        title="Revenue & Profit"
        subtitle={`${farm?.farmName ?? "My Farm"} · ${
          crop?.name ?? "Crop"
        } · ${areaHa} hectares`}
        badge={
          <DemoBadge label="AI Estimate" />
        }
      />

      {/* ================================================== */}
      {/* REFRESH */}
      {/* ================================================== */}

      <div className="flex justify-end">

        <Button
          onClick={getPrediction}
          disabled={loading}
          className="rounded-full bg-primary px-6 font-bold"
        >

          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          {loading
            ? "Updating AI Estimate..."
            : "Refresh AI Estimate"}

        </Button>

      </div>

      {/* ================================================== */}
      {/* MAIN STATS */}
      {/* ================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          icon={
            <IndianRupee className="h-5 w-5 text-leaf" />
          }
          label="Expected revenue"
          value={money(revenue)}
          hint="Based on AI predicted production"
        />

        <StatCard
          icon={
            <ReceiptText className="h-5 w-5 text-earth" />
          }
          label="Estimated cost"
          value={money(totalCost)}
          hint="Estimated farming expenses"
        />

        <StatCard
          tone="hero"
          icon={
            <TrendingUp className="h-5 w-5" />
          }
          label="Estimated profit"
          value={money(profit)}
          hint={`${profitMargin.toFixed(
            1
          )}% profit margin`}
        />

      </div>

      {/* ================================================== */}
      {/* PRODUCTION + COST */}
      {/* ================================================== */}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* PRODUCTION */}

        <Card className="gap-4 p-5 shadow-card">

          <h2 className="font-display text-xl font-bold">
            Production estimate
          </h2>

          <div className="rounded-2xl bg-secondary/50 p-4">

            <Wheat className="h-6 w-6 text-leaf" />

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Predicted yield
            </p>

            <p className="mt-1 font-display text-3xl font-extrabold">
              {predictedYield.toFixed(
                2
              )}{" "}
              t/ha
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {production.toFixed(
                2
              )} tons across{" "}
              {areaHa} ha
            </p>

          </div>

          <div className="rounded-2xl border p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Crop market price
            </p>

            <p className="mt-1 font-display text-xl font-extrabold">
              {money(
                cropPrice
              )} /{" "}
              {crop?.unit ??
                "quintal"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              1 ton = 10 quintals
            </p>

          </div>

        </Card>

        {/* COST CHART */}

        <Card className="gap-4 p-5 shadow-card lg:col-span-2">

          <h2 className="font-display text-xl font-bold">
            Cost breakdown
          </h2>

          <div className="h-64 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={costData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />

                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />

                <Tooltip
                  formatter={(
                    value: number
                  ) =>
                    money(value)
                  }
                />

                <Bar
                  dataKey="value"
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

        </Card>

      </div>

      {/* ================================================== */}
      {/* SEASON ECONOMICS */}
      {/* ================================================== */}

      <Card className="p-5 shadow-card">

        <h2 className="font-display text-xl font-bold">
          Estimated farm economics
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Estimated farm economics based on AI
          predicted production.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* PRODUCTION */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Expected production
            </p>

            <p className="mt-2 font-display text-2xl font-extrabold">
              {(
                production *
                1000
              ).toFixed(0)}{" "}
              kg
            </p>

          </div>

          {/* PRICE */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Crop price
            </p>

            <p className="mt-2 font-display text-2xl font-extrabold">
              {money(
                cropPrice
              )}
            </p>

            <p className="text-xs text-muted-foreground">
              per quintal
            </p>

          </div>

          {/* REVENUE */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estimated revenue
            </p>

            <p className="mt-2 font-display text-2xl font-extrabold">
              {money(
                revenue
              )}
            </p>

          </div>

          {/* COST */}

          <div className="rounded-2xl bg-secondary/50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estimated cost
            </p>

            <p className="mt-2 font-display text-2xl font-extrabold">
              {money(
                totalCost
              )}
            </p>

          </div>

        </div>

        {/* PROFIT */}

        <div className="mt-4 rounded-2xl border p-5">

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estimated profit
          </p>

          <p
            className={`mt-2 font-display text-4xl font-extrabold ${
              profit >= 0
                ? "text-primary"
                : "text-destructive"
            }`}
          >
            {money(profit)}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Revenue minus estimated farming
            cost.
          </p>

          <p className="mt-2 text-sm font-semibold">
            Profit margin:{" "}
            {profitMargin.toFixed(
              1
            )}
            %
          </p>

        </div>

      </Card>

      {/* ================================================== */}
      {/* WHAT-IF */}
      {/* ================================================== */}

      <Card className="border-primary/20 bg-primary/5 p-5 shadow-card">

        <div className="flex items-center gap-3">

          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">

            <TrendingUp className="h-5 w-5 text-primary" />

          </div>

          <div>

            <h2 className="font-display text-xl font-bold">
              What-If: Optimized Conditions
            </h2>

            <p className="text-sm text-muted-foreground">
              If optimized farming practices
              improve production by approximately
              10%.
            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-background/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current production
            </p>

            <p className="mt-1 font-display text-xl font-extrabold">
              {production.toFixed(
                2
              )} t
            </p>

          </div>

          <div className="rounded-2xl bg-background/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Optimized production
            </p>

            <p className="mt-1 font-display text-xl font-extrabold">
              {optimizedProduction.toFixed(
                2
              )} t
            </p>

          </div>

          <div className="rounded-2xl bg-background/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Optimized revenue
            </p>

            <p className="mt-1 font-display text-xl font-extrabold">
              {money(
                optimizedRevenue
              )}
            </p>

          </div>

          <div className="rounded-2xl bg-background/70 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Optimized profit
            </p>

            <p className="mt-1 font-display text-xl font-extrabold text-primary">
              {money(
                optimizedProfit
              )}
            </p>

          </div>

        </div>

        {/* ADDITIONAL VALUE */}

        <div className="mt-4 rounded-2xl bg-background/70 p-4">

          <p className="text-sm">
            Possible additional revenue:
          </p>

          <p className="mt-1 font-display text-2xl font-extrabold text-primary">
            +{money(
              additionalRevenue
            )}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Possible additional profit:
            <span className="ml-1 font-semibold text-foreground">
              +{money(
                additionalProfit
              )}
            </span>
          </p>

        </div>

      </Card>

      {/* ================================================== */}
      {/* FORMULA */}
      {/* ================================================== */}

      <Card className="p-5 shadow-card">

        <h2 className="font-display text-xl font-bold">
          How revenue is estimated
        </h2>

        <div className="mt-4 rounded-2xl bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">

          <p>
            AI predicts expected crop yield using
            the selected crop, farm area, soil,
            sensor and weather information.
          </p>

          <p className="mt-2">
            The predicted production is then
            converted into estimated sales using
            the selected crop price.
          </p>

          <p className="mt-2 font-semibold text-foreground">
            Revenue = Production × 10 ×
            Price per quintal
          </p>

          <p className="mt-1">
            because 1 ton = 10 quintals.
          </p>

          <p className="mt-2 font-semibold text-foreground">
            Profit = Revenue − Estimated Cost
          </p>

        </div>

      </Card>

      {/* ================================================== */}
      {/* DISCLAIMER */}
      {/* ================================================== */}

      <Disclaimer
        text="Revenue and profit figures are AI-assisted estimates based on predicted yield, selected crop price and estimated farming costs. Actual market prices, production and expenses may vary by location, season, crop and farming practices."
      />

    </div>
  );
}