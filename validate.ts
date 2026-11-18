import { LOOKS, STATUSES, type Workspace } from "./studio";
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 100, empty = false): v is string =>
  typeof v === "string" && v.length <= max && (empty || v.trim().length > 0);
const id = (v: unknown) => text(v, 70) && /^[a-zA-Z0-9-]+$/.test(v);
const date = (v: unknown) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const price = (v: unknown) =>
  v === null ||
  (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10000000);
const image = (v: unknown) =>
  typeof v === "string" &&
  (LOOKS.some((l) => l.src === v) ||
    (v.length < 650000 &&
      /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(v)));
export function validateWorkspace(value: unknown): string | null {
  if (!obj(value) || !obj(value.profile)) return "Invalid studio workspace.";
  for (const key of [
    "services",
    "customers",
    "staff",
    "bookings",
    "gallery",
    "reviews",
  ]) {
    const items = value[key];
    if (
      !Array.isArray(items) ||
      items.length > (key === "gallery" ? 40 : 500) ||
      items.some((v) => !obj(v) || !id(v.id)) ||
      new Set(items.map((i) => i.id)).size !== items.length
    )
      return `Invalid ${key} collection or demo limit exceeded.`;
  }
  const w = value as unknown as Workspace;
  if (
    !text(w.profile.name) ||
    !text(w.profile.artist) ||
    !text(w.profile.location, 200) ||
    !text(w.profile.phone, 25) ||
    !/^[+\d\s()-]{7,25}$/.test(w.profile.phone) ||
    !text(w.profile.instagram, 40) ||
    !/^\w[\w.]{0,38}$/.test(w.profile.instagram)
  )
    return "Enter a valid business name, artist, location, phone, and Instagram handle.";
  if (
    w.services.some(
      (s) =>
        !text(s.name) ||
        !text(s.category, 60) ||
        !price(s.price) ||
        typeof s.active !== "boolean",
    )
  )
    return "Check the service name, category, or demo price.";
  if (w.customers.some((c) => !text(c.name, 80) || !text(c.note, 500, true)))
    return "Use a customer alias of 1–80 characters and a short note.";
  if (
    w.staff.some(
      (s) =>
        !text(s.name, 80) || !text(s.role, 80) || typeof s.active !== "boolean",
    )
  )
    return "Enter a valid team member name and role.";
  if (
    w.bookings.some(
      (b) =>
        !w.customers.some((c) => c.id === b.customerId) ||
        !w.services.some((s) => s.id === b.serviceId) ||
        (b.staffId !== "" && !w.staff.some((s) => s.id === b.staffId)) ||
        !date(b.date) ||
        (b.eventDate !== "" && !date(b.eventDate)) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time) ||
        !STATUSES.includes(b.status) ||
        !price(b.amount) ||
        !text(b.note, 500, true),
    )
  )
    return "Check the customer, service, date, time, and status on each appointment.";
  const occupied = new Set<string>();
  for (const b of w.bookings) {
    if (!b.staffId || b.status === "Cancelled") continue;
    const slot = `${b.date}|${b.time}|${b.staffId}`;
    if (occupied.has(slot))
      return "This demo team member already has an appointment at that time. Choose another time or artist.";
    occupied.add(slot);
  }
  if (
    w.gallery.some(
      (g) =>
        !text(g.title) ||
        !text(g.creditedTo, 100, true) ||
        !["Editorial", "Studio", "Before / after"].includes(g.kind) ||
        !image(g.src) ||
        (g.kind === "Before / after" ? !image(g.before) : g.before !== ""),
    )
  )
    return "Gallery entries need a title and a valid photo. Comparisons require both photographs.";
  if (
    w.reviews.some(
      (r) =>
        !text(r.alias, 80) ||
        !text(r.text, 1000) ||
        !Number.isInteger(r.rating) ||
        r.rating < 1 ||
        r.rating > 5 ||
        !["In review", "Approved", "Archived"].includes(r.status) ||
        !date(r.date),
    )
  )
    return "Check the review alias, text, and rating.";
  return null;
}
