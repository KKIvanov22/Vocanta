import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 size-[500px] bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-1/3 size-[400px] bg-violet-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Left — Copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Sparkles className="size-3.5" />
              AI-Powered Job Matching
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Find Your Perfect Job{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                with AI Precision
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              Tell us what you can do. Our AI instantly matches you with the best opportunities tailored to your unique skills and experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5"
              >
                Start Matching Now
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">50K+</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Jobs Matched</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">98%</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Success Rate</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">24/7</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">AI Support</div>
              </div>
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative">
            <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur-2xl opacity-15" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/hero-image.jpg"
                alt="Professional using Vocanta to find their perfect job"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
