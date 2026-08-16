import { useEffect, useRef, useState } from "react";
import { Mic, Volume2, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFarm } from "@/lib/farm-context";
import { aiAnswer, SUGGESTED_QUESTIONS } from "@/lib/mock-data";
import { VoiceWave } from "./VoiceWave";
import { toast } from "sonner";

type VoiceState = "idle" | "permission" | "listening" | "processing" | "answer" | "error";

/** Floating voice-first assistant. Swap the simulated states for the Web Speech API later. */
export function AskAiButton() {
  const { crop, soil, areaLabel } = useFarm();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<VoiceState>("idle");
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function run(question: string) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHeard(question);
    setState("permission");
    timers.current.push(
      setTimeout(() => setState("listening"), 700),
      setTimeout(() => setState("processing"), 2200),
      setTimeout(() => {
        setAnswer(aiAnswer(question, { crop: crop.name, soil: soil.name, area: areaLabel }));
        setState("answer");
      }, 3600),
    );
  }

  function start() {
    setOpen(true);
    run(SUGGESTED_QUESTIONS[Math.floor(Math.random() * SUGGESTED_QUESTIONS.length)]);
  }

  return (
    <>
      <button
        onClick={start}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full gradient-leaf px-5 py-4 font-display text-sm font-bold text-forest shadow-lift transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      >
        <Mic className="h-5 w-5" strokeWidth={2.5} />
        <span className="hidden sm:inline">🎙️ Ask AI</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Voice Farm Assistant</DialogTitle>
          </DialogHeader>

          <div className="grid place-items-center gap-4 py-2 text-center">
            <div className="relative grid h-28 w-28 place-items-center rounded-full gradient-leaf shadow-lift">
              {(state === "listening" || state === "processing") && (
                <span className="absolute inset-0 animate-ping rounded-full bg-leaf/40" />
              )}
              <Mic className="relative h-10 w-10 text-forest" strokeWidth={2.4} />
            </div>

            {state === "permission" && <p className="text-sm text-muted-foreground">Requesting microphone permission…</p>}
            {state === "listening" && (
              <>
                <p className="font-display text-lg font-bold">🎙️ Listening...</p>
                <VoiceWave />
              </>
            )}
            {state === "processing" && (
              <>
                <p className="font-display text-lg font-bold">Understanding your question...</p>
                <p className="text-sm text-muted-foreground">“{heard}”</p>
              </>
            )}
            {state === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4" /> Microphone unavailable. Please type your question instead.
              </div>
            )}
            {state === "answer" && (
              <div className="w-full text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You asked</p>
                <p className="text-sm font-medium">“{heard}”</p>
                <div className="mt-3 rounded-2xl bg-secondary p-4 text-sm leading-relaxed">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
                    <Sparkles className="h-3.5 w-3.5" /> AI Assistant
                  </p>
                  {answer}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" className="rounded-full" onClick={() => toast.success("Playing response aloud (demo)")}>
                    <Volume2 className="h-4 w-4" /> Listen to Response
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => run(SUGGESTED_QUESTIONS[Math.floor(Math.random() * SUGGESTED_QUESTIONS.length)])}>
                    <Mic className="h-4 w-4" /> Ask again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
