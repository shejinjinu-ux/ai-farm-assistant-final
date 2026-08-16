/**
 * Mock data / service layer.
 * Every function here is the seam where a real API (IoT, weather, ML model,
 * vision API) can be plugged in later without touching UI components.
 */

export type Status = "optimal" | "moderate" | "critical";

export interface SensorReading {
  key: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  status: Status;
  group: "npk" | "soil" | "environment";
}

const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

const jitter = (v: number, amt: number) =>
  v + (Math.random() - 0.5) * amt;

function statusFor(
  value: number,
  good: [number, number],
  ok: [number, number],
): Status {
  if (value >= good[0] && value <= good[1]) return "optimal";
  if (value >= ok[0] && value <= ok[1]) return "moderate";
  return "critical";
}

/* =========================================================
   SENSOR DATA
   ========================================================= */

export const baseSensors: SensorReading[] = [
  {
    key: "nitrogen",
    label: "Nitrogen",
    value: 72,
    unit: "kg/ha",
    min: 0,
    max: 140,
    status: "optimal",
    group: "npk",
  },
  {
    key: "phosphorus",
    label: "Phosphorus",
    value: 38,
    unit: "kg/ha",
    min: 0,
    max: 90,
    status: "moderate",
    group: "npk",
  },
  {
    key: "potassium",
    label: "Potassium",
    value: 54,
    unit: "kg/ha",
    min: 0,
    max: 120,
    status: "optimal",
    group: "npk",
  },

  {
    key: "moisture",
    label: "Soil Moisture",
    value: 42,
    unit: "%",
    min: 0,
    max: 100,
    status: "moderate",
    group: "soil",
  },
  {
    key: "ph",
    label: "Soil pH",
    value: 6.6,
    unit: "pH",
    min: 3,
    max: 10,
    status: "optimal",
    group: "soil",
  },
  {
    key: "soilTemp",
    label: "Soil Temperature",
    value: 27.4,
    unit: "°C",
    min: 0,
    max: 50,
    status: "optimal",
    group: "soil",
  },
  {
    key: "ec",
    label: "Electrical Conductivity",
    value: 1.1,
    unit: "dS/m",
    min: 0,
    max: 4,
    status: "optimal",
    group: "soil",
  },
  {
    key: "salinity",
    label: "Salinity",
    value: 0.6,
    unit: "ppt",
    min: 0,
    max: 5,
    status: "optimal",
    group: "soil",
  },

  {
    key: "temperature",
    label: "Temperature",
    value: 32,
    unit: "°C",
    min: 0,
    max: 50,
    status: "moderate",
    group: "environment",
  },
  {
    key: "humidity",
    label: "Humidity",
    value: 68,
    unit: "%",
    min: 0,
    max: 100,
    status: "optimal",
    group: "environment",
  },
  {
    key: "rainfall",
    label: "Rainfall (24h)",
    value: 6.2,
    unit: "mm",
    min: 0,
    max: 60,
    status: "optimal",
    group: "environment",
  },
  {
    key: "wind",
    label: "Wind Speed",
    value: 9,
    unit: "km/h",
    min: 0,
    max: 60,
    status: "optimal",
    group: "environment",
  },
  {
    key: "light",
    label: "Light Intensity",
    value: 38000,
    unit: "lux",
    min: 0,
    max: 80000,
    status: "optimal",
    group: "environment",
  },
];

