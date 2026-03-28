import { Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start matching with your dream job today"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    >
      <form action="/api/auth/register" method="POST" className="space-y-5">

        <AuthField
          id="name"
          name="name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          required
          autoComplete="name"
        />

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

        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          icon={Lock}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <AuthField
          id="confirm-password"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          icon={Lock}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <p className="text-xs text-gray-400 leading-relaxed pt-1">
          By creating an account you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>

        <button
          type="submit"
          className="w-full h-11 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-sm shadow-blue-200 transition-all hover:shadow-blue-300 hover:shadow-md"
        >
          Create Account
        </button>

      </form>
    </AuthLayout>
  );
}
