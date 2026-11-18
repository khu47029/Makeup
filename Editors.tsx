"use client";
import StudioPhoto from "@/components/StudioPhoto";
import { useState, type FormEvent } from "react";
import { Check, LoaderCircle } from "lucide-react";
import Modal from "../Modal";
import {
  STATUSES,
  indiaToday,
  uid,
  type Booking,
  type BookingStatus,
  type GalleryItem,
  type Review,
  type Workspace,
} from "@/lib/studio";
import type { Commit, EditorState } from "./Shared";
const names = {
  booking: "appointment",
  service: "service",
  customer: "customer",
  staff: "team member",
  gallery: "gallery entry",
  review: "review",
};
async function optimiseImage(file: File): Promise<string> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 12 * 1024 * 1024
  )
    throw new Error("Choose a JPEG, PNG, or WebP photo smaller than 12 MB.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Your browser could not process the image.");
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const result = canvas.toDataURL("image/webp", 0.76);
  if (result.length > 640000)
    throw new Error(
      "This photo is too large for the demo. Choose a smaller image.",
    );
  return result;
}
export default function Editors({
  editor,
  data,
  save,
  saving,
  error,
  onClose,
}: {
  editor: EditorState;
  data: Workspace;
  save: Commit;
  saving: boolean;
  error: string;
  onClose: () => void;
}) {
  const { id, kind } = editor;
  const booking = data.bookings.find((b) => b.id === id),
    svc = data.services.find((s) => s.id === id),
    client = data.customers.find((c) => c.id === id),
    member = data.staff.find((s) => s.id === id),
    entry = data.gallery.find((g) => g.id === id),
    review = data.reviews.find((r) => r.id === id);
  const [customerId, setCustomerId] = useState(
    booking?.customerId || editor.customerId || "__new",
  );
  const [serviceId, setServiceId] = useState(
    booking?.serviceId ||
      (editor.bridal
        ? data.services.find(
            (s) => s.active && s.category.toLowerCase() === "bridal",
          )?.id
        : undefined) ||
      data.services.find((s) => s.active)?.id ||
      "",
  );
  const [galleryKind, setGalleryKind] = useState<GalleryItem["kind"]>(
    entry?.kind || "Studio",
  );
  const [photo, setPhoto] = useState(entry?.src || ""),
    [before, setBefore] = useState(entry?.before || ""),
    [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState(""),
    [cancelConfirm, setCancelConfirm] = useState(false);
  const service = data.services.find((s) => s.id === serviceId);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");
    const f = new FormData(e.currentTarget);
    const str = (key: string) => String(f.get(key) || "").trim();
    const newId = id || uid();
    let next = { ...data };
    if (kind === "booking") {
      if (!service) {
        setLocalError("Add an active service before creating an appointment.");
        return;
      }
      let selectedCustomer = customerId;
      if (customerId === "__new") {
        if (!str("alias")) {
          setLocalError("Enter a fictional customer alias.");
          return;
        }
        selectedCustomer = uid();
        next.customers = [
          ...next.customers,
          { id: selectedCustomer, name: str("alias"), note: "" },
        ];
      }
      const event = str("eventDate");
      if (event && event < str("date")) {
        setLocalError("The event date cannot be earlier than the appointment.");
        return;
      }
      const item: Booking = {
        id: newId,
        customerId: selectedCustomer,
        serviceId,
        staffId: str("staffId"),
        date: str("date"),
        time: str("time"),
        status: str("status") as BookingStatus,
        amount: str("amount") === "" ? null : Number(str("amount")),
        eventDate: event,
        note: str("note"),
      };
      next.bookings = id
        ? data.bookings.map((b) => (b.id === id ? item : b))
        : [...data.bookings, item];
    } else if (kind === "service") {
      const item = {
        id: newId,
        name: str("name"),
        category: str("category"),
        price: str("price") === "" ? null : Number(str("price")),
        active: f.has("active"),
      };
      next.services = id
        ? data.services.map((s) => (s.id === id ? item : s))
        : [...data.services, item];
    } else if (kind === "customer") {
      const item = { id: newId, name: str("name"), note: str("note") };
      next.customers = id
        ? data.customers.map((c) => (c.id === id ? item : c))
        : [...data.customers, item];
    } else if (kind === "staff") {
      const item = {
        id: newId,
        name: str("name"),
        role: str("role"),
        active: f.has("active"),
      };
      next.staff = id
        ? data.staff.map((s) => (s.id === id ? item : s))
        : [...data.staff, item];
    } else if (kind === "gallery") {
      if (!photo || (galleryKind === "Before / after" && !before)) {
        setLocalError("Please supply all required photographs.");
        return;
      }
      const item: GalleryItem = {
        id: newId,
        title: str("title"),
        src: photo,
        before: galleryKind === "Before / after" ? before : "",
        kind: galleryKind,
        creditedTo: str("credit"),
      };
      next.gallery = id
        ? data.gallery.map((g) => (g.id === id ? item : g))
        : [...data.gallery, item];
    } else if (kind === "review") {
      const item: Review = {
        id: newId,
        alias: str("alias"),
        text: str("text"),
        rating: Number(str("rating")),
        date: review?.date || indiaToday(),
        status: str("status") as Review["status"],
      };
      next.reviews = id
        ? data.reviews.map((r) => (r.id === id ? item : r))
        : [...data.reviews, item];
    }
    if (await save(next, `Demo ${names[kind]} ${id ? "updated" : "created"}.`))
      onClose();
  };
  const upload = async (file: File | undefined, isBefore: boolean) => {
    if (!file) return;
    setProcessing(true);
    setLocalError("");
    try {
      const src = await optimiseImage(file);
      if (isBefore) setBefore(src);
      else setPhoto(src);
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : "Unable to read that photo.",
      );
    } finally {
      setProcessing(false);
    }
  };
  return (
    <Modal
      title={`${id ? "Edit" : "New"} ${editor.bridal && kind === "booking" ? "bridal booking" : names[kind]}`}
      eyebrow="PRIVATE DEMO WORKSPACE"
      onClose={() => {
        if (!saving && !processing) onClose();
      }}
      className="admin-dialog"
    >
      <p className="dialog-intro">
        {kind === "booking"
          ? "Simulated appointment · All times are India Standard Time."
          : kind === "gallery"
            ? "Private to your demo. Uploaded photos are not published to the website."
            : "Use fictional details only. Changes stay in this demo workspace."}
      </p>
      <form className="form-stack" onSubmit={submit}>
        {kind === "booking" && (
          <>
            <label>
              Customer
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="__new">+ New demo customer</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {customerId === "__new" && (
              <label>
                Customer alias
                <input
                  name="alias"
                  placeholder="e.g. Demo guest 06"
                  required
                  maxLength={80}
                />
              </label>
            )}
            <div className="form-grid">
              <label>
                Service
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  {data.services
                    .filter((s) => s.active || s.id === booking?.serviceId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Assigned team member
                <select name="staffId" defaultValue={booking?.staffId || ""}>
                  <option value="">Unassigned</option>
                  {data.staff
                    .filter((s) => s.active || s.id === booking?.staffId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label>
                Appointment date
                <input
                  name="date"
                  type="date"
                  required
                  min="2000-01-01"
                  max="2099-12-31"
                  defaultValue={booking?.date || editor.date || indiaToday()}
                />
              </label>
              <label>
                Time · IST
                <input
                  name="time"
                  type="time"
                  required
                  defaultValue={booking?.time || "10:00"}
                />
              </label>
            </div>
            {(service?.category.toLowerCase() === "bridal" ||
              !!booking?.eventDate) && (
              <label>
                Bridal event date
                <input
                  name="eventDate"
                  type="date"
                  min="2000-01-01"
                  max="2099-12-31"
                  required
                  defaultValue={
                    booking?.eventDate || editor.date || indiaToday()
                  }
                />
              </label>
            )}
            <div className="form-grid">
              <label>
                Booking status
                <select
                  name="status"
                  defaultValue={booking?.status || "Pending"}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Demo amount (₹)
                <input
                  key={serviceId}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000000"
                  placeholder="Not set"
                  defaultValue={
                    booking?.serviceId === serviceId
                      ? (booking.amount ?? "")
                      : (service?.price ?? "")
                  }
                />
              </label>
            </div>
            <label>
              Booking notes <small>(optional)</small>
              <textarea
                name="note"
                maxLength={500}
                placeholder="Fictional event or styling notes"
                defaultValue={booking?.note}
              />
            </label>
          </>
        )}
        {kind === "service" && (
          <>
            <label>
              Service name
              <input
                name="name"
                maxLength={100}
                required
                defaultValue={svc?.name}
                placeholder="e.g. Occasion styling"
              />
            </label>
            <label>
              Category
              <input
                name="category"
                list="service-categories"
                maxLength={60}
                defaultValue={svc?.category}
                required
                placeholder="Choose or enter a category"
              />
              <datalist id="service-categories">
                {[...new Set(data.services.map((s) => s.category))].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label>
              Demo price (₹)
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                max="10000000"
                defaultValue={svc?.price ?? ""}
                placeholder="Leave blank if not set"
              />
            </label>
            <p className="field-help">
              This is a simulated price for new demo bookings, not a public
              studio rate. Existing bookings keep their saved amount.
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                defaultChecked={svc?.active ?? true}
              />
              Available for new demo bookings
            </label>
          </>
        )}
        {kind === "customer" && (
          <>
            <label>
              Customer alias
              <input
                name="name"
                maxLength={80}
                required
                defaultValue={client?.name}
                placeholder="Use a fictional name"
              />
            </label>
            <label>
              Private demo notes
              <textarea
                name="note"
                maxLength={500}
                defaultValue={client?.note}
                placeholder="Do not enter personal contact information"
              />
            </label>
          </>
        )}
        {kind === "staff" && (
          <>
            <label>
              Team member alias
              <input
                name="name"
                maxLength={80}
                required
                defaultValue={member?.name}
                placeholder="e.g. Demo artist B"
              />
            </label>
            <label>
              Role / speciality
              <input
                name="role"
                maxLength={80}
                required
                defaultValue={member?.role}
                placeholder="e.g. Bridal makeup artist"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                defaultChecked={member?.active ?? true}
              />
              Available for demo assignments
            </label>
          </>
        )}
        {kind === "gallery" && (
          <>
            <label>
              Image title
              <input
                name="title"
                maxLength={100}
                required
                defaultValue={entry?.title}
                placeholder="Give this look a title"
              />
            </label>
            <div className="form-grid">
              <label>
                Collection
                <select
                  value={galleryKind}
                  onChange={(e) =>
                    setGalleryKind(e.target.value as GalleryItem["kind"])
                  }
                >
                  <option>Studio</option>
                  <option>Editorial</option>
                  <option>Before / after</option>
                </select>
              </label>
              <label>
                Photo credit
                <input
                  name="credit"
                  maxLength={100}
                  defaultValue={entry?.creditedTo}
                  placeholder="Photographer / studio"
                />
              </label>
            </div>
            <div
              className={galleryKind === "Before / after" ? "form-grid" : ""}
            >
              {galleryKind === "Before / after" && (
                <label className="file-field">
                  Before photo
                  {before && (
                    <StudioPhoto src={before} alt="Before upload preview" />
                  )}
                  <input
                    aria-label="Upload before photo"
                    type="file"
                    required={!before}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void upload(e.target.files?.[0], true)}
                  />
                </label>
              )}
              <label className="file-field">
                {galleryKind === "Before / after"
                  ? "After photo"
                  : "Photograph"}
                {photo && (
                  <StudioPhoto src={photo} alt="Gallery upload preview" />
                )}
                <input
                  aria-label="Upload photograph"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!photo}
                  onChange={(e) => void upload(e.target.files?.[0], false)}
                />
              </label>
            </div>
            <p className="field-help">
              JPEG, PNG, or WebP · up to 12 MB. Photos are resized locally and
              metadata is removed. Use original paired photos for comparisons.
            </p>
            <label className="checkbox-label">
              <input type="checkbox" required />I have permission to use these
              photographs in this demo.
            </label>
          </>
        )}
        {kind === "review" && (
          <>
            <label>
              Reviewer alias
              <input
                name="alias"
                required
                maxLength={80}
                defaultValue={review?.alias}
                placeholder="Fictional reviewer"
              />
            </label>
            <div className="form-grid">
              <label>
                Demo rating
                <select name="rating" defaultValue={review?.rating || 5}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option value={n} key={n}>
                      {n} {n === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Moderation status
                <select
                  name="status"
                  defaultValue={review?.status || "In review"}
                >
                  <option>In review</option>
                  <option>Approved</option>
                  <option>Archived</option>
                </select>
              </label>
            </div>
            <label>
              Demo review text
              <textarea
                name="text"
                maxLength={1000}
                required
                defaultValue={review?.text}
                placeholder="Write a test entry for the moderation workflow"
              />
            </label>
            <p className="field-help">
              Demo reviews never appear as real customer testimonials and do not
              change the public reference rating.
            </p>
          </>
        )}
        {(localError || error) && (
          <p role="alert" className="form-error">
            {localError || error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-ivory"
            disabled={saving || processing}
            onClick={onClose}
          >
            Discard
          </button>
          <button
            className="btn btn-gold"
            disabled={saving || processing || (kind === "booking" && !service)}
          >
            {saving || processing ? (
              <LoaderCircle size={15} className="spin" />
            ) : (
              <Check size={15} />
            )}{" "}
            {processing
              ? "Processing image…"
              : saving
                ? "Saving…"
                : id
                  ? "Save changes"
                  : `Create ${names[kind]}`}
          </button>
        </div>
      </form>
      {booking && booking.status !== "Cancelled" && kind === "booking" && (
        <div className="cancel-area">
          {cancelConfirm ? (
            <>
              <p>Cancel this demo appointment? Its history will be kept.</p>
              <div>
                <button type="button" onClick={() => setCancelConfirm(false)}>
                  Keep appointment
                </button>
                <button
                  disabled={saving}
                  type="button"
                  className="danger-text"
                  onClick={async () => {
                    if (
                      await save(
                        {
                          ...data,
                          bookings: data.bookings.map((b) =>
                            b.id === id ? { ...b, status: "Cancelled" } : b,
                          ),
                        },
                        "Demo appointment cancelled.",
                      )
                    )
                      onClose();
                  }}
                >
                  Confirm cancellation
                </button>
              </div>
            </>
          ) : (
            <button
              className="danger-text"
              onClick={() => setCancelConfirm(true)}
            >
              Cancel appointment
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