/** Simulates a fresh IoT poll. Replace with a real device/API call later. */
export function simulateSensors(
  current: SensorReading[],
): SensorReading[] {
  return current.map((s) => {
    const span = (s.max - s.min) * 0.06;

    const value = clamp(
      Number(
        jitter(s.value, span).toFixed(
          s.max > 1000 ? 0 : 1,
        ),
      ),
      s.min,
      s.max,
    );

    let status: Status = s.status;

    if (s.key === "moisture") {
      status = statusFor(
        value,
        [45, 70],
        [30, 80],
      );
    }

    if (s.key === "nitrogen") {
      status = statusFor(
        value,
        [70, 110],
        [50, 125],
      );
    }

    if (s.key === "phosphorus") {
      status = statusFor(
        value,
        [45, 70],
        [30, 80],
      );
    }

    if (s.key === "potassium") {
      status = statusFor(
        value,
        [50, 90],
        [35, 105],
      );
    }

    if (s.key === "ph") {
      status = statusFor(
        value,
        [6, 7.5],
        [5.5, 8],
      );
    }

    if (s.key === "temperature") {
      status = statusFor(
        value,
        [22, 32],
        [18, 36],
      );
    }

    return {
      ...s,
      value,
      status,
    };
  });
}

/* =========================================================
   CROPS
   ========================================================= */

export const CROPS = [
  {
    id: "rice",
    name: "Rice",
    emoji: "🌾",
    season: "Kharif",
    price: 2180,
    unit: "₹/quintal",
    baseYield: 4.8,
  },
  {
    id: "wheat",
    name: "Wheat",
    emoji: "🌿",
    season: "Rabi",
    price: 2275,
    unit: "₹/quintal",
    baseYield: 4.1,
  },
  {
    id: "maize",
    name: "Maize",
    emoji: "🌽",
    season: "Kharif",
    price: 2090,
    unit: "₹/quintal",
    baseYield: 5.6,
  },
  {
    id: "cotton",
    name: "Cotton",
    emoji: "☁️",
    season: "Kharif",
    price: 7020,
    unit: "₹/quintal",
    baseYield: 2.2,
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    emoji: "🎋",
    season: "Annual",
    price: 340,
    unit: "₹/quintal",
    baseYield: 78,
  },
  {
    id: "groundnut",
    name: "Groundnut",
    emoji: "🥜",
    season: "Kharif",
    price: 6377,
    unit: "₹/quintal",
    baseYield: 2.4,
  },
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    season: "All year",
    price: 1450,
    unit: "₹/quintal",
    baseYield: 24,
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    season: "Rabi",
    price: 1250,
    unit: "₹/quintal",
    baseYield: 22,
  },
  {
    id: "onion",
    name: "Onion",
    emoji: "🧅",
    season: "Rabi",
    price: 1600,
    unit: "₹/quintal",
    baseYield: 18,
  },
  {
    id: "other",
    name: "Other",
    emoji: "🌱",
    season: "—",
    price: 2000,
    unit: "₹/quintal",
    baseYield: 3.5,
  },
];

/* =========================================================
   SOILS
   ========================================================= */

export const SOILS = [
  {
    id: "alluvial",
    name: "Alluvial",
    note: "Fertile, good water retention",
    best: ["rice", "wheat", "sugarcane"],
  },
  {
    id: "black",
    name: "Black",
    note: "High moisture holding, rich in lime",
    best: ["cotton", "sugarcane"],
  },
  {
    id: "red",
    name: "Red",
    note: "Needs nutrient support",
    best: ["groundnut", "maize"],
  },
  {
    id: "laterite",
    name: "Laterite",
    note: "Acidic, needs organic matter",
    best: ["groundnut", "rice"],
  },
  {
    id: "sandy",
    name: "Sandy",
    note: "Drains fast, frequent irrigation",
    best: ["potato", "onion"],
  },
  {
    id: "clay",
    name: "Clay",
    note: "Holds water well, slow drainage",
    best: ["rice"],
  },
  {
    id: "loamy",
    name: "Loamy",
    note: "Balanced and ideal for most crops",
    best: ["rice", "tomato", "maize"],
  },
];

/* =========================================================
   LOCATION
   ========================================================= */

export const STATES = [
  "Odisha",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Maharashtra",
  "Punjab",
  "Karnataka",
];

