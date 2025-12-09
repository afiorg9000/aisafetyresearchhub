"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export function UserMenu() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors no-underline"
        style={{ 
          backgroundColor: 'var(--foreground)', 
          color: '#faf8f5'
        }}
      >
        Sign in
      </Link>
    );
  }

  const initial = (profile?.full_name || profile?.email || "U")[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-medium truncate">{profile?.full_name || "Anonymous"}</p>
            <p className="text-xs text-[var(--muted)] truncate">{profile?.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)]/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Your profile
            </Link>
            <Link
              href="/submit"
              className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)]/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Submit new entity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

