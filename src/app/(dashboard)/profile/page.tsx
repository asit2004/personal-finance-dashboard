"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { getInitials, formatDate } from "@/lib/utils";
import {
  Mail, Calendar, Crown, Camera, MapPin, Briefcase,
  Phone, Loader2, CheckCircle, AlertCircle, User, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  jobTitle: string;
  plan: string;
  currency: string;
  createdAt: string;
  avatar?: string;
}

type SaveState = "idle" | "saving" | "success" | "error";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Local form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    location: "",
    jobTitle: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const data: UserProfile = json.data;
        setProfile(data);
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          location: data.location ?? "",
          jobTitle: data.jobTitle ?? "",
        });
      } catch {
        setErrorMsg("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setProfile((p) => p ? { ...p, ...json.data } : p);

      // Refresh session so header avatar/name updates
      await updateSession({ name: form.name });

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
      setSaveState("error");
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Profile" description="Manage your account" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-72 rounded-2xl bg-[var(--surface)] animate-pulse" />
          <div className="lg:col-span-2 h-72 rounded-2xl bg-[var(--surface)] animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = profile?.name ?? session?.user?.name ?? "User";
  const displayEmail = profile?.email ?? session?.user?.email ?? "";
  const joinDate = profile?.createdAt ? formatDate(profile.createdAt) : "—";
  const plan = profile?.plan ?? session?.user?.plan ?? "free";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <PageHeader title="Profile" description="Manage your personal information" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: identity card ── */}
        <motion.div variants={fadeUp}>
          <GlassCard delay={0} glow="purple" className="lg:col-span-1 h-fit">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold select-none">
                  {getInitials(displayName)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[var(--surface-elevated)]
                             border border-[var(--border-color)] flex items-center justify-center
                             hover:bg-[var(--accent)] transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h2 className="text-lg font-bold">{displayName}</h2>
              <p className="text-sm text-[var(--muted-fg)]">{displayEmail}</p>

              {/* Plan badge */}
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-400/10">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 capitalize">
                  {plan} Plan
                </span>
              </div>

              {/* Meta info */}
              <div className="w-full mt-6 pt-4 border-t border-[var(--border-color)] space-y-3 text-left">
                <MetaRow icon={<Calendar className="w-4 h-4" />} label={`Joined ${joinDate}`} />
                {profile?.location && (
                  <MetaRow icon={<MapPin className="w-4 h-4" />} label={profile.location} />
                )}
                {profile?.jobTitle && (
                  <MetaRow icon={<Briefcase className="w-4 h-4" />} label={profile.jobTitle} />
                )}
                {profile?.phone && (
                  <MetaRow icon={<Phone className="w-4 h-4" />} label={profile.phone} />
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           text-sm font-medium text-rose-400 border border-rose-400/20
                           hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Right: edit form ── */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard delay={0}>
            <h2 className="text-base font-semibold mb-6">Personal Information</h2>

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <Field label="Full Name">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                      <input type="text" value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Your full name"
                        className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                </div>

                {/* Email — read-only */}
                <div className="sm:col-span-2">
                  <Field label="Email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                      <input type="email" value={displayEmail} readOnly
                        title="Email cannot be changed here"
                        className={cn(inputCls, "pl-9 opacity-60 cursor-not-allowed")} />
                    </div>
                  </Field>
                  <p className="text-xs text-[var(--muted-fg)] mt-1 ml-1">
                    Email is managed through your auth provider.
                  </p>
                </div>

                {/* Phone */}
                <Field label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                    <input type="tel" value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className={cn(inputCls, "pl-9")} />
                  </div>
                </Field>

                {/* Job Title */}
                <Field label="Job Title">
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                    <input type="text" value={form.jobTitle}
                      onChange={(e) => update("jobTitle", e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className={cn(inputCls, "pl-9")} />
                  </div>
                </Field>

                {/* Location */}
                <div className="sm:col-span-2">
                  <Field label="Location">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                      <input type="text" value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="e.g. Bangalore, India"
                        className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">
                    Bio
                    <span className="ml-2 text-xs text-[var(--muted-fg)] font-normal">
                      ({form.bio.length}/300)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="A short bio about yourself..."
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
              </div>

              {/* Error message */}
              {saveState === "error" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--destructive)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-6">
                {saveState === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-sm text-[var(--neon-green)]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Profile saved successfully
                  </motion.p>
                )}
                <div className={cn("flex gap-3 ml-auto", saveState === "success" && "ml-0")}>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        name: profile?.name ?? "",
                        phone: profile?.phone ?? "",
                        bio: profile?.bio ?? "",
                        location: profile?.location ?? "",
                        jobTitle: profile?.jobTitle ?? "",
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-color)]
                               hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={saveState === "saving"}
                    className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold
                               hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {saveState === "saving" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium block">{label}</label>
      {children}
    </div>
  );
}

function MetaRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] " +
  "text-sm focus:outline-none focus:border-[var(--primary)]/40 focus:ring-2 " +
  "focus:ring-[var(--primary)]/10 transition-colors placeholder:text-[var(--muted-fg)]";
