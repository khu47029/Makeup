"use client";
import {
  CalendarDays,
  FolderOpen,
  Pencil,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  displayDate,
  displayTime,
  STATUSES,
  type Booking,
  type BookingStatus,
  type Workspace,
} from "@/lib/studio";
export type EditorState = {
  kind: "booking" | "customer" | "service" | "staff" | "gallery" | "review";
  id?: string;
  date?: string;
  bridal?: boolean;
  customerId?: string;
};
export type OpenEditor = (editor: EditorState) => void;
export type Commit = (data: Workspace, message?: string) => Promise<boolean>;
export type Confirm = (
  title: string,
  detail: string,
  next: Workspace,
  message: string,
) => void;
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
export function EmptyState({
  title,
  description,
  Icon = FolderOpen,
  action,
}: {
  title: string;
  description: string;
  Icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={24} strokeWidth={1.3} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <div className="search-box">
      <Search size={15} />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}
export function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={`status-badge tone-${(tone || String(children)).toLowerCase().replaceAll(" ", "-")}`}
    >
      <i />
      {children}
    </span>
  );
}
export function BookingTable({
  data,
  rows,
  edit,
  changeStatus,
  saving,
  bridal = false,
  compact = false,
}: {
  data: Workspace;
  rows: Booking[];
  edit: OpenEditor;
  changeStatus: (id: string, s: BookingStatus) => void;
  saving: boolean;
  bridal?: boolean;
  compact?: boolean;
}) {
  if (!rows.length)
    return (
      <EmptyState
        title="No appointments to show"
        description="Try a different filter, or create a new demo appointment."
        Icon={CalendarDays}
      />
    );
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>{bridal ? "Appointment / event" : "Date & time"}</th>
            {!compact && !bridal && <th>Assigned to</th>}
            <th>Status</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const c = data.customers.find((c) => c.id === b.customerId),
              s = data.services.find((s) => s.id === b.serviceId);
            return (
              <tr key={b.id}>
                <td>
                  <div className="person-cell">
                    <span className="avatar mini">
                      {initials(c?.name || "D")}
                    </span>
                    <strong>{c?.name}</strong>
                  </div>
                </td>
                <td>
                  <span>{s?.name}</span>
                  {!compact && <small>{s?.category}</small>}
                </td>
                <td>
                  <span>{displayDate(b.date, true)}</span>
                  <small>
                    {displayTime(b.time)} IST
                    {bridal && b.eventDate
                      ? ` · Event: ${displayDate(b.eventDate)}`
                      : ""}
                  </small>
                </td>
                {!compact && !bridal && (
                  <td>
                    {data.staff.find((s) => s.id === b.staffId)?.name ||
                      "Unassigned"}
                  </td>
                )}
                <td>
                  <select
                    disabled={saving}
                    className={`status-select tone-${b.status.toLowerCase()}`}
                    aria-label={`Status for ${c?.name} ${s?.name}`}
                    value={b.status}
                    onChange={(e) =>
                      changeStatus(b.id, e.target.value as BookingStatus)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="row-action"
                    aria-label={`Edit appointment for ${c?.name}`}
                    onClick={() => edit({ kind: "booking", id: b.id })}
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
