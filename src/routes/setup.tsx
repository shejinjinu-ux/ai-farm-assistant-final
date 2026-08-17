import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  Crosshair,
  Ruler,
  ArrowRight,
  ArrowLeft,
  Check,
  Mic,
  Plus,
  Trash2,
  User,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Logo,
  DemoBadge,
} from "@/components/farm/ui-bits";

import { LanguageSelector } from "@/components/farm/LanguageSelector";

import { useFarm } from "@/lib/farm-context";

import {
  AREA_UNITS,
  CROPS,
  SOILS,
} from "@/lib/mock-data";

import { cn } from "@/lib/utils";

import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

import farmMapImg from "@/assets/farm-map.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import soilImg from "@/assets/soil.jpg";


/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      {
        title: "Farm Setup — Location, Area, Crop & Soil",
      },
      {
        name: "description",
        content:
          "Tell the assistant where your farm is, how big it is, and what you grow — then get AI insights.",
      },
      {
        property: "og:title",
        content: "Farm Setup — AI Farm Assistant",
      },
      {
        property: "og:description",
        content:
          "Location, area, crop and soil in four quick steps.",
      },
    ],
  }),

  component: SetupPage,
});


/* =========================================================
   BACKEND
========================================================= */

const BACKEND_URL =
  "http://127.0.0.1:8000";


/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  "Farm Details",
  "Farm Area",
  "Crop",
  "Soil",
];


/* =========================================================
   LOCATION TYPES
========================================================= */

interface LocationState {
  name: string;
  code: string;
}

interface LocationDistrict {
  name: string;
  code: string;
}

interface LocationVillage {
  name: string;
  code: string;
  subdistrict: string;
  subdistrict_code: string;
}


/* =========================================================
   DATABASE TYPE
========================================================= */

interface FarmRow {
  id: string;
  user_id: string;

  farmer_name: string | null;
  phone: string | null;

  farm_name: string | null;

  state: string | null;
  district: string | null;
  village: string | null;

  crop_id: string | null;
  soil_id: string | null;

  area: number | null;
  area_unit: string | null;

  latitude: number | null;
  longitude: number | null;

  language: string | null;

  setup_complete: boolean | null;
}


/* =========================================================
   PAGE
========================================================= */

