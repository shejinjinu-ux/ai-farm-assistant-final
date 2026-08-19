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
import { DemoBadge, PageHeader } from "@/components/farm/ui-bits";
import { useFarm } from "@/lib/farm-context";
import { pageMeta } from "@/lib/meta";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export const Route = createFileRoute("/app/assistant")({
  head: () =>
    pageMeta(
      "AI Farm Assistant",
      "Ask questions about your crop, soil, irrigation and farm decisions."
    ),
  component: AIAssistant,
});

function AIAssistant() {
  const { farm, crop, soil, sensors, areaLabel } = useFarm();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello ${farm.farmerName}! I am your AI Farm Assistant. Ask me about your ${crop.name}, soil, irrigation, yield or farm costs.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [imageName, setImageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // =========================================================
  // SEND MESSAGE TO FASTAPI + GEMINI
  // =========================================================

  const send = async () => {
    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    // Show user message
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        text: text,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      console.log("Calling AGRIGENIE backend...");

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            language: "English",
          }),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "AI assistant error"
        );
      }

      // Show Gemini response
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text:
            data.reply ||
            "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text:
            "Sorry, I could not connect to the AI assistant. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // TEXT TO SPEECH
  // =========================================================

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";

    window.speechSynthesis.speak(speech);
  };

  // =========================================================
  // VOICE INPUT
  // =========================================================

  const startVoice = () => {
    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition?: new () => {
            start: () => void;
            onresult:
              | ((
                  event: {
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
          };
        }
      ).SpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((currentMessages) => [
        ...currentMessages,
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

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setInput(transcript);
    };

    recognition.start();
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      send();
    }
  };

  // =========================================================
  // FARM SENSOR VALUES
  // =========================================================

  const moisture =
    sensors.find(
      (sensor) => sensor.key === "moisture"
    )?.value ?? 42;

  const ph =
    sensors.find(
      (sensor) => sensor.key === "ph"
    )?.value ?? 6.5;

  const npkValues = sensors
    .filter(
      (sensor) => sensor.group === "npk"
    )
    .map((sensor) => sensor.value)
    .join(" / ");

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="AI Farm Assistant"
        subtitle="Ask your farm anything"
        badge={
          <DemoBadge label="AI Assistant" />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

        {/* =====================================================
            CHAT
        ===================================================== */}

        <Card className="flex min-h-[600px] flex-col overflow-hidden p-0 shadow-card">

          {/* CHAT HEADER */}

          <div className="flex items-center gap-3 border-b p-4">

            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary">

              <Bot className="h-6 w-6 text-primary" />

            </span>

            <div>

              <p className="font-display font-bold">
                Farm AI Chat
              </p>

              <p className="text-xs text-muted-foreground">
                Powered by AGRIGENIE AI
              </p>

            </div>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 space-y-4 overflow-y-auto p-4">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60"
                  }`}
                >

                  <span>
                    {message.text}
                  </span>

                  <button
                    type="button"
                    className="ml-2 inline-flex align-middle opacity-70 hover:opacity-100"
                    onClick={() =>
                      speak(message.text)
                    }
                    aria-label="Read aloud"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>

                </div>

              </div>

            ))}

            {/* LOADING */}

            {isLoading && (

              <div className="flex justify-start">

                <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm">

                  <span className="animate-pulse">
                    AGRIGENIE is thinking...
                  </span>

                </div>

              </div>

            )}

          </div>

          {/* ATTACHED IMAGE */}

          {imageName && (

            <div className="mx-4 mb-2 rounded-xl bg-secondary p-2 text-xs">

              Attached:{" "}
              <strong>{imageName}</strong>

              <button
                type="button"
                className="ml-2 text-destructive"
                onClick={() =>
                  setImageName("")
                }
              >
                Remove
              </button>

            </div>

          )}

          {/* INPUT */}

          <div className="border-t p-3">

            <div className="flex items-center gap-2">

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {

                  const file =
                    event.target.files?.[0];

                  if (file) {
                    setImageName(file.name);
                  }

                }}
              />

              {/* IMAGE */}

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() =>
                  fileRef.current?.click()
                }
                aria-label="Upload image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>

              {/* CAMERA */}

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() =>
                  fileRef.current?.click()
                }
                aria-label="Take photo"
              >
                <Camera className="h-4 w-4" />
              </Button>

              {/* INPUT */}

              <Input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about your farm..."
                disabled={isLoading}
              />

              {/* MICROPHONE */}

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={startVoice}
                aria-label="Voice input"
                disabled={isLoading}
              >
                <Mic className="h-4 w-4" />
              </Button>

              {/* SEND */}

              <Button
                type="button"
                size="icon"
                onClick={send}
                aria-label="Send"
                disabled={
                  isLoading ||
                  !input.trim()
                }
              >
                <Send className="h-4 w-4" />
              </Button>

            </div>

          </div>

        </Card>

        {/* =====================================================
            FARM CONTEXT
        ===================================================== */}

        <Card className="h-fit gap-4 p-5 shadow-card">

          <h2 className="font-display text-lg font-bold">
            Your farm context
          </h2>

          <div className="space-y-2 text-sm">

            {/* CROP */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                Crop
              </span>

              <b>
                {crop.name}
              </b>

            </div>

            {/* SOIL */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                Soil
              </span>

              <b>
                {soil.name}
              </b>

            </div>

            {/* AREA */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                Area
              </span>

              <b>
                {areaLabel}
              </b>

            </div>

            {/* NPK */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                NPK
              </span>

              <b>
                {npkValues || "Demo"}
              </b>

            </div>

            {/* MOISTURE */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                Moisture
              </span>

              <b>
                {moisture}%
              </b>

            </div>

            {/* PH */}

            <div className="flex justify-between gap-3 rounded-xl bg-secondary/50 p-3">

              <span className="text-muted-foreground">
                pH
              </span>

              <b>
                {ph}
              </b>

            </div>

          </div>

          <p className="text-xs text-muted-foreground">
            AGRIGENIE AI can answer farming
            questions using the connected
            backend service.
          </p>

        </Card>

      </div>

    </div>
  );
}