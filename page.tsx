import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import "./admin.css";

// The schedule and its India-local date must not be frozen at build time.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Studio Manager — Private Demo",
  robots: { index: false, follow: false },
  description:
    "Explore the private M.S Makeovers studio management demo. All appointments and revenue are simulated.",
};
export default function AdminPage() {
  return <AdminApp />;
}
