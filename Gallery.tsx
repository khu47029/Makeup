"use client";
import StudioPhoto from "@/components/StudioPhoto";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Expand,
  Images,
} from "lucide-react";
import Instagram from "./Instagram";
import { BRAND, LOOKS, type Look } from "@/lib/studio";
import Modal from "./Modal";
import ComparisonJournal from "./ComparisonJournal";
import { studioMedia } from "@/lib/visuals";
const fromStudio = studioMedia.portfolio.length > 0;
const collection: Look[] = fromStudio ? studioMedia.portfolio : LOOKS;
export function Lightbox({
  looks,
  index,
  setIndex,
  onClose,
  editorial = true,
}: {
  editorial?: boolean;
  looks: Look[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const look = looks[index];
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((index + 1) % looks.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((index - 1 + looks.length) % looks.length);
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [index, looks.length, setIndex]);
  return (
    <Modal
      title={look.title}
      eyebrow={
        editorial
          ? "THE BRIDAL EDIT · EDITORIAL INSPIRATION"
          : "M.S MAKEOVERS · STUDIO PORTFOLIO"
      }
      onClose={onClose}
      className="lightbox-dialog"
    >
      <div className="lightbox-image">
        <StudioPhoto src={look.src} alt={look.alt} />
        {looks.length > 1 && (
          <>
            <button
              className="lightbox-prev"
              aria-label="Previous photograph"
              onClick={() =>
                setIndex((index - 1 + looks.length) % looks.length)
              }
            >
              <ArrowLeft size={19} />
            </button>
            <button
              className="lightbox-next"
              aria-label="Next photograph"
              onClick={() => setIndex((index + 1) % looks.length)}
            >
              <ArrowRight size={19} />
            </button>
          </>
        )}
      </div>
      <div className="lightbox-caption">
        <span>
          Photography: {look.credit}
          {editorial ? " / Pexels" : ""}
          <br />
          <small>
            {editorial
              ? "Editorial reference, not a studio client photograph."
              : "Original studio portfolio photograph, shared with permission."}
          </small>
        </span>
        <span>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(looks.length).padStart(2, "0")}
        </span>
      </div>
    </Modal>
  );
}
export default function Gallery() {
  const [filter, setFilter] = useState("All looks"),
    [showAll, setShowAll] = useState(false),
    [index, setIndex] = useState<number | null>(null);
  const filtered = collection.filter(
    (l) => filter === "All looks" || l.category === filter,
  );
  const visible =
    showAll || filter !== "All looks" ? filtered : filtered.slice(0, 3);
  return (
    <>
      <section id="bridal" className="bridal-section section-pad">
        <div className="page-width">
          <div className="editorial-heading">
            <div>
              <div className="eyebrow left">
                <span />
                {fromStudio ? "THE STUDIO PORTFOLIO" : "BRIDAL INSPIRATION"}
              </div>
              <h2>
                The Bridal <em>Edit</em>
              </h2>
            </div>
            <p>
              Tradition, interpreted in your own way.
              <br />
              {fromStudio
                ? "Original bridal artistry by Madhuri Sharma."
                : "A considered edit of bridal beauty inspiration."}
            </p>
          </div>
          <div id="gallery" className="gallery-anchor">
            <div
              className="gallery-filters"
              aria-label="Filter bridal photographs"
            >
              {["All looks", ...new Set(collection.map((l) => l.category))].map(
                (f) => (
                  <button
                    key={f}
                    className={filter === f ? "active" : ""}
                    aria-pressed={filter === f}
                    onClick={() => {
                      setFilter(f);
                      setShowAll(false);
                    }}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
            <div className="look-grid">
              {visible.map((look, i) => (
                <button
                  className="look-card"
                  key={look.id}
                  onClick={() => setIndex(i)}
                  aria-label={`View ${look.title} photograph`}
                >
                  <StudioPhoto
                    loading="lazy"
                    src={look.src}
                    alt={look.alt}
                    style={{ objectPosition: look.position }}
                  />
                  <span className="look-expand">
                    <Expand size={16} />
                  </span>
                  <span className="look-caption">
                    <small>
                      LOOK{" "}
                      {String(collection.indexOf(look) + 1).padStart(2, "0")} ·{" "}
                      {look.category}
                    </small>
                    <strong>{look.title}</strong>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="gallery-bottom">
            <span>
              <Images size={14} />{" "}
              {fromStudio
                ? "Original studio portfolio · shared with permission"
                : "Editorial references · not studio client work"}
            </span>
            {filter === "All looks" && filtered.length > 3 && (
              <button
                className="text-link pale"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show curated edit" : "View all photographs"}{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="artist-portfolio"
          >
            <Instagram size={18} />
            <span>
              Discover Madhuri’s own work <b>@makeoverby.madhuri</b>
            </span>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <ComparisonJournal />
      {index !== null && (
        <Lightbox
          editorial={!fromStudio}
          looks={visible}
          index={index}
          setIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}
