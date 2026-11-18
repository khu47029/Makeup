"use client";
import StudioPhoto from "@/components/StudioPhoto";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Instagram from "./Instagram";
import Brand, { FeatherMark } from "./Brand";
import ServiceArt from "./ServiceArt";
import BookingModal from "./BookingModal";
import Gallery, { Lightbox } from "./Gallery";
import Modal from "./Modal";
import {
  BRAND,
  CATALOG,
  LOOKS,
  whatsapp,
  type CatalogItem,
} from "@/lib/studio";
import { studioMedia } from "@/lib/visuals";
const nav = [
  "Home",
  "About",
  "Services",
  "Bridal",
  "Gallery",
  "Reviews",
  "Contact",
];
const hasOriginals = studioMedia.portfolio.length > 0;
const slides = hasOriginals
  ? studioMedia.portfolio.slice(0, 3)
  : [LOOKS[0], LOOKS[2], LOOKS[4]];
const enquire = whatsapp(
  "Hello M.S Makeovers, I would like to enquire about your beauty and bridal makeup services.",
);
export function WhatsappIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.4 3.7a10.3 10.3 0 0 0-16.1 12.5L2.7 22l6-1.6A10.3 10.3 0 0 0 20.4 3.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 6.5c-.5 0-1.5.8-1.5 2.3s1.1 3.3 2.8 4.9c1.8 1.8 4.2 3.1 5.5 3.1s2.4-1 2.5-2c0-.3-.2-.5-.5-.6l-2.3-1.1c-.2-.1-.5-.1-.7.2l-1 1.2c-2.1-.8-3.3-2.1-4-3.8l.9-1.1c.2-.2.2-.4.1-.7l-1-2.2c-.1-.2-.4-.2-.8-.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default function PublicSite() {
  const [menu, setMenu] = useState(false),
    [active, setActive] = useState("home"),
    [slide, setSlide] = useState(0);
  const [booking, setBooking] = useState<string | null>(null),
    [service, setService] = useState<CatalogItem | null>(null),
    [all, setAll] = useState(false),
    [heroLook, setHeroLook] = useState<number | null>(null);
  const year = new Date().getFullYear();
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -62% 0px", threshold: 0 },
    );
    nav.forEach((n) => {
      const el = document.getElementById(n.toLowerCase());
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);
  const go = (id: string) => {
    setActive(id);
    setMenu(false);
  };
  const book = (id = "bridal") => {
    setMenu(false);
    setService(null);
    setBooking(id);
  };
  return (
    <div className="public-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand-home"
            href="#home"
            aria-label="M.S Makeovers home"
            onClick={() => go("home")}
          >
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((n) => (
              <a
                className={active === n.toLowerCase() ? "active" : ""}
                key={n}
                href={`#${n.toLowerCase()}`}
                onClick={() => go(n.toLowerCase())}
              >
                {n}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button className="header-book" onClick={() => book()}>
              <CalendarDays size={15} />
              <span>Book Appointment</span>
            </button>
            <button
              className="menu-toggle"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {nav.map((n) => (
              <a
                key={n}
                href={`#${n.toLowerCase()}`}
                onClick={() => go(n.toLowerCase())}
              >
                {n}
                <ArrowUpRight size={15} />
              </a>
            ))}
            <a href="/admin">
              Studio demo dashboard <ArrowUpRight size={15} />
            </a>
          </nav>
        )}
      </header>
      <main id="main-content">
        <section
          className={`hero hero-slide-${slide}`}
          id="home"
          aria-label="M.S Makeovers bridal studio"
        >
          <StudioPhoto
            key={slide}
            className="hero-photo"
            src={slides[slide].src}
            fetchPriority="high"
            alt={slides[slide].alt}
            style={
              hasOriginals
                ? { objectPosition: slides[slide].position }
                : undefined
            }
          />
          <div className="hero-shade" />
          <div className="hero-inner page-width">
            <div className="hero-content">
              <div className="hero-kicker">
                <span />
                BRIDAL & BEAUTY STUDIO
              </div>
              <h1>
                Your Beauty.
                <br />
                Your Moment.
                <br />
                <em>Our Artistry.</em>
              </h1>
              <p>
                Bridal makeup & professional beauty artistry by
                <br className="desktop-br" /> <strong>Madhuri Sharma</strong> in
                Anwalkhera, Agra.
              </p>
              <div className="hero-actions">
                <button className="btn btn-gold" onClick={() => book()}>
                  <CalendarDays size={17} />
                  Book Appointment
                </button>
                <a
                  className="btn btn-outline"
                  href="#bridal"
                  onClick={() => go("bridal")}
                >
                  Explore Bridal <ArrowUpRight size={16} />
                </a>
              </div>
              <a className="hero-location" href="#contact">
                <MapPin size={13} />
                <span>ANWALKHERA, AGRA</span>
              </a>
            </div>
          </div>
          <div className="hero-pager">
            <button
              className="hero-photo-label"
              onClick={() => setHeroLook(slide)}
            >
              THE BRIDAL EDIT
            </button>
            {slides.length > 1 && (
              <>
                <span className="pager-current">0{slide + 1}</span>
                <span className="pager-line" />
                <span className="pager-total">0{slides.length}</span>
                <button
                  aria-label="Previous bridal photograph"
                  onClick={() =>
                    setSlide((slide + slides.length - 1) % slides.length)
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label="Next bridal photograph"
                  onClick={() => setSlide((slide + 1) % slides.length)}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </section>
        <section id="services" className="services-section section-pad">
          <div className="page-width">
            <div className="section-heading">
              <div className="eyebrow ornament">
                <span />
                OUR EXPERTISE
                <span />
              </div>
              <h2>
                Signature <em>Services</em>
              </h2>
              <p>Considered care. Personal touches. Beauty, in every detail.</p>
            </div>
            <div className="services-grid">
              {(all ? CATALOG : CATALOG.slice(0, 4)).map((s, i) => (
                <button
                  className="service-card"
                  key={s.id}
                  onClick={() => setService(s)}
                >
                  <span className="service-number">0{i + 1}</span>
                  <span className="service-corner">
                    <ArrowUpRight size={16} strokeWidth={1.3} />
                  </span>
                  <ServiceArt kind={s.icon} />
                  <h3>{s.name}</h3>
                  <p>{s.line}</p>
                </button>
              ))}
            </div>
            <div className="section-center">
              <button className="text-link" onClick={() => setAll(!all)}>
                {all ? "Show signature selection" : "Discover all 8 services"}{" "}
                {all ? (
                  <ChevronDown size={15} className="flipped" />
                ) : (
                  <ArrowRight size={15} />
                )}
              </button>
            </div>
          </div>
        </section>
        <section className="about-section section-pad" id="about">
          <div className="about-layout page-width">
            <div className="about-photo-wrap">
              <StudioPhoto
                className="about-photo"
                src={
                  studioMedia.artistPortrait?.src ||
                  "/images/makeup-artistry.webp"
                }
                loading="lazy"
                alt={
                  studioMedia.artistPortrait?.alt ||
                  "Editorial detail of a makeup brush applying a warm, softly blended bridal look"
                }
              />
              <span className="about-image-caption">
                {studioMedia.artistPortrait
                  ? "MADHURI SHARMA · M.S MAKEOVERS"
                  : "A STUDY IN ARTISTRY · EDITORIAL"}
              </span>
              <div className="about-seal">
                <FeatherMark />
                <span>THE BEAUTY ATELIER</span>
              </div>
            </div>
            <div className="about-copy">
              <div className="eyebrow left">
                <span />
                THE ARTIST BEHIND THE BRUSH
              </div>
              <h2>
                Meet <em>Madhuri.</em>
              </h2>
              <p className="about-lead">
                An individual approach to beauty, with artistry at its heart.
              </p>
              <p>
                Madhuri Sharma is the makeup artist behind M.S Makeovers, a
                bridal and beauty studio in Anwalkhera, Agra. Her work centres
                on bridal makeup and professional makeup artistry.
              </p>
              <p>
                From your bridal vision to the finishing touches for a
                celebration, the conversation begins with you: your features,
                your style, and your moment.
              </p>
              <div className="artist-signature">Madhuri Sharma</div>
              <span className="signature-role">
                MAKEUP ARTIST · M.S MAKEOVERS
              </span>
              <a
                className="text-link"
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={16} /> Meet the artist on Instagram{" "}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>
        <Gallery />
        <section id="reviews" className="reviews-section section-pad">
          <div className="review-layout page-width">
            <div>
              <div className="eyebrow left">
                <span />
                STUDIO REVIEWS
              </div>
              <h2>
                A little <em>perspective.</em>
              </h2>
              <p>A snapshot of the studio’s customer rating.</p>
            </div>
            <div className="rating-card">
              <div className="rating-score">
                5.0<span>/ 5</span>
              </div>
              <div className="rating-detail">
                <div className="stars" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={17} fill="currentColor" />
                  ))}
                </div>
                <strong>111 reviews</strong>
                <small>Screenshot reference</small>
              </div>
              <p>
                This rating and review count are taken from the supplied
                screenshot reference, not live-verified review data.
              </p>
            </div>
          </div>
        </section>
        <section id="contact" className="contact-section section-pad">
          <div className="contact-content page-width">
            <div className="contact-invitation">
              <div className="eyebrow left">
                <span />
                VISIT THE STUDIO
              </div>
              <h2>
                Your next beautiful
                <br />
                <em>moment starts here.</em>
              </h2>
              <p>
                For bridal dates, service enquiries, or a little guidance,
                <br className="desktop-br" /> get in touch with Madhuri.
              </p>
              <a
                className="btn btn-gold"
                href={enquire}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappIcon size={18} />
                Chat on WhatsApp
                <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="contact-details">
              {studioMedia.salonPhotograph && (
                <StudioPhoto
                  className="original-salon-photo"
                  src={studioMedia.salonPhotograph.src}
                  alt={studioMedia.salonPhotograph.alt}
                  loading="lazy"
                />
              )}
              <div>
                <MapPin />
                <section>
                  <small>OUR LOCATION</small>
                  <strong>Anwalkhera, Agra</strong>
                  <p>Uttar Pradesh, India</p>
                  <a href={BRAND.mapUrl} target="_blank" rel="noreferrer">
                    Get directions <ArrowUpRight size={13} />
                  </a>
                </section>
              </div>
              <div>
                <Phone />
                <section>
                  <small>PHONE & WHATSAPP</small>
                  <a className="contact-value" href="tel:+916397973047">
                    +91 6397973047
                  </a>
                </section>
              </div>
              <div>
                <Instagram />
                <section>
                  <small>FOLLOW THE ARTISTRY</small>
                  <a
                    className="contact-value"
                    href={BRAND.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @makeoverby.madhuri <ArrowUpRight size={14} />
                  </a>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner page-width">
          <a href="#home" aria-label="M.S Makeovers home">
            <Brand />
          </a>
          <span>© {year} M.S Makeovers</span>
          <a href="/admin" className="admin-entry">
            Studio dashboard <small>DEMO</small>
            <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      <a
        className="whatsapp-float"
        href={enquire}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with M.S Makeovers on WhatsApp"
      >
        <WhatsappIcon size={26} />
        <span>Chat with the studio</span>
      </a>
      {booking !== null && (
        <BookingModal
          initialService={booking}
          onClose={() => setBooking(null)}
        />
      )}
      {service && (
        <Modal
          title={service.name}
          eyebrow="THE BEAUTY MENU"
          onClose={() => setService(null)}
          className="service-dialog"
        >
          <ServiceArt kind={service.icon} />
          <p className="service-detail-copy">{service.detail}</p>
          <div className="note-box">
            <Sparkles size={17} />
            <span>
              Availability and pricing are shared directly by the studio.
            </span>
          </div>
          <button
            className="btn btn-gold full"
            onClick={() => book(service.id)}
          >
            <CalendarDays size={16} />
            Enquire about this service
            <ArrowRight size={15} />
          </button>
        </Modal>
      )}
      {heroLook !== null && (
        <Lightbox
          editorial={!hasOriginals}
          looks={slides}
          index={heroLook}
          setIndex={setHeroLook}
          onClose={() => setHeroLook(null)}
        />
      )}
    </div>
  );
}
