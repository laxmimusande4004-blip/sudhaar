import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  Menu,
  X,
  Plus,
  ShieldCheck,
  UserRound,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);
  const isAdmin = role === "admin";

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Could not verify user role:", error.message);
        setRole(null);
      } else {
        setRole(data?.role ?? null);
      }

      setRoleLoading(false);
    }

    loadRole();

    return () => {
      active = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
      setRole(null);
      closeMenu();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  const linkClass =
    "text-sm text-[#4F5F52] transition-colors hover:text-[#245B43]";

  const mobileLinkClass =
    "rounded-lg px-3 py-3 text-sm text-[#4F5F52] transition-colors hover:bg-[#EAECE2]";

  const adminDesktopClass =
    "inline-flex items-center gap-2 rounded-lg border border-[#C9D9C9] bg-[#EAF1E8] px-3.5 py-2.5 text-sm font-semibold text-[#245B43] transition-colors hover:bg-[#DDE9DB]";

  const adminMobileClass =
    "mt-1 inline-flex items-center gap-2 rounded-lg border border-[#C9D9C9] bg-[#EAF1E8] px-3 py-3 text-sm font-semibold text-[#245B43] transition-colors hover:bg-[#DDE9DB]";

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#E4E5DC] bg-[#F7F6F0]/95 backdrop-blur-md">
      <nav
        className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
          aria-label="CivicTrack home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#245B43] text-white shadow-sm">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-[#21382B]">
              CivicTrack
            </span>
            <span className="hidden text-[11px] text-[#687468] sm:block">
              Community issue register
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/#map" className={linkClass}>
            Explore map
          </Link>

          <Link to="/complaints" className={linkClass}>
            Community reports
          </Link>

          {user ? (
            <Link to="/profile" className={linkClass}>
              My profile
            </Link>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Sign in
              </Link>
              <Link to="/register" className={linkClass}>
                Create account
              </Link>
            </>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={adminDesktopClass}>
                  <LayoutDashboard size={16} />
                  Admin panel
                </Link>
              )}

              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#194832]"
              >
                <Plus size={17} />
                Report an issue
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-2 text-sm text-[#687468] transition-colors hover:text-[#245B43] disabled:opacity-50"
              >
                <LogOut size={16} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <Link
              to="/report"
              className="inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#194832]"
            >
              <Plus size={17} />
              Report an issue
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-[#294536] transition-colors hover:bg-[#EAECE2] md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#E4E5DC] bg-[#F7F6F0] px-5 py-4 md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            <Link
              to="/#map"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Explore map
            </Link>

            <Link
              to="/complaints"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Community reports
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className={`${mobileLinkClass} flex items-center gap-2`}
                >
                  <UserRound size={17} />
                  My profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={adminMobileClass}
                  >
                    <LayoutDashboard size={17} />
                    Go to admin panel
                  </Link>
                )}

                <Link
                  to="/report"
                  onClick={closeMenu}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white hover:bg-[#194832]"
                >
                  <Plus size={17} />
                  Report an issue
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`${mobileLinkClass} mt-1 flex items-center gap-2 text-left disabled:opacity-50`}
                >
                  <LogOut size={17} />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  Create account
                </Link>

                <Link
                  to="/report"
                  onClick={closeMenu}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-medium text-white hover:bg-[#194832]"
                >
                  <Plus size={17} />
                  Report an issue
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
