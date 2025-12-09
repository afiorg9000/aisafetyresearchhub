import Link from "next/link";

// Icons
export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

export function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

export function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

export function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

export function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  );
}

// Back button
export function BackButton({ href = "/", label = "Back" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6 no-underline"
    >
      <ChevronLeftIcon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

// Focus area tag - academic style
export function FocusTag({ area }: { area: string }) {
  return (
    <span className="research-tag">
      {area}
    </span>
  );
}

// Status badge - academic style
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "!bg-green-50 !text-green-700 !border-green-200",
    Completed: "!bg-blue-50 !text-blue-700 !border-blue-200",
    published: "!bg-emerald-50 !text-emerald-700 !border-emerald-200",
    Unknown: "",
  };
  return (
    <span className={`research-tag ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

// Section header - serif style
export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
      {children}
    </h2>
  );
}

// Card wrapper - paper style
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`paper-card rounded-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

// Link card (for lists) - academic style
export function LinkCard({
  href,
  title,
  subtitle,
  meta,
  icon,
}: {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-3 rounded-sm bg-[var(--background-alt)] border border-[var(--border)] hover:border-[var(--border-dark)] transition-all no-underline"
    >
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
        {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{subtitle}</p>}
      </div>
      {meta && <span className="text-xs text-[var(--muted-light)]">{meta}</span>}
    </Link>
  );
}

// Page header - academic style with serif
export function PageHeader({
  title,
  subtitle,
  meta,
  tags,
  actions,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  tags?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {meta && <div className="flex items-center gap-2 mb-2 text-sm text-[var(--muted)]">{meta}</div>}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
        {actions}
      </div>
      {subtitle && <p className="text-[var(--muted)] mt-3 leading-relaxed max-w-3xl">{subtitle}</p>}
      {tags && tags.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
            Research Areas:{" "}
          </span>
          <span className="text-xs text-[var(--foreground-secondary)]">
            {tags.join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-[var(--muted)] text-sm italic">
      {message}
    </div>
  );
}
