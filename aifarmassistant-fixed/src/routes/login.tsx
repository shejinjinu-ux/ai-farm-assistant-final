import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Phone, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/farm/ui-bits";
import { LanguageSelector } from "@/components/farm/LanguageSelector";
import { useFarm } from "@/lib/farm-context";
import { toast } from "sonner";
import farmerImg from "@/assets/farmer-login.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Farmer Login — AI Farm Assistant" },
      { name: "description", content: "Log in with your mobile number or OTP to open your AI farm dashboard. Demo login available." },
      { property: "og:title", content: "Farmer Login — AI Farm Assistant" },
      { property: "og:description", content: "Voice-friendly, multilingual login built for farmers." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t, updateFarm } = useFarm();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [secret, setSecret] = useState("");

  function go(demo = false) {
    if (demo) {
      updateFarm({ farmerName: "Ramesh", mobile: "98765 43210" });
      toast.success("Demo farmer logged in 🌱");
    } else {
      updateFarm({ mobile: mobile || "98765 43210" });
      toast.success(t("welcomeBack"));
    }
    navigate({ to: "/setup" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={farmerImg} width={912} height={1312} alt="Indian farmer holding a smartphone in a green rice field" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 to-forest/15" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-display text-3xl font-extrabold leading-tight text-forest-foreground">
            “The assistant tells me when to water — not just what the sensor says.”
          </p>
          <p className="mt-3 text-sm text-forest-foreground/80">Demo farmer story · Cuttack, Odisha</p>
        </div>
        <div className="absolute left-10 top-10">
          <Logo invert />
        </div>
      </div>

      <div className="flex flex-col justify-center gradient-soft px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Link to="/" className="min-w-0 lg:hidden">
              <Logo />
            </Link>
            <div className="col-start-2 flex justify-end">
              <LanguageSelector />
            </div>
          </div>

          <h1 className="mt-8 font-display text-3xl font-extrabold">{t("welcomeBack")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to open your farm dashboard, sensor readings and AI action plan.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("mobile")}</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobile"
                  inputMode="tel"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-13 rounded-2xl pl-10 pr-12 text-base"
                />
                <button
                  type="button"
                  aria-label="Speak your mobile number"
                  onClick={() => toast("🎙️ Listening... (demo voice input)")}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full gradient-leaf text-forest"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">{t("password")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="secret"
                  type="password"
                  placeholder="••••••"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium">
              <Checkbox defaultChecked /> {t("rememberMe")}
            </label>

            <div className="space-y-3">
              <Button type="submit" size="lg" className="h-13 w-full rounded-2xl text-base font-bold shadow-card">
                {t("login")} <ArrowRight className="h-5 w-5" />
              </Button>
              <Button type="button" size="lg" variant="secondary" className="h-13 w-full rounded-2xl text-base font-bold" onClick={() => toast.success("OTP sent to your mobile (demo)")}>
                {t("loginOtp")}
              </Button>
              <Button type="button" size="lg" variant="outline" className="h-13 w-full rounded-2xl text-base font-bold" onClick={() => go(true)}>
                <Sparkles className="h-5 w-5" /> {t("demoLogin")}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo login uses simulated farm data — no real account or backend is required.
          </p>
        </div>
      </div>
    </div>
  );
}
