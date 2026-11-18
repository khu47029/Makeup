export const BRAND = {
  name: "M.S Makeovers",
  artist: "Madhuri Sharma",
  phone: "+91 6397973047",
  location: "Anwalkhera, Agra, Uttar Pradesh",
  instagram: "makeoverby.madhuri",
  instagramUrl: "https://www.instagram.com/makeoverby.madhuri/",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=M.S+Makeovers+Anwalkhera+Agra+Uttar+Pradesh",
};
export const whatsapp = (message: string) =>
  `https://wa.me/916397973047?text=${encodeURIComponent(message)}`;
export const CATALOG = [
  {
    id: "bridal",
    name: "Bridal Makeup",
    category: "Bridal",
    line: "An unforgettable look for your most meaningful day.",
    detail:
      "A bridal look built around your features, your outfit, and the way you want to feel. Share your ceremony plans with Madhuri to discuss colours, finishes, and availability.",
    icon: "bride",
  },
  {
    id: "party",
    name: "Party Makeup",
    category: "Makeup",
    line: "A little radiance for every celebration.",
    detail:
      "From a softly defined eye to a statement lip, explore a celebration look that complements your outfit and personal style.",
    icon: "brushes",
  },
  {
    id: "professional",
    name: "Professional Makeup",
    category: "Makeup",
    line: "Considered detail. A beautifully polished finish.",
    detail:
      "Discuss a polished look for a special occasion, portrait, or professional setting, with a finish tailored to you.",
    icon: "lipstick",
  },
  {
    id: "skin",
    name: "Facial & Skin Care",
    category: "Skin care",
    line: "Thoughtful rituals for a fresh, luminous glow.",
    detail:
      "Talk with the studio about your skin-care preferences and the facial services available. Share any sensitivities before your visit.",
    icon: "face",
  },
  {
    id: "hair",
    name: "Haircut & Hairstyling",
    category: "Hair",
    line: "Shape, texture, and a style that feels like you.",
    detail:
      "Explore a fresh haircut or occasion hairstyle, from soft waves to a carefully arranged updo. Discuss your hair length and inspiration with the studio.",
    icon: "hair",
  },
  {
    id: "brows",
    name: "Eyebrow Threading & Shaping",
    category: "Finishing",
    line: "Soft definition, thoughtfully shaped.",
    detail:
      "A brow-shaping consultation to discuss your natural arch and your preferred level of definition.",
    icon: "brows",
  },
  {
    id: "lashes",
    name: "Eyelashes",
    category: "Finishing",
    line: "A finishing touch, from subtle to statement.",
    detail:
      "Explore lash options for your bridal or occasion look. Speak to the studio about the finish, application, and aftercare.",
    icon: "lashes",
  },
  {
    id: "extensions",
    name: "Hair Extensions",
    category: "Hair",
    line: "Beautiful length and natural-looking volume.",
    detail:
      "Discuss extension options, shade matching, and styling with the studio to find the right fit for your desired look.",
    icon: "extensions",
  },
];
export type CatalogItem = (typeof CATALOG)[number];
export const LOOKS = [
  {
    id: "portrait",
    title: "The classic bridal",
    category: "Classic bridal",
    src: "/images/bridal-hero.webp",
    credit: "Gaurav Vishwakarma",
    position: "69% 37%",
    alt: "Bridal beauty portrait with a crimson veil, silver jewellery, and softly defined eyes",
  },
  {
    id: "rose",
    title: "A touch of rose",
    category: "Soft romance",
    src: "/images/rose-bridal.webp",
    credit: "Rakshit Dutta",
    position: "50% 38%",
    alt: "A bride wearing an embroidered rose lehenga and traditional jewellery",
  },
  {
    id: "heritage",
    title: "Heritage in gold",
    category: "Classic bridal",
    src: "/images/classic-bridal.webp",
    credit: "Deepak Sharma",
    position: "65% 41%",
    alt: "A traditional bridal portrait with gold embroidery and delicately layered jewellery",
  },
  {
    id: "details",
    title: "The finer details",
    category: "Bridal details",
    src: "/images/bridal-details.webp",
    credit: "Satyam Vicky",
    position: "50% 50%",
    alt: "An editorial close-up of bridal mehndi, rings, and gold jewellery",
  },
  {
    id: "veil",
    title: "Beneath the veil",
    category: "Classic bridal",
    src: "/images/crimson-veil.webp",
    credit: "Arto Suraj",
    position: "53% 40%",
    alt: "A bride framed by a rich red veil and embroidered golden border",
  },
];
export type Look = (typeof LOOKS)[number];
export const STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof STATUSES)[number];
export type Service = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  active: boolean;
};
export type Customer = { id: string; name: string; note: string };
export type Staff = { id: string; name: string; role: string; active: boolean };
export type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  eventDate: string;
  status: BookingStatus;
  amount: number | null;
  note: string;
};
export type GalleryItem = {
  id: string;
  title: string;
  src: string;
  kind: "Editorial" | "Studio" | "Before / after";
  before: string;
  creditedTo: string;
};
export type Review = {
  id: string;
  alias: string;
  text: string;
  rating: number;
  status: "In review" | "Approved" | "Archived";
  date: string;
};
export type Profile = {
  name: string;
  artist: string;
  phone: string;
  location: string;
  instagram: string;
};
export type Workspace = {
  bookings: Booking[];
  services: Service[];
  customers: Customer[];
  staff: Staff[];
  gallery: GalleryItem[];
  reviews: Review[];
  profile: Profile;
};
export const uid = () => crypto.randomUUID();
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
export const indiaToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const dateOffset = (days: number, base = parseDate(indiaToday())) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return dateKey(d);
};
export const displayDate = (date: string, year = false) =>
  parseDate(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {}),
  });
