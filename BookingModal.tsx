"use client";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Modal from "./Modal";
import {
  CATALOG,
  displayDate,
  displayTime,
  indiaToday,
  uid,
  whatsapp,
  type Booking,
} from "@/lib/studio";
import { useWorkspace } from "@/lib/useWorkspace";
export default function BookingModal({
  onClose,
  initialService = "bridal",
}: {
  onClose: () => void;
  initialService?: string;
}) {
  const [mode, setMode] = useState<"enquiry" | "demo">("enquiry");
  const [serviceId, setServiceId] = useState(initialService),
    [name, setName] = useState(""),
    [day, setDay] = useState(""),
    [time, setTime] = useState("");
  const [eventDate, setEventDate] = useState(""),
    [done, setDone] = useState(false),
    [link, setLink] = useState(""),
    [validation, setValidation] = useState("");
  const { data, error, loading, saving, save, reload } = useWorkspace(
    mode === "demo",
  );
  const options =
    mode === "demo" && data ? data.services.filter((s) => s.active) : CATALOG;
  const service = options.find((s) => s.id === serviceId);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setValidation("");
    if (!name.trim() || !service) {
      setValidation("Please enter your name and choose an available service.");
      return;
    }
    const chosen = new Date(`${day}T${time}:00+05:30`);
    if (chosen.getTime() <= Date.now()) {
      setValidation("Choose a future date and time in India Standard Time.");
      return;
    }
    if (eventDate && service.category === "Bridal" && eventDate < day) {
      setValidation("The event date must be on or after the appointment date.");
      return;
    }
    if (mode === "enquiry") {
      const url = whatsapp(
        `Hello M.S Makeovers, I’m ${name.trim()}. I’d like to enquire about ${service.name} on ${displayDate(day, true)} at ${displayTime(time)} IST.${service.category === "Bridal" && eventDate ? ` My event date is ${displayDate(eventDate, true)}.` : ""} Please let me know your availability and pricing.`,
      );
      setLink(url);
      window.open(url, "_blank", "noopener,noreferrer");
      setDone(true);
      return;
    }
    if (!data) return;
    const customer = {
      id: uid(),
      name: name.trim(),
      note: "Created through the private demo booking form.",
    };
    const booking: Booking = {
      id: uid(),
      customerId: customer.id,
      serviceId,
      staffId: "",
      date: day,
      time,
      eventDate: service.category === "Bridal" ? eventDate || day : "",
      status: "Pending",
      amount: data.services.find((s) => s.id === serviceId)?.price ?? null,
      note: "",
    };
    if (
      await save({
        ...data,
        customers: [...data.customers, customer],
        bookings: [...data.bookings, booking],
      })
    )
      setDone(true);
  }
  return (
    <Modal
      title={
        done
          ? mode === "demo"
            ? "Demo booking saved."
            : "Your enquiry is ready."
          : "Let’s plan your visit."
      }
      eyebrow="M.S MAKEOVERS · APPOINTMENTS"
      onClose={onClose}
      className="booking-dialog"
    >
      {done ? (
        <div className="booking-success">
          <span className="success-mark">
            <Check size={27} />
          </span>
          <p>
            {mode === "demo"
              ? "Your simulated appointment is in your private demo dashboard. No real appointment has been made."
              : "Send your prepared message in WhatsApp. Your appointment is only confirmed when the studio replies."}
          </p>
          <div className="booking-recap">
            <strong>{service?.name}</strong>
            <span>
              {displayDate(day, true)} · {displayTime(time)} IST
            </span>
            <span>{name}</span>
          </div>
          {mode === "demo" ? (
            <a className="btn btn-dark full" href="/admin#appointments">
              Manage demo booking <ArrowUpRight size={16} />
            </a>
          ) : (
            <a
              className="btn btn-dark full"
              href={link}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      ) : (
        <>
          <p className="dialog-intro">
            Tell us a little about your plans. We’ll take it from there.
          </p>
          <div className="segmented booking-tabs">
            <button
              className={mode === "enquiry" ? "selected" : ""}
              onClick={() => {
                setMode("enquiry");
                setValidation("");
                setName("");
                setServiceId(initialService);
              }}
            >
              <MessageCircle size={15} />
              WhatsApp enquiry
            </button>
            <button
              className={mode === "demo" ? "selected" : ""}
              onClick={() => {
                setMode("demo");
                setValidation("");
                setName("");
              }}
            >
              <CalendarDays size={15} />
              Try a demo
            </button>
          </div>
          {mode === "demo" && (
            <div className="note-box">
              <ShieldCheck size={17} />
              <span>
                <strong>Demo only.</strong> Use a fictional name. This does not
                reserve a studio appointment.
              </span>
            </div>
          )}
          <form className="form-stack" onSubmit={submit}>
            <label>
              {mode === "demo" ? "Demo customer alias" : "Your name"}
              <input
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  mode === "demo" ? "e.g. Demo guest" : "Enter your name"
                }
                required
                autoComplete={mode === "demo" ? "off" : "given-name"}
              />
            </label>
            <label>
              Service
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                {options.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Preferred date
                <input
                  type="date"
                  min={indiaToday()}
                  max="2099-12-31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                />
              </label>
              <label>
                Preferred time · IST
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </label>
            </div>
            {service?.category === "Bridal" && (
              <label>
                Bridal event date <small>(optional)</small>
                <input
                  type="date"
                  min={day || indiaToday()}
                  max="2099-12-31"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </label>
            )}
            {(error || validation) && (
              <div className="form-error" role="alert">
                {validation || error}
                {!data && mode === "demo" && (
                  <button type="button" onClick={() => void reload()}>
                    Retry connection
                  </button>
                )}
              </div>
            )}
            <button
              className="btn btn-gold full"
              disabled={
                saving ||
                (mode === "demo" && (loading || !data || !options.length))
              }
            >
              {saving || (loading && mode === "demo") ? (
                <LoaderCircle className="spin" size={16} />
              ) : mode === "enquiry" ? (
                <MessageCircle size={17} />
              ) : (
                <CalendarDays size={17} />
              )}{" "}
              {mode === "demo" ? "Create demo booking" : "Continue to WhatsApp"}{" "}
              <ArrowUpRight size={16} />
            </button>
            <small className="form-footnote">
              {mode === "enquiry"
                ? "An enquiry, not a confirmed booking. Availability and prices are confirmed directly by the studio."
                : "Saved to this browser’s private demo workspace. Never published."}
            </small>
          </form>
        </>
      )}
    </Modal>
  );
}
