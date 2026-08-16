import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload, FolderOpen, Loader2, ShieldAlert, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBadge, PageHeader, Gauge, Disclaimer } from "@/components/farm/ui-bits";
import { DISEASE_DISCLAIMER, diseaseResult } from "@/lib/mock-data";
import { pageMeta } from "@/lib/meta";
import diseasedLeaf from "@/assets/diseased-leaf.jpg";
import cropRice from "@/assets/crop-rice.jpg";

export const Route = createFileRoute("/app/disease")({
  head: () => pageMeta("Crop Disease Detection", "Upload or capture a crop leaf photo and get a preliminary AI indication with symptoms and next steps."),
  component: Disease,
});

type Phase = "empty" | "preview" | "analyzing" | "result";

function Disease() {
  const [phase, setPhase] = useState<Phase>("empty");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function analyze(src: string) {
    setImage(src);
    setPhase("analyzing");
    setTimeout(() => setPhase("result"), 2600);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    analyze(URL.createObjectURL(f));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Crop Disease Detection" subtitle="AI crop doctor for leaves, spots and discolouration" badge={<DemoBadge label="Simulated Disease Analysis" />} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="gap-4 p-5 shadow-card">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          {phase === "empty" && (
            <div className="grid place-items-center gap-4 rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <img src={cropRice} width={1024} height={700} loading="lazy" alt="Healthy crop leaves illustration" className="h-32 w-full rounded-2xl object-cover" />
              <p className="font-display text-lg font-bold">Add a photo of the affected leaf</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Get close, keep the leaf in focus and avoid shadows. One leaf per photo works best.
              </p>
            </div>
          )}

          {phase !== "empty" && image && (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={image} alt="Crop photo submitted for analysis" className="h-72 w-full object-cover" />
              {phase === "analyzing" && (
                <div className="absolute inset-0 grid place-items-center bg-forest/70 text-center text-forest-foreground">
                  <div>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-3 font-display text-lg font-bold">AI is analyzing the crop...</p>
                    <p className="mt-1 text-sm text-forest-foreground/80">Checking leaf colour, spots and edges</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <Button className="h-12 rounded-2xl font-bold" onClick={() => analyze(diseasedLeaf)}>
              <Camera className="h-4 w-4" /> Take Photo
            </Button>
            <Button variant="secondary" className="h-12 rounded-2xl font-bold" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl font-bold" onClick={() => fileRef.current?.click()}>
              <FolderOpen className="h-4 w-4" /> Choose Image
            </Button>
          </div>
          {phase === "result" && (
            <Button variant="ghost" className="w-fit rounded-full font-bold" onClick={() => { setPhase("empty"); setImage(null); }}>
              <RotateCcw className="h-4 w-4" /> Analyze another photo
            </Button>
          )}
        </Card>

        <Card className="gap-4 p-5 shadow-card">
          {phase !== "result" ? (
            <div className="grid h-full place-items-center gap-3 text-center">
              <span aria-hidden className="text-4xl">🔬</span>
              <p className="font-display text-lg font-bold">No analysis yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Results appear here with possible disease, confidence, symptoms and preventive measures.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Possible Disease</p>
                  <p className="font-display text-2xl font-extrabold">{diseaseResult.name}</p>
                </div>
                <Gauge value={diseaseResult.confidence} size={96} tone="warn" label={`${diseaseResult.confidence}%`} sub="confidence" thickness={9} />
              </div>

              {[
                { title: "Possible symptoms", items: diseaseResult.symptoms },
                { title: "General preventive measures", items: diseaseResult.prevention },
                { title: "Recommended next steps", items: diseaseResult.next },
              ].map((b) => (
                <div key={b.title} className="rounded-2xl bg-secondary/45 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{b.title}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {b.items.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">•</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Badge variant="outline" className="w-fit rounded-full">AI-generated preliminary result — not a confirmed diagnosis</Badge>
            </>
          )}
        </Card>
      </div>

      <Disclaimer text={DISEASE_DISCLAIMER} icon={<ShieldAlert className="h-4 w-4" />} />
    </div>
  );
}
