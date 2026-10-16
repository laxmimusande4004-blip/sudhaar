
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  ShieldCheck,
  FilePlus2,
  MapPin,
  ArrowUpRight,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

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
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPhotoUrl(path) {
  if (!path) return null;

  return supabase.storage
    .from("complaint-photos")
    .getPublicUrl(path).data.publicUrl;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");

  const loadProfileAndReports = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setReportsError("");

    const [profileResult, complaintsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("complaints")
        .select(
          "id, title, category, address, status, created_at, updated_at, photo_path"
        )
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      console.error("Could not load profile:", profileResult.error.message);
    }

    if (complaintsResult.error) {
      console.error(
        "Could not load your reports:",
        complaintsResult.error.message
      );
      setReportsError("We couldn't load your reports. Please try again.");
    }

    setProfile(profileResult.data ?? null);
    setComplaints(complaintsResult.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProfileAndReports();
  }, [loadProfileAndReports]);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Citizen";

  const submittedCount = complaints.length;
  const inProgressCount = complaints.filter(
    (item) => item.status === "in_progress"
  ).length;
  const resolvedCount = complaints.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-medium text-[#687468]">
          Your CivicTrack account
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your profile
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[#687468]">
          Manage your account and follow the issues you report to your community.
        </p>

        {/* Account details */}
        <section className="mt-10 rounded-2xl border border-[#E4E5DC] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8EEE5] text-[#245B43]">
              <UserRound size={30} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold">
                {displayName}
              </h2>
              <p className="mt-1 break-all text-sm text-[#687468]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="my-7 border-t border-[#E8E9E1]" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail size={19} className="mt-0.5 shrink-0 text-[#687468]" />
              <div>
                <p className="text-sm font-medium">Email address</p>
                <p className="mt-1 break-all text-sm text-[#687468]">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#687468]"
              />
              <div>
                <p className="text-sm font-medium">Account type</p>
                <p className="mt-1 text-sm capitalize text-[#687468]">
                  {profile?.role || "citizen"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#E8E9E1] pt-6">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#194832]"
            >
              <FilePlus2 size={17} />
              Report an issue
            </Link>
          </div>
        </section>

        {/* Complaint tracking */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#55715B]">
                Your activity
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                My reports
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#687468]">
                Track every complaint you've submitted and follow its progress.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProfileAndReports}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#245B43] disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E4E5DC] bg-white p-4">
              <p className="text-xs text-[#687468]">Total</p>
              <p className="mt-2 text-2xl font-semibold">{submittedCount}</p>
            </div>

            <div className="rounded-xl border border-[#E4E5DC] bg-white p-4">
              <p className="text-xs text-[#687468]">In progress</p>
              <p className="mt-2 text-2xl font-semibold text-[#285D83]">
                {inProgressCount}
              </p>
            </div>

            <div className="rounded-xl border border-[#E4E5DC] bg-white p-4">
              <p className="text-xs text-[#687468]">Resolved</p>
              <p className="mt-2 text-2xl font-semibold text-[#276746]">
                {resolvedCount}
              </p>
            </div>
          </div>

          {reportsError && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-[#E3D3A8] bg-[#FBF4DF] p-4 text-sm text-[#77561B]"
            >
              {reportsError}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-sm text-[#687468]" role="status">
              Loading your reports…
            </div>
          ) : reportsError ? null : complaints.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#C7CEC1] bg-white px-5 py-12 text-center">
              <ClipboardList
                size={30}
                className="mx-auto text-[#899087]"
              />

              <h3 className="mt-4 font-semibold">No reports yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687468]">
                When you report a civic issue, you'll find its status and
                progress here.
              </p>

              <Link
                to="/report"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white hover:bg-[#194832]"
              >
                <FilePlus2 size={16} />
                Submit your first report
              </Link>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#DADDD3] border-y border-[#DADDD3]">
              {complaints.map((complaint) => {
                const image = getPhotoUrl(complaint.photo_path);

                return (
                  <article
                    key={complaint.id}
                    className="flex gap-4 py-5 sm:py-6"
                  >
                    {image && (
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        className="hidden h-20 w-24 shrink-0 rounded-xl border border-[#E4E5DC] object-cover sm:block"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#687468]">
                          {categoryLabels[complaint.category] ??
                            complaint.category}
                        </span>

                        <span
                          className={`rounded px-2 py-1 text-[11px] font-medium ${
                            statusStyles[complaint.status] ??
                            "bg-[#E9EAE3] text-[#58675C]"
                          }`}
                        >
                          {statusLabels[complaint.status] ??
                            complaint.status}
                        </span>
                      </div>

                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="mt-2 block break-words font-semibold hover:text-[#245B43] hover:underline"
                      >
                        {complaint.title}
                      </Link>

                      <p className="mt-2 flex items-start gap-1.5 text-sm text-[#687468]">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span>{complaint.address}</span>
                      </p>

                      <p className="mt-2 text-xs text-[#899087]">
                        Submitted {formatDate(complaint.created_at)}
                      </p>

                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#245B43] hover:underline"
                      >
                        View complaint <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/complaints"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#245B43] hover:underline"
            >
              Explore community complaints
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        <p className="mt-10 text-sm leading-6 text-[#687468]">
          Your account details are private to your account. Public complaints
          and their progress are visible according to CivicTrack's reporting
          rules.
        </p>
      </main>

      <Footer />
    </div>
  );
}
