
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkRole() {
      if (authLoading) return;

      if (!user) {
        setCheckingRole(false);
        return;
      }

      setCheckingRole(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (queryError) {
        setError("We couldn't verify your admin permissions.");
      } else {
        setIsAdmin(data?.role === "admin");
      }

      setCheckingRole(false);
    }

    checkRole();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  if (authLoading || checkingRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F6F0] px-5">
        <p className="text-sm text-[#687468]">
          Verifying admin access…
        </p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F6F0] px-5">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-[#21382B]">
            Access verification failed
          </h1>
          <p className="mt-3 text-sm text-[#687468]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#245B43] px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

