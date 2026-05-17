"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  Github,
  Chrome,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginErrors = Partial<Record<keyof z.infer<typeof loginSchema>, string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: LoginErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    // Simulate network delay for demo
    await new Promise((r) => setTimeout(r, 800));

    // Mock auth — set cookie and redirect
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    document.cookie = `financeai_auth=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    router.push("/");
  }

  function handleOAuth(provider: string) {
    // Placeholder — will connect to Auth.js OAuth in Phase 3
    alert(`${provider} OAuth will be available in Phase 3. Use email/password for now.`);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="relative w-full max-w-md"
    >
      {/* Logo */}
      <motion.div variants={fadeUp} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">FinanceAI</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-[var(--muted-fg)] text-sm">
          Sign in to your account to continue
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="glass-card rounded-2xl p-6 md:p-8 border border-[var(--border-color)]"
      >
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuth("Google")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)]
                       bg-[var(--surface)] text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <Chrome className="w-4 h-4" />
            Google
          </button>
          <button
            onClick={() => handleOAuth("GitHub")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)]
                       bg-[var(--surface)] text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--card-bg)] px-3 text-[var(--muted-fg)]">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] text-sm">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[var(--surface)] text-sm",
                  "placeholder:text-[var(--muted-fg)] outline-none transition-colors",
                  "focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10",
                  errors.email
                    ? "border-[var(--destructive)]/50"
                    : "border-[var(--border-color)]"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[var(--destructive)]">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Link
                href="/register"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl border bg-[var(--surface)] text-sm",
                  "placeholder:text-[var(--muted-fg)] outline-none transition-colors",
                  "focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10",
                  errors.password
                    ? "border-[var(--destructive)]/50"
                    : "border-[var(--border-color)]"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)]">{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-[var(--muted-fg)] cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary
                       text-white text-sm font-semibold hover:opacity-90 transition-opacity
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted-fg)] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
            Create one free
          </Link>
        </p>
      </motion.div>

      {/* Demo hint */}
      <motion.p variants={fadeUp} className="text-center text-xs text-[var(--muted-fg)] mt-4">
        Demo: any email + password (8+ chars) works
      </motion.p>
    </motion.div>
  );
}
