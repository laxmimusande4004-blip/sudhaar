
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Search,
  ThumbsUp,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const categories = [
  ["roads", "Roads and potholes"],
  ["sanitation", "Waste and sanitation"],
  ["water", "Water supply"],
  ["drainage", "Drainage and flooding"],
  ["streetlights", "Streetlights"],
  ["footpaths", "Footpaths"],
  ["public_spaces", "Public spaces"],
  ["other", "Other"],
];

const statuses = [
  ["submitted", "Submitted"],
  ["in_progress", "In Progress"],
  ["resolved", "Resolved"],
];

const statusStyles = {
  submitted: "bg-[#F5EAD1] text-[#94600C]",
  in_progress: "bg-[#E3EDF4] text-[#285D83]",
  resolved: "bg-[#E1EEE1] text-[#276746]",
};

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function photoUrl(path) {
  if (!path) return null;

  return supabase.storage
    .from("complaint-photos")
    .getPublicUrl(path).data.publicUrl;
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [votes, setVotes] = useState({});
  const [myVotes, setMyVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyVote, setBusyVote] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: complaintError } = await supabase
      .from("complaints")
      .select(
        "id, title, category, description, address, latitude, longitude, photo_path, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (complaintError) {
      console.error(complaintError);
      setError("We couldn't load complaints. Please try again.");
      setLoading(false);
      return;
    }

    const items = data ?? [];
    setComplaints(items);

    if (items.length === 0) {
      setVotes({});
      setMyVotes(new Set());
      setLoading(false);
      return;
    }

    const ids = items.map((item) => item.id);
    const { data: voteRows, error: voteError } = await supabase
      .from("complaint_votes")
      .select("complaint_id, user_id")
      .in("complaint_id", ids);

    if (voteError) {
      console.error("Could not load complaint votes:", voteError);
    }

    const countMap = {};
    const ownVotes = new Set();

    for (const vote of voteRows ?? []) {
      countMap[vote.complaint_id] =
        (countMap[vote.complaint_id] ?? 0) + 1;

      if (user && vote.user_id === user.id) {
        ownVotes.add(vote.complaint_id);
      }
    }

    setVotes(countMap);
    setMyVotes(ownVotes);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  async function toggleVote(complaintId) {
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/complaints" } },
      });
      return;
    }

    if (busyVote === complaintId) return;

    setBusyVote(complaintId);
    setError("");

    const alreadyVoted = myVotes.has(complaintId);

    const result = alreadyVoted
      ? await supabase
          .from("complaint_votes")
          .delete()
          .eq("complaint_id", complaintId)
          .eq("user_id", user.id)
      : await supabase.from("complaint_votes").insert({
          complaint_id: complaintId,
          user_id: user.id,
        });

    if (result.error) {
      console.error("Could not update vote:", result.error);
      setError(
        result.error.code === "23505"
          ? "You've already supported this complaint."
          : "Your vote couldn't be saved. Please try again."
      );
    } else {
      setMyVotes((current) => {
        const next = new Set(current);

        if (alreadyVoted) {
          next.delete(complaintId);
        } else {
          next.add(complaintId);
        }

        return next;
      });

      setVotes((current) => ({
        ...current,
        [complaintId]: Math.max(
          0,
          (current[complaintId] ?? 0) + (alreadyVoted ? -1 : 1)
        ),
      }));
    }

    setBusyVote(null);
  }

  const filtered = complaints
    .filter((complaint) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        [
          complaint.title,
          complaint.description,
          complaint.address,
        ].some((value) => value?.toLowerCase().includes(term));

      return (
        matchesSearch &&
        (category === "all" || complaint.category === category) &&
        (status === "all" || complaint.status === status)
      );
    })
    .sort((a, b) => {
      if (sort === "supported") {
        return (votes[b.id] ?? 0) - (votes[a.id] ?? 0);
      }

      if (sort === "updated") {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#55715B]">
              The community board
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Civic complaints
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687468]">
              Discover local issues, support problems that matter, and follow
              their progress toward resolution.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white hover:bg-[#194832]"
          >
            Report an issue <ArrowUpRight size={16} />
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E4E5DC] bg-white p-4 sm:p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8578]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by issue, description, or address…"
              className="w-full rounded-lg border border-[#D5D9CF] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="rounded-lg border border-[#D5D9CF] bg-white px-3 py-3 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-[#D5D9CF] bg-white px-3 py-3 text-sm"
            >
              <option value="all">All statuses</option>
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort complaints"
              className="rounded-lg border border-[#D5D9CF] bg-white px-3 py-3 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="updated">Recently updated</option>
              <option value="supported">Most supported</option>
            </select>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-[#687468]">
            {loading
              ? "Loading complaints…"
              : `${filtered.length} complaint${filtered.length === 1 ? "" : "s"} found`}
          </p>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#245B43] disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-[#FBF4DF] p-4 text-sm text-[#77561B]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-[#687468]">
            Loading community complaints…
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-[#E4E5DC] bg-white px-5 py-14 text-center">
            <h2 className="text-lg font-semibold">No complaints found</h2>
            <p className="mt-2 text-sm text-[#687468]">
              Try changing your filters, or report an issue in your community.
            </p>
            <Link
              to="/report"
              className="mt-5 inline-flex rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white"
            >
              Report an issue
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-[#DADDD3] border-y border-[#DADDD3]">
            {filtered.map((complaint) => {
              const image = photoUrl(complaint.photo_path);

              return (
                <article
                  key={complaint.id}
                  className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:py-6"
                >
                  <div className="flex min-w-0 gap-4">
                    {image && (
                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="hidden h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-[#E4E5DC] sm:block"
                      >
                        <img
                          src={image}
                          alt={`Evidence for ${complaint.title}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#687468]">
                          {categories.find(([value]) => value === complaint.category)?.[1] ?? complaint.category}
                        </span>
                        <span className={`rounded px-2 py-1 text-[11px] font-medium ${statusStyles[complaint.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {statuses.find(([value]) => value === complaint.status)?.[1] ?? complaint.status}
                        </span>
                      </div>

                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="mt-2 block text-lg font-semibold text-[#21382B] hover:text-[#245B43] hover:underline"
                      >
                        {complaint.title}
                      </Link>

                      <p className="mt-2 flex items-start gap-1.5 text-sm text-[#687468]">
                        <MapPin size={15} className="mt-0.5 shrink-0" />
                        <span>{complaint.address}</span>
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#59685C]">
                        {complaint.description}
                      </p>

                      <p className="mt-2 text-xs text-[#899087]">
                        Reported {formatDate(complaint.created_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleVote(complaint.id)}
                    disabled={busyVote === complaint.id}
                    aria-pressed={myVotes.has(complaint.id)}
                    className={`inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                      myVotes.has(complaint.id)
                        ? "border-[#245B43] bg-[#E8EEE5] text-[#245B43]"
                        : "border-[#D5D9CF] bg-white text-[#405648] hover:bg-[#F0F3EC]"
                    }`}
                  >
                    <ThumbsUp size={16} />
                    {votes[complaint.id] ?? 0}
                    <span>{myVotes.has(complaint.id) ? "Supported" : "Support"}</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-[#899087]">
          Showing up to the 100 most recent reports. Votes are saved to your
          account when you're signed in.
        </p>
      </main>

      <Footer />
    </div>
  );
}
