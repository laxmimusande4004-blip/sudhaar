
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ComplaintsPage from "./pages/ComplaintsPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F0] px-5 text-center">
      <p className="text-sm text-[#687468]">404 · Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#21382B]">
        We couldn't find that page.
      </h1>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-[#245B43] px-5 py-3 text-sm font-medium text-white"
      >
        Back to CivicTrack
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route
          path="/complaints/:id"
          element={<ComplaintDetailPage />}
        />

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
