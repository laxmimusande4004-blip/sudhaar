import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  MapPin,
  Menu,
  Navigation,
  Radio,
  ShieldCheck,
  Sparkles,
  Trees,
  TrafficCone,
  Waves,
  Zap,
} from "lucide-react";

const issues = [
  {
    id: "road",
    number: "CT-0248",
    title: "Pothole on main road",
    category: "Roads & streets",
    location: "HSR Layout, Bengaluru",
    status: "In progress",
    statusTone: "amber",
    age: "Updated 18 min ago",
    icon: TrafficCone,
    x: 57,
    y: 42,
    color: "#F4B860",
    description: "A damaged road surface reported by a nearby resident.",
  },
  {
    id: "water",
    number: "CT-0247",
    title: "Water leakage",
    category: "Water supply",
    location: "Sector 2, Bengaluru",
    status: "Submitted",
    statusTone: "blue",
    age: "Reported 42 min ago",
    icon: Waves,
    x: 31,
    y: 64,
    color: "#79C7E8",
    description: "Water is pooling near the pavement after a pipe leak.",
  },
  {
    id: "light",
    number: "CT-0246",
    title: "Streetlight not working",
    category: "Street lighting",
    location: "27th Main, Bengaluru",
    status: "Resolved",
    statusTone: "green",
    age: "Resolved yesterday",
    icon: Zap,
    x: 76,
    y: 25,
    color: "#A9D7A4",
    description: "A previously reported streetlight issue has been marked resolved.",
  },
];

const statusStyles = {
  amber: "bg-[#FFF0D2] text-[#8A5A12] ring-[#F2D9A8]",
  blue: "bg-[#DDF2FC] text-[#245F7B] ring-[#B9E2F4]",
  green: "bg-[#DDF2DE] text-[#286441] ring-[#BCE0C0]",
};