export const DISTRICTS: Record<string, string[]> = {
  Odisha: [
    "Cuttack",
    "Puri",
    "Balasore",
    "Sambalpur",
  ],
  "Tamil Nadu": [
    "Thanjavur",
    "Erode",
    "Madurai",
    "Salem",
  ],
  "Uttar Pradesh": [
    "Varanasi",
    "Meerut",
    "Kanpur",
  ],
  Maharashtra: [
    "Nashik",
    "Pune",
    "Nagpur",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Patiala",
  ],
  Karnataka: [
    "Mysuru",
    "Belagavi",
    "Hassan",
  ],
};

/* =========================================================
   AREA
   ========================================================= */

export const AREA_UNITS = [
  {
    id: "acre",
    label: "Acre",
    toHa: 0.4047,
  },
  {
    id: "hectare",
    label: "Hectare",
    toHa: 1,
  },
  {
    id: "cent",
    label: "Cent",
    toHa: 0.004047,
  },
];

/* =========================================================
   WEATHER
   ========================================================= */

export interface WeatherDay {
  day: string;
  condition: string;
  icon: string;
  max: number;
  min: number;
  rainProb: number;
  rainfall: number;
}

export const weatherNow = {
  temp: 32,
  humidity: 68,
  rainProb: 62,
  rainfall: 6.2,
  wind: 9,
  condition: "Partly Cloudy",
  insight:
    "Rain is expected tomorrow. Irrigation can potentially be reduced.",
};

export const forecast: WeatherDay[] = [
  {
    day: "Today",
    condition: "Partly Cloudy",
    icon: "⛅",
    max: 32,
    min: 24,
    rainProb: 62,
    rainfall: 6.2,
  },
  {
    day: "Tue",
    condition: "Rain",
    icon: "🌧️",
    max: 29,
    min: 23,
    rainProb: 88,
    rainfall: 22.4,
  },
  {
    day: "Wed",
    condition: "Showers",
    icon: "🌦️",
    max: 30,
    min: 23,
    rainProb: 55,
    rainfall: 9.1,
  },
  {
    day: "Thu",
    condition: "Cloudy",
    icon: "☁️",
    max: 31,
    min: 24,
    rainProb: 30,
    rainfall: 1.2,
  },
  {
    day: "Fri",
    condition: "Sunny",
    icon: "☀️",
    max: 34,
    min: 25,
    rainProb: 10,
    rainfall: 0,
  },
  {
    day: "Sat",
    condition: "Sunny",
    icon: "☀️",
    max: 35,
    min: 26,
    rainProb: 8,
    rainfall: 0,
  },
  {
    day: "Sun",
    condition: "Partly Cloudy",
    icon: "⛅",
    max: 33,
    min: 25,
    rainProb: 24,
    rainfall: 0.6,
  },
];

/* =========================================================
   FARM HEALTH
   ========================================================= */

export const healthBreakdown = [
  {
    key: "crop",
    label: "Crop Health",
    value: 88,
    icon: "🌱",
  },
  {
    key: "soil",
    label: "Soil Health",
    value: 82,
    icon: "🧪",
  },
  {
    key: "water",
    label: "Water Health",
    value: 79,
    icon: "💧",
  },
  {
    key: "weather",
    label: "Weather Suitability",
    value: 86,
    icon: "🌦️",
  },
];

export const sustainability = {
  score: 78,
  factors: [
    {
      label: "Water efficiency",
      value: 71,
    },
    {
      label: "Nutrient efficiency",
      value: 80,
    },
    {
      label: "Soil health",
      value: 82,
    },
    {
      label: "Irrigation efficiency",
      value: 74,
    },
    {
      label: "Resource usage",
      value: 83,
    },
  ],
  tip:
    "Your farm could improve water efficiency through optimized irrigation.",
};

/* =========================================================
   YIELD
   ========================================================= */

export const yieldFactors = [
  {
    label: "Soil quality",
    weight: 22,
    note: "Loamy soil suits rice well",
  },
  {
    label: "Nutrients (NPK)",
    weight: 24,
    note: "Nitrogen slightly below target",
  },
  {
    label: "Soil moisture",
    weight: 18,
    note: "Moderate at 42%",
  },
  {
    label: "Temperature",
    weight: 12,
    note: "Within comfortable range",
  },
  {
    label: "Rainfall",
    weight: 14,
    note: "Good rainfall expected this week",
  },
  {
    label: "Crop & area",
    weight: 10,
    note: "2.5 acres of rice",
  },
];

