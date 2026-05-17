import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal information and account details.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