function MapArtwork({ activeIssue, onSelect }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E8EEE3]">
      {/* Neighborhood blocks */}
      <svg
        viewBox="0 0 620 570"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-label="Illustrated neighborhood map with selectable civic issue markers"
        role="img"
      >
        <defs>
          <pattern id="map-grain" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".6" fill="#9DAF9B" opacity=".24" />
          </pattern>
          <linearGradient id="map-wash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0F2E9" />
            <stop offset="100%" stopColor="#DCE8D9" />
          </linearGradient>
        </defs>
        <rect width="620" height="570" fill="url(#map-wash)" />
        <rect width="620" height="570" fill="url(#map-grain)" />
        <g fill="#D1E0CA" opacity=".9">
          <path d="M-30 20 L105 0 150 90 55 140 -20 110Z" />
          <path d="M180 10 L300 -10 326 68 238 100Z" />
          <path d="M410 -10 L540 10 520 95 420 75Z" />
          <path d="M500 130 L650 115 640 225 560 245 490 205Z" />
          <path d="M-20 240 L85 205 135 280 75 345 -20 320Z" />
          <path d="M180 190 L270 165 315 235 260 285 175 260Z" />
          <path d="M370 290 L465 255 515 325 460 390 360 365Z" />
          <path d="M70 410 L165 385 205 465 130 520 40 490Z" />
          <path d="M260 440 L340 405 390 475 350 560 245 545Z" />
          <path d="M480 445 L600 420 640 510 540 590 460 530Z" />
        </g>
        <g fill="#C4D8BC" opacity=".85">
          <path d="M375 0 L412 0 450 100 425 140 395 95Z" />
          <path d="M-10 370 L30 355 82 405 55 438 0 430Z" />
          <path d="M545 270 L590 255 620 300 600 340 560 330Z" />
        </g>
        {/* Road casing */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-30 160 C80 170 120 110 215 145 S360 225 455 165 560 105 650 130" stroke="#F9FAF5" strokeWidth="31" />
          <path d="M-30 160 C80 170 120 110 215 145 S360 225 455 165 560 105 650 130" stroke="#C6D1C1" strokeWidth="2" />
          <path d="M90 -20 C120 70 150 135 135 225 S155 360 230 430 270 520 285 600" stroke="#FAFBF7" strokeWidth="26" />
          <path d="M90 -20 C120 70 150 135 135 225 S155 360 230 430 270 520 285 600" stroke="#C6D1C1" strokeWidth="2" />
          <path d="M320 -20 C300 80 355 120 340 205 S300 325 380 390 450 470 430 600" stroke="#FAFBF7" strokeWidth="35" />
          <path d="M320 -20 C300 80 355 120 340 205 S300 325 380 390 450 470 430 600" stroke="#C6D1C1" strokeWidth="2" />
          <path d="M-20 360 C90 320 155 350 240 330 S380 280 470 320 570 390 650 355" stroke="#FAFBF7" strokeWidth="28" />
          <path d="M-20 360 C90 320 155 350 240 330 S380 280 470 320 570 390 650 355" stroke="#C6D1C1" strokeWidth="2" />
          <path d="M-20 510 C90 475 145 490 225 510 S380 550 470 495 575 455 650 480" stroke="#FAFBF7" strokeWidth="22" />
          <path d="M-20 510 C90 475 145 490 225 510 S380 550 470 495 575 455 650 480" stroke="#C6D1C1" strokeWidth="2" />
          <path d="M505 -10 C475 90 500 150 530 215 S515 340 545 405 570 500 610 580" stroke="#FAFBF7" strokeWidth="20" />
          <path d="M505 -10 C475 90 500 150 530 215 S515 340 545 405 570 500 610 580" stroke="#C6D1C1" strokeWidth="2" />
        </g>
        {/* Small lanes */}
        <g fill="none" stroke="#FAFBF7" strokeWidth="12" strokeLinecap="round">
          <path d="M20 65 L165 210 L245 200 L305 255" />
          <path d="M205 20 L190 110 L255 165" />
          <path d="M400 65 L390 140 L455 205 L470 270" />
          <path d="M70 275 L175 300 L210 365" />
          <path d="M285 390 L340 355 L430 380 L485 420" />
          <path d="M330 470 L390 450 L420 430" />
          <path d="M120 390 L150 450 L215 475" />
        </g>
        <g fill="#6D8B67" opacity=".65" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="700" letterSpacing="1.5">
          <text x="25" y="220" transform="rotate(-13 25 220)">HSR LAYOUT</text>
          <text x="390" y="245" transform="rotate(17 390 245)">SECTOR 2</text>
          <text x="420" y="455" transform="rotate(-11 420 455)">27TH MAIN</text>
        </g>
        <g fill="#B6CDAE" stroke="#FAFBF7" strokeWidth="3">
          <circle cx="225" cy="95" r="20" />
          <circle cx="465" cy="225" r="14" />
          <circle cx="100" cy="435" r="22" />
          <circle cx="555" cy="365" r="18" />
        </g>
        <g fill="#5F8A60" opacity=".8">
          <circle cx="225" cy="95" r="5" />
          <circle cx="465" cy="225" r="4" />
          <circle cx="100" cy="435" r="6" />
          <circle cx="555" cy="365" r="5" />
        </g>
      </svg>

      {/* Interactive issue pins */}
      {issues.map((issue, index) => {
        const selected = activeIssue.id === issue.id;
        const Icon = issue.icon;
        return (
          <button
            key={issue.id}
            type="button"
            onClick={() => onSelect(issue)}
            aria-label={`Show ${issue.title}`}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/90 ${
              selected ? "scale-110" : "hover:scale-110"
            }`}
            style={{ left: `${issue.x}%`, top: `${issue.y}%`, animationDelay: `${index * 180}ms` }}
          >
            {selected && <span className="absolute inset-0 animate-ping rounded-full bg-[#245B43]/30" />}
            <span
              className={`relative grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-white shadow-[0_7px_18px_rgba(29,58,37,.22)] transition-all duration-300 ${
                selected ? "bg-[#245B43] text-white" : "bg-white text-[#245B43]"
              }`}
            >
              <Icon size={18} strokeWidth={2.3} />
            </span>
            {selected && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#E8B65D]" />
            )}
          </button>
        );
      })}

      <div className="absolute bottom-4 left-4 rounded-xl border border-white/70 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-md sm:bottom-5 sm:left-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#49644D]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4E9B65] opacity-50" />
            <span className="relative h-2 w-2 rounded-full bg-[#4E9B65]" />
          </span>
          Community issue map
        </div>
        <p className="mt-1 text-xs text-[#637565]">Tap a pin to inspect a report</p>
      </div>
      <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/70 bg-white/85 text-[#35563C] shadow-sm backdrop-blur-md sm:right-5 sm:top-5">
        <Navigation size={16} />
      </div>
    </div>
  );
}

export default function Hero() {
  const [activeIssue, setActiveIssue] = useState(issues[0]);
  const [view, setView] = useState("map");

  return (
    <section className="relative isolate overflow-hidden bg-[#F7F6F0] text-[#183625]">
      <style>{`
        @keyframes ct-enter { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ct-pin-in { 0% { opacity: 0; transform: translate(-50%, -35%) scale(.65); } 70% { transform: translate(-50%, -55%) scale(1.08); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes ct-dash { to { stroke-dashoffset: -28; } }
        .ct-enter { animation: ct-enter .7s cubic-bezier(.2,.75,.25,1) both; }
        .ct-enter-2 { animation: ct-enter .7s .12s cubic-bezier(.2,.75,.25,1) both; }
        .ct-enter-3 { animation: ct-enter .7s .24s cubic-bezier(.2,.75,.25,1) both; }
        .ct-map-line { animation: ct-dash 12s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ct-enter, .ct-enter-2, .ct-enter-3, .ct-map-line { animation: none !important; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full border border-[#DCE4D7]" />
        <div className="absolute -right-20 -top-28 h-[25rem] w-[25rem] rounded-full border border-[#E4E9E0]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#DDE8D8]/40 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-14 lg:px-14 lg:pb-24 lg:pt-20">
        <div className="relative z-10">
          <div className="ct-enter inline-flex items-center gap-2 rounded-full border border-[#D5E0D2] bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#45664B] shadow-sm sm:text-[11px]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E5EFE2]">
              <Radio size={11} className="text-[#2D7044]" />
            </span>
            Civic life, made visible
          </div>

          <h1 className="ct-enter-2 mt-7 max-w-2xl text-[3.45rem] font-semibold leading-[.98] tracking-[-.07em] sm:text-6xl md:text-7xl xl:text-[5.6rem]">
            Your city.
            <span className="block text-[#5E8B61]">Your say.</span>
            <span className="block">Real change.</span>
          </h1>

          <p className="ct-enter-2 mt-6 max-w-lg text-base leading-7 text-[#5D6D5E] sm:text-lg sm:leading-8">
            Spot something broken? Put it on the map. Follow the updates. See what happens next.
          </p>

          <div className="ct-enter-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/report"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#245B43] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(36,91,67,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#194832] hover:shadow-[0_14px_30px_rgba(36,91,67,.24)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B7D3B5]"
            >
              Report an issue
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/complaints"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#D1D9CE] bg-white/80 px-5 py-3.5 text-sm font-semibold text-[#294536] transition duration-200 hover:-translate-y-0.5 hover:border-[#AABDA8] hover:bg-white"
            >
              Explore reports
              <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="ct-enter-3 mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#DDE2D7] pt-5">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#657666]">
              <ShieldCheck size={15} className="text-[#39734B]" /> Public status tracking
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#657666]">
              <MapPin size={15} className="text-[#39734B]" /> Location-based reports
            </span>
          </div>

          <div className="mt-9 hidden max-w-md grid-cols-3 gap-3 border-t border-[#DDE2D7] pt-5 sm:grid">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#829080]">01 / Notice</p>
              <p className="mt-1.5 text-sm font-semibold">See the issue</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#829080]">02 / Report</p>
              <p className="mt-1.5 text-sm font-semibold">Make it visible</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#829080]">03 / Follow</p>
              <p className="mt-1.5 text-sm font-semibold">Track progress</p>
            </div>
          </div>
        </div>

        {/* Interactive product preview */}
        <div className="ct-enter-3 relative mx-auto w-full max-w-[760px] lg:ml-auto">
          <div className="absolute -inset-3 rounded-[2rem] bg-[#D9E5D4]/70 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.6rem] border border-[#D5DED1] bg-white shadow-[0_28px_90px_rgba(25,58,36,.16)] sm:rounded-[1.9rem]">
            <div className="flex items-center justify-between gap-3 border-b border-[#E6EAE2] bg-white px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EAF1E6] text-[#245B43]">
                  <Trees size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold tracking-tight text-[#183625]">Neighborhood pulse</p>
                  <p className="mt-0.5 text-[11px] text-[#839080]">Bengaluru · interactive preview</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center rounded-lg bg-[#F0F3ED] p-1">
                <button
                  type="button"
                  onClick={() => setView("map")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "map" ? "bg-white text-[#245B43] shadow-sm" : "text-[#7A8879] hover:text-[#245B43]"}`}
                >
                  Map
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === "list" ? "bg-white text-[#245B43] shadow-sm" : "text-[#7A8879] hover:text-[#245B43]"}`}
                >
                  Reports
                </button>
              </div>
            </div>

            {view === "map" ? (
              <div className="relative h-[360px] overflow-hidden sm:h-[450px]">
                <MapArtwork activeIssue={activeIssue} onSelect={setActiveIssue} />
                <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#557057] shadow-sm backdrop-blur sm:left-5 sm:top-5">
                  <CircleDot size={13} className="text-[#4D8E59]" />
                  Select a report
                </div>
                <div key={activeIssue.id} className="absolute bottom-4 right-4 z-20 w-[min(290px,calc(100%-2rem))] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_12px_35px_rgba(23,48,30,.18)] backdrop-blur-md sm:bottom-5 sm:right-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${activeIssue.color}35`, color: "#245B43" }}>
                      <activeIssue.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${statusStyles[activeIssue.statusTone]}`}>
                          {activeIssue.status}
                        </span>
                        <span className="text-[9px] font-semibold tracking-wide text-[#98A193]">{activeIssue.number}</span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold leading-snug text-[#203B29]">{activeIssue.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#718071]">
                        <MapPin size={11} /> {activeIssue.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E8ECE5] pt-3">
                    <span className="flex items-center gap-1.5 text-[10px] text-[#829080]"><Clock3 size={12} /> {activeIssue.age}</span>
                    <Link to="/complaints" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#245B43] hover:underline">
                      View reports <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[360px] bg-[#F8F9F5] p-4 sm:min-h-[450px] sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[.13em] text-[#718071]">Nearby reports</p>
                  <span className="rounded-full bg-[#E8F0E4] px-2.5 py-1 text-[10px] font-semibold text-[#45664B]">Preview data</span>
                </div>
                <div className="space-y-2.5">
                  {issues.map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <button
                        type="button"
                        key={issue.id}
                        onClick={() => { setActiveIssue(issue); setView("map"); }}
                        className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${activeIssue.id === issue.id ? "border-[#8FB193] shadow-sm" : "border-[#E4E9E0] hover:border-[#C3D4BE]"}`}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${issue.color}35`, color: "#245B43" }}>
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#25412E]">{issue.title}</span>
                          <span className="mt-1 block truncate text-[11px] text-[#829080]">{issue.location}</span>
                        </span>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${statusStyles[issue.statusTone]}`}>{issue.status}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-[11px] text-[#8A9587]">Select a report to locate it on the map.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6EAE2] bg-[#FBFCF9] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-[#667766]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#E4EEE0] text-[#39734B]"><Check size={12} /></span>
                Every report has a place in the process.
              </div>
              <Link to="/complaints" className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#245B43]">
                Open community board <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="absolute -left-3 top-[30%] hidden -translate-x-1/2 rounded-xl border border-[#D8E3D4] bg-white px-3.5 py-3 shadow-lg sm:block xl:-left-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#E8F0E4] text-[#39734B]"><Sparkles size={14} /></span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8A9688]">Built around</p>
                <p className="text-xs font-bold text-[#294536]">Local action</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDE2D7] bg-white/45">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-14">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#829080]">From everyday frustration to visible action</p>
          <a href="#map" className="group inline-flex items-center gap-2 text-xs font-semibold text-[#45664B] transition hover:text-[#245B43]">
            Explore the issue map <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
