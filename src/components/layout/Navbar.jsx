import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  ArrowUpRight,
  MapPinned,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

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

  const navLinks = [
    { to: "/#map", label: "Explore map" },
    { to: "/complaints", label: "Community reports" },
  ];

  const navLinkClass = (active = false) =>
    `relative inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83AC8A] ${
      active
        ? "bg-[#E8F0E5] text-[#245B43]"
        : "text-[#526455] hover:bg-white/75 hover:text-[#1E5036]"
    }`;

  const mobileLinkClass =
    "group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-[#435747] transition-all duration-200 hover:bg-[#EDF2E9] hover:text-[#245B43]";

  const primaryActionClass =
    "group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#245B43] px-4.5 py-2.5 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(36,91,67,.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#194832] hover:shadow-[0_9px_22px_rgba(36,91,67,.24)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BBD5B9] active:translate-y-0";

  const isExploreActive = location.pathname === "/" && location.hash === "#map";
  const isReportsActive = location.pathname.startsWith("/complaints");

  return (
    <header className="sticky top-0 z-[1000] px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className="relative mx-auto flex min-h-[68px] max-w-[1376px] items-center justify-between gap-3 rounded-2xl border border-white/75 bg-[#F9FAF5]/80 px-4 shadow-[0_8px_32px_rgba(29,57,36,.08),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-2xl backdrop-saturate-150 sm:rounded-[1.35rem] sm:px-6 lg:px-7"
        aria-label="Main navigation"
      >
        {/* Soft glass highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />

        {/* Brand */}
        <Link to="/" onClick={closeMenu} aria-label="Sudhaar home">
          <img
            src="/logo.png"
            alt="Sudhaar"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/45 p-1.5 shadow-[inset_0_1px_2px_rgba(40,60,40,.04)] md:flex">
          {navLinks.map((item) => {
            const active =
              (item.to === "/#map" && isExploreActive) ||
              (item.to === "/complaints" && isReportsActive);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(active)}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-[#4F8558]" />
                )}
              </Link>
            );
          })}

          {user ? (
            <Link to="/profile" className={navLinkClass(location.pathname === "/profile")}>
              My profile
            </Link>
          ) : (
            <Link to="/login" className={navLinkClass(location.pathname === "/login")}>
              Sign in
            </Link>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-[#C8DCC7]/90 bg-[#EAF2E7]/80 px-3.5 py-2.5 text-[13px] font-semibold text-[#245B43] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A8C8A8] hover:bg-[#DFECDC]"
                >
                  <LayoutDashboard size={15} />
                  Admin
                </Link>
              )}

              <Link to="/report" className={primaryActionClass}>
                <Plus size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:rotate-90" />
                Report an issue
                <ArrowUpRight size={14} className="ml-0.5 opacity-65 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-label="Sign out"
                title={signingOut ? "Signing out" : "Sign out"}
                className="grid h-10 w-10 place-items-center rounded-full text-[#788578] transition-all duration-200 hover:bg-[#F0E8E4] hover:text-[#9A4738] disabled:opacity-50"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="hidden rounded-full px-3 py-2.5 text-[13px] font-semibold text-[#526455] transition-colors hover:text-[#245B43] lg:inline-flex"
              >
                Create account
              </Link>
              <Link to="/report" className={primaryActionClass}>
                <Plus size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:rotate-90" />
                Report an issue
                <ArrowUpRight size={14} className="ml-0.5 opacity-65 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/80 bg-white/65 text-[#294536] shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83AC8A] md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span className={`absolute transition-all duration-200 ${menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}>
            <Menu size={21} />
          </span>
          <span className={`absolute transition-all duration-200 ${menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}>
            <X size={21} />
          </span>
        </button>
      </nav>

      {/* Animated glass mobile panel */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`mx-auto grid max-w-[1376px] overflow-hidden transition-[grid-template-rows,opacity,transform,margin] duration-300 ease-out md:hidden ${
          menuOpen
            ? "mt-2 grid-rows-[1fr] translate-y-0 opacity-100"
            : "pointer-events-none mt-0 grid-rows-[0fr] -translate-y-2 opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            className="rounded-2xl border border-white/80 bg-[#F9FAF5]/90 p-3 shadow-[0_15px_40px_rgba(29,57,36,.12),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-2xl"
            aria-label="Mobile navigation"
          >
            <div className="mb-2 flex items-center justify-between px-3.5 pb-3 pt-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#849182]">Navigate</p>
                <p className="mt-1 text-sm font-semibold text-[#25412E]">Make your city heard.</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F0E5] text-[#245B43]">
                <MapPinned size={17} />
              </span>
            </div>

            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className={mobileLinkClass}
              >
                {item.label}
                <ChevronRight size={16} className="text-[#9AA697] transition-transform group-hover:translate-x-1 group-hover:text-[#245B43]" />
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2.5"><UserRound size={17} /> My profile</span>
                  <ChevronRight size={16} className="text-[#9AA697]" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    tabIndex={menuOpen ? 0 : -1}
                    className="group mt-1 flex items-center justify-between rounded-xl border border-[#C8DCC7] bg-[#EAF2E7]/80 px-3.5 py-3 text-sm font-semibold text-[#245B43] transition hover:bg-[#DFECDC]"
                  >
                    <span className="flex items-center gap-2.5"><LayoutDashboard size={17} /> Admin dashboard</span>
                    <ArrowUpRight size={15} />
                  </Link>
                )}

                <Link
                  to="/report"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`${primaryActionClass} mt-3 w-full`}
                >
                  <Plus size={17} /> Report an issue <ArrowUpRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[#8A5A52] transition hover:bg-[#F5EAE6] disabled:opacity-50"
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
                  tabIndex={menuOpen ? 0 : -1}
                  className={mobileLinkClass}
                >
                  Sign in
                  <ChevronRight size={16} className="text-[#9AA697]" />
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className={mobileLinkClass}
                >
                  Create account
                  <ChevronRight size={16} className="text-[#9AA697]" />
                </Link>
                <Link
                  to="/report"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`${primaryActionClass} mt-3 w-full`}
                >
                  <Plus size={17} /> Report an issue <ArrowUpRight size={14} />
                </Link>
              </>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 border-t border-[#E4E9E0] pt-3 text-[10px] font-medium text-[#8A9587]">
              <Sparkles size={12} className="text-[#6F966E]" />
              Community-powered civic progress
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
