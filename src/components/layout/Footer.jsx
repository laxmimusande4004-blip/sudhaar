
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#E4E5DC] bg-[#F7F6F0]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link to="/" aria-label="Sudhaar home">
          <img
            src="/logo.png"
            alt="Sudhaar"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <p className="max-w-md text-sm leading-6 text-[#687468]">
          A shared place to report local problems and follow their progress.
        </p>

        <p className="text-xs text-[#7C8578]">
          Sudhaar · Public Greivence System
        </p>
      </div>
    </footer>
  );
}
