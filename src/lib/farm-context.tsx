import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "./supabase";

import {
  AREA_UNITS,
  CROPS,
  SOILS,
  alerts as seedAlerts,
  baseSensors,
  simulateSensors,
  type SensorReading,
} from "./mock-data";

import type { LanguageCode } from "./i18n";
import { translate } from "./i18n";

export interface FarmProfile {
  id?: string;

  farmerName: string;
  mobile: string;
  farmName: string;

  state: string;
  district: string;
  village: string;

  latitude?: number | null;
  longitude?: number | null;

  area: number;
  unit: string;

  cropId: string;
  soilId: string;

  setupComplete: boolean;
}

const defaultFarm: FarmProfile = {
  farmerName: "Ramesh",
  mobile: "98765 43210",
  farmName: "Green Valley Farm",

  state: "Odisha",
  district: "Cuttack",
  village: "Bidyadharpur",

  latitude: null,
  longitude: null,

  area: 2.5,
  unit: "acre",

  cropId: "rice",
  soilId: "loamy",

  setupComplete: false,
};

export interface WeatherForPrediction {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  solar_radiation: number;
}

export interface PredictionResult {
  success: boolean;

  crop?: string;
  state?: string;
  district?: string;
  soil_type?: string;

  area?: number;

  expected_yield_per_hectare?: number;
  estimated_total_production?: number;

  error?: string;
}

interface FarmContextValue {
  farm: FarmProfile;

  updateFarm: (patch: Partial<FarmProfile>) => void;

  /*
   * IMPORTANT:
   * farmLoading = Supabase/local farm data still loading
   * farmReady   = farm data is ready for other pages
   */
  farmLoading: boolean;
  farmReady: boolean;

  sensors: SensorReading[];

  simulate: () => void;

  lastReading: string;

  language: LanguageCode;

  setLanguage: (l: LanguageCode) => void;

  t: (key: string) => string;

  demoMode: boolean;

  setDemoMode: (v: boolean) => void;

  alertList: typeof seedAlerts;

  markAlertsRead: () => void;

  unreadAlerts: number;

  crop: (typeof CROPS)[number];

  soil: (typeof SOILS)[number];

  areaLabel: string;

  areaHa: number;

  sensor: (key: string) => SensorReading;

  predictYield: (
    weather: WeatherForPrediction,
  ) => Promise<PredictionResult>;

  prediction: PredictionResult | null;

  predictionLoading: boolean;
}

const FarmContext =
  createContext<FarmContextValue | null>(null);

const STORAGE_KEY = "aifa.farm.v1";

/* =========================================================
   UPDATE SENSOR VALUES
========================================================= */

function updateSensorValues(
  current: SensorReading[],
  values: Record<string, number>,
): SensorReading[] {
  return current.map((item) => {
    if (values[item.key] === undefined) {
      return item;
    }

    return {
      ...item,
      value: values[item.key],
    };
  });
}

/* =========================================================
   FARM PROVIDER
========================================================= */

