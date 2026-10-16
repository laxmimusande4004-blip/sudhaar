
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, RefreshCw } from "lucide-react";
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
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyles = {
  submitted: "text-[#94600C] bg-[#F5EAD1]",
  in_progress: "text-[#285D83] bg-[#E3EDF4]",
  resolved: "text-[#276746] bg-[#E1EEE1]",
};

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPhotoUrl(photoPath) {
  if (!photoPath) return null;

  const { data } = supabase.storage
    .from("complaint-photos")
    .getPublicUrl(photoPath);

  return data?.publicUrl ?? null;
}

export default function RecentReports() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("complaints")
      .select(
        "id, title, category, description, address, status, created_at, photo_path"
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (queryError) {
      console.error("Could not load complaints:", queryError.message);
      setError("We couldn't load community reports. Please try again.");
      setLoading(false);
      return;
    }

    setComplaints(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <section
      id="reports"
      className="scroll-mt-24 border-b border-[#E4E5DC] bg-[#F7F6F0]"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Community reports"
            title="Problems people have reported"
            description="Follow civic issues reported by people in their communities."
          />

          <span className="w-fit border-b border-[#BFCBBE] pb-1 text-xs text-[#687468]">
            Latest reports
          </span>
        </div>

        <div className="mt-8 border-t border-[#DADDD3]">
          {loading ? (
            <div className="py-12 text-sm text-[#687468]" role="status">
              Loading community reports…
            </div>
          ) : error ? (
            <div className="py-8" role="alert">
              <p className="text-sm text-red-800">{error}</p>

              <button
                type="button"
                onClick={loadComplaints}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#245B43]"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12">
              <h3 className="text-base font-semibold text-[#263E2F]">
                No reports yet
              </h3>

              <p className="mt-2 text-sm text-[#687468]">
                Be the first to report an issue in your community.
              </p>

              <Link
                to="/report"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#245B43] hover:underline"
              >
                Report an issue
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            complaints.map((complaint, index) => {
              const statusStyle =
                statusStyles[complaint.status] ??
                "text-[#58675C] bg-[#E9EAE3]";

              const photoUrl = getPhotoUrl(complaint.photo_path);

              return (
                <article
                  key={complaint.id}
                  className="grid gap-3 border-b border-[#DADDD3] py-5 sm:grid-cols-[42px_1fr] sm:gap-5 sm:py-6"
                >
                  <span className="pt-1 text-xs tabular-nums text-[#8A9085]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="grid min-w-0 gap-4 sm:grid-cols-[1fr_144px] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-base font-semibold text-[#263E2F]">
                          {complaint.title}
                        </h3>

                        <span
                          className={`rounded px-2 py-1 text-[11px] font-medium ${statusStyle}`}
                        >
                          {statusLabels[complaint.status] ??
                            complaint.status}
                        </span>
                      </div>

                      <p className="mt-2 flex items-start gap-1.5 text-sm text-[#687468]">
                        <MapPin
                          size={14}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {complaint.address}
                          <span aria-hidden="true"> · </span>
                          {categoryLabels[complaint.category] ??
                            complaint.category}
                        </span>
                      </p>

                      {complaint.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#59685C]">
                          {complaint.description}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-[#899087]">
                        Reported {formatDate(complaint.created_at)}
                      </p>
                    </div>

                    {photoUrl && (
                      <a
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View photo for ${complaint.title}`}
                        className="block overflow-hidden rounded-xl border border-[#DADDD3] bg-white sm:w-36"
                      >
                        <img
                          src={photoUrl}
                          alt={`Evidence for ${complaint.title}`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          className="h-40 w-full object-cover sm:h-28"
                        />

                        <span className="block px-2 py-1.5 text-center text-xs font-medium text-[#365340]">
                          View photo ↗
                        </span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
