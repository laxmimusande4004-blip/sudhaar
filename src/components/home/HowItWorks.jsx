import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, MapPin, MessagesSquare } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Put it on the map",
    description: "Choose a category, describe the issue, and add a location so your community can understand where help is needed.",
    icon: MapPin,
    note: "Report with context",
  },
  {
    number: "02",
    title: "Follow the record",
    description: "Check the complaint status and read official updates as actions and progress are recorded.",
    icon: MessagesSquare,
    note: "Progress stays visible",
  },
  {
    number: "03",
    title: "See what changed",
    description: "Review the final status, actions taken, and resolution evidence when it is provided.",
    icon: CheckCircle2,
    note: "Close the loop",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden border-t border-[#DDE2D7] bg-[#EDEFE6]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="A simple public record"
              title="From “something's wrong” to “here's what happened.”"
              description="CivicTrack gives residents a shared place to raise local issues and follow the record as it develops."
            />
            <Link to="/report" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#245B43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#194832]">
              Start a report <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="border-t border-[#C9D2C5]">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="group grid gap-4 border-b border-[#C9D2C5] py-6 sm:grid-cols-[54px_1fr_auto] sm:items-start sm:gap-5 sm:py-7">
                  <span className="pt-1 font-mono text-xs font-semibold tracking-wider text-[#77907A]">{step.number}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D3DDD0] bg-white/70 text-[#356747] transition group-hover:bg-[#245B43] group-hover:text-white"><Icon size={18} /></span>
                      <h3 className="text-lg font-semibold tracking-tight text-[#21382B] sm:text-xl">{step.title}</h3>
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#627164]">{step.description}</p>
                  </div>
                  <span className="pl-0 text-[10px] font-bold uppercase tracking-[0.13em] text-[#68806B] sm:pt-3">{step.note}</span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