export const yieldHistory = [
  {
    season: "2022 K",
    actual: 4.1,
    predicted: 4.0,
  },
  {
    season: "2023 R",
    actual: 4.3,
    predicted: 4.2,
  },
  {
    season: "2023 K",
    actual: 4.4,
    predicted: 4.5,
  },
  {
    season: "2024 R",
    actual: 4.6,
    predicted: 4.5,
  },
  {
    season: "2024 K",
    actual: 4.5,
    predicted: 4.7,
  },
  {
    season: "2025 K",
    actual: null as number | null,
    predicted: 4.8,
  },
];

/* =========================================================
   RECOMMENDATIONS
   ========================================================= */

export interface Recommendation {
  id: string;
  icon: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  action: string;
  status: "Pending" | "In progress" | "Done";
}

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    icon: "💧",
    title: "Irrigation",
    priority: "High",
    reason:
      "Soil moisture is at 42%, below the comfortable band for rice.",
    action:
      "Monitor moisture and consider irrigation based on upcoming rainfall.",
    status: "Pending",
  },
  {
    id: "r2",
    icon: "🧪",
    title: "Nutrients",
    priority: "Medium",
    reason:
      "Nitrogen is moderately low compared with the target range.",
    action:
      "Plan a light top-dressing after the rain window closes.",
    status: "Pending",
  },
  {
    id: "r3",
    icon: "🌦️",
    title: "Weather",
    priority: "Medium",
    reason:
      "88% rain probability tomorrow with ~22 mm rainfall.",
    action:
      "Rainfall is expected. Avoid unnecessary irrigation.",
    status: "In progress",
  },
  {
    id: "r4",
    icon: "🌱",
    title: "Crop Care",
    priority: "Low",
    reason:
      "Crop health score is steady at 88/100.",
    action:
      "Continue monitoring crop health twice a week.",
    status: "Done",
  },
  {
    id: "r5",
    icon: "🔬",
    title: "Field Scouting",
    priority: "Low",
    reason:
      "Humid conditions can encourage leaf diseases.",
    action:
      "Check lower leaves in Zone C for early spots.",
    status: "Pending",
  },
];

/* =========================================================
   FARM ZONES
   ========================================================= */

export const farmZones = [
  {
    id: "A",
    name: "Field Zone A",
    status: "healthy",
    moisture: 52,
    npk: "Good",
    health: 89,
    area: 0.9,
  },
  {
    id: "B",
    name: "Field Zone B",
    status: "healthy",
    moisture: 48,
    npk: "Good",
    health: 85,
    area: 0.7,
  },
  {
    id: "C",
    name: "Field Zone C",
    status: "attention",
    moisture: 34,
    npk: "Low N",
    health: 71,
    area: 0.5,
  },
  {
    id: "D",
    name: "Field Zone D",
    status: "critical",
    moisture: 22,
    npk: "Low N, Low P",
    health: 58,
    area: 0.4,
  },
] as const;

/* =========================================================
   CROP GROWTH
   ========================================================= */

export const growthStages = [
  {
    key: "seed",
    label: "Seed",
    icon: "🌱",
    days: 0,
  },
  {
    key: "germination",
    label: "Germination",
    icon: "🌿",
    days: 10,
  },
  {
    key: "vegetative",
    label: "Vegetative Stage",
    icon: "🌾",
    days: 35,
  },
  {
    key: "flowering",
    label: "Flowering",
    icon: "🌼",
    days: 65,
  },
  {
    key: "grain",
    label: "Grain Development",
    icon: "🌾",
    days: 95,
  },
  {
    key: "harvest",
    label: "Harvest",
    icon: "🚜",
    days: 120,
  },
];

