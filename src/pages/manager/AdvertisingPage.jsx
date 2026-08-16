import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Megaphone, MapPin, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { api, apiUrl } from "../../api";
import { Badge, PageHeading } from "../../components/ui";
import EventLoading from "../../components/EventLoading";

export default function AdvertisingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backendUrl = apiUrl.replace(/\/api\/v1$/, "");
  const mediaUrl = (url) => url?.startsWith("/storage/") ? `${backendUrl}${url}` : url;
  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const data = await api("/manager/advertisements");
        if (active) setItems(data.advertisements || []);
      } catch (problem) {
        if (active) setError(problem.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadApplications();
    return () => {
      active = false;
    };
  }, []);

  const review = async (item, status) => {
    const result = await Swal.fire({
      title: `${status === "approved" ? "Approve" : "Reject"} this advert?`,
      input: "textarea",
      inputLabel: status === "approved" ? "Manager note (optional)" : "Reason for rejection",
      inputPlaceholder: "Add a short note for the host…",
      showCancelButton: true,
      confirmButtonText: status === "approved" ? "Approve and feature" : "Reject application",
      confirmButtonColor: status === "approved" ? "#22c55e" : "#ef4444",
      background: "#17131b", color: "#f7f4fb",
    });
    if (!result.isConfirmed) return;
    try {
      const response = await api(`/manager/advertisements/${item.id}`, {
        method: "PATCH", body: JSON.stringify({ status, review_note: result.value || null }),
      });
      setItems((current) => current.map((entry) => entry.id === item.id ? response.advertisement : entry));
      Swal.fire({ title: status === "approved" ? "Event is now featured" : "Application rejected", icon: "success", background: "#17131b", color: "#f7f4fb", confirmButtonColor: "#8b4ee8" });
    } catch (e) { setError(e.message); }
  };

  return <>
    <PageHeading badge={<Badge tone="pink"><Megaphone size={13} /> Campaign approvals</Badge>} title="Event advertising" description="Review host applications. Approved published events appear in the member app's Featured section." />
    {error && <p className="auth-error">{error}</p>}
    {loading ? <EventLoading label="Loading advertisement applications…" /> : (
      <section className="panel ad-applications">
        {items.length === 0 && <div className="venue-empty"><Megaphone /><h2>No applications yet</h2><p>Host advertising applications will appear here.</p></div>}
        {items.map((item) => <article className="ad-application" key={item.id}>
          <img src={mediaUrl(item.event.media?.[0]?.url) || "/images/afro-night.png"} alt="" />
          <div className="ad-application-copy"><div><Badge tone={item.status === "approved" ? "green" : item.status === "pending" ? "amber" : "neutral"}>{item.status}</Badge></div><h2>{item.event.name}</h2><p><MapPin /> {item.event.venue?.name} · {item.requester?.name}</p><small><Clock3 /> Applied {new Date(item.created_at).toLocaleDateString()}</small>{item.review_note && <blockquote>{item.review_note}</blockquote>}</div>
          {item.status === "pending" && <div className="ad-review-actions"><button className="secondary-button" onClick={() => review(item, "rejected")}><XCircle /> Reject</button><button className="primary-button" onClick={() => review(item, "approved")}><CheckCircle2 /> Approve & feature</button></div>}
        </article>)}
      </section>
    )}
  </>;
}
