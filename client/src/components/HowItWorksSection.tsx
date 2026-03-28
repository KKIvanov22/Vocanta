import Image from "next/image";
import { Search, Sparkles, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: Search,
    number: "01",
    title: "Describe Your Skills",
    description:
      "Simply type what you can do — your skills, experience, and what you're looking for in your next role.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI Analysis",
    description:
      "Our intelligent AI analyzes your input and searches through thousands of opportunities to find the perfect matches.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Get Matched",
    description:
      "Receive a curated list of jobs that align with your skills, preferences, and career goals. Apply with confidence.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Three steps to your dream job
          </h2>
          <p className="text-lg text-gray-500">
            AI-powered precision, delivered simply.
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Steps */}
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="size-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-100">
                    <step.icon className="size-7 text-white" />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                    Step {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl blur-2xl opacity-15" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/how-it-works-image.jpg"
                alt="AI technology powering Vocanta's job matching"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
