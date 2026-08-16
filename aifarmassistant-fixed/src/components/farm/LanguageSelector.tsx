import { Globe } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useFarm } from "@/lib/farm-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LanguageSelector({ variant = "default", className }: { variant?: "default" | "invert"; className?: string }) {
  const { language, setLanguage } = useFarm();
  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
      <SelectTrigger
        aria-label="Select language"
        className={cn(
          "h-10 w-[132px] rounded-full border-border/70 text-sm font-semibold",
          variant === "invert" && "border-white/25 bg-white/10 text-forest-foreground",
          className,
        )}
      >
        <Globe className="h-4 w-4 shrink-0 opacity-80" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
