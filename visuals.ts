import registry from "@/content/studio-media.json";
import type { Look } from "./studio";

/** Trusted, studio-supplied assets only. Demo uploads never enter this manifest. */
type StudioImage = { src: string; alt: string };
export type Comparison = {
  id: string;
  title: string;
  before: string;
  after: string;
  credit: string;
  approved: boolean;
};
type MediaRegistry = {
  logo: StudioImage | null;
  artistPortrait: StudioImage | null;
  salonPhotograph: StudioImage | null;
  portfolio: (Look & { approved: boolean })[];
  comparisons: Comparison[];
};
const source = registry as MediaRegistry;
export const studioMedia = {
  ...source,
  portfolio: source.portfolio.filter((p) => p.approved && p.src && p.alt),
  comparisons: source.comparisons.filter(
    (p) => p.approved && p.before && p.after,
  ),
};
