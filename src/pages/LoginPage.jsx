
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { signIn } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/report";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "We couldn't sign you in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
      <Navbar />

      <main className="mx-auto max-w-lg px-5 py-12 sm:py-16">
        <div className="border-b border-[#DADDD3] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#55715B]">
            Citizen account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#667267]">
            Sign in to submit a complaint or check on an existing report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#245B43] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#194832] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#667267]">
          New to CivicTrack?{" "}
          <Link to="/register" className="font-semibold text-[#245B43] underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