export const currentStageIndex = 2;
export const daysCompleted = 48;

/* =========================================================
   CALENDAR
   ========================================================= */

export const calendarItems = [
  {
    date: "Today",
    icon: "💧",
    title: "Check soil moisture",
    type: "Irrigation",
    tone: "info",
  },
  {
    date: "Tomorrow",
    icon: "🌦️",
    title: "Heavy rain expected — skip irrigation",
    type: "Weather alert",
    tone: "warn",
  },
  {
    date: "In 3 days",
    icon: "🧪",
    title: "Sensor check for Zone C & D",
    type: "Sensor",
    tone: "info",
  },
  {
    date: "In 6 days",
    icon: "🌱",
    title: "Nutrient review after rain",
    type: "Crop care",
    tone: "info",
  },
  {
    date: "In 12 days",
    icon: "🔬",
    title: "Leaf disease scouting round",
    type: "Crop care",
    tone: "info",
  },
  {
    date: "In 72 days",
    icon: "🚜",
    title: "Estimated harvest window",
    type: "Harvest",
    tone: "success",
  },
];

/* =========================================================
   ALERTS
   ========================================================= */

export const alerts = [
  {
    id: "a1",
    level: "high",
    icon: "🔴",
    title: "Possible moisture stress detected",
    detail: "Zone D moisture dropped to 22%.",
    time: "20 min ago",
    read: false,
  },
  {
    id: "a2",
    level: "medium",
    icon: "🟡",
    title: "Rain expected tomorrow",
    detail: "88% probability, around 22 mm.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "a3",
    level: "medium",
    icon: "🟡",
    title: "Nitrogen below target",
    detail: "72 kg/ha against a target of 95 kg/ha.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "a4",
    level: "info",
    icon: "🟢",
    title: "Current soil pH is within a suitable range",
    detail: "pH 6.6 is well suited for rice.",
    time: "Yesterday",
    read: true,
  },
];

/* =========================================================
   HISTORY
   ========================================================= */

