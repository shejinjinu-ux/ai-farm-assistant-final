import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Bot,
  Camera,
  ImagePlus,
  Mic,
  Send,
  Volume2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DemoBadge,
  PageHeader,
} from "@/components/farm/ui-bits";

import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type ChatResponse = {
  success: boolean;
  reply: string;
};

export const Route = createFileRoute(
  "/app/assistant"
)({
  head: () =>
    pageMeta(
      "AI Farm Assistant",
      "Ask questions about your crop, soil, irrigation and farm decisions."
    ),
  component: AIAssistant,
});

function AIAssistant() {
  const {
    farm,
    crop,
    soil,
    sensors,
    areaLabel,
  } = useFarm();

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        text: `Hello ${farm.farmerName}! I am AGRIGENIE, your AI farming assistant. Ask me about your ${crop.name}, soil, irrigation, weather, yield or farm management.`,
      },
    ]);

  const [input, setInput] =
    useState("");

  const [imageName, setImageName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const fileRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // BACKEND URL
  // =====================================================

  const BACKEND_URL =
    "http://127.0.0.1:8000";


  // =====================================================
  // GET FARM LOCATION
  // =====================================================

  const getFarmCoordinates = () => {
    const farmData =
      farm as unknown as Record<
        string,
        unknown
      >;

    const latitude =
      farmData.latitude ??
      farmData.lat ??
      farmData.locationLatitude;

    const longitude =
      farmData.longitude ??
      farmData.lng ??
      farmData.lon ??
      farmData.locationLongitude;

    const latNumber =
      typeof latitude === "number"
        ? latitude
        : Number(latitude);

    const lonNumber =
      typeof longitude === "number"
        ? longitude
        : Number(longitude);

    if (
      Number.isFinite(latNumber) &&
      Number.isFinite(lonNumber)
    ) {
      return {
        latitude: latNumber,
        longitude: lonNumber,
      };
    }

    return {
      latitude: null,
      longitude: null,
    };
  };


  // =====================================================
  // BUILD FARM CONTEXT
  // =====================================================

  const buildFarmContext = () => {
    const moisture =
      sensors.find(
        (s) => s.key === "moisture"
      )?.value ?? 42;

    const ph =
      sensors.find(
        (s) => s.key === "ph"
      )?.value ?? 6.5;

    const npkSensors =
      sensors.filter(
        (s) => s.group === "npk"
      );

    const nitrogen =
      npkSensors[0]?.value ?? "Unavailable";

    const phosphorus =
      npkSensors[1]?.value ?? "Unavailable";

    const potassium =
      npkSensors[2]?.value ?? "Unavailable";

    return {
      farmer_name:
        farm.farmerName,

      farm_name:
        farm.farmName,

      crop:
        crop.name,

      soil:
        soil.name,

      area:
        areaLabel,

      state:
        farm.state,

      district:
        farm.district,

      nitrogen,

      phosphorus,

      potassium,

      moisture,

      ph,
    };
  };


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const send = async () => {
    const text =
      input.trim();

    if (!text || loading) {
      return;
    }

    // Add user message immediately
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");

    setLoading(true);

    try {
      // -----------------------------------------------
      // Get saved farm coordinates
      // -----------------------------------------------

      const coordinates =
        getFarmCoordinates();

      // -----------------------------------------------
      // Prepare request
      // -----------------------------------------------

      const requestBody = {
        message: text,

        language: "English",

        farm_context:
          buildFarmContext(),

        latitude:
          coordinates.latitude,

        longitude:
          coordinates.longitude,
      };

      console.log(
        "AGRIGENIE Chat Request:",
        requestBody
      );

      // -----------------------------------------------
      // Call FastAPI
      // -----------------------------------------------

      const response =
        await fetch(
          `${BACKEND_URL}/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              requestBody
            ),
          }
        );

      // -----------------------------------------------
      // Handle backend error
      // -----------------------------------------------

      if (!response.ok) {
        let errorMessage =
          "AI assistant is temporarily unavailable.";

        try {
          const errorData =
            await response.json();

          if (
            errorData?.detail
          ) {
            errorMessage =
              errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(
          errorMessage
        );
      }

      // -----------------------------------------------
      // Read response
      // -----------------------------------------------

      const data =
        (await response.json()) as ChatResponse;

      if (
        !data.reply
      ) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      // -----------------------------------------------
      // Add AI response
      // -----------------------------------------------

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error(
        "AGRIGENIE Chat Error:",
        error
      );

      const errorText =
        error instanceof Error
          ? error.message
          : "Unable to connect to AGRIGENIE.";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            `Sorry, I could not connect to the AI assistant.\n\n${errorText}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // SPEAK RESPONSE
  // =====================================================

  const speak = (
    text: string
  ) => {
    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      speech.rate = 0.95;

      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );
    }
  };


  // =====================================================
  // VOICE INPUT
  // =====================================================

  const startVoice = () => {
    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition?: new () => {
            start: () => void;

            onresult:
              | ((
                  e: {
                    results: {
                      [key: number]: {
                        [key: number]: {
                          transcript: string;
                        };
                      };
                    };
                  }
                ) => void)
              | null;

            onerror?:
              | (() => void)
              | null;
          };
        }
      ).SpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            "Voice input is not supported by this browser. You can use the text box instead.",
        },
      ]);

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.onresult = (
      event
    ) => {
      const transcript =
        event.results[0][0]
          .transcript;

      setInput(
        transcript
      );
    };

    recognition.start();
  };


  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Enter"
    ) {
      e.preventDefault();

      void send();
    }
  };


  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setImageName(
      file.name
    );
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="AI Farm Assistant"
        subtitle="Ask your farm anything"
        badge={
          <DemoBadge label="AGRIGENIE AI Assistant" />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

        {/* =================================================
            CHAT CARD
        ================================================= */}

        <Card className="flex min-h-[600px] flex-col overflow-hidden p-0 shadow-card">

          {/* Header */}

          <div className="flex items-center gap-3 border-b p-4">

            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary">

              <Bot className="h-6 w-6 text-primary" />

            </span>

            <div>

              <p className="font-display font-bold">
                AGRIGENIE AI Chat
              </p>

              <p className="text-xs text-muted-foreground">

                AI powered by your farm
                information and live weather

              </p>

            </div>

          </div>


          {/* Messages */}

          <div className="flex-1 space-y-4 overflow-y-auto p-4">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60"
                    }`}
                  >

                    {message.text}

                    {message.role ===
                      "assistant" && (

                      <button
                        className="ml-2 inline-flex align-middle opacity-70 hover:opacity-100"
                        onClick={() =>
                          speak(
                            message.text
                          )
                        }
                        aria-label="Read aloud"
                      >

                        <Volume2 className="h-3.5 w-3.5" />

                      </button>

                    )}

                  </div>

                </div>

              )
            )}


            {/* Loading */}

            {loading && (

              <div className="flex justify-start">

                <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm">

                  AGRIGENIE is thinking... 🌾🤖

                </div>

              </div>

            )}

          </div>


          {/* Attached Image */}

          {imageName && (

            <div className="mx-4 mb-2 rounded-xl bg-secondary p-2 text-xs">

              Attached: {imageName}

              <button
                className="ml-2 underline"
                onClick={() =>
                  setImageName("")
                }
              >
                Remove
              </button>

            </div>

          )}


          {/* Input */}

          <div className="border-t p-3">

            <div className="flex items-center gap-2">

              {/* Image Upload */}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleImageChange
                }
              />

              <Button
                variant="secondary"
                size="icon"
                onClick={() =>
                  fileRef.current?.click()
                }
                aria-label="Upload image"
              >

                <ImagePlus className="h-4 w-4" />

              </Button>


              {/* Camera */}

              <Button
                variant="secondary"
                size="icon"
                onClick={() =>
                  fileRef.current?.click()
                }
                aria-label="Take photo"
              >

                <Camera className="h-4 w-4" />

              </Button>


              {/* Text */}

              <Input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                disabled={loading}
                placeholder="Ask AGRIGENIE about your farm..."
              />


              {/* Voice */}

              <Button
                variant="secondary"
                size="icon"
                onClick={
                  startVoice
                }
                disabled={loading}
                aria-label="Voice input"
              >

                <Mic className="h-4 w-4" />

              </Button>


              {/* Send */}

              <Button
                size="icon"
                onClick={() =>
                  void send()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                aria-label="Send"
              >

                <Send className="h-4 w-4" />

              </Button>

            </div>

          </div>

        </Card>


        {/* =================================================
            FARM CONTEXT
        ================================================= */}

        <Card className="h-fit gap-4 p-5 shadow-card">

          <h2 className="font-display text-lg font-bold">

            Your farm context

          </h2>


          <div className="space-y-2 text-sm">

            {[
              [
                "Farmer",
                farm.farmerName,
              ],

              [
                "Farm",
                farm.farmName,
              ],

              [
                "Crop",
                crop.name,
              ],

              [
                "Soil",
                soil.name,
              ],

              [
                "Area",
                areaLabel,
              ],

              [
                "State",
                farm.state,
              ],

              [
                "District",
                farm.district,
              ],

              [
                "NPK",

                sensors
                  .filter(
                    (s) =>
                      s.group ===
                      "npk"
                  )
                  .map(
                    (s) =>
                      s.value
                  )
                  .join(" / "),
              ],

              [
                "Moisture",

                `${
                  sensors.find(
                    (s) =>
                      s.key ===
                      "moisture"
                  )?.value ??
                  42
                }%`,
              ],

              [
                "pH",

                `${
                  sensors.find(
                    (s) =>
                      s.key ===
                      "ph"
                  )?.value ??
                  6.5
                }`,
              ],

            ].map(
              ([key, value]) => (

                <div
                  key={key}
                  className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3"
                >

                  <span className="text-muted-foreground">

                    {key}

                  </span>

                  <b className="text-right">

                    {value}

                  </b>

                </div>

              )
            )}

          </div>


          <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">

            <p className="font-semibold text-foreground">

              🌾 AGRIGENIE

            </p>

            <p className="mt-1">

              AI responses use your farm
              context. When farm coordinates
              are available, live weather is
              also supplied to the AI.

            </p>

          </div>

        </Card>

      </div>

    </div>
  );
}