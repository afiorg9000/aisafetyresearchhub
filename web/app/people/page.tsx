"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllPeople, orgs, slugify, FOCUS_COLORS } from "../lib/data";
import { SearchIcon, UserIcon, BuildingIcon, BackButton } from "../components/ui";

const allPeople = getAllPeople();

// Get unique orgs and focus areas for filters
const uniqueOrgs = [...new Set(allPeople.map((p) => p.org.name))].sort();
const uniqueFocusAreas = [...new Set(allPeople.flatMap((p) => p.org.focus_areas || []))].sort();

export default function PeoplePage() {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [focusFilter, setFocusFilter] = useState("all");

  const filteredPeople = useMemo(() => {
    return allPeople.filter((person) => {
      const matchesSearch =
        search === "" ||
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.role.toLowerCase().includes(search.toLowerCase()) ||
        person.org.name.toLowerCase().includes(search.toLowerCase());

      const matchesOrg = orgFilter === "all" || person.org.name === orgFilter;

      const matchesFocus =
        focusFilter === "all" || (person.org.focus_areas || []).includes(focusFilter);

      return matchesSearch && matchesOrg && matchesFocus;
    });
  }, [search, orgFilter, focusFilter]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href="/"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  ← Back
                </Link>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">People</h1>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {allPeople.length} researchers across {uniqueOrgs.length} organizations
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All organizations</option>
              {uniqueOrgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>

            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All focus areas</option>
              {uniqueFocusAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted)]">No people found</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person, index) => (
              <Link
                key={`${person.name}-${person.org.name}-${index}`}
                href={`/person/${slugify(person.name)}`}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--muted)]/50 hover:bg-[var(--card-hover)] transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--muted)]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate mt-0.5">{person.role}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--muted)]">
                    <BuildingIcon className="w-3 h-3" />
                    <span className="truncate">{person.org.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

