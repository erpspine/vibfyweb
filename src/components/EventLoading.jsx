import { CalendarDays, Music2, Sparkles } from "lucide-react";

export default function EventLoading({ label = "Loading events…" }) {
  return (
    <section className="event-loading" aria-live="polite" aria-busy="true">
      <div className="event-loading-art" aria-hidden="true">
        <span className="loader-orbit">
          <Sparkles />
        </span>
        <span className="loader-orbit second">
          <Music2 />
        </span>
        <div className="loader-calendar">
          <CalendarDays />
          <i />
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
