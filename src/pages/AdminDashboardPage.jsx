import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  Filter,
  Gauge,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabaseClient";

const statuses = ["submitted", "in_progress", "resolved"];

const statusLabels = {
  submitted: "Submitted",
  in_progress: "In progress",
  resolved: "Resolved",
};

const statusStyles = {
  submitted: "bg-amber-50 text-amber-800 ring-amber-200",
  in_progress: "bg-sky-50 text-sky-800 ring-sky-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

const categoryLabels = {
  roads: "Roads",
  sanitation: "Sanitation",
  water: "Water supply",
  drainage: "Drainage",
  streetlights: "Streetlights",
  footpaths: "Footpaths",
  public_spaces: "Public spaces",
  other: "Other",
};

const categoryColors = {
  roads: "#f59e0b",
  sanitation: "#14b8a6",
  water: "#38bdf8",
  drainage: "#818cf8",
  streetlights: "#f97316",
  footpaths: "#a78bfa",
  public_spaces: "#34d399",
  other: "#94a3b8",
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxProofSize = 5 * 1024 * 1024;

function formatDate(value, options = {}) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: options.year ? "numeric" : undefined,
  });
}

function getImageExtension(file) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];
}

function MetricCard({ label, value, helper, icon: Icon, tone, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#14271F] p-5 text-white shadow-[0_12px_36px_rgba(5,20,13,0.12)] transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className={`absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-[0.10] blur-2xl ${tone}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A5B7AB]">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-2 text-xs text-[#A5B7AB]">{helper}</p>
        </div>
        <div className={`rounded-xl border border-white/10 bg-white/[0.06] p-3 ${tone.replace("bg-", "text-")}`}>
          <Icon size={19} />
        </div>
      </div>
      {trend && (
        <div className="relative mt-5 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-[#B9D9C3]">
          <TrendingUp size={14} />
          {trend}
        </div>
      )}
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-[#E3E9E1] bg-white shadow-[0_5px_24px_rgba(26,48,35,0.035)] ${className}`}>
      {children}
    </section>
  );
}

function PanelHeader({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#799080]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1.5 text-base font-semibold tracking-tight text-[#20392B]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function TrendChart({ data }) {
  const width = 640;
  const height = 230;
  const padX = 30;
  const padTop = 20;
  const padBottom = 32;
  const plotHeight = height - padTop - padBottom;
  const plotWidth = width - padX * 2;
  const max = Math.max(4, ...data.map((point) => point.count));
  const points = data.map((point, index) => ({
    ...point,
    x: padX + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth),
    y: padTop + plotHeight - (point.count / max) * plotHeight,
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1]?.x ?? width - padX} ${height - padBottom} L ${points[0]?.x ?? padX} ${height - padBottom} Z`;

  return (
    <div className="px-3 pb-3 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-4 px-2 text-xs text-[#75877A]">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#2D7653]" />Reports received</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#B7D8C1]" />Daily volume</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Complaint submissions over the last seven days">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2D7653" stopOpacity=".24" />
            <stop offset="100%" stopColor="#2D7653" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = padTop + (plotHeight / 3) * tick;
          return (
            <g key={tick}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#E8EEE8" strokeDasharray="4 5" />
              <text x={padX - 9} y={y + 4} textAnchor="end" fontSize="10" fill="#9AA89D">
                {Math.round(max - (max / 3) * tick)}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke="#2D7653" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="7" fill="#2D7653" fillOpacity=".12" />
            <circle cx={point.x} cy={point.y} r="3.5" fill="#2D7653" stroke="white" strokeWidth="1.5" />
            <text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#829286">{point.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function StatusDonut({ counts, total }) {
  const parts = [
    { key: "resolved", label: "Resolved", color: "#2D7653", value: counts.resolved },
    { key: "in_progress", label: "In progress", color: "#6CA8C8", value: counts.in_progress },
    { key: "submitted", label: "Submitted", color: "#E9B85C", value: counts.submitted },
  ];
  let running = 0;
  const segments = parts.map((part) => {
    const start = total ? (running / total) * 100 : 0;
    running += part.value;
    const end = total ? (running / total) * 100 : 0;
    return `${part.color} ${start}% ${end}%`;
  });
  const background = total
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#E7ECE7 0% 100%)";

  return (
    <div className="flex flex-col items-center gap-6 px-5 pb-6 sm:flex-row sm:items-center sm:justify-around">
      <div className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full" style={{ background }}>
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-inner">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-[#20392B]">{total}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#819084]">Total reports</p>
          </div>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-4">
        {parts.map((part) => (
          <div key={part.key} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: part.color }} />
              <span className="text-sm text-[#65776A]">{part.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums text-[#20392B]">{part.value}</span>
              <span className="ml-2 text-xs text-[#91A095]">{total ? `${Math.round((part.value / total) * 100)}%` : "0%"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ data }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  if (data.length === 0) {
    return <p className="px-6 pb-6 text-sm text-[#839187]">No category data yet.</p>;
  }

  return (
    <div className="space-y-4 px-5 pb-6 sm:px-6">
      {data.map((item) => (
        <div key={item.key}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm text-[#53695A]">{item.label}</span>
            <span className="text-xs font-semibold tabular-nums text-[#20392B]">{item.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2ED]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.count / max) * 100}%`,
                backgroundColor: categoryColors[item.key] ?? "#2D7653",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [nextStatus, setNextStatus] = useState("in_progress");
  const [note, setNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState(false);
  const [period, setPeriod] = useState("7d");

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("complaints")
        .select(
          "id, title, category, description, address, status, created_at, updated_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (queryError) throw queryError;
      setComplaints(data ?? []);
    } catch (err) {
      setError(err.message || "Unable to load complaints.");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const counts = useMemo(() => ({
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }), [complaints]);

  const trendData = useMemo(() => {
    const days = period === "30d" ? 30 : 7;
    const today = new Date();
    const rows = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = complaints.filter((complaint) => {
        const created = new Date(complaint.created_at);
        return created >= date && created < nextDate;
      }).length;

      rows.push({
        label: period === "30d"
          ? (date.getDate() % 5 === 0 || offset === 0 ? `${date.getDate()}` : "")
          : date.toLocaleDateString("en-IN", { weekday: "short" }),
        count,
        date,
      });
    }

    if (period === "30d") {
      // Keep the 30-day chart legible by sampling every third day.
      return rows.map((row, index) => ({
        ...row,
        label: index % 3 === 0 || index === rows.length - 1 ? row.label || `${row.date.getDate()}` : "",
      }));
    }

    return rows;
  }, [complaints, period]);

  const categoryData = useMemo(() => {
    const countsByCategory = new Map();

    for (const complaint of complaints) {
      const key = complaint.category || "other";
      countsByCategory.set(key, (countsByCategory.get(key) || 0) + 1);
    }

    return [...countsByCategory.entries()]
      .map(([key, count]) => ({
        key,
        count,
        label: categoryLabels[key] ?? key,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [complaints]);

  const resolutionRate = counts.total
    ? Math.round((counts.resolved / counts.total) * 100)
    : 0;

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      filterStatus === "all" || complaint.status === filterStatus;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [complaint.title, complaint.description, complaint.address]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  function openEditor(complaint) {
    setSelected(complaint);
    setNextStatus(complaint.status);
    setNote("");
    setProofFile(null);
    setActionMessage("");
    setActionError(false);
  }

  function closeEditor() {
    if (saving) return;
    setSelected(null);
    setNote("");
    setProofFile(null);
    setActionMessage("");
    setActionError(false);
  }

  async function saveUpdate(event) {
    event.preventDefault();
    if (!selected || saving) return;

    const trimmedNote = note.trim();

    if (trimmedNote.length < 3) {
      setActionError(true);
      setActionMessage("Please add an official update note (at least 3 characters).");
      return;
    }

    if (nextStatus === "resolved" && !proofFile) {
      setActionError(true);
      setActionMessage("Please upload a resolution proof photo before resolving this complaint.");
      return;
    }

    if (proofFile && !allowedImageTypes.includes(proofFile.type)) {
      setActionError(true);
      setActionMessage("Upload a JPG, PNG, or WebP image.");
      return;
    }

    if (proofFile && proofFile.size > maxProofSize) {
      setActionError(true);
      setActionMessage("The image must be 5 MB or smaller.");
      return;
    }

    setSaving(true);
    setActionMessage("");
    setActionError(false);
    let uploadedProofPath = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Your session could not be verified. Please sign in again.");
      }

      const user = authData.user;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        throw new Error("Admin permission could not be verified.");
      }

      if (proofFile) {
        const extension = getImageExtension(proofFile);
        if (!extension) throw new Error("That image format is not supported.");

        uploadedProofPath = `${user.id}/${selected.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("resolution-proof")
          .upload(uploadedProofPath, proofFile, {
            contentType: proofFile.type,
            upsert: false,
          });

        if (uploadError) throw new Error(`Proof upload failed: ${uploadError.message}`);
      }

      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);

      if (updateError) {
        if (uploadedProofPath) {
          await supabase.storage.from("resolution-proof").remove([uploadedProofPath]);
        }
        throw new Error(`Status update failed: ${updateError.message}`);
      }

      const { error: historyError } = await supabase
        .from("complaint_updates")
        .insert({
          complaint_id: selected.id,
          actor_id: user.id,
          status: nextStatus,
          note: trimmedNote,
          proof_path: uploadedProofPath,
        });

      if (historyError) {
        await loadComplaints();
        throw new Error(
          `The status changed, but the history entry could not be saved: ${historyError.message}. Please inspect the complaint before retrying.`
        );
      }

      await loadComplaints();
      setSelected(null);
      setNote("");
      setProofFile(null);
      setActionMessage("Complaint update published successfully!");
      setActionError(false);
    } catch (err) {
      setActionError(true);
      setActionMessage(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function exportComplaints() {
    const headers = ["Title", "Category", "Status", "Address", "Created at"];
    const rows = filteredComplaints.map((complaint) => [
      complaint.title,
      categoryLabels[complaint.category] ?? complaint.category,
      statusLabels[complaint.status] ?? complaint.status,
      complaint.address,
      complaint.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "civictrack-complaints.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    {
      label: "Total complaints",
      value: counts.total,
      helper: "Reports in the latest 200 records",
      icon: FileText,
      tone: "bg-emerald-300",
      trend: "Community-wide visibility",
    },
    {
      label: "Awaiting action",
      value: counts.submitted,
      helper: "Needs an initial response",
      icon: AlertCircle,
      tone: "bg-amber-300",
      trend: "Prioritise oldest first",
    },
    {
      label: "In progress",
      value: counts.in_progress,
      helper: "Currently being addressed",
      icon: Activity,
      tone: "bg-sky-300",
      trend: "Keep status notes current",
    },
    {
      label: "Resolved",
      value: counts.resolved,
      helper: `${resolutionRate}% of loaded reports`,
      icon: CheckCircle2,
      tone: "bg-teal-300",
      trend: "Close the loop with proof",
    },
  ];

  const latestComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F3F5EF] text-[#20392B]">
      <Navbar />

      <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[28px] bg-[#10251B] px-5 py-7 text-white shadow-[0_20px_60px_rgba(15,37,26,0.18)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-1 top-8 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-16 top-16 h-28 w-28 rounded-full bg-[#6DAA7E]/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8EBB9A]/25 bg-[#8EBB9A]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8DCC2]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9BE0AE]" />
                Civic operations / live overview
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                The city, <span className="font-serif italic text-[#A6D5B2]">in focus.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#B1C4B6] sm:text-base">
                One command centre for citizen reports, response progress, and visible accountability.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#B1C4B6]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2">
                  <CalendarDays size={14} />
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2">
                  <ShieldCheck size={14} />
                  Admin workspace
                </span>
              </div>
            </div>

            <div className="relative flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportComplaints}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.13]"
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                type="button"
                onClick={loadComplaints}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B6D9BE] px-4 py-3 text-sm font-semibold text-[#143321] transition hover:bg-[#C8E6CE] disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh data
              </button>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#91A99A]">Resolution rate</p>
              <p className="mt-1.5 text-2xl font-semibold">{resolutionRate}%</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#91A99A]">Open workload</p>
              <p className="mt-1.5 text-2xl font-semibold">{counts.submitted + counts.in_progress}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#91A99A]">Top issue category</p>
              <p className="mt-1.5 truncate text-2xl font-semibold">{categoryData[0]?.label ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#91A99A]">Reporting pulse</p>
              <p className="mt-1.5 inline-flex items-center gap-2 text-2xl font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#9BE0AE]" />
                {loading ? "Syncing" : "Synced"}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Couldn't load dashboard data</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
          <Panel>
            <PanelHeader
              eyebrow="Intake analytics"
              title="Complaint activity"
              action={
                <div className="flex items-center gap-1 rounded-xl bg-[#F1F5F0] p-1">
                  {[["7d", "7 days"], ["30d", "30 days"]].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPeriod(value)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        period === value ? "bg-white text-[#245B43] shadow-sm" : "text-[#809084] hover:text-[#20392B]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="mx-5 border-t border-[#EEF1EC]" />
            {loading ? (
              <div className="grid h-64 place-items-center text-sm text-[#839187]">Building activity chart…</div>
            ) : (
              <TrendChart data={trendData} />
            )}
            <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F8F3] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[#64786A]">
                <Sparkles size={15} className="text-[#2D7653]" />
                Live summary from loaded complaint records
              </div>
              <div className="text-xs font-semibold text-[#245B43]">
                {trendData.reduce((sum, point) => sum + point.count, 0)} new in selected period
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Resolution intelligence" title="Status distribution" />
            <div className="mx-5 border-t border-[#EEF1EC]" />
            <div className="pt-5">
              <StatusDonut counts={counts} total={counts.total} />
            </div>
            <div className="mx-5 mb-5 rounded-xl border border-[#E6EEE5] bg-[#F7FAF6] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#718376]">Resolved so far</p>
                  <p className="mt-1 text-lg font-semibold text-[#20392B]">{resolutionRate}%</p>
                </div>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-[#E3EAE2]">
                  <div className="h-full rounded-full bg-[#2D7653]" style={{ width: `${resolutionRate}%` }} />
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel>
            <PanelHeader
              eyebrow="Where attention goes"
              title="Top issue categories"
              action={<span className="rounded-full bg-[#F1F5F0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#66806D]">Top 6</span>}
            />
            <div className="mx-5 border-t border-[#EEF1EC]" />
            <div className="pt-5">
              <CategoryBars data={categoryData} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="Latest incoming reports"
              title="Recent activity"
              action={
                <Link to="/complaints" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D7653] hover:underline">
                  Community feed <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="mx-5 border-t border-[#EEF1EC]" />
            <div className="divide-y divide-[#EEF1EC] px-5">
              {latestComplaints.length === 0 ? (
                <p className="py-8 text-sm text-[#839187]">No complaints have been reported yet.</p>
              ) : latestComplaints.map((complaint, index) => (
                <div key={complaint.id} className="flex items-start gap-3 py-4">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    complaint.status === "resolved" ? "bg-emerald-50 text-emerald-700" :
                    complaint.status === "in_progress" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {complaint.status === "resolved" ? <Check size={16} /> : <FileText size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/complaints/${complaint.id}`}
                      state={{ from: "/admin" }}
                      className="block truncate text-sm font-semibold text-[#20392B] hover:text-[#2D7653]"
                    >
                      {complaint.title}
                    </Link>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#849287]">
                      <MapPin size={12} /> {complaint.address || "Location not provided"}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[#98A59B]">
                      {categoryLabels[complaint.category] ?? complaint.category} · {formatDate(complaint.created_at)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[complaint.status] ?? "bg-gray-50 text-gray-700 ring-gray-200"}`}>
                    {statusLabels[complaint.status] ?? complaint.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5">
          <Panel>
            <div className="flex flex-col gap-4 border-b border-[#EEF1EC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#799080]">Operations queue</p>
                <h2 className="mt-1.5 text-base font-semibold text-[#20392B]">Manage community complaints</h2>
                <p className="mt-1 text-xs text-[#819084]">Search, filter, inspect, and publish an official update.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#839187]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search reports..."
                    aria-label="Search complaints"
                    className="w-full rounded-xl border border-[#DCE5DA] bg-[#FBFCFA] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#2D7653] sm:w-56"
                  />
                </div>
                <div className="relative">
                  <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#839187]" />
                  <select
                    value={filterStatus}
                    onChange={(event) => setFilterStatus(event.target.value)}
                    aria-label="Filter complaints by status"
                    className="w-full appearance-none rounded-xl border border-[#DCE5DA] bg-[#FBFCFA] py-2.5 pl-8 pr-8 text-sm outline-none focus:border-[#2D7653] sm:w-40"
                  >
                    <option value="all">All statuses</option>
                    {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#839187]" />
                </div>
                <button
                  type="button"
                  onClick={exportComplaints}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5DA] px-3 py-2.5 text-xs font-semibold text-[#526B5A] transition hover:bg-[#F4F7F2]"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAF7] px-5 py-3 text-xs text-[#829186] sm:px-6">
              <span>Showing <strong className="text-[#385541]">{filteredComplaints.length}</strong> of {complaints.length} loaded reports</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#64A77B]" /> Sorted newest first</span>
            </div>

            {loading ? (
              <div className="grid h-40 place-items-center text-sm text-[#839187]">Loading operations queue…</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#F1F5F0] text-[#769080]"><Search size={20} /></div>
                <p className="mt-3 text-sm font-semibold text-[#20392B]">No matching complaints</p>
                <p className="mt-1 text-xs text-[#839187]">Try another search term or status filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EEF1EC]">
                {filteredComplaints.map((complaint, index) => (
                  <article key={complaint.id} className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-[#FAFCF9] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E5ECE3] bg-[#F5F8F3] text-xs font-bold text-[#6B8471]">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[complaint.status] ?? "bg-gray-50 text-gray-700 ring-gray-200"}`}>
                            {statusLabels[complaint.status] ?? complaint.status}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#87968A]">
                            {categoryLabels[complaint.category] ?? complaint.category}
                          </span>
                        </div>
                        <h3 className="mt-2 truncate text-sm font-semibold text-[#20392B]">{complaint.title}</h3>
                        <p className="mt-1 line-clamp-1 text-xs text-[#7C8D80]">{complaint.description}</p>
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#98A59B]">
                          <MapPin size={11} /> {complaint.address || "Location not provided"} <span className="mx-1">·</span> {formatDate(complaint.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 pl-[52px] sm:pl-0">
                      <Link
                        to={`/complaints/${complaint.id}`}
                        state={{ from: "/admin" }}
                        className="text-xs font-semibold text-[#52725B] hover:text-[#245B43] hover:underline"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditor(complaint)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#245B43] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173F2D]"
                      >
                        Manage <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#07160D]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) closeEditor();
          }}
        >
          <form
            onSubmit={saveUpdate}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-white/60 bg-[#FCFDFB] p-6 shadow-2xl sm:rounded-[28px] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF2E9] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D7653]">
                  <ShieldCheck size={13} /> Admin action
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#20392B]">{selected.title}</h2>
                <p className="mt-1.5 text-sm text-[#7A8C7E]">{selected.address}</p>
              </div>
              <button type="button" disabled={saving} onClick={closeEditor} aria-label="Close dialog" className="rounded-xl border border-[#E0E8DF] p-2 text-[#6C8071] hover:bg-[#F0F5EF] disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E2EAE0] bg-white p-4">
              <label htmlFor="complaint-status" className="block text-xs font-bold uppercase tracking-[0.13em] text-[#607565]">Complaint status</label>
              <select
                id="complaint-status"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#DCE5DA] bg-[#FBFCFA] px-3 py-3 text-sm outline-none focus:border-[#2D7653]"
              >
                {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>

              <label htmlFor="official-note" className="mt-5 block text-xs font-bold uppercase tracking-[0.13em] text-[#607565]">Official update note</label>
              <textarea
                id="official-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                required
                minLength={3}
                maxLength={1000}
                rows={4}
                placeholder="What action was taken? What should residents know?"
                className="mt-2 w-full resize-y rounded-xl border border-[#DCE5DA] bg-[#FBFCFA] p-3 text-sm outline-none focus:border-[#2D7653]"
              />

              <div className="mt-5">
                <label htmlFor="resolution-proof" className="block text-xs font-bold uppercase tracking-[0.13em] text-[#607565]">
                  Resolution proof photo {nextStatus === "resolved" && <span className="text-red-600">*</span>}
                </label>
                <p className="mt-1.5 text-xs leading-5 text-[#839187]">JPG, PNG or WebP · up to 5 MB. Required when marking a complaint resolved.</p>
                <input
                  id="resolution-proof"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setProofFile(event.target.files?.[0] ?? null);
                    setActionMessage("");
                    setActionError(false);
                  }}
                  className="mt-3 block w-full rounded-xl border border-dashed border-[#C8D8C9] bg-[#F5F9F4] p-3 text-sm text-[#526B5A] file:mr-3 file:rounded-lg file:border-0 file:bg-[#DDEBDD] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#245B43]"
                />
                {proofFile && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[#EAF3E9] px-3 py-2">
                    <p className="min-w-0 truncate text-xs font-medium text-[#2D7653]">{proofFile.name}</p>
                    <button type="button" onClick={() => setProofFile(null)} className="shrink-0 text-xs font-semibold text-red-700 hover:underline">Remove</button>
                  </div>
                )}
              </div>
            </div>

            {actionMessage && (
              <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${actionError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
                {actionMessage}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button type="button" disabled={saving} onClick={closeEditor} className="flex-1 rounded-xl border border-[#DCE5DA] bg-white px-4 py-3 text-sm font-semibold text-[#526B5A] hover:bg-[#F5F8F3] disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#245B43] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#245B43]/15 hover:bg-[#173F2D] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Publishing update…" : "Publish update"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