export const historySeries = {
  "7d": Array.from(
    { length: 7 },
    (_, i) => ({
      label: `D${i + 1}`,
      yieldIdx: 4.3 + i * 0.07,
      moisture: 38 + i * 1.6,
      npk: 60 + i * 1.4,
      temp: 30 + Math.sin(i) * 2,
      irrigation: 900 + i * 45,
      revenue: 108000 + i * 2400,
    }),
  ),

  "30d": Array.from(
    { length: 10 },
    (_, i) => ({
      label: `W${i + 1}`,
      yieldIdx: 4.0 + i * 0.09,
      moisture: 34 + i * 1.2,
      npk: 55 + i * 2,
      temp: 29 + Math.cos(i) * 3,
      irrigation: 800 + i * 70,
      revenue: 100000 + i * 3000,
    }),
  ),

  "3m": Array.from(
    { length: 12 },
    (_, i) => ({
      label: `M${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
      yieldIdx: 3.8 + i * 0.08,
      moisture: 30 + i * 1.5,
      npk: 48 + i * 2.4,
      temp: 27 + Math.sin(i / 2) * 4,
      irrigation: 700 + i * 60,
      revenue: 92000 + i * 3200,
    }),
  ),

  season: Array.from(
    { length: 8 },
    (_, i) => ({
      label: `S${i + 1}`,
      yieldIdx: 3.6 + i * 0.16,
      moisture: 32 + i * 2,
      npk: 45 + i * 3.5,
      temp: 26 + i * 0.7,
      irrigation: 650 + i * 120,
      revenue: 86000 + i * 5600,
    }),
  ),
};

/* =========================================================
   DISEASE
   ========================================================= */

export const diseaseResult = {
  name: "Leaf Blight",
  confidence: 89,
  symptoms: [
    "Elongated greyish-green lesions on leaf edges",
    "Yellow halo around brown spots",
    "Drying of leaf tips in humid weather",
  ],
  prevention: [
    "Avoid excess nitrogen in humid weeks",
    "Maintain field drainage after heavy rainfall",
    "Remove and destroy heavily infected leaves",
  ],
  next: [
    "Inspect 8–10 plants across Zone C and D",
    "Photograph affected leaves again after 3 days",
    "Consult your local agriculture officer before any spraying",
  ],
};

/* =========================================================
   AI ASSISTANT
   ========================================================= */

/** Very small rule-based responder standing in for a real AI endpoint. */
export function aiAnswer(
  question: string,
  ctx: {
    crop: string;
    soil: string;
    area: string;
  },
): string {
  const q = question.toLowerCase();

  if (
    q.includes("irrigat") ||
    q.includes("water") ||
    q.includes("पानी")
  ) {
    return `Soil moisture is around 42%, and there is an 88% chance of rain tomorrow with about 22 mm. For your ${ctx.crop} on ${ctx.area}, it is better to wait for the rain and re-check moisture the day after. If moisture stays under 35%, give a short irrigation of about 1,200 L.`;
  }

  if (
    q.includes("npk") ||
    q.includes("nutrient") ||
    q.includes("fertil")
  ) {
    return `Your readings are N 72, P 38 and K 54 kg/ha. Nitrogen and phosphorus are a little below the comfortable range for ${ctx.crop}. A light split application after the rain window usually works better than one heavy dose. Please confirm quantities with your local agriculture officer.`;
  }

  if (q.includes("soil")) {
    return `Your ${ctx.soil} soil is holding up well: pH 6.6, temperature 27.4°C and salinity is low. Soil health scores 82/100. The main thing to watch is moisture, which is on the lower side at 42%.`;
  }

  if (
    q.includes("yellow") ||
    q.includes("leaves") ||
    q.includes("disease") ||
    q.includes("wrong")
  ) {
    return `Yellowing lower leaves in humid weather usually points to either low nitrogen or an early leaf disease. Take a clear photo of an affected leaf and use Disease Detection — the AI will give a preliminary indication. This is not a confirmed diagnosis, so please verify with an agriculture expert before treating.`;
  }

  if (q.includes("rain")) {
    return `More rainfall this week would raise soil moisture toward 55–60%, which suits ${ctx.crop}. In the What-If page you can move the rainfall slider and see how the estimated yield changes.`;
  }

  if (
    q.includes("yield") ||
    q.includes("harvest")
  ) {
    return `The current AI estimate is 4.8 tons per hectare with 87% confidence, and the expected harvest window is in about 72 days. Balancing nitrogen could add roughly 0.3 tons per hectare.`;
  }

  if (
    q.includes("profit") ||
    q.includes("revenue") ||
    q.includes("price")
  ) {
    return `At today's demo price for ${ctx.crop}, your estimated revenue is about ₹1,25,000 with costs near ₹48,000, leaving around ₹77,000 profit for ${ctx.area}.`;
  }

  return `Here is what I can see for your farm right now — crop: ${ctx.crop}, soil: ${ctx.soil}, area: ${ctx.area}, moisture 42%, NPK moderate and partly cloudy weather. Overall farm health is 84/100. Ask me about irrigation, nutrients, weather, disease or expected profit and I will explain it in simple terms.`;
}

/* =========================================================
   SUGGESTED QUESTIONS
   ========================================================= */

export const SUGGESTED_QUESTIONS = [
  "What is wrong with my crop?",
  "When should I irrigate?",
  "How is my soil health?",
  "What does my NPK level mean?",
  "What happens if rainfall increases?",
  "Why are my leaves turning yellow?",
];

/* =========================================================
   DISCLAIMERS
   ========================================================= */

export const DISCLAIMER =
  "AI-generated recommendations are intended as decision-support information. Actual fertilizer, pesticide, irrigation or crop-treatment decisions should be verified with qualified agricultural professionals and local guidelines.";

export const DISEASE_DISCLAIMER =
  "AI image analysis provides a preliminary indication and should not be treated as a confirmed diagnosis.";