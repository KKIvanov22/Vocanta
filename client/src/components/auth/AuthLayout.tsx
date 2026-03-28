import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 size-[500px] bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-1/4 size-[400px] bg-violet-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base leading-none">V</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">Vocanta</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-2xl mb-4">
            <Sparkles className="size-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm shadow-gray-100">
          {children}

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
