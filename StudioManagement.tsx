"use client";
import StudioPhoto from "@/components/StudioPhoto";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Images,
  LockKeyhole,
  MessageSquare,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import {
  displayDate,
  initialWorkspace,
  type Review,
  type Workspace,
} from "@/lib/studio";
import Modal from "../Modal";
import {
  Badge,
  EmptyState,
  SearchBox,
  type Commit,
  type Confirm,
  type OpenEditor,
} from "./Shared";
export function Portfolio({
  data,
  edit,
  confirm,
}: {
  data: Workspace;
  edit: OpenEditor;
  confirm: Confirm;
}) {
  const [category, setCategory] = useState("All images"),
    [selected, setSelected] = useState(""),
    [split, setSplit] = useState(50);
  const rows = data.gallery.filter(
      (g) => category === "All images" || g.kind === category,
    ),
    image = rows.find((g) => g.id === selected);
  return (
    <div className="module-stack">
      <div className="portfolio-toolbar">
        <div className="admin-chips">
          {["All images", "Editorial", "Studio", "Before / after"].map((s) => (
            <button
              key={s}
              className={category === s ? "active" : ""}
              onClick={() => setCategory(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span>{rows.length} images</span>
      </div>
      {rows.length ? (
        <div className="admin-gallery-grid">
          {rows.map((g) => (
            <article key={g.id} className="panel admin-gallery-card">
              <button
                className="admin-gallery-image"
                onClick={() => {
                  setSelected(g.id);
                  setSplit(50);
                }}
                aria-label={`View image ${g.title}`}
              >
                <StudioPhoto src={g.src} alt={g.title} />
                <span>
                  <Eye size={16} />
                </span>
              </button>
              <div>
                <small>{g.kind.toUpperCase()}</small>
                <h3>{g.title}</h3>
                <p>{g.creditedTo || "Private demo upload"}</p>
                <div className="gallery-card-actions">
                  <button
                    className="admin-text-link"
                    onClick={() => edit({ kind: "gallery", id: g.id })}
                  >
                    <Pencil size={13} />
                    Edit entry
                  </button>
                  <button
                    className="row-action"
                    aria-label={`Remove ${g.title}`}
                    onClick={() =>
                      confirm(
                        "Remove this image?",
                        `“${g.title}” will be removed from your private demo only.`,
                        {
                          ...data,
                          gallery: data.gallery.filter(
                            (item) => item.id !== g.id,
                          ),
                        },
                        "Gallery entry removed.",
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            Icon={Images}
            title="No images in this collection"
            description={
              category === "Before / after"
                ? "Add an original before and after pair with permission to try the comparison viewer."
                : "Add a photograph to your private demo gallery."
            }
          />
        </div>
      )}
      <div className="privacy-note">
        <LockKeyhole size={15} />
        <p>
          Gallery changes stay in this workspace. Editorial references are not
          represented as the studio’s client work.
        </p>
      </div>
      {image && (
        <Modal
          title={image.title}
          eyebrow={`${image.kind.toUpperCase()} · PRIVATE DEMO`}
          onClose={() => setSelected("")}
          className="private-image-dialog"
        >
          <div className="private-image-view">
            <StudioPhoto
              src={image.src}
              alt={`${image.title}${image.before ? " — after" : ""}`}
            />
            {image.before && (
              <>
                <StudioPhoto
                  className="before-overlay"
                  src={image.before}
                  alt={`${image.title} — before`}
                  style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                />
                <span
                  className="compare-divider"
                  style={{ left: `${split}%` }}
                />
                <span className="compare-before">Before</span>
                <span className="compare-after">After</span>
              </>
            )}
          </div>
          {image.before && (
            <label className="comparison-range">
              Compare original photographs
              <input
                type="range"
                min={0}
                max={100}
                value={split}
                onChange={(e) => setSplit(Number(e.target.value))}
              />
            </label>
          )}
          <div className="private-image-caption">
            <span>
              {image.creditedTo
                ? `Photography: ${image.creditedTo}`
                : "Private, permissioned upload"}
            </span>
            <div>
              {rows.length > 1 && (
                <>
                  <button
                    className="icon-button"
                    aria-label="Previous gallery image"
                    onClick={() =>
                      setSelected(
                        rows[
                          (rows.indexOf(image) - 1 + rows.length) % rows.length
                        ].id,
                      )
                    }
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next gallery image"
                    onClick={() =>
                      setSelected(
                        rows[(rows.indexOf(image) + 1) % rows.length].id,
                      )
                    }
                  >
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function Reviews({
  data,
  edit,
  save,
  saving,
  confirm,
}: {
  data: Workspace;
  edit: OpenEditor;
  save: Commit;
  saving: boolean;
  confirm: Confirm;
}) {
  const [status, setStatus] = useState("All statuses"),
    [query, setQuery] = useState("");
  const rows = data.reviews.filter(
    (r) =>
      (status === "All statuses" || r.status === status) &&
      `${r.alias} ${r.text}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section className="panel">
      <div className="records-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search demo reviews…"
        />
        <select
          aria-label="Filter review status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All statuses</option>
          <option>In review</option>
          <option>Approved</option>
          <option>Archived</option>
        </select>
      </div>
      {!rows.length ? (
        <EmptyState
          Icon={MessageSquare}
          title={
            data.reviews.length
              ? "No matching reviews"
              : "Your review inbox is clear"
          }
          description="No testimonials are fabricated here. Add a fictional entry to explore moderation; demo reviews are never published."
          action={
            <button
              className="btn btn-ivory btn-small"
              onClick={() => edit({ kind: "review" })}
            >
              Add a demo review
            </button>
          }
        />
      ) : (
        <div className="reviews-list">
          {rows.map((r) => (
            <article key={r.id}>
              <div className="review-head">
                <div>
                  <strong>{r.alias}</strong>
                  <small>{displayDate(r.date, true)} · Demo entry</small>
                </div>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      size={13}
                      key={n}
                      fill={n <= r.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <p>{r.text}</p>
              <div className="review-actions">
                <select
                  aria-label={`Moderation status for ${r.alias}`}
                  value={r.status}
                  disabled={saving}
                  onChange={(e) =>
                    void save(
                      {
                        ...data,
                        reviews: data.reviews.map((v) =>
                          v.id === r.id
                            ? {
                                ...v,
                                status: e.target.value as Review["status"],
                              }
                            : v,
                        ),
                      },
                      "Demo moderation status updated.",
                    )
                  }
                >
                  <option>In review</option>
                  <option>Approved</option>
                  <option>Archived</option>
                </select>
                <button
                  className="row-action"
                  aria-label={`Edit review by ${r.alias}`}
                  onClick={() => edit({ kind: "review", id: r.id })}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="row-action"
                  aria-label={`Remove review by ${r.alias}`}
                  onClick={() =>
                    confirm(
                      "Remove this demo review?",
                      "This entry will be deleted from the private demo review inbox.",
                      {
                        ...data,
                        reviews: data.reviews.filter((v) => v.id !== r.id),
                      },
                      "Demo review removed.",
                    )
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="panel-hint">
        Public reference: 5.0 from 111 reviews, as described in the screenshot
        reference. This is not a live rating, and it is not derived from demo
        reviews.
      </p>
    </section>
  );
}
export function Settings({
  data,
  save,
  saving,
  confirm,
}: {
  data: Workspace;
  save: Commit;
  saving: boolean;
  confirm: Confirm;
}) {
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      field = (key: string) => String(f.get(key) || "").trim();
    await save(
      {
        ...data,
        profile: {
          name: field("name"),
          artist: field("artist"),
          location: field("location"),
          phone: field("phone"),
          instagram: field("instagram").replace(/^@/, ""),
        },
      },
      "Private demo profile saved.",
    );
  };
  return (
    <div className="settings-layout">
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <span className="admin-eyebrow">BUSINESS DETAILS</span>
            <h2>Studio profile</h2>
          </div>
          <Badge tone="pending">Demo copy</Badge>
        </div>
        <form
          className="form-stack"
          key={JSON.stringify(data.profile)}
          onSubmit={submit}
        >
          <div className="form-grid">
            <label>
              Business name
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={data.profile.name}
              />
            </label>
            <label>
              Makeup artist
              <input
                name="artist"
                required
                maxLength={100}
                defaultValue={data.profile.artist}
              />
            </label>
          </div>
          <label>
            Studio location
            <input
              name="location"
              required
              maxLength={200}
              defaultValue={data.profile.location}
            />
          </label>
          <label>
            Business phone
            <input
              name="phone"
              type="tel"
              required
              maxLength={25}
              defaultValue={data.profile.phone}
            />
          </label>
          <label>
            Instagram username
            <input
              name="instagram"
              maxLength={39}
              required
              defaultValue={data.profile.instagram}
            />
          </label>
          <p className="field-help">
            This editable profile is private to your demo. The public studio’s
            contact details and WhatsApp number are unchanged.
          </p>
          <button className="btn btn-gold" disabled={saving}>
            <Check size={15} />
            {saving ? "Saving…" : "Save demo profile"}
          </button>
        </form>
      </section>
      <div className="module-stack">
        <section className="panel workspace-info">
          <ShieldCheck size={26} strokeWidth={1.4} />
          <h3>Private by design</h3>
          <p>
            Your demo is identified by a secure browser session. Other visitors
            do not see your customers, appointments, or uploads.
          </p>
          <p>
            Use fictional aliases only. There are no live payments,
            notifications, or appointment integrations.
          </p>
        </section>
        <section className="panel workspace-info">
          <RotateCcw size={23} strokeWidth={1.4} />
          <h3>Start fresh</h3>
          <p>
            Restore the sample workspace. This removes your demo changes,
            including uploaded images.
          </p>
          <button
            className="btn btn-ivory btn-small"
            onClick={() =>
              confirm(
                "Reset your demo workspace?",
                "All of your demo appointments, profiles, reviews, and uploads will be replaced with the original fictional sample data. This cannot be undone.",
                initialWorkspace(),
                "Demo workspace restored.",
              )
            }
          >
            Reset demo data
          </button>
        </section>
      </div>
    </div>
  );
}
