import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    role: "Software Engineer",
    company: "Stripe",
    content:
      "Vocanta changed my job search completely. I found my dream role in just 2 days! The AI matching is incredibly accurate and saved me weeks of searching.",
    rating: 5,
    avatar: "SM",
  },
  {
    name: "James Chen",
    role: "Marketing Manager",
    company: "Notion",
    content:
      "I was skeptical at first, but the quality of job matches was outstanding. Every opportunity was relevant to my skills and experience.",
    rating: 5,
    avatar: "JC",
  },
  {
    name: "Maria Rodriguez",
    role: "Product Designer",
    company: "Figma",
    content:
      "The time I saved using Vocanta was incredible. No more scrolling through irrelevant listings — just perfect matches, instantly.",
    rating: 5,
    avatar: "MR",
  },
];

const avatarColors: Record<string, string> = {
  SM: "from-pink-500 to-rose-500",
  JC: "from-blue-500 to-cyan-500",
  MR: "from-violet-500 to-purple-500",
};

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Loved by job seekers
          </h2>
          <p className="text-lg text-gray-500">
            See what professionals are saying about their experience with Vocanta.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col p-7 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div
                  className={`size-10 rounded-full bg-gradient-to-br ${avatarColors[t.avatar] ?? "from-blue-500 to-violet-500"} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
