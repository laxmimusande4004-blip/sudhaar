import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, RefreshCw, ArrowRight, FileText } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import SectionHeading from "../ui/SectionHeading";

const categoryLabels = {
  roads: "Roads and potholes",
  sanitation: "Waste and sanitation",
  water: "Water supply",
  drainage: "Drainage and flooding",
  streetlights: "Streetlights",
  footpaths: "Footpaths",
  public_spaces: "Public spaces",
  other: "Other",
};

const statusLabels = {
  submitted: "Submitted",
  in_progress: "In progress",
  resolved: "Resolved",
};

const statusStyles = {
  submitted: "border-[#EAD9AC] bg-[#F8F0D9] text-[#865B12]",
  in_progress: "border-[#C9DDE8] bg-[#E8F1F5] text-[#285D83]",
  resolved: "border-[#C8DDC9] bg-[#E8F1E5] text-[#276746]",
};

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  const { data } = supabase.storage.from("complaint-photos").getPublicUrl(photoPath);
  return data?.publicUrl ?? null;
}

export default function RecentReports() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("complaints")
      .select("id, title, category, description, address, status, created_at, photo_path")
      .order("created_at", { ascending: false })
      .limit(6);

    if (queryError) {
      console.error("Could not load complaints:", queryError.message);
      setError("We couldn't load community reports. Please try again.");
      setLoading(false);
      return;
    }

    setComplaints(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  return (
    <section id="reports" className="scroll-mt-24 border-y border-[#DDE2D7] bg-[#F8F7F1]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="flex flex-col gap-5 border-b border-[#D9DED4] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="From the community"
            title="Issues, out in the open."
            description="Real reports from residents. Open one to see its details, current status, and recorded updates."
          />
          <Link to="/complaints" className="inline-flex w-fit items-center gap-2 pb-1 text-sm font-semibold text-[#245B43] transition hover:gap-3">
            All community reports <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-7">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading community reports">
              {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-[#E1E5DC] bg-white/70" />)}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
              <p className="text-sm text-red-800">{error}</p>
              <button type="button" onClick={loadComplaints} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#245B43]">
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C9D5C6] bg-white/60 px-6 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E8EFE5] text-[#477A55]"><FileText size={21} /></span>
              <h3 className="mt-4 text-lg font-semibold text-[#263E2F]">The first report starts here.</h3>
              <p className="mt-2 text-sm text-[#687468]">No community reports yet. Be the first to put a local issue on the map.</p>
              <Link to="/report" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#194832]">
                Report an issue <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complaints.map((complaint, index) => {
                const photoUrl = getPhotoUrl(complaint.photo_path);
                const statusStyle = statusStyles[complaint.status] ?? "border-[#E1E5DC] bg-[#F0F0E8] text-[#58675C]";
                return (
                  <article key={complaint.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E0E5DC] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#C3D4C0] hover:shadow-[0_18px_45px_rgba(31,61,41,0.09)]">
                    {photoUrl ? (
                      <Link to={`/complaints/${complaint.id}`} className="relative block h-44 overflow-hidden bg-[#E8EDE3]">
                        <img src={photoUrl} alt={`Evidence for ${complaint.title}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#42664C]">Report {String(index + 1).padStart(2, "0")}</span>
                      </Link>
                    ) : (
                      <div className="relative flex h-36 items-end overflow-hidden bg-[#E9EEE4] p-4">
                        <div aria-hidden="true" className="absolute -right-6 -top-12 h-40 w-40 rounded-full border border-[#C9D8C4]" />
                        <div aria-hidden="true" className="absolute -right-1 -top-5 h-28 w-28 rounded-full border border-[#D2DEC9]" />
                        <span className="relative inline-flex items-center gap-2 rounded-full border border-[#D3DFCF] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#42664C]">
                          <FileText size={12} /> Community report
                        </span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyle}`}>{statusLabels[complaint.status] ?? complaint.status}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#829083]">{categoryLabels[complaint.category] ?? complaint.category}</span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-[#21382B]">
                        <Link to={`/complaints/${complaint.id}`} className="outline-none transition hover:text-[#39734B] focus-visible:underline">{complaint.title}</Link>
                      </h3>
                      {complaint.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687468]">{complaint.description}</p>}
                      <p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-[#778477]">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{complaint.address || "Location not provided"}</span>
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEF0EA] pt-4 mt-5">
                        <span className="text-xs text-[#899087]">{formatDate(complaint.created_at)}</span>
                        <Link to={`/complaints/${complaint.id}`} aria-label={`View ${complaint.title}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B43] transition group-hover:gap-2.5">
                          View report <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
