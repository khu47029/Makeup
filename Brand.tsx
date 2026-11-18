import StudioPhoto from "@/components/StudioPhoto";
import { studioMedia } from "@/lib/visuals";

export function FeatherMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 74"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth=".9" strokeLinecap="round">
        <path d="M40 53C51 30 64 12 81 3M54 32C49 22 59 10 80 3C83 17 72 31 57 31M57 27C52 19 65 9 78 6C77 16 69 26 57 27Z" />
        <path
          d="M58 23C58 17 66 11 73 10C72 16 67 23 60 24M62 21C61 17 66 14 70 13C69 18 66 20 62 21Z"
          fill="currentColor"
        />
        <path d="M52 36C46 29 48 23 48 20M54 31C49 25 51 16 54 13M57 25C54 18 58 11 61 8M61 20C59 13 65 7 68 5M65 16C66 9 73 4 77 2M51 37C59 37 65 34 70 31M54 32C65 32 74 26 77 21M60 26C70 24 79 17 82 12M67 18C75 16 81 10 84 5" />
      </g>
      <text
        x="0"
        y="60"
        fontFamily="Georgia, serif"
        fontWeight="400"
        fontSize="47"
        letterSpacing="-7"
        fill="currentColor"
      >
        MS
      </text>
      <path
        d="M4 66C18 61 41 69 59 62M12 70C27 65 42 70 52 66"
        stroke="currentColor"
        strokeWidth=".8"
      />
    </svg>
  );
}
export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand${compact ? " compact" : ""}`}>
      {studioMedia.logo ? (
        <StudioPhoto
          className="brand-mark original-logo"
          src={studioMedia.logo.src}
          alt={studioMedia.logo.alt}
        />
      ) : (
        <FeatherMark className="brand-mark" />
      )}
      {!compact && (
        <span className="brand-words">
          <span>M.S Makeovers</span>
          <small>MAKEUP & BRIDAL STUDIO</small>
        </span>
      )}
    </span>
  );
}
