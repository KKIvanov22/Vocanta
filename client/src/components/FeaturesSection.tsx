import { Brain, Zap, Target, Shield, Clock, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Brain,
    title: "Smart AI Matching",
    description:
      "Our advanced AI understands your skills and matches you with the most relevant opportunities in seconds.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "No more endless scrolling. Get personalized job matches instantly based on what you can actually do.",
  },
  {
    icon: Target,
    title: "Precision Targeting",
    description:
      "Every match is tailored to your unique skill set, ensuring you only see jobs that truly fit your profile.",
  },
  {
    icon: Shield,
    title: "Verified Opportunities",
    description:
      "All job listings are verified and quality-checked to ensure you're connecting with legitimate employers.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Stop wasting hours on job boards. Our AI does the heavy lifting, so you can focus on what matters.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Get insights and recommendations to help you identify skills to develop for better opportunities.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            Why Vocanta
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Everything you need to land your next role
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Experience the future of job searching with our intelligent platform designed to connect you with opportunities that matter.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
            >
              <div className="size-11 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-blue-200 transition-shadow">
                <feature.icon className="size-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
