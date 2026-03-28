import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 size-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Left — Copy */}
          <div className="space-y-7">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Ready to find your dream job?
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed max-w-md">
              Join thousands of professionals who have found their perfect role with Vocanta&apos;s AI-powered job matching.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 text-base font-semibold text-white border border-white/30 hover:bg-white/10 rounded-xl transition-all"
              >
                Schedule Demo
              </Link>
            </div>

            <p className="text-sm text-blue-200">
              No credit card required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; Cancel anytime
            </p>
          </div>

          {/* Right — Image */}
          <div className="relative hidden md:block">
            <div className="absolute inset-4 bg-white/10 rounded-2xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/cta-image.jpg"
                alt="Career success with Vocanta"
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
