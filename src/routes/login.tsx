import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Mail, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/farm/ui-bits";
import { LanguageSelector } from "@/components/farm/LanguageSelector";
import { useFarm } from "@/lib/farm-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import farmerImg from "@/assets/farmer-login.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Farmer Login — AI Farm Assistant" },
      {
        name: "description",
        content:
          "Log in with your email and password to open your AI farm dashboard.",
      },
      {
        property: "og:title",
        content: "Farmer Login — AI Farm Assistant",
      },
      {
        property: "og:description",
        content: "Voice-friendly, multilingual login built for farmers.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t, updateFarm } = useFarm();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginWithSupabase() {
    if (!email || !secret) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: secret,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error("Login failed. Please try again.");
        return;
      }

      updateFarm({
        mobile: email.trim(),
      });

      toast.success("Login successful 🌱");

      navigate({ to: "/setup" });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during login");
    } finally {
      setLoading(false);
    }
  }

  function demoLogin() {
    updateFarm({
      farmerName: "Ramesh",
      mobile: "98765 43210",
    });

    toast.success("Demo farmer logged in 🌱");

    navigate({ to: "/setup" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT IMAGE */}
      <div className="relative hidden lg:block">
        <img
          src={farmerImg}
          width={912}
          height={1312}
          alt="Indian farmer holding a smartphone in a green rice field"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 to-forest/15" />

        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-display text-3xl font-extrabold leading-tight text-forest-foreground">
            “The assistant tells me when to water — not just what the sensor
            says.”
          </p>

          <p className="mt-3 text-sm text-forest-foreground/80">
            AI Farm Assistant
          </p>
        </div>

        <div className="absolute left-10 top-10">
          <Logo invert />
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex flex-col justify-center gradient-soft px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">

          {/* LOGO + LANGUAGE */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Link to="/" className="min-w-0 lg:hidden">
              <Logo />
            </Link>

            <div className="col-start-2 flex justify-end">
              <LanguageSelector />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="mt-8 font-display text-3xl font-extrabold">
            {t("welcomeBack")}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Log in to open your farm dashboard, sensor readings and AI action
            plan.
          </p>

          {/* LOGIN FORM */}
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              loginWithSupabase();
            }}
          >
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-2xl pl-10 pr-12 text-base"
                  disabled={loading}
                />

                <button
                  type="button"
                  aria-label="Speak your email"
                  onClick={() =>
                    toast("🎙️ Voice email input can be connected later")
                  }
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full gradient-leaf text-forest"
                  disabled={loading}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="secret">{t("password")}</Label>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="secret"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>

            {/* REMEMBER ME */}
            <label className="flex items-center gap-2.5 text-sm font-medium">
              <Checkbox defaultChecked />
              {t("rememberMe")}
            </label>

            {/* BUTTONS */}
            <div className="space-y-3">

              {/* REAL SUPABASE LOGIN */}
              <Button
                type="submit"
                size="lg"
                className="h-13 w-full rounded-2xl text-base font-bold shadow-card"
                disabled={loading}
              >
                {loading ? "Logging in..." : t("login")}

                {!loading && (
                  <ArrowRight className="h-5 w-5" />
                )}
              </Button>

              {/* OTP - kept for future implementation */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="h-13 w-full rounded-2xl text-base font-bold"
                onClick={() =>
                  toast(
                    "OTP login will be connected when SMS authentication is configured."
                  )
                }
                disabled={loading}
              >
                {t("loginOtp")}
              </Button>

              {/* DEMO LOGIN */}
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-13 w-full rounded-2xl text-base font-bold"
                onClick={demoLogin}
                disabled={loading}
              >
                <Sparkles className="h-5 w-5" />
                {t("demoLogin")}
              </Button>
            </div>
          </form>

          {/* INFO */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Use your registered email and password to access your farm
            dashboard. Demo login is available for testing.
          </p>
        </div>
      </div>
    </div>
  );
}