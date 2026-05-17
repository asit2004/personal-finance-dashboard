"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { mockUser } from "@/lib/mock-data";
import { getInitials, formatDate } from "@/lib/utils";
import { Mail, Calendar, Crown, Camera, MapPin, Briefcase } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Manage your account" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <GlassCard delay={0.1} glow="purple" className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(mockUser.name)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--accent)] transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-lg font-bold">{mockUser.name}</h2>
            <p className="text-sm text-[var(--muted-fg)]">{mockUser.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 capitalize">{mockUser.plan} Plan</span>
            </div>
            <div className="w-full mt-6 pt-4 border-t border-[var(--border-color)] space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(mockUser.joinDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
                <Briefcase className="w-4 h-4" />
                <span>Software Engineer</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Edit form */}
        <GlassCard delay={0.15} className="lg:col-span-2">
          <h2 className="text-base font-semibold mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First Name</label>
              <input
                type="text"
                defaultValue="Alex"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last Name</label>
              <input
                type="text"
                defaultValue="Thompson"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
                <input
                  type="email"
                  defaultValue={mockUser.email}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <textarea
                rows={3}
                defaultValue="Software engineer passionate about personal finance and building tools that make money management effortless."
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
