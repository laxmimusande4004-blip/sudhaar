
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  RefreshCw,
  ThumbsUp,
  Clock3,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  submitted: "Submitted",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyles = {
  submitted: "bg-[#F5EAD1] text-[#94600C]",
  in_progress: "bg-[#E3EDF4] text-[#285D83]",
  resolved: "bg-[#E1EEE1] text-[#276746]",
};

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

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function photoUrl(path, bucket = "complaint-photos") {
  if (!path) return null;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voteBusy, setVoteBusy] = useState(false);

  const location = useLocation();

  const backPath = location.state?.from === "/admin" ? "/admin" : "/complaints";

  const backLabel =
   backPath === "/admin"
    ? "Back to Admin Dashboard"
    : "Back to Community Complaints";

  const loadComplaint = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: item, error: complaintError } = await supabase
      .from("complaints")
      .select(
        "id, title, category, description, address, latitude, longitude, photo_path, status, created_at, updated_at, reporter_id"
      )
      .eq("id", id)
      .maybeSingle();

    if (complaintError || !item) {
      console.error("Could not load complaint:", complaintError);
      setError(
        complaintError
          ? "We couldn't load this complaint. Please try again."
          : "This complaint could not be found."
      );
      setComplaint(null);
      setLoading(false);
      return;
    }

    setComplaint(item);

    const [
      { data: voteRows, error: voteError },
      { data: updateRows, error: updatesError },
    ] = await Promise.all([
      supabase
        .from("complaint_votes")
        .select("user_id")
        .eq("complaint_id", id),
      supabase
        .from("complaint_updates")
        .select("id, status, note, proof_path, created_at, actor_id")
        .eq("complaint_id", id)
        .order("created_at", { ascending: true }),
    ]);

    if (voteError) {
      console.error("Could not load votes:", voteError.message);
    }

    if (updatesError) {
      console.error("Could not load complaint updates:", updatesError.message);
    }

    const rows = voteRows ?? [];
    setVoteCount(rows.length);
    setHasVoted(Boolean(user && rows.some((row) => row.user_id === user.id)));
    setUpdates(updateRows ?? []);
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  async function toggleVote() {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/complaints/${id}` } },
      });
      return;
    }

    if (voteBusy || !complaint) return;

    setVoteBusy(true);
    setError("");

    const result = hasVoted
      ? await supabase
          .from("complaint_votes")
          .delete()
          .eq("complaint_id", id)
          .eq("user_id", user.id)
      : await supabase.from("complaint_votes").insert({
          complaint_id: id,
          user_id: user.id,
        });

    if (result.error) {
      console.error("Could not update vote:", result.error);
      setError("Your support couldn't be saved. Please try again.");
    } else {
      setHasVoted(!hasVoted);
      setVoteCount((count) => Math.max(0, count + (hasVoted ? -1 : 1)));
    }

    setVoteBusy(false);
  }

  const image = complaint ? photoUrl(complaint.photo_path) : null;

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-sm text-[#58675C] hover:text-[#245B43]"
        >
            <ArrowLeft size={16} />
            {backLabel}
        </Link>


        {loading ? (
          <div className="py-20 text-center text-sm text-[#687468]">
            Loading complaint…
          </div>
        ) : error && !complaint ? (
          <div className="mt-8 rounded-2xl border border-[#E4E5DC] bg-white p-6" role="alert">
            <p className="text-sm text-[#687468]">{error}</p>
            <button
              type="button"
              onClick={loadComplaint}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#245B43]"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : complaint ? (
          <>
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[#55715B]">
                  {categoryLabels[complaint.category] ?? complaint.category}
                </span>

                <span
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    statusStyles[complaint.status] ??
                    "bg-[#E9EAE3] text-[#58675C]"
                  }`}
                >
                  {statusLabels[complaint.status] ?? complaint.status}
                </span>
              </div>

              <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
                {complaint.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#687468]">
                <span className="inline-flex items-start gap-1.5">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  {complaint.address}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={16} />
                  Reported {formatDate(complaint.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="min-w-0 space-y-6">
                {image && (
                  <a
                    href={image}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-2xl border border-[#E4E5DC] bg-white"
                  >
                    <img
                      src={image}
                      alt={`Evidence for ${complaint.title}`}
                      className="max-h-[520px] w-full object-contain"
                    />
                  </a>
                )}

                <section className="rounded-2xl border border-[#E4E5DC] bg-white p-5 sm:p-7">
                  <h2 className="text-lg font-semibold">About this issue</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#59685C]">
                    {complaint.description}
                  </p>

                  {complaint.latitude != null &&
                    complaint.longitude != null && (
                      <div className="mt-5 rounded-xl bg-[#F0F3EC] p-4">
                        <p className="text-sm font-medium text-[#294536]">
                          <MapPin size={16} className="mr-1 inline" />
                          Reported coordinates
                        </p>
                        <p className="mt-2 text-sm text-[#687468]">
                          {Number(complaint.latitude).toFixed(6)},{" "}
                          {Number(complaint.longitude).toFixed(6)}
                        </p>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(complaint.latitude)}&mlon=${encodeURIComponent(complaint.longitude)}#map=17/${encodeURIComponent(complaint.latitude)}/${encodeURIComponent(complaint.longitude)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm font-medium text-[#245B43] hover:underline"
                        >
                          Open location in OpenStreetMap ↗
                        </a>
                      </div>
                    )}
                </section>

                <section className="rounded-2xl border border-[#E4E5DC] bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-2">
                    <Clock3 size={19} className="text-[#55715B]" />
                    <h2 className="text-lg font-semibold">Progress timeline</h2>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div className="relative flex gap-3">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#94600C] ring-4 ring-[#F5EAD1]" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Complaint submitted</p>
                        <p className="mt-1 text-xs text-[#899087]">
                          {formatDate(complaint.created_at)}
                        </p>
                      </div>
                    </div>

                    {updates.map((update) => (
                      <div key={update.id} className="flex gap-3">
                        <span
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${
                            update.status === "resolved"
                              ? "bg-[#168653] ring-[#E1EEE1]"
                              : update.status === "in_progress"
                                ? "bg-[#2563EB] ring-[#E3EDF4]"
                                : "bg-[#94600C] ring-[#F5EAD1]"
                          }`}
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {statusLabels[update.status] ?? update.status}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#59685C]">
                            {update.note}
                          </p>
                          <p className="mt-1 text-xs text-[#899087]">
                            {formatDate(update.created_at)}
                          </p>

                          {update.proof_path && (
                            <a
                              href={photoUrl(update.proof_path, "resolution-proof")}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-sm font-medium text-[#245B43] hover:underline"
                            >
                              View resolution evidence ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {updates.length === 0 && (
                      <p className="pl-6 text-sm leading-6 text-[#687468]">
                        No additional progress updates have been posted yet.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-[#E4E5DC] bg-white p-5">
                  <h2 className="font-semibold">Support this issue</h2>
                  <p className="mt-2 text-sm leading-6 text-[#687468]">
                    Show that this problem matters to your community.
                  </p>

                  <button
                    type="button"
                    onClick={toggleVote}
                    disabled={voteBusy}
                    aria-pressed={hasVoted}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                      hasVoted
                        ? "border-[#245B43] bg-[#E8EEE5] text-[#245B43]"
                        : "border-[#D5D9CF] text-[#405648] hover:bg-[#F0F3EC]"
                    }`}
                  >
                    <ThumbsUp size={17} />
                    {voteBusy
                      ? "Saving…"
                      : hasVoted
                        ? `Supported · ${voteCount}`
                        : `Support · ${voteCount}`}
                  </button>

                  {!user && (
                    <p className="mt-3 text-xs leading-5 text-[#899087]">
                      Sign in to support this complaint.
                    </p>
                  )}
                </section>

                <section className="rounded-2xl border border-[#E4E5DC] bg-white p-5">
                  <h2 className="font-semibold">Current status</h2>
                  <p className="mt-2 text-sm leading-6 text-[#687468]">
                    This complaint is currently marked as{" "}
                    <strong>
                      {statusLabels[complaint.status] ?? complaint.status}
                    </strong>.
                  </p>
                  <p className="mt-2 text-xs text-[#899087]">
                    Last record update: {formatDate(complaint.updated_at)}
                  </p>
                </section>

                {error && (
                  <p role="alert" className="rounded-lg bg-[#FBF4DF] p-3 text-sm text-[#77561B]">
                    {error}
                  </p>
                )}

                
                <Link
                    to={backPath}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#245B43] hover:underline"
                >
                    ← {backLabel}
                </Link>
              </aside>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