function SetupPage() {

  const {
    updateFarm,
  } = useFarm();

  const navigate =
    useNavigate();


  /* =======================================================
     FARM LIST
  ======================================================= */

  const [farms, setFarms] =
    useState<FarmRow[]>([]);


  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] =
    useState({
      farmerName: "",
      phone: "",
      farmName: "",

      state: "",
      district: "",
      village: "",

      cropId:
        CROPS[0]?.id ??
        "rice",

      soilId:
        SOILS[0]?.id ??
        "loamy",

      area: "1",

      unit:
        AREA_UNITS[0]?.id ??
        "acre",

      latitude: "",
      longitude: "",

      language: "en",
    });


  /* =======================================================
     LOCATION DATA
  ======================================================= */

  const [locationStates, setLocationStates] =
    useState<LocationState[]>([]);

  const [locationDistricts, setLocationDistricts] =
    useState<LocationDistrict[]>([]);

  const [locationVillages, setLocationVillages] =
    useState<LocationVillage[]>([]);

  const [loadingStates, setLoadingStates] =
    useState(false);

  const [loadingDistricts, setLoadingDistricts] =
    useState(false);

  const [loadingVillages, setLoadingVillages] =
    useState(false);


  /* =======================================================
     OTHER STATES
  ======================================================= */

  const [selectedFarmId, setSelectedFarmId] =
    useState<string | null>(null);

  const [step, setStep] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  /* =======================================================
     LOAD STATES
  ======================================================= */

  async function loadStates() {

    try {

      setLoadingStates(true);

      const response =
        await fetch(
          `${BACKEND_URL}/locations/states`,
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load states",
        );
      }

      const data =
        await response.json();

      setLocationStates(
        data.states ?? [],
      );

    } catch (err) {

      console.error(
        "State loading error:",
        err,
      );

      setError(
        "Unable to load India states.",
      );

    } finally {

      setLoadingStates(false);

    }
  }


  /* =======================================================
     LOAD DISTRICTS
  ======================================================= */

  async function loadDistricts(
    state: string,
  ) {

    if (!state) {

      setLocationDistricts([]);

      return;
    }

    try {

      setLoadingDistricts(true);

      const response =
        await fetch(
          `${BACKEND_URL}/locations/districts?state=${encodeURIComponent(
            state,
          )}`,
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load districts",
        );
      }

      const data =
        await response.json();

      setLocationDistricts(
        data.districts ?? [],
      );

    } catch (err) {

      console.error(
        "District loading error:",
        err,
      );

      setError(
        "Unable to load districts.",
      );

    } finally {

      setLoadingDistricts(false);

    }
  }


  /* =======================================================
     LOAD VILLAGES
  ======================================================= */

  async function loadVillages(
    state: string,
    district: string,
  ) {

    if (!state || !district) {

      setLocationVillages([]);

      return;
    }

    try {

      setLoadingVillages(true);

      const response =
        await fetch(
          `${BACKEND_URL}/locations/villages?state=${encodeURIComponent(
            state,
          )}&district=${encodeURIComponent(
            district,
          )}`,
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load villages",
        );
      }

      const data =
        await response.json();

      setLocationVillages(
        data.villages ?? [],
      );

    } catch (err) {

      console.error(
        "Village loading error:",
        err,
      );

      setError(
        "Unable to load villages.",
      );

    } finally {

      setLoadingVillages(false);

    }
  }


  /* =======================================================
     LOAD FARM LIST
  ======================================================= */

  async function loadFarms() {

    setLoading(true);
    setError("");

    try {

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {

        setError(
          "Please login first.",
        );

        return;
      }

      const {
        data,
        error,
      } =
        await supabase
          .from("farms")
          .select("*")
          .eq(
            "user_id",
            user.id,
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          );

      if (error) {

        console.error(
          "Farm loading error:",
          error,
        );

        setError(
          error.message,
        );

        return;
      }

      setFarms(
        (data ?? []) as FarmRow[],
      );

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load farms.",
      );

    } finally {

      setLoading(false);

    }
  }


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadFarms();
    loadStates();

  }, []);


  /* =======================================================
     FORM UPDATE
  ======================================================= */

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {

    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

  }


  /* =======================================================
     STATE CHANGE
  ======================================================= */

  async function handleStateChange(
    value: string,
  ) {

    updateField(
      "state",
      value,
    );

    updateField(
      "district",
      "",
    );

    updateField(
      "village",
      "",
    );

    updateField(
      "latitude",
      "",
    );

    updateField(
      "longitude",
      "",
    );

    setLocationDistricts([]);
    setLocationVillages([]);

    await loadDistricts(value);

  }


  /* =======================================================
     DISTRICT CHANGE
  ======================================================= */

  async function handleDistrictChange(
    value: string,
  ) {

    updateField(
      "district",
      value,
    );

    updateField(
      "village",
      "",
    );

    updateField(
      "latitude",
      "",
    );

    updateField(
      "longitude",
      "",
    );

    setLocationVillages([]);

    await loadVillages(
      form.state,
      value,
    );

  }


  /* =======================================================
     VILLAGE CHANGE
  ======================================================= */

  async function handleVillageChange(
    value: string,
  ) {

    updateField(
      "village",
      value,
    );

    updateField(
      "latitude",
      "",
    );

    updateField(
      "longitude",
      "",
    );

    try {

      setMessage(
        "Finding village coordinates...",
      );

      const response =
        await fetch(
          `${BACKEND_URL}/locations/village-location?village=${encodeURIComponent(
            value,
          )}&district=${encodeURIComponent(
            form.district,
          )}&state=${encodeURIComponent(
            form.state,
          )}`,
        );

      if (!response.ok) {
        throw new Error(
          "Coordinate API failed",
        );
      }

      const data =
        await response.json();

      if (!data.success) {

        setError(
          "Coordinates not found for this village.",
        );

        setMessage("");

        return;
      }

      updateField(
        "latitude",
        String(data.latitude),
      );

      updateField(
        "longitude",
        String(data.longitude),
      );

      setMessage(
        `📍 ${value} coordinates found successfully.`,
      );

      toast.success(
        "Village location found 📍",
      );

    } catch (err) {

      console.error(
        "Village coordinate error:",
        err,
      );

      setMessage("");

      setError(
        "Unable to get village latitude and longitude.",
      );

    }
  }


  /* =======================================================
     NEW FARM
  ======================================================= */

  function handleNewFarm() {

    if (saving) {
      return;
    }

    setSelectedFarmId(null);

    setForm({
      farmerName: "",
      phone: "",
      farmName: "",

      state: "",
      district: "",
      village: "",

      cropId:
        CROPS[0]?.id ??
        "rice",

      soilId:
        SOILS[0]?.id ??
        "loamy",

      area: "1",

      unit:
        AREA_UNITS[0]?.id ??
        "acre",

      latitude: "",
      longitude: "",

      language: "en",
    });

    setLocationDistricts([]);
    setLocationVillages([]);

    setStep(0);

    setError("");
    setMessage("");

    toast.success(
      "New farm started 🌱",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =======================================================
     EDIT FARM
  ======================================================= */

  async function handleEditFarm(
    farm: FarmRow,
  ) {

    setSelectedFarmId(
      farm.id,
    );

    setForm({
      farmerName:
        farm.farmer_name ??
        "",

      phone:
        farm.phone ??
        "",

      farmName:
        farm.farm_name ??
        "",

      state:
        farm.state ??
        "",

      district:
        farm.district ??
        "",

      village:
        farm.village ??
        "",

      cropId:
        farm.crop_id ??
        CROPS[0]?.id ??
        "rice",

      soilId:
        farm.soil_id ??
        SOILS[0]?.id ??
        "loamy",

      area:
        String(
          farm.area ??
            1,
        ),

      unit:
        farm.area_unit ??
        AREA_UNITS[0]?.id ??
        "acre",

      latitude:
        farm.latitude != null
          ? String(
              farm.latitude,
            )
          : "",

      longitude:
        farm.longitude != null
          ? String(
              farm.longitude,
            )
          : "",

      language:
        farm.language ??
        "en",
    });

    setStep(0);

    setError("");
    setMessage("");

    if (farm.state) {

      await loadDistricts(
        farm.state,
      );

      if (farm.district) {

        await loadVillages(
          farm.state,
          farm.district,
        );

      }
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =======================================================
     CURRENT GPS LOCATION
  ======================================================= */

  function handleCurrentLocation() {

    if (!navigator.geolocation) {

      setError(
        "Geolocation is not supported by this browser.",
      );

      return;
    }

    setGettingLocation(true);
    setError("");
    setMessage(
      "Detecting your current location...",
    );

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const latitudeText =
          latitude.toFixed(7);

        const longitudeText =
          longitude.toFixed(7);

        updateField(
          "latitude",
          latitudeText,
        );

        updateField(
          "longitude",
          longitudeText,
        );

        try {

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
            );

          if (!response.ok) {
            throw new Error(
              "Reverse geocoding failed",
            );
          }

          const data =
            await response.json();

          const address =
            data.address ?? {};

          const detectedState =
            address.state ??
            "";

          const detectedDistrict =
            (
              address.state_district ??
              address.district ??
              address.county ??
              ""
            )
              .replace(
                /\s+district$/i,
                "",
              )
              .trim();

          const detectedVillage =
            address.village ??
            address.town ??
            address.city ??
            address.municipality ??
            address.suburb ??
            "";

          let matchedState =
            detectedState;

          const stateMatch =
            locationStates.find(
              (state) =>
                state.name
                  .toLowerCase() ===
                detectedState
                  .toLowerCase(),
            );

          if (stateMatch) {
            matchedState =
              stateMatch.name;
          }

          setForm(
            (current) => ({
              ...current,

              latitude:
                latitudeText,

              longitude:
                longitudeText,

              state:
                matchedState ||
                current.state,

              district:
                detectedDistrict ||
                current.district,

              village:
                detectedVillage ||
                current.village,
            }),
          );

          if (matchedState) {

            await loadDistricts(
              matchedState,
            );

            if (detectedDistrict) {

              await loadVillages(
                matchedState,
                detectedDistrict,
              );

            }
          }

          setMessage(
            `📍 Location detected: ${
              detectedVillage ||
              "Current location"
            }, ${
              detectedDistrict ||
              "District"
            }, ${
              matchedState ||
              "State"
            }`,
          );

          toast.success(
            "Location detected successfully 📍",
          );

        } catch (reverseError) {

          console.error(
            "Reverse geocoding error:",
            reverseError,
          );

          setMessage(
            "📍 GPS captured. Please select state, district and village manually.",
          );

          toast.success(
            "GPS coordinates captured.",
          );

        } finally {

          setGettingLocation(false);

        }
      },

      (locationError) => {

        console.error(
          "GPS error:",
          locationError,
        );

        setGettingLocation(false);

        if (
          locationError.code ===
          1
        ) {

          setError(
            "Location permission denied. Please allow location access.",
          );

        } else if (
          locationError.code ===
          2
        ) {

          setError(
            "Your location could not be determined.",
          );

        } else if (
          locationError.code ===
          3
        ) {

          setError(
            "Location request timed out. Please try again.",
          );

        } else {

          setError(
            "Unable to get your current location.",
          );

        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }


  /* =======================================================
     VALIDATE
  ======================================================= */

  function validateStep() {

    if (step === 0) {

      if (!form.farmerName.trim()) {

        toast.error(
          "Please enter farmer name.",
        );

        return false;
      }

      if (!form.phone.trim()) {

        toast.error(
          "Please enter mobile number.",
        );

        return false;
      }

      const mobile =
        form.phone.replace(
          /\D/g,
          "",
        );

      if (
        mobile.length !==
        10
      ) {

        toast.error(
          "Please enter a valid 10-digit mobile number.",
        );

        return false;
      }

      if (!form.farmName.trim()) {

        toast.error(
          "Please enter farm name.",
        );

        return false;
      }

      if (!form.state.trim()) {

        toast.error(
          "Please select state.",
        );

        return false;
      }

      if (!form.district.trim()) {

        toast.error(
          "Please select district.",
        );

        return false;
      }

      if (!form.village.trim()) {

        toast.error(
          "Please select village.",
        );

        return false;
      }

      return true;
    }


    if (step === 1) {

      const area =
        Number(form.area);

      if (
        !Number.isFinite(area) ||
        area <= 0
      ) {

        toast.error(
          "Please enter valid farm area.",
        );

        return false;
      }

      if (!form.unit) {

        toast.error(
          "Please select area unit.",
        );

        return false;
      }

      return true;
    }


    if (step === 2) {

      if (!form.cropId) {

        toast.error(
          "Please select crop.",
        );

        return false;
      }

      return true;
    }


    if (step === 3) {

      if (!form.soilId) {

        toast.error(
          "Please select soil type.",
        );

        return false;
      }

      return true;
    }

    return true;
  }


  /* =======================================================
     SAVE FARM
  ======================================================= */

  async function saveFarm() {

    setError("");
    setMessage("");

    setSaving(true);

    try {

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {

        setError(
          "Please login first.",
        );

        return;
      }

      const areaValue =
        Number(form.area);

      const payload = {

        user_id:
          user.id,

        farmer_name:
          form.farmerName.trim(),

        phone:
          form.phone.trim(),

        farm_name:
          form.farmName.trim(),

        state:
          form.state.trim(),

        district:
          form.district.trim(),

        village:
          form.village.trim(),

        crop_id:
          form.cropId,

        soil_id:
          form.soilId,

        area:
          areaValue,

        area_unit:
          form.unit,

        latitude:
          form.latitude.trim()
            ? Number(
                form.latitude,
              )
            : null,

        longitude:
          form.longitude.trim()
            ? Number(
                form.longitude,
              )
            : null,

        language:
          form.language,

        setup_complete:
          true,
      };


      let result;


      if (selectedFarmId) {

        result =
          await supabase
            .from("farms")
            .update(
              payload,
            )
            .eq(
              "id",
              selectedFarmId,
            )
            .eq(
              "user_id",
              user.id,
            )
            .select()
            .single();

      } else {

        result =
          await supabase
            .from("farms")
            .insert(
              payload,
            )
            .select()
            .single();
      }


      if (result.error) {

        console.error(
          "Farm save error:",
          result.error,
        );

        setError(
          result.error.message,
        );

        return;
      }


      const savedFarm =
        result.data as FarmRow;


      updateFarm({

        id:
          savedFarm.id,

        farmerName:
          savedFarm.farmer_name ??
          "",

        mobile:
          savedFarm.phone ??
          "",

        farmName:
          savedFarm.farm_name ??
          "",

        state:
          savedFarm.state ??
          "",

        district:
          savedFarm.district ??
          "",

        village:
          savedFarm.village ??
          "",

        area:
          savedFarm.area ??
          1,

        unit:
          savedFarm.area_unit ??
          "acre",

        cropId:
          savedFarm.crop_id ??
          "rice",

        soilId:
          savedFarm.soil_id ??
          "loamy",
   latitude:
  savedFarm.latitude,

longitude:
  savedFarm.longitude,

        setupComplete:
          true,
      });


      setMessage(
        selectedFarmId
          ? "Farm updated successfully 🌱"
          : "New farm created successfully 🌱",
      );

      toast.success(
        selectedFarmId
          ? "Farm updated successfully 🌱"
          : "New farm created successfully 🌱",
      );


      await loadFarms();


      navigate({
        to: "/app",
      });

    } catch (err) {

      console.error(
        "Save farm error:",
        err,
      );

      setError(
        "Something went wrong while saving the farm.",
      );

    } finally {

      setSaving(false);

    }
  }


  /* =======================================================
     DELETE FARM
  ======================================================= */

  async function handleDeleteFarm(
    id: string,
    name: string,
  ) {

    if (saving) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${name || "this farm"}"?`,
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {

        setError(
          "Please login first.",
        );

        return;
      }


      const {
        error: deleteError,
      } =
        await supabase
          .from("farms")
          .delete()
          .eq(
            "id",
            id,
          )
          .eq(
            "user_id",
            user.id,
          );


      if (deleteError) {

        console.error(
          "Delete error:",
          deleteError,
        );

        setError(
          deleteError.message,
        );

        return;
      }


      toast.success(
        "Farm deleted successfully 🗑️",
      );


      if (
        selectedFarmId === id
      ) {

        handleNewFarm();

      }


      await loadFarms();

    } catch (err) {

      console.error(
        "Delete farm error:",
        err,
      );

      setError(
        "Farm could not be deleted.",
      );

    } finally {

      setSaving(false);

    }
  }


  /* =======================================================
     NEXT
  ======================================================= */

  async function next() {

    if (!validateStep()) {
      return;
    }

    if (
      step <
      STEPS.length - 1
    ) {

      setStep(
        (current) =>
          current + 1,
      );

      return;
    }

    await saveFarm();
  }


  /* =======================================================
     AREA
  ======================================================= */

  const selectedUnit =
    AREA_UNITS.find(
      (unit) =>
        unit.id ===
        form.unit,
    );

  const areaHa =
    (
      Number(form.area) *
      (selectedUnit?.toHa ??
        1)
    ).toFixed(2);


  /* =======================================================
     RECOMMENDED CROPS
  ======================================================= */

  const selectedSoil =
    SOILS.find(
      (s) =>
        s.id ===
        form.soilId,
    ) ??
    SOILS[0];

  const recommended =
    CROPS
      .filter(
        (c) =>
          selectedSoil?.best.includes(
            c.id,
          ),
      )
      .slice(0, 3);


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="min-h-screen gradient-soft pb-16">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-border/50 bg-background/70 backdrop-blur-md">

        <div className="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">

          <Link
            to="/"
            className="min-w-0"
          >
            <Logo />
          </Link>

          <LanguageSelector />

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-[1000px] px-4 pt-8 sm:px-6">


        {/* =================================================
            FARM MANAGEMENT
        ================================================= */}

        <Card className="mb-6 gap-4 p-4 shadow-card sm:p-5">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                My Farms
              </p>

              <p className="mt-1 text-sm font-semibold">
                Select a farm or create a new one
              </p>

            </div>


            <Button
              type="button"
              variant="secondary"
              className="rounded-full font-bold"
              onClick={
                handleNewFarm
              }
              disabled={
                saving
              }
            >

              <Plus className="h-4 w-4" />

              New Farm

            </Button>

          </div>


          {/* FARM LIST */}

          {!loading &&
            farms.length > 0 && (

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {farms.map(
                  (savedFarm) => (

                    <div
                      key={
                        savedFarm.id
                      }
                      className={cn(
                        "rounded-2xl border-2 p-4 transition-all",
                        selectedFarmId ===
                          savedFarm.id
                          ? "border-primary bg-secondary shadow-card"
                          : "border-border",
                      )}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleEditFarm(
                            savedFarm,
                          )
                        }
                        className="w-full text-left"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold">
                              {savedFarm.farm_name ||
                                "Unnamed Farm"}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {savedFarm.farmer_name ||
                                "Farmer name not set"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {savedFarm.village ||
                                "Village not set"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {savedFarm.district ||
                                "District not set"}

                              {savedFarm.state
                                ? `, ${savedFarm.state}`
                                : ""}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-muted-foreground">

                              {savedFarm.area ??
                                0}{" "}

                              {savedFarm.area_unit ??
                                "acre"}

                            </p>

                          </div>


                          {selectedFarmId ===
                            savedFarm.id && (

                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full gradient-leaf text-forest">

                              <Check className="h-4 w-4" />

                            </span>

                          )}

                        </div>

                      </button>


                      <div className="mt-3 flex gap-2">

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="flex-1 rounded-xl"
                          onClick={() =>
                            handleEditFarm(
                              savedFarm,
                            )
                          }
                        >
                          Edit
                        </Button>


                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="rounded-xl"
                          onClick={() =>
                            handleDeleteFarm(
                              savedFarm.id,
                              savedFarm.farm_name ??
                                "this farm",
                            )
                          }
                          disabled={
                            saving
                          }
                        >

                          <Trash2 className="h-4 w-4" />

                        </Button>

                      </div>

                    </div>

                  ),
                )}

              </div>

            )}

        </Card>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="mb-4 rounded-2xl border border-green-300 bg-green-50 p-4 text-sm font-semibold text-green-700">

            {message}

          </div>

        )}


        {error && (

          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">

            {error}

          </div>

        )}


        {/* =================================================
            TITLE
        ================================================= */}

        <DemoBadge
          label="Step-by-step farm setup"
        />

        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
          Let's set up your farm
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Farmer → Location → Area → Crop → Soil.
          Sensor readings, weather and AI analysis
          unlock right after this.
        </p>


        {/* =================================================
            STEPS
        ================================================= */}

        <ol className="mt-7 grid grid-cols-4 gap-2">

          {STEPS.map(
            (item, index) => (

              <li
                key={item}
                className="min-w-0"
              >

                <div
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    index <= step
                      ? "gradient-leaf"
                      : "bg-muted",
                  )}
                />

                <p
                  className={cn(
                    "mt-2 truncate text-[11px] font-bold uppercase tracking-wide",
                    index <= step
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item}
                </p>

              </li>

            ),
          )}

        </ol>


        {/* =================================================
            MAIN CARD
        ================================================= */}

        <Card className="mt-6 gap-6 p-5 shadow-card sm:p-7">


          {/* =================================================
              STEP 0
          ================================================= */}

          {step === 0 && (

            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">

              <div className="space-y-4">

                <h2 className="flex items-center gap-2 font-display text-xl font-bold">

                  <MapPin className="h-5 w-5 text-primary" />

                  Farm Details

                </h2>


                {/* FARMER NAME */}

                <div className="space-y-2">

                  <Label>
                    Farmer Name
                  </Label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      value={
                        form.farmerName
                      }
                      onChange={(e) =>
                        updateField(
                          "farmerName",
                          e.target.value,
                        )
                      }
                      className="h-12 rounded-2xl pl-10"
                      placeholder="Enter farmer name"
                    />

                  </div>

                </div>


                {/* PHONE */}

                <div className="space-y-2">

                  <Label>
                    Mobile Number
                  </Label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      value={
                        form.phone
                      }
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value,
                        )
                      }
                      className="h-12 rounded-2xl pl-10"
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                    />

                  </div>

                </div>


                {/* FARM NAME */}

                <div className="space-y-2">

                  <Label>
                    Farm Name
                  </Label>

                  <Input
                    value={
                      form.farmName
                    }
                    onChange={(e) =>
                      updateField(
                        "farmName",
                        e.target.value,
                      )
                    }
                    className="h-12 rounded-2xl"
                    placeholder="Example: Green Valley Farm"
                  />

                </div>


                {/* STATE */}

                <div className="space-y-2">

                  <Label>
                    State
                  </Label>

                  <Select
                    value={
                      form.state
                    }
                    onValueChange={
                      handleStateChange
                    }
                  >

                    <SelectTrigger className="h-12 rounded-2xl">

                      <SelectValue
                        placeholder={
                          loadingStates
                            ? "Loading states..."
                            : "Select state"
                        }
                      />

                    </SelectTrigger>

                    <SelectContent>

                      {locationStates.map(
                        (state) => (

                          <SelectItem
                            key={
                              state.code
                            }
                            value={
                              state.name
                            }
                          >
                            {state.name}
                          </SelectItem>

                        ),
                      )}

                    </SelectContent>

                  </Select>

                </div>


                {/* DISTRICT */}

                <div className="space-y-2">

                  <Label>
                    District
                  </Label>

                  <Select
                    value={
                      form.district
                    }
                    disabled={
                      !form.state ||
                      loadingDistricts
                    }
                    onValueChange={
                      handleDistrictChange
                    }
                  >

                    <SelectTrigger className="h-12 rounded-2xl">

                      <SelectValue
                        placeholder={
                          loadingDistricts
                            ? "Loading districts..."
                            : form.state
                              ? "Select district"
                              : "Select state first"
                        }
                      />

                    </SelectTrigger>

                    <SelectContent>

                      {locationDistricts.map(
                        (district) => (

                          <SelectItem
                            key={
                              district.code
                            }
                            value={
                              district.name
                            }
                          >
                            {district.name}
                          </SelectItem>

                        ),
                      )}

                    </SelectContent>

                  </Select>

                </div>


                {/* VILLAGE */}

                <div className="space-y-2">

                  <Label>
                    Village / Town
                  </Label>

                  <Select
                    value={
                      form.village
                    }
                    disabled={
                      !form.district ||
                      loadingVillages
                    }
                    onValueChange={
                      handleVillageChange
                    }
                  >

                    <SelectTrigger className="h-12 rounded-2xl">

                      <SelectValue
                        placeholder={
                          loadingVillages
                            ? "Loading villages..."
                            : form.district
                              ? "Select village"
                              : "Select district first"
                        }
                      />

                    </SelectTrigger>

                    <SelectContent>

                      {locationVillages.map(
                        (village) => (

                          <SelectItem
                            key={`${village.code}-${village.name}`}
                            value={
                              village.name
                            }
                          >

                            {village.name}

                          </SelectItem>

                        ),
                      )}

                    </SelectContent>

                  </Select>

                </div>


                {/* VOICE DEMO */}

                <button
                  type="button"
                  onClick={() =>
                    toast(
                      "🎙️ Listening... (demo voice input)",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-bold"
                >

                  <Mic className="h-4 w-4" />

                  Voice Input

                </button>


                {/* GPS */}

                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 w-full rounded-2xl font-bold"
                  onClick={
                    handleCurrentLocation
                  }
                  disabled={
                    gettingLocation
                  }
                >

                  <Crosshair className="h-4 w-4" />

                  {gettingLocation
                    ? "Detecting location..."
                    : "Use Current Location"}

                </Button>


                {/* COORDINATES */}

                {(form.latitude ||
                  form.longitude) && (

                  <div className="rounded-2xl bg-secondary/60 p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      GPS Coordinates
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-[10px] text-muted-foreground">
                          Latitude
                        </p>

                        <p className="text-sm font-bold">
                          {form.latitude}
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] text-muted-foreground">
                          Longitude
                        </p>

                        <p className="text-sm font-bold">
                          {form.longitude}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* MAP */}

              <div className="relative overflow-hidden rounded-2xl">

                <img
                  src={farmMapImg}
                  width={1200}
                  height={900}
                  loading="lazy"
                  alt="Aerial view of farm plots"
                  className="h-full min-h-56 w-full object-cover"
                />

                <div className="absolute inset-0 bg-forest/25" />

                <div className="absolute inset-0 grid place-items-center">

                  <span className="glass rounded-2xl px-4 py-3 text-center">

                    <MapPin className="mx-auto h-5 w-5 text-primary" />

                    <p className="mt-1 font-display text-sm font-extrabold">
                      {form.village ||
                        "Your Farm"}
                    </p>

                    <p className="text-[11px] text-muted-foreground">

                      {form.district ||
                        "District"}

                      {form.state
                        ? `, ${form.state}`
                        : ""}

                    </p>

                  </span>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              STEP 1 — AREA
          ================================================= */}

          {step === 1 && (

            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">

              <div className="space-y-4">

                <h2 className="flex items-center gap-2 font-display text-xl font-bold">

                  <Ruler className="h-5 w-5 text-primary" />

                  Farm Area

                </h2>


                <div className="space-y-2">

                  <Label>
                    Farm Area
                  </Label>

                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={
                      form.area
                    }
                    onChange={(e) =>
                      updateField(
                        "area",
                        e.target.value,
                      )
                    }
                    className="h-12 rounded-2xl"
                  />

                </div>


                <div className="space-y-2">

                  <Label>
                    Area Unit
                  </Label>

                  <Select
                    value={
                      form.unit
                    }
                    onValueChange={(
                      value,
                    ) =>
                      updateField(
                        "unit",
                        value,
                      )
                    }
                  >

                    <SelectTrigger className="h-12 rounded-2xl">

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      {AREA_UNITS.map(
                        (unit) => (

                          <SelectItem
                            key={
                              unit.id
                            }
                            value={
                              unit.id
                            }
                          >
                            {unit.label}
                          </SelectItem>

                        ),
                      )}

                    </SelectContent>

                  </Select>

                </div>


                <Card className="bg-secondary/60 p-5">

                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Area Summary
                  </p>

                  <p className="mt-2 font-display text-2xl font-extrabold">

                    {form.area}{" "}

                    {selectedUnit?.label ??
                      form.unit}

                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">

                    Approximately{" "}
                    {areaHa}{" "}
                    hectares

                  </p>

                </Card>

              </div>


              <div className="relative overflow-hidden rounded-2xl">

                <img
                  src={farmMapImg}
                  width={1200}
                  height={900}
                  loading="lazy"
                  alt="Farm area"
                  className="h-full min-h-56 w-full object-cover"
                />

                <div className="absolute inset-0 bg-forest/25" />

                <div className="absolute inset-0 grid place-items-center">

                  <div className="glass rounded-2xl px-5 py-4 text-center">

                    <Ruler className="mx-auto h-6 w-6 text-primary" />

                    <p className="mt-2 font-bold">
                      Farm Size
                    </p>

                    <p className="text-sm text-muted-foreground">

                      {form.area}{" "}

                      {selectedUnit?.label ??
                        form.unit}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              STEP 2 — CROP
          ================================================= */}

          {step === 2 && (

            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">

              <div className="space-y-4">

                <h2 className="font-display text-xl font-bold">
                  Crop
                </h2>

                <div className="grid gap-2 sm:grid-cols-2">

                  {CROPS.map(
                    (crop) => (

                      <button
                        key={
                          crop.id
                        }
                        type="button"
                        onClick={() =>
                          updateField(
                            "cropId",
                            crop.id,
                          )
                        }
                        className={cn(
                          "rounded-2xl border-2 p-4 text-left transition-all",
                          form.cropId ===
                            crop.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/40",
                        )}
                      >

                        <p className="text-2xl">
                          {crop.emoji}
                        </p>

                        <p className="mt-2 text-sm font-bold">
                          {crop.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          ₹{crop.price}/quintal
                        </p>

                      </button>

                    ),
                  )}

                </div>

              </div>


              <div className="relative overflow-hidden rounded-2xl">

                <img
                  src={cropRice}
                  width={1024}
                  height={700}
                  loading="lazy"
                  alt="Crop field"
                  className="h-64 w-full object-cover"
                />

                <div className="absolute inset-0 bg-forest/20" />

                <div className="absolute inset-x-4 bottom-4">

                  <div className="glass rounded-2xl p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Selected Crop
                    </p>

                    <p className="mt-1 font-display text-xl font-extrabold">

                      {CROPS.find(
                        (c) =>
                          c.id ===
                          form.cropId,
                      )?.emoji}{" "}

                      {CROPS.find(
                        (c) =>
                          c.id ===
                          form.cropId,
                      )?.name ??
                        "Crop"}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              STEP 3 — SOIL
          ================================================= */}

          {step === 3 && (

            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">

              <div className="space-y-4">

                <h2 className="font-display text-xl font-bold">
                  Soil Type
                </h2>

                <div className="grid gap-2 sm:grid-cols-2">

                  {SOILS.map(
                    (s) => (

                      <button
                        key={
                          s.id
                        }
                        type="button"
                        onClick={() =>
                          updateField(
                            "soilId",
                            s.id,
                          )
                        }
                        className={cn(
                          "rounded-2xl border-2 p-4 text-left transition-all",
                          form.soilId ===
                            s.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/40",
                        )}
                      >

                        <p className="text-sm font-bold">
                          {s.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.note}
                        </p>

                      </button>

                    ),
                  )}

                </div>

              </div>


              <div className="space-y-4">

                <div className="relative overflow-hidden rounded-2xl">

                  <img
                    src={soilImg}
                    width={1024}
                    height={700}
                    loading="lazy"
                    alt="Farm soil"
                    className="h-40 w-full object-cover"
                  />

                </div>


                <Card className="gap-2 bg-secondary/60 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Recommended Crop
                  </p>

                  <p className="font-display text-lg font-extrabold">

                    {recommended[0]?.emoji}{" "}

                    {recommended[0]?.name ??
                      CROPS.find(
                        (c) =>
                          c.id ===
                          form.cropId,
                      )?.name ??
                      "Crop"}

                  </p>

                  <p className="text-xs text-muted-foreground">

                    Based on{" "}

                    {selectedSoil?.name ??
                      "selected soil"}{" "}

                    soil and current demo
                    conditions.

                    {" "}

                    Also suitable:{" "}

                    {recommended
                      .slice(1)
                      .map(
                        (r) =>
                          r.name,
                      )
                      .join(
                        ", ",
                      ) ||
                      "—"}

                    .

                  </p>

                </Card>

              </div>

            </div>

          )}


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex flex-wrap gap-3 border-t pt-5">

            {step > 0 && (

              <Button
                type="button"
                variant="ghost"
                className="h-12 rounded-2xl font-bold"
                onClick={() =>
                  setStep(
                    (current) =>
                      current - 1,
                  )
                }
                disabled={
                  saving
                }
              >

                <ArrowLeft className="h-4 w-4" />

                Back

              </Button>

            )}


            <Button
              type="button"
              className="h-12 flex-1 rounded-2xl text-base font-bold shadow-card sm:flex-none sm:px-8"
              onClick={
                next
              }
              disabled={
                saving ||
                gettingLocation
              }
            >

              {saving
                ? "Saving..."
                : step ===
                    STEPS.length - 1
                  ? "Save & Open Dashboard"
                  : "Continue"}

              {!saving && (

                <ArrowRight className="h-5 w-5" />

              )}

            </Button>

          </div>

        </Card>


        {/* =================================================
            GPS INFO
        ================================================= */}

        <div className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-4">

          <div className="flex gap-3">

            <Crosshair className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div>

              <p className="text-sm font-bold">
                GPS location
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">

                Use Current Location automatically
                detects your latitude, longitude,
                state, district and nearby village.
                You can still change them manually.

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}