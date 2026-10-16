
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F0] px-5 text-center">
      <p className="text-sm text-[#687468]">404 · Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#21382B]">
        We couldn't find that page.
      </h1>
      <a
        href="/"
        className="mt-6 rounded-lg bg-[#245B43] px-5 py-3 text-sm font-medium text-white"
      >
        Back to CivicTrack
      </a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
