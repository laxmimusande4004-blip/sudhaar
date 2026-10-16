
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Mail, ShieldCheck, FilePlus2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Could not load profile:", error.message);
      }

      setProfile(data ?? null);
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Citizen";

  return (
    <div className="min-h-screen bg-[#F7F6F0]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-medium text-[#687468]">
          Your CivicTrack account
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#21382B] sm:text-4xl">
          Your profile
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[#687468]">
          Manage your account and follow the issues you report to your community.
        </p>

        <section className="mt-10 rounded-2xl border border-[#E4E5DC] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8EEE5] text-[#245B43]">
              <UserRound size={30} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold text-[#21382B]">
                {displayName}
              </h2>
              <p className="mt-1 break-all text-sm text-[#687468]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="my-7 border-t border-[#E8E9E1]" />

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Mail size={19} className="mt-0.5 shrink-0 text-[#687468]" />
              <div>
                <p className="text-sm font-medium text-[#21382B]">
                  Email address
                </p>
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
                <p className="text-sm font-medium text-[#21382B]">
                  Account type
                </p>
                <p className="mt-1 text-sm capitalize text-[#687468]">
                  {loading
                    ? "Loading…"
                    : profile?.role || "citizen"}
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

        <p className="mt-6 text-sm leading-6 text-[#687468]">
          Your account details are private to your account. Complaint visibility
          follows CivicTrack's public reporting rules.
        </p>
      </main>

      <Footer />
    </div>
  );
}
