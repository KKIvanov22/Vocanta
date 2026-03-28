import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";

type Props = {
  error?: string;
};

export default function LoginPage({ error }: Props) {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your job search"
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkHref="/register"
    >
      <form action="/api/auth/login" method="POST" className="space-y-5">
        {error ? (
          <p
            role="alert"
            className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
          >
            {error}
          </p>
        ) : null}

        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          required
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-gray-400 pointer-events-none" />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-11 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-sm shadow-blue-200 transition-all hover:shadow-blue-300 hover:shadow-md mt-2"
        >
          Sign In
        </button>

      </form>
    </AuthLayout>
  );
}
