
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E4E5DC] bg-[#F7F6F0]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link to="/" className="flex w-fit items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#245B43] text-white">
            <ShieldCheck size={17} strokeWidth={1.8} />
          </span>
          <span className="font-bold tracking-tight text-[#21382B]">
            CivicTrack
          </span>
        </Link>

        <p className="max-w-md text-sm leading-6 text-[#687468]">
          A shared place to report local problems and follow their progress.
        </p>

        <p className="text-xs text-[#7C8578]">
          CivicTrack · Public Greivence System
        </p>
      </div>
    </footer>
  );
}
