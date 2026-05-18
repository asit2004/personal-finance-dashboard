"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Mail, Lock, Eye, EyeOff, User, TrendingUp,
  ArrowRight, Loader2, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Fields = { name: string; email: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Fields | "terms", string>>;

const PERKS = [
  "AI-powered spending insights",
  "Real-time budget tracking",
  "Subscription detector",
  "Financial health score",
];

export default function RegisterPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({ name: "", email: "", password: "", confirmPassword: "" });
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function update(field: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse({ ...fields, terms });
    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof Errors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    // 1. Create account
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fields.name, email: fields.email, password: fields.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error ?? "Registration failed. Please try again.");
      setIsLoading(false);
      return;
    }

    // 2. Auto sign-in after registration
    const signInRes = await signIn("credentials", {
      email: fields.email,
      password: fields.password,
      redirect: false,
    });

    setIsLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="relative w-full max-w-lg"
    >
      <motion.div variants={fadeUp} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">FinanceAI</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-[var(--muted-fg)] text-sm">Start managing your finances smarter, for free</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2 mb-6">
        {PERKS.map((perk) => (
          <div key={perk} className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
            <CheckCircle className="w-3.5 h-3.5 text-[var(--neon-green)] shrink-0" />
            {perk}
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="glass-card rounded-2xl p-6 md:p-8 border border-[var(--border-color)]"
      >
        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20
                          text-[var(--destructive)] text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name" id="name" icon={<User className="w-4 h-4" />}
            type="text" autoComplete="name" value={fields.name}
            onChange={(v) => update("name", v)} placeholder="Alex Thompson" error={errors.name} />

          <FormField label="Email" id="email" icon={<Mail className="w-4 h-4" />}
            type="email" autoComplete="email" value={fields.email}
            onChange={(v) => update("email", v)} placeholder="you@example.com" error={errors.email} />

          <PasswordField id="password" label="Password" autoComplete="new-password"
            value={fields.password} onChange={(v) => update("password", v)}
            show={showPassword} onToggle={() => setShowPassword(!showPassword)}
            error={errors.password} hint="Minimum 8 characters" />

          <PasswordField id="confirmPassword" label="Confirm Password" autoComplete="new-password"
            value={fields.confirmPassword} onChange={(v) => update("confirmPassword", v)}
            show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
            error={errors.confirmPassword} />

          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <input id="terms" type="checkbox" checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[var(--primary)] cursor-pointer shrink-0" />
              <label htmlFor="terms" className="text-sm text-[var(--muted-fg)] cursor-pointer leading-relaxed">
                I agree to the{" "}
                <span className="text-[var(--primary)] hover:underline cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-[var(--primary)] hover:underline cursor-pointer">Privacy Policy</span>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-[var(--destructive)] ml-6">{errors.terms}</p>}
          </div>

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
              <>Create account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted-fg)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

function FormField({ id, label, icon, type, autoComplete, value, onChange, placeholder, error }: {
  id: string; label: string; icon: React.ReactNode; type: string;
  autoComplete?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">{icon}</span>
        <input id={id} type={type} autoComplete={autoComplete} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[var(--surface)] text-sm",
            "placeholder:text-[var(--muted-fg)] outline-none transition-colors",
            "focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10",
            error ? "border-[var(--destructive)]/50" : "border-[var(--border-color)]"
          )} />
      </div>
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

function PasswordField({ id, label, autoComplete, value, onChange, show, onToggle, error, hint }: {
  id: string; label: string; autoComplete?: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggle: () => void;
  error?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="••••••••"
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-xl border bg-[var(--surface)] text-sm",
            "placeholder:text-[var(--muted-fg)] outline-none transition-colors",
            "focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10",
            error ? "border-[var(--destructive)]/50" : "border-[var(--border-color)]"
          )} />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
          aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--muted-fg)]">{hint}</p>}
    </div>
  );
}
