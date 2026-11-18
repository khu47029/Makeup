"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useModuleHash, useSidebarPreference } from "@/lib/useAdminShell";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronRight,
  CircleAlert,
  Diamond,
  ExternalLink,
  Feather,
  Image as ImageIcon,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Scissors,
  Settings2,
  ShieldCheck,
  UsersRound,
  UserRoundCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  indiaToday,
  parseDate,
  type BookingStatus,
  type Workspace,
} from "@/lib/studio";
import { useWorkspace } from "@/lib/useWorkspace";
import Brand from "../Brand";
import Modal from "../Modal";
import { type Commit, type Confirm, type EditorState } from "./Shared";
import Editors from "./Editors";
import Insights from "./Insights";
import CalendarView from "./CalendarView";
import { Appointments, Customers, Services, StaffView } from "./Records";
import { Portfolio, Reviews, Settings } from "./StudioManagement";
type Module =
  | "overview"
  | "appointments"
  | "calendar"
  | "customers"
  | "services"
  | "bridal"
  | "staff"
  | "gallery"
  | "reviews"
  | "analytics"
  | "settings";
const modules: {
  id: Module;
  label: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  group: string;
  add?: EditorState["kind"];
  action?: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Studio overview",
    subtitle: "Your appointments, customers, and studio activity at a glance.",
    Icon: LayoutDashboard,
    group: "WORKSPACE",
    add: "booking",
    action: "New appointment",
  },
  {
    id: "appointments",
    label: "Appointments",
    title: "Appointments",
    subtitle:
      "Manage your demo booking list, assignments, and appointment statuses.",
    Icon: CalendarDays,
    group: "WORKSPACE",
    add: "booking",
    action: "New appointment",
  },
  {
    id: "calendar",
    label: "Calendar",
    title: "Studio calendar",
    subtitle: "An organised view of every appointment, day by day.",
    Icon: CalendarRange,
    group: "WORKSPACE",
    add: "booking",
    action: "New appointment",
  },
  {
    id: "customers",
    label: "Customers",
    title: "Customers",
    subtitle:
      "Fictional customer profiles and their complete booking histories.",
    Icon: UsersRound,
    group: "WORKSPACE",
    add: "customer",
    action: "New customer",
  },
  {
    id: "services",
    label: "Services",
    title: "Service menu",
    subtitle:
      "Curate service categories, availability, and private demo pricing.",
    Icon: Scissors,
    group: "STUDIO MANAGEMENT",
    add: "service",
    action: "New service",
  },
  {
    id: "bridal",
    label: "Bridal bookings",
    title: "Bridal bookings",
    subtitle:
      "Keep bridal appointments, event dates, and customer details together.",
    Icon: Diamond,
    group: "STUDIO MANAGEMENT",
    add: "booking",
    action: "New bridal booking",
  },
  {
    id: "staff",
    label: "Team members",
    title: "Studio team",
    subtitle: "Manage demo artists, roles, and booking assignments.",
    Icon: UserRoundCheck,
    group: "STUDIO MANAGEMENT",
    add: "staff",
    action: "New team member",
  },
  {
    id: "gallery",
    label: "Portfolio & gallery",
    title: "Portfolio & gallery",
    subtitle:
      "Organise private photographs, editorial references, and original comparisons.",
    Icon: ImageIcon,
    group: "STUDIO MANAGEMENT",
    add: "gallery",
    action: "Add photograph",
  },
  {
    id: "reviews",
    label: "Reviews",
    title: "Review management",
    subtitle:
      "Explore a private moderation workflow without publishing testimonials.",
    Icon: MessageSquare,
    group: "STUDIO MANAGEMENT",
    add: "review",
    action: "New demo review",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "Studio analytics",
    subtitle:
      "Understand booking trends and simulated revenue from your demo data.",
    Icon: Activity,
    group: "BUSINESS",
  },
  {
    id: "settings",
    label: "Business settings",
    title: "Business settings",
    subtitle:
      "Manage your private copy of the studio profile and workspace preferences.",
    Icon: Settings2,
    group: "BUSINESS",
  },
];
export default function AdminApp() {
  const { data, loading, error, setError, saving, save, reload } =
    useWorkspace();
  const hash = useModuleHash();
  const [collapsed, collapse] = useSidebarPreference();
  const [mobile, setMobile] = useState(false),
    [editor, setEditor] = useState<EditorState | null>(null),
    [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState<{
    title: string;
    detail: string;
    next: Workspace;
    message: string;
  } | null>(null);
  const sidebar = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  const current = modules.find((m) => m.id === hash) || modules[0];
  const tab = current.id;
  useEffect(() => {
    const route = () => {
      setMobile(false);
      setEditor(null);
      setConfirm(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", route);
    return () => window.removeEventListener("hashchange", route);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!mobile) return;
    const trigger = menuButton.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLElement>("a,button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobile(false);
      if (e.key === "Tab" && sidebar.current) {
        const all = [
          ...sidebar.current.querySelectorAll<HTMLElement>("a,button"),
        ].filter((el) => el.offsetParent !== null);
        if (e.shiftKey && document.activeElement === all[0]) {
          e.preventDefault();
          all.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === all.at(-1)) {
          e.preventDefault();
          all[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      trigger?.focus();
    };
  }, [mobile]);
  const commit: Commit = async (next, message) => {
    if (await save(next)) {
      setToast(message || "Demo changes saved.");
      return true;
    }
    return false;
  };
  const ask: Confirm = (title, detail, next, message) => {
    setError("");
    setConfirm({ title, detail, next, message });
  };
  const edit = (e: EditorState) => {
    setError("");
    setEditor(e);
  };
  const changeStatus = (id: string, status: BookingStatus) => {
    if (!data) return;
    const next = {
      ...data,
      bookings: data.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    };
    if (status === "Cancelled")
      ask(
        "Cancel this appointment?",
        "This demo booking will be marked as cancelled. Its customer and booking history will be preserved.",
        next,
        "Demo appointment cancelled.",
      );
    else void commit(next, `Appointment marked ${status.toLowerCase()}.`);
  };
  return (
    <div
      className={`admin-shell${collapsed ? " is-collapsed" : ""}${mobile ? " is-mobile-open" : ""}`}
    >
      <a
        className="skip-link"
        href="#admin-main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("admin-main")?.focus();
        }}
      >
        Skip to workspace
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close sidebar"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="studio-sidebar"
        ref={sidebar}
        className="admin-sidebar"
        aria-label="Studio workspace navigation"
      >
        <div className="sidebar-brand">
          <Link href="/" aria-label="M.S Makeovers public website">
            <Brand compact={collapsed && !mobile} />
          </Link>
          <button
            className="mobile-sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-workspace">
          <span className="workspace-icon">
            <Feather size={17} />
          </span>
          <div>
            <strong>Studio workspace</strong>
            <small>Private demo environment</small>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Dashboard modules">
          {["WORKSPACE", "STUDIO MANAGEMENT", "BUSINESS"].map((group) => (
            <div className="sidebar-group" key={group}>
              <small>{group}</small>
              {modules
                .filter((m) => m.group === group)
                .map((m) => (
                  <a
                    key={m.id}
                    title={m.label}
                    aria-label={m.label}
                    aria-current={tab === m.id ? "page" : undefined}
                    href={`#${m.id}`}
                    className={tab === m.id ? "active" : ""}
                    onClick={() => setMobile(false)}
                  >
                    <m.Icon size={17} strokeWidth={1.6} />
                    <span>{m.label}</span>
                    {m.id === "appointments" && !!data?.bookings.length && (
                      <b>{data.bookings.length}</b>
                    )}
                  </a>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link href="/" title="View public website">
            <ExternalLink size={16} />
            <span>View public website</span>
            <ArrowUpRight size={13} />
          </Link>
          <div className="workspace-user">
            <span>MS</span>
            <div>
              <strong>{data?.profile.name || "M.S Makeovers"}</strong>
              <small>Demo workspace</small>
            </div>
            <LockKeyhole size={13} />
          </div>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            className="desktop-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={collapse}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button
            className="mobile-admin-menu"
            ref={menuButton}
            aria-controls="studio-sidebar"
            aria-expanded={mobile}
            aria-label="Open dashboard navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Studio</span>
            <ChevronRight size={11} />
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-end">
            <span className="demo-badge">
              <i />
              DEMO
            </span>
            <span className="topbar-date">
              {parseDate(indiaToday()).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>
        <main id="admin-main" className="admin-main" tabIndex={-1}>
          <div className="admin-page-heading">
            <div>
              <span className="admin-eyebrow">
                M.S MAKEOVERS · STUDIO MANAGER
              </span>
              <h1>{current.title}</h1>
              <p>{current.subtitle}</p>
            </div>
            {current.add && data && (
              <button
                className="btn btn-gold admin-add"
                disabled={saving}
                onClick={() =>
                  edit({ kind: current.add!, bridal: tab === "bridal" })
                }
              >
                <Plus size={16} />
                {current.action}
              </button>
            )}
          </div>
          <div className="demo-notice">
            <ShieldCheck size={16} />
            <p>
              <strong>Demo workspace.</strong> Fictional records, private to
              this browser. No real appointments or payments.
            </p>
          </div>
          {error && !editor && !confirm && (
            <div className="admin-error" role="alert">
              <CircleAlert size={16} />
              <span>{error}</span>
              <button onClick={() => void reload()}>
                <RotateCcw size={13} />
                Retry
              </button>
            </div>
          )}
          {loading && !data ? (
            <div className="panel admin-loading" role="status">
              <LoaderCircle className="spin" size={24} />
              <h3>Opening your studio workspace</h3>
              <p>Loading your private demo records…</p>
            </div>
          ) : !data ? (
            <div className="panel admin-loading">
              <LockKeyhole size={26} />
              <h3>Workspace unavailable</h3>
              <p>Check your connection and retry to load the demo.</p>
              <button
                className="btn btn-ivory btn-small"
                onClick={() => void reload()}
              >
                Reload workspace
              </button>
            </div>
          ) : (
            <div key={tab} className="module-view">
              {(tab === "overview" || tab === "analytics") && (
                <Insights
                  data={data}
                  overview={tab === "overview"}
                  edit={edit}
                  saving={saving}
                  changeStatus={changeStatus}
                />
              )}
              {(tab === "appointments" || tab === "bridal") && (
                <Appointments
                  data={data}
                  edit={edit}
                  saving={saving}
                  changeStatus={changeStatus}
                  bridal={tab === "bridal"}
                />
              )}
              {tab === "calendar" && <CalendarView data={data} edit={edit} />}
              {tab === "customers" && <Customers data={data} edit={edit} />}
              {tab === "services" && <Services data={data} edit={edit} />}
              {tab === "staff" && <StaffView data={data} edit={edit} />}
              {tab === "gallery" && (
                <Portfolio data={data} edit={edit} confirm={ask} />
              )}
              {tab === "reviews" && (
                <Reviews
                  data={data}
                  edit={edit}
                  confirm={ask}
                  save={commit}
                  saving={saving}
                />
              )}
              {tab === "settings" && (
                <Settings
                  data={data}
                  save={commit}
                  saving={saving}
                  confirm={ask}
                />
              )}
            </div>
          )}
          <footer className="admin-footer">
            <span>
              <Feather size={12} />
              M.S Makeovers Studio Manager
            </span>
            <span>Private demo · IST</span>
          </footer>
        </main>
      </div>
      {editor && data && (
        <Editors
          key={`${editor.kind}-${editor.id || "new"}`}
          editor={editor}
          data={data}
          save={commit}
          saving={saving}
          error={error}
          onClose={() => setEditor(null)}
        />
      )}
      {confirm && (
        <Modal
          title={confirm.title}
          eyebrow="DEMO WORKSPACE · CONFIRMATION"
          onClose={() => {
            if (!saving) setConfirm(null);
          }}
        >
          <p className="confirm-copy">{confirm.detail}</p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="btn btn-ivory"
              disabled={saving}
              onClick={() => setConfirm(null)}
            >
              Go back
            </button>
            <button
              className="btn btn-dark"
              disabled={saving}
              onClick={async () => {
                if (await commit(confirm.next, confirm.message))
                  setConfirm(null);
              }}
            >
              {saving ? "Saving…" : "Confirm change"}
              <Check size={14} />
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