export function FarmProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [farm, setFarm] =
    useState<FarmProfile>(defaultFarm);

  /*
   * IMPORTANT FIX
   *
   * Initially true loading state.
   * This prevents Recommendations from calling
   * the backend before saved farm data is loaded.
   */
  const [farmLoading, setFarmLoading] =
    useState(true);

  const [farmReady, setFarmReady] =
    useState(false);

  const [sensors, setSensors] =
    useState<SensorReading[]>(baseSensors);

  const [lastReading, setLastReading] =
    useState("Just now");

  const [language, setLanguage] =
    useState<LanguageCode>("en");

  const [demoMode, setDemoMode] =
    useState(true);

  const [alertList, setAlertList] =
    useState(seedAlerts);

  /* =======================================================
     AI PREDICTION STATE
  ======================================================= */

  const [prediction, setPrediction] =
    useState<PredictionResult | null>(null);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  /* =======================================================
     1. LOAD SAVED FARM + SUPABASE FARM
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadFarm() {
      try {
        /*
         * ---------------------------------------------------
         * STEP 1
         * Load localStorage first.
         * ---------------------------------------------------
         */

        let localFarm: FarmProfile | null = null;

        try {
          const raw =
            localStorage.getItem(
              STORAGE_KEY,
            );

          if (raw) {
            const parsed =
              JSON.parse(raw);

            if (parsed.farm) {
              localFarm = {
                ...defaultFarm,
                ...parsed.farm,
              };

              if (!cancelled) {
                setFarm(localFarm);
              }
            }

            if (
              parsed.language &&
              !cancelled
            ) {
              setLanguage(
                parsed.language,
              );
            }

            if (
              typeof parsed.demoMode ===
                "boolean" &&
              !cancelled
            ) {
              setDemoMode(
                parsed.demoMode,
              );
            }
          }
        } catch (error) {
          console.error(
            "Local storage load error:",
            error,
          );
        }

        /*
         * ---------------------------------------------------
         * STEP 2
         * Load saved farm from Supabase.
         * ---------------------------------------------------
         */

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log(
            "No logged-in user.",
          );

          /*
           * If local farm exists, use it.
           * Otherwise keep default farm.
           */
          if (!cancelled) {
            setFarm((current) => ({
              ...current,
              ...(localFarm ?? {}),
            }));
          }

          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("farms")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Farm fetch error:",
            error,
          );

          /*
           * Supabase failed.
           * Local farm can still be used.
           */
          if (!cancelled) {
            setFarm((current) => ({
              ...current,
              ...(localFarm ?? {}),
            }));
          }

          return;
        }

        console.log(
          "Farms from Supabase:",
          data,
        );

        /*
         * ---------------------------------------------------
         * STEP 3
         * Select most recent saved farm.
         * ---------------------------------------------------
         */

        if (
          data &&
          data.length > 0
        ) {
          const firstFarm = data[0];

          console.log(
            "Selected farm:",
            firstFarm,
          );

          console.log(
            "Farm GPS:",
            firstFarm.latitude,
            firstFarm.longitude,
          );

          if (!cancelled) {
            setFarm((current) => ({
              ...current,

              id:
                firstFarm.id,

              farmerName:
                firstFarm.farmer_name ??
                current.farmerName,

              mobile:
                firstFarm.phone ??
                current.mobile,

              farmName:
                firstFarm.farm_name ??
                current.farmName,

              state:
                firstFarm.state ??
                current.state,

              district:
                firstFarm.district ??
                current.district,

              village:
                firstFarm.village ??
                current.village,

              /*
               * ==========================
               * SAVED FARM GPS
               * ==========================
               */

              latitude:
                firstFarm.latitude !==
                  null &&
                firstFarm.latitude !==
                  undefined
                  ? Number(
                      firstFarm.latitude,
                    )
                  : current.latitude,

              longitude:
                firstFarm.longitude !==
                  null &&
                firstFarm.longitude !==
                  undefined
                  ? Number(
                      firstFarm.longitude,
                    )
                  : current.longitude,

              area:
                firstFarm.area ??
                current.area,

              unit:
                firstFarm.area_unit ??
                current.unit,

              cropId:
                firstFarm.crop_id ??
                current.cropId,

              soilId:
                firstFarm.soil_id ??
                current.soilId,

              setupComplete:
                firstFarm.setup_complete ??
                true,
            }));
          }
        } else {
          console.log(
            "No farms found in Supabase.",
          );

          /*
           * No Supabase farm.
           * Keep local saved farm if available.
           */
          if (!cancelled) {
            setFarm((current) => ({
              ...current,
              ...(localFarm ?? {}),
            }));
          }
        }
      } catch (error) {
        console.error(
          "Unexpected farm loading error:",
          error,
        );
      } finally {
        /*
         * ---------------------------------------------------
         * VERY IMPORTANT
         *
         * Only after the farm loading process is finished:
         *
         * farmLoading = false
         * farmReady   = true
         *
         * Recommendations can now safely use farm data.
         * ---------------------------------------------------
         */

        if (!cancelled) {
          setFarmLoading(false);
          setFarmReady(true);
        }
      }
    }

    loadFarm();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     2. SAVE FARM TO LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    /*
     * Don't save the initial default farm while
     * Supabase/localStorage is still loading.
     *
     * This prevents the initial empty/default farm
     * from overwriting a saved farm.
     */
    if (!farmReady) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          farm,
          language,
          demoMode,
        }),
      );
    } catch (error) {
      console.error(
        "Local storage save error:",
        error,
      );
    }
  }, [
    farm,
    language,
    demoMode,
    farmReady,
  ]);

  /* =======================================================
     3. LOAD CURRENT SENSOR DATA
  ======================================================= */

  useEffect(() => {
    if (!farm.id) {
      return;
    }

    async function loadCurrentSensors() {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("sensor_current")
          .select("*")
          .eq("farm_id", farm.id)
          .maybeSingle();

        if (error) {
          console.error(
            "Current sensor fetch error:",
            error,
          );
          return;
        }

        if (!data) {
          console.log(
            "No current sensor data for this farm",
          );
          return;
        }

        console.log(
          "Current sensor data:",
          data,
        );

        const sensorValues: Record<
          string,
          number
        > = {
          moisture:
            Number(
              data.soil_moisture,
            ),

          temperature:
            Number(
              data.temperature,
            ),

          humidity:
            Number(
              data.humidity,
            ),

          ph:
            Number(
              data.soil_ph,
            ),

          nitrogen:
            Number(
              data.nitrogen,
            ),

          phosphorus:
            Number(
              data.phosphorus,
            ),

          potassium:
            Number(
              data.potassium,
            ),
        };

        setSensors((current) =>
          updateSensorValues(
            current,
            sensorValues,
          ),
        );

        if (data.updated_at) {
          setLastReading(
            new Date(
              data.updated_at,
            ).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              },
            ),
          );
        }
      } catch (error) {
        console.error(
          "Unexpected sensor loading error:",
          error,
        );
      }
    }

    loadCurrentSensors();
  }, [farm.id]);

  /* =======================================================
     4. SAVE CURRENT SENSOR DATA
  ======================================================= */

  const saveCurrentSensors =
    useCallback(
      async (
        farmId: string,
        readings: SensorReading[],
      ) => {
        try {
          const getValue = (
            key: string,
          ) =>
            Number(
              readings.find(
                (s) =>
                  s.key === key,
              )?.value ?? 0,
            );

          const payload = {
            farm_id: farmId,

            soil_moisture:
              getValue("moisture"),

            temperature:
              getValue("temperature"),

            humidity:
              getValue("humidity"),

            soil_ph:
              getValue("ph"),

            nitrogen:
              getValue("nitrogen"),

            phosphorus:
              getValue("phosphorus"),

            potassium:
              getValue("potassium"),

            updated_at:
              new Date().toISOString(),
          };

          const {
            data: existing,
            error: findError,
          } = await supabase
            .from("sensor_current")
            .select("id")
            .eq("farm_id", farmId)
            .maybeSingle();

          if (findError) {
            console.error(
              "Current sensor lookup error:",
              findError,
            );
            return;
          }

          let error;

          if (existing) {
            const result =
              await supabase
                .from("sensor_current")
                .update(payload)
                .eq(
                  "farm_id",
                  farmId,
                );

            error =
              result.error;
          } else {
            const result =
              await supabase
                .from("sensor_current")
                .insert(payload);

            error =
              result.error;
          }

          if (error) {
            console.error(
              "Current sensor save error:",
              error,
            );
          } else {
            console.log(
              "Current sensor saved:",
              payload,
            );
          }
        } catch (error) {
          console.error(
            "Unexpected current sensor error:",
            error,
          );
        }
      },
      [],
    );

  /* =======================================================
     5. SAVE SENSOR HISTORY
  ======================================================= */

  const saveSensorHistory =
    useCallback(
      async (
        farmId: string,
        readings: SensorReading[],
      ) => {
        try {
          const getValue = (
            key: string,
          ) =>
            Number(
              readings.find(
                (s) =>
                  s.key === key,
              )?.value ?? 0,
            );

          const payload = {
            farm_id: farmId,

            moisture:
              getValue("moisture"),

            temperature:
              getValue("temperature"),

            humidity:
              getValue("humidity"),

            nitrogen:
              getValue("nitrogen"),

            phosphorus:
              getValue("phosphorus"),

            potassium:
              getValue("potassium"),

            ph:
              getValue("ph"),

            recorded_at:
              new Date().toISOString(),
          };

          const {
            error,
          } = await supabase
            .from("sensor_readings")
            .insert(payload);

          if (error) {
            console.error(
              "Sensor history save error:",
              error,
            );
          } else {
            console.log(
              "Sensor history saved:",
              payload,
            );
          }
        } catch (error) {
          console.error(
            "Unexpected sensor history error:",
            error,
          );
        }
      },
      [],
    );

  /* =======================================================
     6. DEMO SENSOR SIMULATION
  ======================================================= */

  const simulate =
    useCallback(() => {
      const newSensors =
        simulateSensors(
          sensors,
        );

      setSensors(newSensors);

      const time =
        new Date();

      setLastReading(
        time.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          },
        ),
      );

      if (farm.id) {
        void saveCurrentSensors(
          farm.id,
          newSensors,
        );

        void saveSensorHistory(
          farm.id,
          newSensors,
        );
      }
    }, [
      sensors,
      farm.id,
      saveCurrentSensors,
      saveSensorHistory,
    ]);

  /* =======================================================
     7. UPDATE FARM
  ======================================================= */

  const updateFarm =
    useCallback(
      (
        patch: Partial<FarmProfile>,
      ) => {
        setFarm((current) => ({
          ...current,
          ...patch,
        }));
      },
      [],
    );

  /* =======================================================
     8. AI YIELD PREDICTION
  ======================================================= */

  const predictYield =
    useCallback(
      async (
        weather: WeatherForPrediction,
      ): Promise<PredictionResult> => {
        setPredictionLoading(true);

        try {
          const getSensorValue = (
            key: string,
          ): number => {
            return Number(
              sensors.find(
                (s) =>
                  s.key === key,
              )?.value ?? 0,
            );
          };

          const crop =
            CROPS.find(
              (c) =>
                c.id ===
                farm.cropId,
            ) ?? CROPS[0];

          const soil =
            SOILS.find(
              (s) =>
                s.id ===
                farm.soilId,
            ) ?? SOILS[0];

          const unit =
            AREA_UNITS.find(
              (u) =>
                u.id ===
                farm.unit,
            ) ?? AREA_UNITS[0];

          const areaHa =
            Number(
              (
                farm.area *
                unit.toHa
              ).toFixed(3),
            );

          const payload = {
            state:
              farm.state,

            district:
              farm.district,

            crop:
              crop.name,

            area:
              areaHa,

            N:
              getSensorValue(
                "nitrogen",
              ),

            P:
              getSensorValue(
                "phosphorus",
              ),

            K:
              getSensorValue(
                "potassium",
              ),

            temperature:
              Number(
                weather.temperature,
              ),

            humidity:
              Number(
                weather.humidity,
              ),

            ph:
              getSensorValue(
                "ph",
              ),

            rainfall:
              Number(
                weather.rainfall,
              ),

            wind_speed:
              Number(
                weather.wind_speed,
              ),

            solar_radiation:
              Number(
                weather.solar_radiation,
              ),

            soil_type:
              soil.name,
          };

          console.log(
            "AI Prediction Request:",
            payload,
          );

          const response =
            await fetch(
              "https://ai-farm-backend-v57r.onrender.com/predict",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify(
                  payload,
                ),
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.detail ||
                data?.error ||
                `Prediction failed with status ${response.status}`,
            );
          }

          console.log(
            "AI Prediction Response:",
            data,
          );

          const result: PredictionResult =
            {
              success:
                data.success ??
                true,

              crop:
                data.crop,

              state:
                data.state,

              district:
                data.district,

              soil_type:
                data.soil_type,

              area:
                data.area,

              expected_yield_per_hectare:
                Number(
                  data.expected_yield_per_hectare ??
                    0,
                ),

              estimated_total_production:
                Number(
                  data.estimated_total_production ??
                    0,
                ),
            };

          setPrediction(
            result,
          );

          return result;
        } catch (error) {
          console.error(
            "AI prediction error:",
            error,
          );

          const result: PredictionResult =
            {
              success: false,

              error:
                error instanceof Error
                  ? error.message
                  : "Unable to get AI prediction",
            };

          setPrediction(
            result,
          );

          return result;
        } finally {
          setPredictionLoading(
            false,
          );
        }
      },
      [
        farm,
        sensors,
      ],
    );

  /* =======================================================
     9. CONTEXT VALUE
  ======================================================= */

  const value =
    useMemo<FarmContextValue>(() => {
      const crop =
        CROPS.find(
          (c) =>
            c.id ===
            farm.cropId,
        ) ?? CROPS[0];

      const soil =
        SOILS.find(
          (s) =>
            s.id ===
            farm.soilId,
        ) ?? SOILS[0];

      const unit =
        AREA_UNITS.find(
          (u) =>
            u.id ===
            farm.unit,
        ) ?? AREA_UNITS[0];

      return {
        farm,

        updateFarm,

        /*
         * IMPORTANT
         */
        farmLoading,

        farmReady,

        sensors,

        simulate,

        lastReading,

        language,

        setLanguage,

        t: (key: string) =>
          translate(
            language,
            key,
          ),

        demoMode,

        setDemoMode,

        alertList,

        markAlertsRead: () =>
          setAlertList(
            (alerts) =>
              alerts.map(
                (alert) => ({
                  ...alert,
                  read: true,
                }),
              ),
          ),

        unreadAlerts:
          alertList.filter(
            (alert) =>
              !alert.read,
          ).length,

        crop,

        soil,

        areaLabel:
          `${farm.area} ${
            unit.label
          }${
            farm.area === 1
              ? ""
              : "s"
          }`,

        areaHa:
          Number(
            (
              farm.area *
              unit.toHa
            ).toFixed(3),
          ),

        sensor: (
          key: string,
        ) =>
          sensors.find(
            (sensor) =>
              sensor.key ===
              key,
          ) ??
          sensors[0],

        predictYield,

        prediction,

        predictionLoading,
      };
    }, [
      farm,
      updateFarm,
      farmLoading,
      farmReady,
      sensors,
      simulate,
      lastReading,
      language,
      demoMode,
      alertList,
      predictYield,
      prediction,
      predictionLoading,
    ]);

  return (
    <FarmContext.Provider
      value={value}
    >
      {children}
    </FarmContext.Provider>
  );
}

/* =========================================================
   USE FARM HOOK
========================================================= */

export function useFarm() {
  const ctx =
    useContext(
      FarmContext,
    );

  if (!ctx) {
    throw new Error(
      "useFarm must be used inside FarmProvider",
    );
  }

  return ctx;
}