import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-blue-200 transition-shadow">
              <span className="text-white font-bold text-base leading-none">V</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">Vocanta</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-blue-200"
            >
              Get Started
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
