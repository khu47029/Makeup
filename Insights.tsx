"use client";
import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  IndianRupee,
  UsersRound,
} from "lucide-react";
import {
  dateOffset,
  displayDate,
  indiaToday,
  money,
  parseDate,
  STATUSES,
  type BookingStatus,
  type Workspace,
} from "@/lib/studio";
import { BookingTable, type OpenEditor } from "./Shared";
const colors = ["#c7a971", "#93a187", "#596f60", "#c7bab0"];
export default function Insights({
  data,
  overview,
  edit,
  saving,
  changeStatus,
}: {
  data: Workspace;
  overview: boolean;
  edit: OpenEditor;
  saving: boolean;
  changeStatus: (id: string, status: BookingStatus) => void;
}) {
  const [days, setDays] = useState(7),
    [metric, setMetric] = useState<"Bookings" | "Revenue">("Bookings"),
    [showValues, setShowValues] = useState(false);
  const today = indiaToday(),
    start = dateOffset(1 - days),
    range = data.bookings.filter((b) => b.date >= start && b.date <= today);
  const displayed = overview ? data.bookings : range;
  const revenue = displayed
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);
  const kpis = [
    {
      label: "Appointments",
      value: displayed.length,
      detail: overview ? "All demo appointments" : `In the last ${days} days`,
      Icon: CalendarDays,
      tone: "sand",
    },
    {
      label: "Confirmed bookings",
      value: displayed.filter((b) => b.status === "Confirmed").length,
      detail: "Confirmed demo appointments",
      Icon: CalendarCheck,
      tone: "sage",
    },
    {
      label: "Demo revenue",
      value: money(revenue),
      detail: "Completed, priced bookings",
      Icon: IndianRupee,
      tone: "rose",
    },
    {
      label: "Customers",
      value: overview
        ? data.customers.length
        : new Set(displayed.map((b) => b.customerId)).size,
      detail: "Fictional customer profiles",
      Icon: UsersRound,
      tone: "stone",
    },
  ];
  const step = days === 7 ? 1 : days === 30 ? 5 : 15;
  const bars = Array.from({ length: days / step }, (_, i) => {
    const from = dateOffset(1 - days + i * step),
      to = dateOffset(step - days + i * step);
    const rows = range.filter((b) => b.date >= from && b.date <= to);
    return {
      label:
        days === 7
          ? parseDate(from).toLocaleDateString("en-IN", { weekday: "short" })
          : displayDate(from),
      from,
      to,
      bookings: rows.length,
      revenue: rows
        .filter((b) => b.status === "Completed")
        .reduce((sum, b) => sum + (b.amount || 0), 0),
    };
  });
  const value = (b: (typeof bars)[number]) =>
    metric === "Bookings" ? b.bookings : b.revenue;
  const max = Math.max(3, Math.ceil(Math.max(...bars.map(value), 1) / 3) * 3);
  const counts = STATUSES.map(
    (s) => displayed.filter((b) => b.status === s).length,
  );
  let offset = 0;
  const stops = counts
    .map((n, i) => {
      const last = offset;
      offset += displayed.length ? (n / displayed.length) * 100 : 0;
      return `${colors[i]} ${last}% ${offset}%`;
    })
    .join(", ");
  const upcoming = data.bookings
    .filter(
      (b) =>
        b.date >= today && (b.status === "Pending" || b.status === "Confirmed"),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);
  const popular = data.services
    .map((s) => {
      const records = range.filter((b) => b.serviceId === s.id);
      return {
        ...s,
        count: records.length,
        revenue: records
          .filter((b) => b.status === "Completed")
          .reduce((sum, b) => sum + (b.amount || 0), 0),
      };
    })
    .filter((s) => s.count)
    .sort((a, b) => b.count - a.count);
  return (
    <div className="module-stack">
      {!overview && (
        <div className="analytics-range">
          <span>
            <ChartNoAxesColumn size={16} />
            Reporting window
          </span>
          <select
            aria-label="Analytics reporting window"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      )}
      <div className="kpi-grid">
        {kpis.map((k) => (
          <article className="kpi-card" key={k.label}>
            <div>
              <span>{k.label}</span>
              <i className={`kpi-icon ${k.tone}`}>
                <k.Icon size={17} strokeWidth={1.6} />
              </i>
            </div>
            <strong>{k.value}</strong>
            <small>{k.detail}</small>
          </article>
        ))}
      </div>
      <div className="chart-layout">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="admin-eyebrow">PERFORMANCE</span>
              <h2>
                {metric === "Bookings" ? "Booking activity" : "Demo revenue"}
              </h2>
            </div>
            {overview && (
              <select
                className="small-select"
                aria-label="Chart reporting window"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            )}
          </div>
          <div className="chart-tools">
            <div className="chart-switch">
              {(["Bookings", "Revenue"] as const).map((m) => (
                <button
                  className={metric === m ? "active" : ""}
                  key={m}
                  onClick={() => setMetric(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <span>
              {displayDate(start)} – {displayDate(today)}
            </span>
          </div>
          <svg
            className="activity-chart"
            viewBox="0 0 570 178"
            role="img"
            aria-label={`${metric} for the last ${days} days. ${bars.map((b) => `${b.label}: ${value(b)}`).join(", ")}`}
          >
            {[0, 1, 2, 3].map((n) => (
              <g key={n}>
                <line
                  x1="48"
                  y1={139 - n * 40}
                  x2="554"
                  y2={139 - n * 40}
                  stroke="#e5e4db"
                  strokeDasharray="3 4"
                />
                <text x="38" y={143 - n * 40} textAnchor="end">
                  {metric === "Revenue" ? "₹" : ""}
                  {((n * max) / 3).toLocaleString("en-IN", {
                    notation: "compact",
                  })}
                </text>
              </g>
            ))}
            {bars.map((b, i) => {
              const width = 491 / bars.length,
                barHeight = (value(b) / max) * 120;
              return (
                <g key={b.from}>
                  <rect
                    x={52 + width * i + width * 0.25}
                    y={139 - barHeight}
                    width={width * 0.5}
                    height={barHeight}
                    rx="3"
                    fill={i === bars.length - 1 ? "#9b8359" : "#cfb993"}
                  >
                    <title>
                      {displayDate(b.from)}:{" "}
                      {metric === "Revenue"
                        ? money(value(b))
                        : `${value(b)} bookings`}
                    </title>
                  </rect>
                  <text
                    x={52 + width * i + width * 0.5}
                    y="162"
                    textAnchor="middle"
                  >
                    {b.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="chart-caption">
            <span>
              <i />
              {metric === "Revenue"
                ? "Completed demo booking amounts"
                : "Demo appointments by scheduled date"}
            </span>
            <button onClick={() => setShowValues(!showValues)}>
              {showValues ? "Hide data" : "View data"}
              <ChevronDown size={12} />
            </button>
          </div>
          {showValues && (
            <div className="chart-data">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date range</th>
                    <th>Bookings</th>
                    <th>Demo revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bars.map((b) => (
                    <tr key={b.from}>
                      <td>
                        {displayDate(b.from)}
                        {b.from !== b.to && ` – ${displayDate(b.to)}`}
                      </td>
                      <td>{b.bookings}</td>
                      <td>{money(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="panel mix-panel">
          <div className="panel-heading">
            <div>
              <span className="admin-eyebrow">AT A GLANCE</span>
              <h2>Booking mix</h2>
            </div>
          </div>
          <div
            className="donut"
            role="img"
            aria-label={`Status distribution: ${STATUSES.map((s, i) => `${s} ${counts[i]}`).join(", ")}`}
            style={{
              background: displayed.length
                ? `conic-gradient(${stops})`
                : "#e7e5dd",
            }}
          >
            <div>
              <strong>{displayed.length}</strong>
              <span>BOOKINGS</span>
            </div>
          </div>
          <div className="chart-legend">
            {STATUSES.map((s, i) => (
              <div key={s}>
                <i style={{ background: colors[i] }} />
                <span>{s}</span>
                <strong>{counts[i]}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      {overview ? (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="admin-eyebrow">THE SCHEDULE</span>
              <h2>Upcoming appointments</h2>
            </div>
            <a className="admin-text-link" href="#appointments">
              View all <ArrowRight size={14} />
            </a>
          </div>
          <BookingTable
            data={data}
            rows={upcoming}
            edit={edit}
            saving={saving}
            changeStatus={changeStatus}
            compact
          />
        </section>
      ) : (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="admin-eyebrow">SERVICE INSIGHTS</span>
              <h2>Services in this period</h2>
            </div>
          </div>
          {popular.length ? (
            <div className="service-stats">
              {popular.map((s) => (
                <div key={s.id}>
                  <span>{s.name}</span>
                  <i>
                    <b
                      style={{
                        width: `${(s.count / Math.max(...popular.map((s) => s.count))) * 100}%`,
                      }}
                    />
                  </i>
                  <strong>{s.count} bookings</strong>
                  <em>{money(s.revenue)}</em>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-hint">No bookings in this period.</p>
          )}
          <p className="panel-hint">
            Revenue is calculated only from completed demo appointments with a
            saved amount. Unpriced appointments contribute ₹0. These are not
            actual studio earnings.
          </p>
        </section>
      )}
    </div>
  );
}
