"use client";
import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";

type PhotoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
};

/** The delivery pipeline already resizes editorial WebP files and private uploads. */
export default function StudioPhoto({
  src,
  alt,
  className,
  loading,
  fetchPriority,
  onError,
  ...rest
}: PhotoProps) {
  const [unavailable, setUnavailable] = useState("");
  if (unavailable === src)
    return (
      <span
        className={`${className || ""} photo-unavailable`}
        role="img"
        aria-label={`${alt}. Photograph unavailable.`}
      >
        <ImageOff size={22} strokeWidth={1.3} />
        <small>Photograph unavailable</small>
      </span>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Local WebPs are pre-optimized; private data-URL uploads must never use a shared optimizer cache.
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading || (fetchPriority === "high" ? "eager" : "lazy")}
      fetchPriority={fetchPriority}
      decoding="async"
      onError={(event) => {
        setUnavailable(src);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