export const displayTime = (time: string) =>
  new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export function initialWorkspace(): Workspace {
  const services = CATALOG.map(({ id, name, category }) => ({
    id,
    name,
    category,
    price: null,
    active: true,
  }));
  const customers = Array.from({ length: 5 }, (_, i) => ({
    id: `guest-${i + 1}`,
    name: `Demo guest ${String(i + 1).padStart(2, "0")}`,
    note: "",
  }));
  const data: [number, string, number, string, BookingStatus][] = [
    [1, "bridal", 1, "10:00", "Confirmed"],
    [2, "party", 0, "14:00", "Pending"],
    [3, "hair", 0, "16:30", "Confirmed"],
    [4, "professional", -1, "11:00", "Completed"],
    [5, "skin", -3, "12:00", "Completed"],
    [2, "brows", -5, "15:00", "Completed"],
    [3, "bridal", 5, "09:00", "Pending"],
  ];
  return {
    services,
    customers,
    staff: [
      {
        id: "artist",
        name: "Demo artist",
        role: "Makeup artist",
        active: true,
      },
      {
        id: "stylist",
        name: "Demo stylist",
        role: "Hair & beauty",
        active: true,
      },
    ],
    bookings: data.map(([guest, serviceId, days, time, status], i) => ({
      id: `demo-${i + 1}`,
      customerId: `guest-${guest}`,
      serviceId,
      staffId: serviceId === "hair" ? "stylist" : "artist",
      date: dateOffset(days),
      time,
      eventDate: serviceId === "bridal" ? dateOffset(days) : "",
      status,
      amount: null,
      note: "",
    })),
    gallery: LOOKS.slice(0, 3).map((l) => ({
      id: l.id,
      title: l.title,
      src: l.src,
      kind: "Editorial",
      before: "",
      creditedTo: l.credit,
    })),
    reviews: [],
    profile: {
      name: BRAND.name,
      artist: BRAND.artist,
      phone: BRAND.phone,
      location: BRAND.location,
      instagram: BRAND.instagram,
    },
  };
}
