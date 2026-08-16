import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Droplets,
  Wind,
  ThermometerSun,
  CloudRain,
  Sun,
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
import { DemoBadge, PageHeader, StatCard } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/weather")({
  head: () =>
    pageMeta(
      "Smart Weather Center",
      "Live weather, rainfall and forecast for your saved farm location.",
    ),
  component: Weather,
});

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://ai-farm-backend-v57r.onrender.com";

type CurrentWeather = {
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  solar_radiation_current: number;
};

type ForecastDay = {
  date: string;
  max_temperature: number;
  min_temperature: number;
  precipitation_mm: number;
  rain_probability: number;
  weather_code: number;
};

type WeatherResponse = {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  weather: CurrentWeather;
  timezone: string;
  updated_at: string;
};

type ForecastResponse = {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  tomorrow?: {
    date: string;
    max_temperature: number;
    min_temperature: number;
    precipitation_mm: number;
    rain_probability: number;
    weather_code: number;
    tomorrow_rain_expected?: boolean;
  };
  forecast: ForecastDay[];
  timezone: string;
};

function weatherText(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Cloudy";
}

function weatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "☁️";
}

function dayName(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function getWeatherInsight(
  weather: CurrentWeather,
  forecast: ForecastDay[],
) {
  if (!forecast.length) {
    return "Current weather conditions can be used together with soil moisture to plan irrigation.";
  }

  const tomorrow = forecast[1] ?? forecast[0];

  if (tomorrow && tomorrow.rain_probability >= 60) {
    return `Rain is likely soon (${tomorrow.rain_probability}% probability). Consider reducing or delaying irrigation.`;
  }

  if (weather.humidity >= 80) {
    return "High humidity is present. Monitor crop conditions and avoid unnecessary irrigation.";
  }

  if (weather.temperature >= 35) {
    return "High temperature detected. Monitor soil moisture closely and consider irrigation during cooler hours.";
  }

  if (weather.precipitation > 0) {
    return "Rainfall has been recorded. Check soil moisture before applying additional irrigation.";
  }

  return "Current weather conditions can be used together with soil moisture to plan irrigation.";
}

function Weather() {
  const { farm } = useFarm();

  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         * Farm location comes from the saved farm.
         */
        const latitude = Number(farm?.latitude);
        const longitude = Number(farm?.longitude);

        console.log("Selected farm:", farm);
        console.log("Farm GPS:", latitude, longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          setError("Farm location is not available.");
          setWeather(null);
          setForecast([]);
          return;
        }

        /*
         * CURRENT WEATHER
         */
        const weatherUrl =
          `${API_BASE}/weather` +
          `?latitude=${encodeURIComponent(latitude)}` +
          `&longitude=${encodeURIComponent(longitude)}`;

        console.log("Weather API:", weatherUrl);

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
          throw new Error(
            `Weather API error: ${weatherResponse.status}`,
          );
        }

        const weatherData: WeatherResponse =
          await weatherResponse.json();

        console.log("Weather API response:", weatherData);

        if (!weatherData.success || !weatherData.weather) {
          throw new Error("Invalid weather response");
        }

        setWeather(weatherData.weather);

        /*
         * 7-DAY FORECAST
         */
        const forecastUrl =
          `${API_BASE}/forecast` +
          `?latitude=${encodeURIComponent(latitude)}` +
          `&longitude=${encodeURIComponent(longitude)}`;

        console.log("Forecast API:", forecastUrl);

        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
          throw new Error(
            `Forecast API error: ${forecastResponse.status}`,
          );
        }

        const forecastData: ForecastResponse =
          await forecastResponse.json();

        console.log("Forecast API response:", forecastData);

        if (forecastData.success && Array.isArray(forecastData.forecast)) {
          setForecast(forecastData.forecast);
        } else {
          setForecast([]);
        }
      } catch (err) {
        console.error("Weather loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load weather data.",
        );

        setWeather(null);
        setForecast([]);
      } finally {
        setLoading(false);
      }
    }

    if (farm) {
      loadWeather();
    }
  }, [farm]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Smart Weather Center"
          subtitle="Live weather for your saved farm location"
          badge={<DemoBadge label="LOADING WEATHER..." />}
        />

        <Card className="flex min-h-72 items-center justify-center p-6">
          <div className="text-center">
            <CloudRain className="mx-auto h-12 w-12 animate-pulse text-primary" />

            <p className="mt-4 text-lg font-bold">
              Loading live weather...
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Fetching weather for your saved farm location.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /*
   * ERROR / LOCATION MISSING
   */
  if (error || !weather) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Smart Weather Center"
          subtitle="Live weather for your saved farm location"
          badge={<DemoBadge label="WEATHER UNAVAILABLE" />}
        />

        <Card className="flex min-h-72 items-center justify-center p-6">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary" />

            <h2 className="mt-4 font-display text-2xl font-bold">
              Farm location is not available.
            </h2>

            <p className="mt-2 text-muted-foreground">
              {error ||
                "Please make sure your farm has a valid latitude and longitude."}
            </p>

            <p className="mt-4 text-xs text-muted-foreground">
              Backend: {API_BASE}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const insight = getWeatherInsight(weather, forecast);

  const chartData = forecast.map((day) => ({
    day: dayName(day.date),
    rainfall: day.precipitation_mm,
  }));

  const warmestDay = forecast.reduce(
    (max, day) =>
      day.max_temperature > max.max_temperature ? day : max,
    forecast[0],
  );

  const heaviestRain = forecast.reduce(
    (max, day) =>
      day.precipitation_mm > max.precipitation_mm ? day : max,
    forecast[0],
  );

  const weekRainfall = forecast.reduce(
    (total, day) => total + Number(day.precipitation_mm || 0),
    0,
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Smart Weather Center"
        subtitle={`Live weather for ${farm?.farmName || "your saved farm"}`}
        badge={<DemoBadge label="LIVE WEATHER DATA" />}
      />

      {/* CURRENT WEATHER */}
      <Card className="gradient-hero gap-6 border-transparent p-6 text-forest-foreground shadow-lift">

        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">

          {/* TEMPERATURE */}
          <div>
            <p className="font-display text-6xl font-extrabold leading-none">
              {weather.temperature.toFixed(1)}°C
            </p>

            <p className="mt-3 text-xl font-bold">
              {weatherIcon(weather.weather_code)}{" "}
              {weatherText(weather.weather_code)}
            </p>

            <p className="mt-2 text-xs text-forest-foreground/70">
              Updated from live weather API
            </p>
          </div>

          {/* WEATHER VALUES */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {/* HUMIDITY */}
            <div className="rounded-2xl bg-white/12 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">
                <Droplets className="h-4 w-4" />
                Humidity
              </p>

              <p className="mt-2 font-display text-xl font-extrabold">
                {weather.humidity}%
              </p>
            </div>

            {/* RAINFALL */}
            <div className="rounded-2xl bg-white/12 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">
                <CloudRain className="h-4 w-4" />
                Rainfall
              </p>

              <p className="mt-2 font-display text-xl font-extrabold">
                {weather.precipitation.toFixed(1)} mm
              </p>
            </div>

            {/* WIND */}
            <div className="rounded-2xl bg-white/12 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">
                <Wind className="h-4 w-4" />
                Wind
              </p>

              <p className="mt-2 font-display text-xl font-extrabold">
                {weather.wind_speed.toFixed(1)} km/h
              </p>
            </div>

            {/* SOLAR */}
            <div className="rounded-2xl bg-white/12 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">
                <Sun className="h-4 w-4" />
                Solar
              </p>

              <p className="mt-2 font-display text-xl font-extrabold">
                {weather.solar_radiation_current.toFixed(0)} W/m²
              </p>
            </div>

            {/* LOCATION */}
            <div className="rounded-2xl bg-white/12 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-foreground/80">
                <MapPin className="h-4 w-4" />
                Location
              </p>

              <p className="mt-2 font-display text-sm font-extrabold">
                {Number(farm.latitude).toFixed(4)},
                {" "}
                {Number(farm.longitude).toFixed(4)}
              </p>
            </div>

          </div>
        </div>

        {/* AI INSIGHT */}
        <div className="flex items-start gap-3 rounded-2xl bg-white/12 p-4">

          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-forest-foreground/80">
              AI Weather Insight
            </p>

            <p className="mt-1 text-sm">
              {insight}
            </p>
          </div>

        </div>

      </Card>

      {/* WEATHER SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          icon={
            <ThermometerSun className="h-5 w-5 text-warn" />
          }
          label="Warmest day"
          value={
            warmestDay
              ? `${warmestDay.max_temperature.toFixed(1)}°C ${dayName(
                  warmestDay.date,
                )}`
              : "--"
          }
          hint="Plan field work early"
        />

        <StatCard
          icon={
            <CloudRain className="h-5 w-5 text-sky" />
          }
          label="Heaviest rain"
          value={
            heaviestRain
              ? `${heaviestRain.precipitation_mm.toFixed(1)} mm ${dayName(
                  heaviestRain.date,
                )}`
              : "--"
          }
          hint={
            heaviestRain
              ? `${heaviestRain.rain_probability}% probability`
              : "No data"
          }
        />

        <StatCard
          icon={
            <Droplets className="h-5 w-5 text-primary" />
          }
          label="Week rainfall"
          value={`${weekRainfall.toFixed(1)} mm`}
          hint="Useful for irrigation planning"
        />

      </div>

      {/* 7 DAY FORECAST */}
      <Card className="gap-4 p-5 shadow-card sm:p-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="font-display text-xl font-bold">
              7-day forecast
            </h2>

            <p className="text-sm text-muted-foreground">
              Forecast for your selected farm location
            </p>
          </div>

          <DemoBadge label="LIVE FORECAST" />

        </div>

        {forecast.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

            {forecast.map((day) => (
              <div
                key={day.date}
                className="rounded-2xl bg-secondary/45 p-4 text-center transition-transform hover:-translate-y-1"
              >

                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {dayName(day.date)}
                </p>

                <p
                  aria-hidden
                  className="mt-2 text-3xl"
                >
                  {weatherIcon(day.weather_code)}
                </p>

                <p className="mt-2 font-display text-base font-extrabold">
                  {day.max_temperature.toFixed(1)}° /
                  {" "}
                  {day.min_temperature.toFixed(1)}°
                </p>

                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  {weatherText(day.weather_code)}
                </p>

                <p className="mt-1 text-[11px] font-bold text-sky">
                  💧 {day.rain_probability}%
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  🌧️ {day.precipitation_mm.toFixed(1)} mm
                </p>

              </div>
            ))}

          </div>
        ) : (
          <div className="rounded-2xl bg-secondary/40 p-8 text-center text-muted-foreground">
            Forecast data unavailable.
          </div>
        )}

      </Card>

      {/* RAINFALL CHART */}
      <Card className="gap-4 p-5 shadow-card sm:p-6">

        <div>
          <h2 className="font-display text-xl font-bold">
            Expected rainfall this week
          </h2>

          <p className="text-sm text-muted-foreground">
            Useful for irrigation planning
          </p>
        </div>

        {chartData.length > 0 ? (
          <div className="h-60 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={chartData}>

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
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />

                <Bar
                  dataKey="rainfall"
                  name="Rainfall (mm)"
                  fill="var(--chart-3)"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        ) : (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            Loading rainfall data...
          </div>
        )}

      </Card>

    </div>
  );
}