"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { href: "/", label: "Organizations" },
  { href: "/publications", label: "Publications" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/problems", label: "Open Problems" },
];

export function SiteHeader() {
  const pathname = usePathname();

  // Determine active tab
  const getActiveTab = () => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/publications") || pathname.startsWith("/project")) return "/publications";
    if (pathname.startsWith("/benchmarks") || pathname.startsWith("/benchmark")) return "/benchmarks";
    if (pathname.startsWith("/problems") || pathname.startsWith("/problem")) return "/problems";
    if (pathname.startsWith("/org")) return "/";
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]"
            >
              AI Safety Research Hub
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap no-underline pb-3 -mb-3 border-b-2 transition-colors ${
                  activeTab === item.href
                    ? "font-medium text-[var(--foreground)] border-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="ml-auto whitespace-nowrap no-underline text-[var(--muted)] hover:text-[var(--foreground)] pb-3 -mb-3 border-b-2 border-transparent flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Search
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--muted)]">
            AI Safety Research Hub — A community resource for AI safety research coordination
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">About</Link>
            <Link href="/submit" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Contribute</Link>
            <a href="https://github.com/afiorg9000/aisafetyresearchhub" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

