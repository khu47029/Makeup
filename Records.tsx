"use client";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  History,
  Pencil,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import {
  displayDate,
  displayTime,
  money,
  STATUSES,
  type BookingStatus,
  type Workspace,
} from "@/lib/studio";
import Modal from "../Modal";
import {
  Badge,
  BookingTable,
  EmptyState,
  initials,
  SearchBox,
  type OpenEditor,
} from "./Shared";
export function Appointments({
  data,
  edit,
  saving,
  changeStatus,
  bridal = false,
}: {
  data: Workspace;
  edit: OpenEditor;
  saving: boolean;
  changeStatus: (id: string, s: BookingStatus) => void;
  bridal?: boolean;
}) {
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [day, setDay] = useState(""),
    [serviceId, setServiceId] = useState(""),
    [filters, setFilters] = useState(false);
  const records = data.bookings.filter(
    (b) =>
      !bridal ||
      b.eventDate ||
      data.services
        .find((s) => s.id === b.serviceId)
        ?.category.toLowerCase() === "bridal",
  );
  const rows = records
    .filter((b) => {
      const c = data.customers.find((c) => c.id === b.customerId),
        s = data.services.find((s) => s.id === b.serviceId);
      return (
        `${c?.name} ${s?.name} ${b.date} ${b.eventDate}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (status === "All statuses" || b.status === status) &&
        (!day || b.date === day) &&
        (!serviceId || b.serviceId === serviceId)
      );
    })
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  return (
    <section className="panel">
      <div className="records-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={
            bridal ? "Search bridal bookings…" : "Search appointments…"
          }
        />
        <select
          aria-label="Filter by booking status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          className={`btn btn-ivory btn-small ${filters ? "filter-on" : ""}`}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={14} />
          Filters{(day || serviceId) && <i className="filter-dot" />}
        </button>
      </div>
      {filters && (
        <div className="advanced-filters">
          <label>
            Appointment date
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>
          <label>
            Service
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">All services</option>
              {data.services.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="admin-text-link"
            onClick={() => {
              setDay("");
              setServiceId("");
              setStatus("All statuses");
              setQuery("");
            }}
          >
            Clear filters <X size={12} />
          </button>
        </div>
      )}
      <div className="records-count">
        {rows.length} of {records.length} demo{" "}
        {bridal ? "bridal bookings" : "appointments"}
      </div>
      <BookingTable
        data={data}
        rows={rows}
        edit={edit}
        saving={saving}
        changeStatus={changeStatus}
        bridal={bridal}
      />
    </section>
  );
}
export function Customers({
  data,
  edit,
}: {
  data: Workspace;
  edit: OpenEditor;
}) {
  const [query, setQuery] = useState(""),
    [history, setHistory] = useState(""),
    [scope, setScope] = useState("All customers");
  const customers = data.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (scope === "All customers" ||
        (scope === "With bookings") ===
          data.bookings.some((b) => b.customerId === c.id)),
  );
  const selected = data.customers.find((c) => c.id === history);
  const booked = data.bookings
    .filter((b) => b.customerId === history)
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <section className="panel">
        <div className="records-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search customers…"
          />
          <select
            aria-label="Filter customers"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option>All customers</option>
            <option>With bookings</option>
            <option>Without bookings</option>
          </select>
        </div>
        <div className="records-count">
          {customers.length} fictional customer profiles
        </div>
        {!customers.length ? (
          <EmptyState
            Icon={UsersRound}
            title="No matching customers"
            description="Try another alias or add a demo customer."
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Appointments</th>
                  <th>Latest booking</th>
                  <th>Demo spend</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const records = data.bookings
                    .filter((b) => b.customerId === c.id)
                    .sort((a, b) => b.date.localeCompare(a.date));
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">{initials(c.name)}</span>
                          <strong>{c.name}</strong>
                        </div>
                      </td>
                      <td>{records.length}</td>
                      <td>
                        {records[0]
                          ? displayDate(records[0].date, true)
                          : "No bookings"}
                      </td>
                      <td>
                        {money(
                          records
                            .filter((b) => b.status === "Completed")
                            .reduce((n, b) => n + (b.amount || 0), 0),
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="admin-text-link"
                            onClick={() => setHistory(c.id)}
                          >
                            <History size={13} />
                            History
                          </button>
                          <button
                            className="row-action"
                            aria-label={`Edit ${c.name}`}
                            onClick={() => edit({ kind: "customer", id: c.id })}
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <Modal
          title={selected.name}
          eyebrow="CUSTOMER BOOKING HISTORY · DEMO"
          onClose={() => setHistory("")}
        >
          <p className="dialog-intro">
            {selected.note ||
              "Private fictional customer profile. No contact details are stored."}
          </p>
          {booked.length ? (
            <div className="history-list">
              {booked.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setHistory("");
                    edit({ kind: "booking", id: b.id });
                  }}
                >
                  <div>
                    <CalendarDays size={15} />
                    <strong>
                      {data.services.find((s) => s.id === b.serviceId)?.name}
                    </strong>
                  </div>
                  <span>
                    {displayDate(b.date, true)} · {displayTime(b.time)} IST
                  </span>
                  <Badge>{b.status}</Badge>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No booking history yet"
              description="Add an appointment for this demo customer."
            />
          )}
          <button
            className="btn btn-gold full"
            onClick={() => {
              setHistory("");
              edit({ kind: "booking", customerId: selected.id });
            }}
          >
            New appointment for this customer <ArrowRight size={14} />
          </button>
        </Modal>
      )}
    </>
  );
}
export function Services({
  data,
  edit,
}: {
  data: Workspace;
  edit: OpenEditor;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [active, setActive] = useState("All services");
  const rows = data.services.filter(
    (s) =>
      s.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (!category || category === s.category) &&
      (active === "All services" || (active === "Active") === s.active),
  );
  return (
    <section className="panel">
      <div className="records-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search services…"
        />
        <select
          aria-label="Filter service category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {[...new Set(data.services.map((s) => s.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filter service availability"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option>All services</option>
          <option>Active</option>
          <option>Paused</option>
        </select>
      </div>
      {rows.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service name</th>
                <th>Category</th>
                <th>Demo price</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="person-cell">
                      <span className="service-mini">
                        <Sparkles size={15} />
                      </span>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td>{s.category}</td>
                  <td>
                    {s.price === null ? (
                      <span className="muted">Not set</span>
                    ) : (
                      money(s.price)
                    )}
                  </td>
                  <td>
                    <Badge tone={s.active ? "active" : "paused"}>
                      {s.active ? "Active" : "Paused"}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="row-action"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => edit({ kind: "service", id: s.id })}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No matching services"
          description="Change your filters or add a new service to the demo."
        />
      )}
      <p className="panel-hint">
        Prices are deliberately unset. Any amount you enter is for this demo
        only, never an advertised salon price.
      </p>
    </section>
  );
}
export function StaffView({
  data,
  edit,
}: {
  data: Workspace;
  edit: OpenEditor;
}) {
  const [query, setQuery] = useState("");
  const rows = data.staff.filter((s) =>
    `${s.name} ${s.role}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="module-stack">
      <div className="standalone-search">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search team members…"
        />
      </div>
      {rows.length ? (
        <div className="team-grid">
          {rows.map((s) => (
            <article className="panel team-card" key={s.id}>
              <div className="team-card-top">
                <span className="avatar big">{initials(s.name)}</span>
                <Badge tone={s.active ? "active" : "paused"}>
                  {s.active ? "Available" : "Paused"}
                </Badge>
              </div>
              <h3>{s.name}</h3>
              <p>{s.role}</p>
              <div className="team-assignment">
                <CalendarDays size={14} />
                {
                  data.bookings.filter(
                    (b) => b.staffId === s.id && b.status !== "Cancelled",
                  ).length
                }{" "}
                assigned bookings
              </div>
              <button
                className="admin-text-link"
                onClick={() => edit({ kind: "staff", id: s.id })}
              >
                <Pencil size={13} />
                Edit team member
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            Icon={UsersRound}
            title="No team members found"
            description="Try a different search, or add a demo team member."
          />
        </div>
      )}
    </div>
  );
}
