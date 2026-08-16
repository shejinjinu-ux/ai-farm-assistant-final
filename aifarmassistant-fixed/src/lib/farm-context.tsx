import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AREA_UNITS, CROPS, SOILS, alerts as seedAlerts, baseSensors, simulateSensors, type SensorReading } from "./mock-data";
import type { LanguageCode } from "./i18n";
import { translate } from "./i18n";

export interface FarmProfile {
  farmerName: string;
  mobile: string;
  farmName: string;
  state: string;
  district: string;
  village: string;
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
  area: 2.5,
  unit: "acre",
  cropId: "rice",
  soilId: "loamy",
  setupComplete: false,
};

interface FarmContextValue {
  farm: FarmProfile;
  updateFarm: (patch: Partial<FarmProfile>) => void;
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
}

const FarmContext = createContext<FarmContextValue | null>(null);
const STORAGE_KEY = "aifa.farm.v1";

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farm, setFarm] = useState<FarmProfile>(defaultFarm);
  const [sensors, setSensors] = useState<SensorReading[]>(baseSensors);
  const [lastReading, setLastReading] = useState("Just now");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [demoMode, setDemoMode] = useState(true);
  const [alertList, setAlertList] = useState(seedAlerts);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.farm) setFarm({ ...defaultFarm, ...parsed.farm });
        if (parsed.language) setLanguage(parsed.language);
        if (typeof parsed.demoMode === "boolean") setDemoMode(parsed.demoMode);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ farm, language, demoMode }));
    } catch {
      /* ignore */
    }
  }, [farm, language, demoMode]);

  const updateFarm = useCallback((patch: Partial<FarmProfile>) => setFarm((f) => ({ ...f, ...patch })), []);
  const simulate = useCallback(() => {
    setSensors((s) => simulateSensors(s));
    setLastReading(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, []);

  const value = useMemo<FarmContextValue>(() => {
    const crop = CROPS.find((c) => c.id === farm.cropId) ?? CROPS[0];
    const soil = SOILS.find((s) => s.id === farm.soilId) ?? SOILS[0];
    const unit = AREA_UNITS.find((u) => u.id === farm.unit) ?? AREA_UNITS[0];
    return {
      farm,
      updateFarm,
      sensors,
      simulate,
      lastReading,
      language,
      setLanguage,
      t: (key: string) => translate(language, key),
      demoMode,
      setDemoMode,
      alertList,
      markAlertsRead: () => setAlertList((a) => a.map((x) => ({ ...x, read: true }))),
      unreadAlerts: alertList.filter((a) => !a.read).length,
      crop,
      soil,
      areaLabel: `${farm.area} ${unit.label}${farm.area === 1 ? "" : "s"}`,
      areaHa: Number((farm.area * unit.toHa).toFixed(3)),
      sensor: (key: string) => sensors.find((s) => s.key === key) ?? sensors[0],
    };
  }, [farm, updateFarm, sensors, simulate, lastReading, language, demoMode, alertList]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used inside FarmProvider");
  return ctx;
}
