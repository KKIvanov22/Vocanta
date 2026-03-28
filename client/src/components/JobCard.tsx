import { MapPin, DollarSign, Clock } from "lucide-react";
import Link from "next/link";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  skills: string[];
  matchScore: number;
};

type JobCardProps = {
  job: Job;
};

const matchColor = (score: number) => {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 50) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100 hover:border-gray-200 transition-all duration-300">

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Company avatar */}
          <div className="size-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">
              {job.company.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate leading-snug">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500">{job.company}</p>
          </div>
        </div>

        {/* Match badge */}
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${matchColor(job.matchScore)}`}
        >
          {job.matchScore}% match
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-gray-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="size-3.5 text-gray-400" />
          {job.salary}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-gray-400" />
          {job.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-5 flex-1">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {job.skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="text-xs font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="text-xs text-gray-400 px-2 py-1">
            +{job.skills.length - 5} more
          </span>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center justify-center h-9 text-sm font-semibold text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl transition-all duration-200"
      >
        View Job
      </Link>

    </div>
  );
}
