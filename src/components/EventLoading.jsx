import { CalendarDays } from "lucide-react";

export default function EventLoading({ label = "Loading events…" }) {
  return (
    <section className="event-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="event-loading-art" aria-hidden="true">
        <div className="loader-calendar">
          <CalendarDays />
        </div>
      </div>
      <strong>{label}</strong>
      <div className="loader-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
