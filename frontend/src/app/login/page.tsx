"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { BrandLogo } from "@/components/BrandLogo";
import { apiLogin, apiGetProfile, ApiError } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useStore((s) => s.setAuth);
  const hydrateFromProfile = useStore((s) => s.hydrateFromProfile);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const loginData = await apiLogin(email, password);
      // Temporarily set auth to allow subsequent calls
      setAuth(loginData.user, loginData.accessToken);

      // Fetch full profile to hydrate store
      try {
        const profileData = await apiGetProfile(loginData.accessToken);
        hydrateFromProfile(profileData);
      } catch (profileErr) {
        console.error("Failed to load full profile after login:", profileErr);
        // Continue anyway since we got access token
      }

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
          <Link href="/" className="flex justify-center mb-6">
            <BrandLogo className="h-12 w-auto" />
          </Link>
          <h1 className="text-xl font-medium text-foreground text-center mb-8">Welcome back</h1>
          
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button type="submit" className="w-full" variant="default" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
