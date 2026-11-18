"use client";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
} from "lucide-react";
import {
  dateKey,
  dateOffset,
  displayDate,
  displayTime,
  indiaToday,
  parseDate,
  type Booking,
  type Workspace,
} from "@/lib/studio";
import { Badge, EmptyState, type OpenEditor } from "./Shared";
export default function CalendarView({
  data,
  edit,
}: {
  data: Workspace;
  edit: OpenEditor;
}) {
  const [mode, setMode] = useState<"Day" | "Week" | "Month">("Month"),
    [selected, setSelected] = useState(indiaToday()),
    [cancelled, setCancelled] = useState(false);
  const day = parseDate(selected),
    today = indiaToday();
  const shift = (dir: number) => {
    const next = new Date(day);
    if (mode === "Month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + dir);
    } else next.setDate(next.getDate() + dir * (mode === "Week" ? 7 : 1));
    setSelected(dateKey(next));
  };
  const monday = (d: Date) => dateOffset(-((d.getDay() + 6) % 7), d);
  const first = new Date(day.getFullYear(), day.getMonth(), 1, 12),
    monthStart = parseDate(monday(first)),
    weekStart = parseDate(monday(day));
  const dayCount = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
  const dates = Array.from(
    {
      length:
        mode === "Month"
          ? Math.ceil((((first.getDay() + 6) % 7) + dayCount) / 7) * 7
          : 7,
    },
    (_, i) => dateOffset(i, mode === "Month" ? monthStart : weekStart),
  );
  const rows = (date: string) =>
    data.bookings
      .filter((b) => b.date === date && (cancelled || b.status !== "Cancelled"))
      .sort((a, b) => a.time.localeCompare(b.time));
  const customer = (b: Booking) =>
    data.customers.find((c) => c.id === b.customerId)?.name;
  const service = (b: Booking) =>
    data.services.find((s) => s.id === b.serviceId)?.name;
  const title =
    mode === "Month"
      ? day.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : mode === "Day"
        ? day.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : `${displayDate(dates[0])} – ${displayDate(dates[6], true)}`;
  return (
    <section className="panel calendar-panel">
      <div className="calendar-toolbar">
        <div className="date-controls">
          <button
            className="icon-button"
            aria-label="Previous calendar period"
            onClick={() => shift(-1)}
          >
            <ChevronLeft size={16} />
          </button>
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Next calendar period"
            onClick={() => shift(1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="calendar-tools">
          <button
            className="btn btn-ivory btn-small"
            onClick={() => setSelected(today)}
          >
            Today
          </button>
          <div className="segmented">
            {(["Day", "Week", "Month"] as const).map((m) => (
              <button
                className={mode === m ? "selected" : ""}
                key={m}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      {mode === "Month" ? (
        <div className="month-grid">
          <div className="weekday-head">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="month-days">
            {dates.map((d) => (
              <div
                className={`calendar-cell${parseDate(d).getMonth() !== day.getMonth() ? " outside" : ""}${d === today ? " is-today" : ""}`}
                key={d}
              >
                <button
                  aria-label={`View day ${displayDate(d, true)}`}
                  className="day-number"
                  onClick={() => {
                    setSelected(d);
                    setMode("Day");
                  }}
                >
                  {parseDate(d).getDate()}
                </button>
                {rows(d)
                  .slice(0, 2)
                  .map((b) => (
                    <button
                      className={`calendar-event tone-${b.status.toLowerCase()}`}
                      key={b.id}
                      onClick={() => edit({ kind: "booking", id: b.id })}
                      title={`${b.time} · ${customer(b)} · ${service(b)}`}
                    >
                      <strong>{b.time}</strong>
                      <span>{customer(b)}</span>
                    </button>
                  ))}
                {rows(d).length > 2 && (
                  <button
                    className="more-events"
                    onClick={() => {
                      setSelected(d);
                      setMode("Day");
                    }}
                  >
                    +{rows(d).length - 2} more
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : mode === "Week" ? (
        <div className="week-list">
          {dates.map((d) => (
            <div
              className={`week-day${d === today ? " is-today" : ""}`}
              key={d}
            >
              <button
                onClick={() => {
                  setSelected(d);
                  setMode("Day");
                }}
              >
                <small>
                  {parseDate(d).toLocaleDateString("en-IN", {
                    weekday: "short",
                  })}
                </small>
                <strong>{parseDate(d).getDate()}</strong>
              </button>
              <div>
                {rows(d).length ? (
                  rows(d).map((b) => (
                    <button
                      key={b.id}
                      className={`week-event tone-${b.status.toLowerCase()}`}
                      onClick={() => edit({ kind: "booking", id: b.id })}
                    >
                      <span>{displayTime(b.time)}</span>
                      <strong>{customer(b)}</strong>
                      <small>{service(b)}</small>
                    </button>
                  ))
                ) : (
                  <span className="no-events">No appointments</span>
                )}
              </div>
              <button
                className="row-action"
                aria-label={`Add appointment for ${displayDate(d)}`}
                onClick={() => edit({ kind: "booking", date: d })}
              >
                <Plus size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="daily-list">
          {rows(selected).length ? (
            rows(selected).map((b) => (
              <button
                className="daily-event"
                key={b.id}
                onClick={() => edit({ kind: "booking", id: b.id })}
              >
                <span>
                  <Clock3 size={14} />
                  {displayTime(b.time)}
                </span>
                <div>
                  <strong>{customer(b)}</strong>
                  <small>
                    {service(b)} ·{" "}
                    {data.staff.find((s) => s.id === b.staffId)?.name ||
                      "Unassigned"}
                  </small>
                </div>
                <Badge>{b.status}</Badge>
              </button>
            ))
          ) : (
            <EmptyState
              Icon={CalendarDays}
              title="A clear day on the calendar"
              description={`No demo appointments scheduled for ${displayDate(selected, true)}.`}
            />
          )}
          <button
            className="btn btn-ivory btn-small"
            onClick={() => edit({ kind: "booking", date: selected })}
          >
            <Plus size={14} />
            Add appointment for this day
          </button>
        </div>
      )}
      <div className="calendar-foot">
        <span>India Standard Time (UTC+05:30)</span>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={cancelled}
            onChange={(e) => setCancelled(e.target.checked)}
          />
          Include cancelled
        </label>
      </div>
    </section>
  );
}
