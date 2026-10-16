
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="border-b border-[#E4E5DC] bg-[#F7F6F0]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-12 lg:py-24">
        <div>
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#55715B]">
            <MapPin size={15} />
            A community issue register
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.13] tracking-[-0.04em] text-[#21382B] sm:text-5xl lg:text-6xl">
            What's broken in your neighbourhood?
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[#58675C] sm:text-lg sm:leading-8">
            Report local problems, find issues others have raised, and follow
            updates until something gets done.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#194832]"
            >
              Report a problem
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/complaints"
              className="inline-flex items-center rounded-lg border border-[#D5D9CF] px-5 py-3.5 text-sm font-medium text-[#294536] transition-colors hover:bg-[#EEEEE5]"
            >
              Browse existing reports
            </Link>
          </div>
        </div>

        <aside className="border-l-2 border-[#C9D5C6] pl-5 sm:pl-6 lg:mb-2">
          <p className="text-sm font-semibold text-[#294536]">
            How CivicTrack works
          </p>

          <ol className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="text-sm font-semibold text-[#66806A]">01</span>
              <p className="text-sm leading-6 text-[#58675C]">
                Report an issue with its location and a description.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="text-sm font-semibold text-[#66806A]">02</span>
              <p className="text-sm leading-6 text-[#58675C]">
                Follow its status and see updates from the responsible team.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="text-sm font-semibold text-[#66806A]">03</span>
              <p className="text-sm leading-6 text-[#58675C]">
                Check the resolution details when the issue is marked complete.
              </p>
            </li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
