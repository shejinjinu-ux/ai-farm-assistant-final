import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, KeyRound, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/farm/ui-bits";
import { LanguageSelector } from "@/components/farm/LanguageSelector";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import farmerImg from "@/assets/farmer-login.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — AI Farm Assistant" },
      {
        name: "description",
        content: "Create your AI Farm Assistant farmer account.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();

  const [farmerName, setFarmerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!farmerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must contain at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            farmer_name: farmerName.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error("Account creation failed. Please try again.");
        return;
      }

      toast.success("Account created successfully 🌱");

      /*
       * If Supabase email confirmation is enabled,
       * user may need to confirm email before login.
       */
      if (!data.session) {
        toast.success(
          "Please check your email and confirm your account before logging in."
        );
        navigate({ to: "/login" });
        return;
      }

      navigate({ to: "/setup" });
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong while creating your account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* LEFT IMAGE */}
      <div className="relative hidden lg:block">
        <img
          src={farmerImg}
          width={912}
          height={1312}
          alt="Indian farmer in a green field"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 to-forest/15" />

        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-display text-3xl font-extrabold leading-tight text-forest-foreground">
            Build your smart farm with AI-powered insights.
          </p>

          <p className="mt-3 text-sm text-forest-foreground/80">
            AI Farm Assistant
          </p>
        </div>

        <div className="absolute left-10 top-10">
          <Logo invert />
        </div>
      </div>

      {/* RIGHT SIGNUP */}
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
            Create your account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create your farmer account to manage your farm and AI insights.
          </p>

          {/* SIGNUP FORM */}
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >

            {/* FARMER NAME */}
            <div className="space-y-2">
              <Label htmlFor="farmerName">Farmer Name</Label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="farmerName"
                  type="text"
                  placeholder="Enter your name"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="signupEmail">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="signupEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="signupPassword">Password</Label>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="signupPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password
              </Label>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-13 rounded-2xl pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>

            {/* CREATE ACCOUNT */}
            <Button
              type="submit"
              size="lg"
              className="h-13 w-full rounded-2xl text-base font-bold shadow-card"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </form>

          {/* EXISTING USER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Your account is securely managed using Supabase authentication.
          </p>

        </div>
      </div>
    </div>
  );
}