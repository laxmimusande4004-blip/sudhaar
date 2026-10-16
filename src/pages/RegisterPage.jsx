
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { signUp } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.displayName.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await signUp({
        displayName: form.displayName,
        email: form.email.trim(),
        password: form.password,
      });

      if (data.session) {
        navigate("/", { replace: true });
      } else {
        setMessage(
          "Your account was created. Check your email for a confirmation link before signing in."
        );
      }
    } catch (err) {
      setError(err.message || "We couldn't create your account.");
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
            Join CivicTrack
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#667267]">
            Create an account to submit reports and follow their progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              Your name
            </label>
            <input
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={updateField}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
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
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              required
              autoComplete="new-password"
              className="mt-2 w-full rounded-lg border border-[#D5D9CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#557F61] focus:ring-2 focus:ring-[#DCE9DA]"
              placeholder="Enter your password again"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-[#E5EFE2] p-3 text-sm leading-6 text-[#245B43]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#245B43] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#194832] disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#667267]">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-[#245B43] underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
