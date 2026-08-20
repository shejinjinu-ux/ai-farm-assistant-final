import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Droplets,
  Wind,
  ThermometerSun,
  CloudRain,
  RefreshCw,
  MapPin,
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
import {
  DemoBadge,
  PageHeader,
  StatCard,
} from "@/components/farm/ui-bits";

import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/app/weather")({
  head: () =>
    pageMeta(
      "Smart Weather Center",
      "Live weather, rainfall and forecast for your saved farm location."
    ),
  component: Weather,
});

/* =========================================================
   RENDER BACKEND URL
   ========================================================= */

const API_BASE_URL =
  "https://ai-farm-backend-v57r.onrender.com";

/* =========================================================
   TYPES
   ========================================================= */

type WeatherData = {
  temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  weather_code: number | null;
  solar_radiation_current: number | null;
};

type ForecastDay = {
  day: string;
  max: number;
  min: number;
  rainfall: number;
  rainProb: number;
  condition: string;
  icon: string;
};

/* =========================================================
   WEATHER CODE
   ========================================================= */

function weatherInfo(code: number | null) {
  if (code === null) {
    return {
      condition: "Weather unavailable",
      icon: "🌤️",
    };
  }

  if (code === 0) {
    return {
      condition: "Clear sky",
      icon: "☀️",
    };
  }

  if (code <= 3) {
    return {
      condition: "Partly cloudy",
      icon: "⛅",
    };
  }

  if (code >= 51 && code <= 67) {
    return {
      condition: "Rain",
      icon: "🌧️",
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      condition: "Snow",
      icon: "❄️",
    };
  }

  if (code >= 80 && code <= 82) {
    return {
      condition: "Rain showers",
      icon: "🌦️",
    };
  }

  if (code >= 95) {
    return {
      condition: "Thunderstorm",
      icon: "⛈️",
    };
  }

  return {
    condition: "Cloudy",
    icon: "☁️",
  };
}

/* =========================================================
   GET FARM LOCATION
   ========================================================= */

function getFarmLocation(): {
  latitude: number;
  longitude: number;
} | null {
  try {
    const possibleKeys = [
      "farm",
      "farmData",
      "savedFarm",
      "farm-data",
    ];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const data = JSON.parse(raw);

      const latitude =
        data?.latitude ??
        data?.location?.latitude ??
        data?.farm?.latitude;

      const longitude =
        data?.longitude ??
        data?.location?.longitude ??
        data?.farm?.longitude;

      if (
        latitude !== undefined &&
        longitude !== undefined &&
        Number(latitude) !== 0 &&
        Number(longitude) !== 0
      ) {
        return {
          latitude: Number(latitude),
          longitude: Number(longitude),
        };
      }
    }
  } catch (error) {
    console.error("Farm location read error:", error);
  }

  return null;
}

/* =========================================================
   FORECAST PARSER
   ========================================================= */

