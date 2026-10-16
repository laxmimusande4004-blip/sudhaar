
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Describe the problem",
    description:
      "Choose a category, explain what's happening, and add a photo and location.",
  },
  {
    number: "02",
    title: "Keep track of it",
    description:
      "Check the complaint status and read updates as action is recorded.",
  },
  {
    number: "03",
    title: "Review the outcome",
    description:
      "When an issue is resolved, check the action taken and any completion proof.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-b border-[#E4E5DC] bg-[#EFEEE6]"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <SectionHeading
          eyebrow="The process"
          title="A clear record, from report to resolution"
          description="Citizens should be able to see what happened after an issue was reported."
        />

        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border-t border-[#C9CFC3] pt-4"
            >
              <span className="text-xs font-semibold text-[#55715B]">
                {step.number}
              </span>

              <h3 className="mt-4 text-lg font-semibold text-[#263E2F]">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#667267]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
