import Link from "next/link";
import { Share2, Building2, Users, Camera } from "lucide-react";

const navigation = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: Share2, label: "Twitter", href: "https://twitter.com/vocanta" },
  { icon: Building2, label: "LinkedIn", href: "https://linkedin.com/company/vocanta" },
  { icon: Users, label: "Facebook", href: "https://facebook.com/vocanta" },
  { icon: Camera, label: "Instagram", href: "https://instagram.com/vocanta" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">

        {/* Top grid */}
        <div className="grid md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="size-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base leading-none">V</span>
              </div>
              <span className="font-semibold text-xl text-white tracking-tight">Vocanta</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered job matching that connects talented professionals with their perfect opportunities.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Vocanta. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-800 hover:border-gray-700 transition-colors"
              >
                <s.icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
