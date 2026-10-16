import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import RecentReports from "../components/home/RecentReports";
import HowItWorks from "../components/home/HowItWorks";
import IndiaMap from "../components/IndiaMap";
import SectionHeading from "../components/ui/SectionHeading";
import { ArrowDown, MapPinned } from "lucide-react";

function MapSection() {
  return (
    <section id="map" className="scroll-mt-24 bg-[#F2F1E9]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-8 flex flex-col gap-5 border-b border-[#D8DED3] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="The city, in context"
            title="Every report has a place."
            description="Explore reported issues, understand what's happening nearby, and open a report to follow its progress."
          />
          <a href="#reports" className="inline-flex w-fit items-center gap-2 pb-1 text-sm font-semibold text-[#245B43] transition hover:gap-3">
            Browse recent reports <ArrowDown size={16} />
          </a>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-[#D8DED3] bg-white p-2 shadow-[0_24px_70px_rgba(27,53,37,0.09)] sm:p-3">
          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8EFE5] text-[#245B43]"><MapPinned size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-[#21382B]">Community issue map</p>
                <p className="text-xs text-[#778477]">Explore reports by location</p>
              </div>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-[#DDE6D9] px-3 py-1.5 text-[11px] font-semibold text-[#55715B] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4C9668]" /> Live report data
            </span>
          </div>
          <IndiaMap />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F6F0] text-[#21382B]">
      <Navbar />
      <main>
        <Hero />
        <MapSection />
        <RecentReports />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
