import {
  Search,
  Sparkles,
  Briefcase,
  User,
  MapPin,
  GraduationCap,
  Calendar,
  Tag,
} from "lucide-react";
import { JobCard, type Job } from "@/components/JobCard";

// ─── Props from your server component / page ────────────────────────────────
// Pass `jobs` and `hasSearched` from your server action or API call.
// This component is purely presentational.

type DashboardViewProps = {
  jobs?: Job[];
  hasSearched?: boolean;
};

export function DashboardView({ jobs = [], hasSearched = false }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Job Matcher</h1>
          </div>
          <p className="text-blue-100 text-sm ml-[52px]">
            Tell us about yourself and we&apos;ll find the perfect jobs for you
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Profile Form ── */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm shadow-gray-100">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="size-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <User className="size-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">Your Profile</h2>
                <p className="text-xs text-gray-400">Help us understand your background</p>
              </div>
            </div>

            {/* Form — action/method wired to your backend */}
            <form action="/api/jobs/match" method="POST" className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <div>
                  <label
                    htmlFor="age"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                  >
                    <Calendar className="size-3.5 text-blue-500" />
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="e.g. 25"
                    min={18}
                    max={100}
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                  >
                    <MapPin className="size-3.5 text-blue-500" />
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. San Francisco"
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label
                  htmlFor="education"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                >
                  <GraduationCap className="size-3.5 text-blue-500" />
                  Education
                </label>
                <select
                  id="education"
                  name="education"
                  defaultValue=""
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none"
                >
                  <option value="" disabled>Select your education level</option>
                  <option value="high-school">High School</option>
                  <option value="associate">Associate Degree</option>
                  <option value="bachelor">Bachelor&apos;s Degree</option>
                  <option value="master">Master&apos;s Degree</option>
                  <option value="phd">PhD</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="self-taught">Self-Taught</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label
                  htmlFor="skills"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                >
                  <Tag className="size-3.5 text-blue-500" />
                  Skills
                  <span className="text-blue-500 ml-0.5">*</span>
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  placeholder="e.g. React, TypeScript, Node.js, Python, Design..."
                  required
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">Separate skills with commas</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 transition-all"
              >
                <Search className="size-4" />
                Find Matching Jobs
              </button>
            </form>
          </div>
        </div>

        {/* ── Results ── */}
        {hasSearched && jobs.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Matched Jobs</h2>
              <p className="text-sm text-gray-500 mt-1">
                Found {jobs.length} job{jobs.length !== 1 ? "s" : ""} matching your skills
              </p>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* ── No results ── */}
        {hasSearched && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center size-16 bg-gray-100 rounded-2xl mb-4">
              <Search className="size-7 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No matching jobs found</h3>
            <p className="text-sm text-gray-500">Try different skills or broader search terms</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasSearched && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center size-20 bg-blue-50 border border-blue-100 rounded-3xl mb-5">
              <Briefcase className="size-9 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Start your job search</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Fill out your profile above and let our AI match you with the best opportunities
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