function parseForecast(data: any): ForecastDay[] {
  const daily =
    data?.forecast?.daily ??
    data?.daily ??
    data?.forecast ??
    {};

  const dates =
    daily?.time ??
    [];

  const maxTemps =
    daily?.temperature_2m_max ??
    daily?.max_temperature ??
    [];

  const minTemps =
    daily?.temperature_2m_min ??
    daily?.min_temperature ??
    [];

  const rainfall =
    daily?.precipitation_sum ??
    daily?.rainfall ??
    [];

  const rainProbability =
    daily?.precipitation_probability_max ??
    daily?.rain_probability ??
    [];

  const weatherCodes =
    daily?.weather_code ??
    [];

  if (!Array.isArray(dates)) {
    return [];
  }

  return dates.map((date: string, index: number) => {
    const code =
      weatherCodes[index] !== undefined
        ? Number(weatherCodes[index])
        : null;

    const info = weatherInfo(code);

    const dateObject = new Date(date);

    return {
      day: dateObject.toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
        }
      ),

      max:
        Number(maxTemps[index] ?? 0),

      min:
        Number(minTemps[index] ?? 0),

      rainfall:
        Number(rainfall[index] ?? 0),

      rainProb:
        Number(rainProbability[index] ?? 0),

      condition:
        info.condition,

      icon:
        info.icon,
    };
  });
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function Weather() {
  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [forecast, setForecast] =
    useState<ForecastDay[]>([]);

  const [location, setLocation] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     FETCH WEATHER
     ======================================================= */

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError("");

      let farmLocation =
        getFarmLocation();

      /*
       * If saved farm location is not found,
       * use browser location.
       */

      if (!farmLocation) {
        farmLocation =
          await new Promise<{
            latitude: number;
            longitude: number;
          } | null>((resolve) => {
            if (!navigator.geolocation) {
              resolve(null);
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude:
                    position.coords.latitude,

                  longitude:
                    position.coords.longitude,
                });
              },

              () => {
                resolve(null);
              },

              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
              }
            );
          });
      }

      if (!farmLocation) {
        throw new Error(
          "Farm location is not available."
        );
      }

      setLocation(farmLocation);

      /* ===================================================
         WEATHER
         =================================================== */

      const weatherUrl =
        `${API_BASE_URL}/weather` +
        `?latitude=${farmLocation.latitude}` +
        `&longitude=${farmLocation.longitude}`;

      const weatherResponse =
        await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        const message =
          await weatherResponse.text();

        throw new Error(
          message ||
            `Weather request failed: ${weatherResponse.status}`
        );
      }

      const weatherJson =
        await weatherResponse.json();

      setWeather(
        weatherJson?.weather ?? null
      );

      /* ===================================================
         FORECAST
         =================================================== */

      const forecastUrl =
        `${API_BASE_URL}/forecast` +
        `?latitude=${farmLocation.latitude}` +
        `&longitude=${farmLocation.longitude}`;

      const forecastResponse =
        await fetch(forecastUrl);

      if (forecastResponse.ok) {
        const forecastJson =
          await forecastResponse.json();

        const parsedForecast =
          parseForecast(
            forecastJson
          );

        setForecast(
          parsedForecast
        );
      } else {
        console.warn(
          "Forecast unavailable:",
          forecastResponse.status
        );

        setForecast([]);
      }
    } catch (err) {
      console.error(
        "Weather loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load weather."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD ON PAGE OPEN
     ======================================================= */

  useEffect(() => {
    loadWeather();
  }, []);

  /* =======================================================
     CURRENT WEATHER
     ======================================================= */

  const weatherDetails =
    weatherInfo(
      weather?.weather_code ?? null
    );

  const temperature =
    weather?.temperature;

  const humidity =
    weather?.humidity;

  const rainfall =
    weather?.precipitation;

  const wind =
    weather?.wind_speed;

  const weekRainfall =
    forecast.reduce(
      (sum, day) =>
        sum + Number(day.rainfall || 0),
      0
    );

  const warmestDay =
    forecast.length > 0
      ? forecast.reduce(
          (max, day) =>
            day.max > max.max
              ? day
              : max,
          forecast[0]
        )
      : null;

  const heaviestRainDay =
    forecast.length > 0
      ? forecast.reduce(
          (max, day) =>
            day.rainfall >
            max.rainfall
              ? day
              : max,
          forecast[0]
        )
      : null;

  /* =======================================================
     AI WEATHER INSIGHT
     ======================================================= */

  let weatherInsight =
    "Live weather data is being loaded.";

  if (!loading && weather) {
    if (
      rainfall !== null &&
      rainfall > 5
    ) {
      weatherInsight =
        "Rainfall is currently significant. Avoid unnecessary irrigation and check field drainage.";
    } else if (
      humidity !== null &&
      humidity > 80
    ) {
      weatherInsight =
        "Humidity is high. Monitor the crop for fungal disease and avoid unnecessary leaf wetness.";
    } else if (
      temperature !== null &&
      temperature > 35
    ) {
      weatherInsight =
        "Temperature is high. Monitor crop water demand and avoid heavy field work during peak heat.";
    } else {
      weatherInsight =
        "Current conditions look suitable for normal farm monitoring. Check soil moisture before irrigation.";
    }
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="space-y-6">

      <PageHeader
        title="Smart Weather Center"
        subtitle="Live weather for your saved farm location"
        badge={
          <DemoBadge
            label={
              loading
                ? "Loading Weather..."
                : error
                ? "Weather Unavailable"
                : "Live Farm Weather"
            }
          />
        }
      />

      {/* =================================================
          ERROR
         ================================================= */}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <CloudRain className="mt-1 h-5 w-5 text-destructive" />

            <div>
              <p className="font-bold text-destructive">
                Weather could not be loaded
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                The backend may be waking up or the
                weather service may be temporarily
                rate limited. Please try again shortly.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* =================================================
          REFRESH
         ================================================= */}

      <div className="flex justify-end">
        <button
          onClick={loadWeather}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          {loading
            ? "Loading..."
            : "Refresh Weather"}
        </button>
      </div>

      {/* =================================================
          CURRENT WEATHER
         ================================================= */}

      <Card className="gradient-hero gap-6 border-transparent p-6 text-forest-foreground shadow-lift">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="font-display text-6xl font-extrabold leading-none">
              {temperature !== null &&
              temperature !== undefined
                ? `${temperature}°C`
                : "--"}
            </p>

            <p className="mt-2 text-lg font-bold">
              {weatherDetails.icon}{" "}
              {weatherDetails.condition}
            </p>
          </div>

          {location && (
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />

              Farm:{" "}
              {location.latitude.toFixed(4)},
              {" "}
              {location.longitude.toFixed(4)}
            </div>
          )}
        </div>

        {/* =================================================
            WEATHER STATS
           ================================================= */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl bg-white/12 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
              <Droplets className="h-4 w-4" />
              Humidity
            </p>

            <p className="mt-1 font-display text-lg font-extrabold">
              {humidity !== null &&
              humidity !== undefined
                ? `${humidity}%`
                : "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
              <CloudRain className="h-4 w-4" />
              Rainfall
            </p>

            <p className="mt-1 font-display text-lg font-extrabold">
              {rainfall !== null &&
              rainfall !== undefined
                ? `${rainfall} mm`
                : "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
              <Wind className="h-4 w-4" />
              Wind
            </p>

            <p className="mt-1 font-display text-lg font-extrabold">
              {wind !== null &&
              wind !== undefined
                ? `${wind} km/h`
                : "--"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
              <ThermometerSun className="h-4 w-4" />
              Solar
            </p>

            <p className="mt-1 font-display text-lg font-extrabold">
              {weather?.solar_radiation_current !==
                null &&
              weather?.solar_radiation_current !==
                undefined
                ? `${weather.solar_radiation_current} W/m²`
                : "--"}
            </p>
          </div>

        </div>

        {/* =================================================
            AI INSIGHT
           ================================================= */}

        <div className="flex items-start gap-3 rounded-2xl bg-white/12 p-4">

          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              AI Weather Insight
            </p>

            <p className="mt-1 text-sm">
              {weatherInsight}
            </p>
          </div>

        </div>

      </Card>

      {/* =================================================
          SUMMARY CARDS
         ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          icon={
            <ThermometerSun className="h-5 w-5 text-warn" />
          }
          label="Warmest day"
          value={
            warmestDay
              ? `${warmestDay.max}°C ${warmestDay.day}`
              : "--"
          }
          hint={
            warmestDay
              ? "Plan field work accordingly"
              : "Forecast unavailable"
          }
        />

        <StatCard
          icon={
            <CloudRain className="h-5 w-5 text-sky" />
          }
          label="Heaviest rain"
          value={
            heaviestRainDay
              ? `${heaviestRainDay.rainfall.toFixed(
                  1
                )} mm ${heaviestRainDay.day}`
              : "--"
          }
          hint="Check irrigation requirement"
        />

        <StatCard
          icon={
            <Droplets className="h-5 w-5 text-primary" />
          }
          label="Week rainfall"
          value={
            forecast.length > 0
              ? `${weekRainfall.toFixed(1)} mm`
              : "--"
          }
          hint="Based on live forecast"
        />

      </div>

      {/* =================================================
          7 DAY FORECAST
         ================================================= */}

      <Card className="gap-4 p-5 shadow-card">

        <h2 className="font-display text-xl font-bold">
          7-day forecast
        </h2>

        {forecast.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            7-day forecast is currently unavailable.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

            {forecast.map((day, index) => (

              <div
                key={`${day.day}-${index}`}
                className="rounded-2xl bg-secondary/45 p-4 text-center transition-transform hover:-translate-y-1"
              >

                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {day.day}
                </p>

                <p
                  aria-hidden
                  className="mt-2 text-3xl"
                >
                  {day.icon}
                </p>

                <p className="mt-2 font-display text-base font-extrabold">
                  {day.max}° / {day.min}°
                </p>

                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  {day.condition}
                </p>

                <p className="mt-1 text-[11px] font-bold text-sky">
                  💧 {day.rainProb}%
                </p>

                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  {day.rainfall.toFixed(1)} mm
                </p>

              </div>

            ))}

          </div>
        )}

      </Card>

      {/* =================================================
          RAINFALL CHART
         ================================================= */}

      <Card className="gap-4 p-5 shadow-card">

        <h2 className="font-display text-xl font-bold">
          Expected rainfall this week
        </h2>

        <div className="h-60 w-full">

          {forecast.length === 0 ? (

            <div className="flex h-full items-center justify-center text-muted-foreground">
              Rainfall forecast unavailable.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={forecast}
              >

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
                  unit=" mm"
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

                <Bar
                  dataKey="rainfall"
                  name="Rainfall (mm)"
                  fill="var(--chart-3)"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

      </Card>

    </div>
  );
}