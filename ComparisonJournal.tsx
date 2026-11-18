"use client";
import StudioPhoto from "@/components/StudioPhoto";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ScanLine } from "lucide-react";
import { BRAND } from "@/lib/studio";
import { studioMedia } from "@/lib/visuals";
export default function ComparisonJournal() {
  const [index, setIndex] = useState(0),
    [split, setSplit] = useState(50);
  const pairs = studioMedia.comparisons,
    pair = pairs[index];
  if (!pair)
    return (
      <section
        className="transform-section page-width"
        aria-label="Before and after portfolio"
      >
        <div className="transform-symbol">
          <ScanLine size={34} strokeWidth={1} />
        </div>
        <div>
          <div className="tiny-label">THE CLIENT JOURNAL</div>
          <h3>Authentic before & after.</h3>
          <p>
            Client comparisons are not published yet. Only paired, original
            photographs with permission belong here.
          </p>
        </div>
        <a
          href={BRAND.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Visit the artist’s portfolio <ArrowUpRight size={15} />
        </a>
      </section>
    );
  return (
    <section
      className="original-journal section-pad page-width"
      aria-label="Original before and after portfolio"
    >
      <div className="section-heading">
        <div className="eyebrow ornament">
          <span />
          THE CLIENT JOURNAL
          <span />
        </div>
        <h2>
          Before <em>& after.</em>
        </h2>
        <p>
          Original paired photographs from the studio, shared with permission.
        </p>
      </div>
      <div className="journal-comparison">
        <StudioPhoto
          src={pair.after}
          alt={`${pair.title}, after makeup`}
          loading="lazy"
        />
        <StudioPhoto
          className="journal-before"
          src={pair.before}
          alt={`${pair.title}, before makeup`}
          loading="lazy"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        />
        <i style={{ left: `${split}%` }} />
        <span>Before</span>
        <span>After</span>
      </div>
      <label className="journal-range">
        Compare the photographs
        <input
          type="range"
          value={split}
          min={0}
          max={100}
          onChange={(e) => setSplit(Number(e.target.value))}
        />
      </label>
      <div className="journal-caption">
        <div>
          <h3>{pair.title}</h3>
          {pair.credit && <p>Photography: {pair.credit}</p>}
        </div>
        {pairs.length > 1 && (
          <div>
            <button
              className="icon-button"
              aria-label="Previous comparison"
              onClick={() =>
                setIndex((index - 1 + pairs.length) % pairs.length)
              }
            >
              <ArrowLeft size={15} />
            </button>
            <button
              className="icon-button"
              aria-label="Next comparison"
              onClick={() => setIndex((index + 1) % pairs.length)}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
