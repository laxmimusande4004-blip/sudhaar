
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import RecentReports from "../components/home/RecentReports";
import HowItWorks from "../components/home/HowItWorks";
import IndiaMap from "../components/IndiaMap";
import SectionHeading from "../components/ui/SectionHeading";

function MapSection() {
  return (
    <section
      id="map"
      className="scroll-mt-24 border-b border-[#E4E5DC] bg-[#F7F6F0]"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <SectionHeading
          eyebrow="Explore reports"
          title="Find issues across India"
          description="Select a marker to inspect an example complaint and its current status."
        />

        <div className="mt-7">
          <IndiaMap />
        </div>

        <p className="mt-3 text-xs leading-5 text-[#7C8578]">
          Markers currently use illustrative data, not live public reports.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#21382B]">
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
