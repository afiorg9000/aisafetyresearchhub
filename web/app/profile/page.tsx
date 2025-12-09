"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../components/auth-provider";
import { createClient } from "../lib/supabase/client";
import type { Claim, EditSuggestion } from "../lib/supabase/types";
import { BackButton, Card, SectionHeader } from "../components/ui";

export default function ProfilePage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setWebsite(profile.website || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      // Fetch claims
      supabase
        .from("claims")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setClaims(data || []));

      // Fetch edit suggestions
      supabase
        .from("edit_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setSuggestions(data || []));
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await refreshProfile();
    setEditing(false);
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const statusColors = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BackButton href="/" label="Back to home" />

        {/* Profile Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--border)] flex items-center justify-center text-2xl font-semibold text-[var(--muted)]">
              {(profile.full_name || profile.email)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{profile.full_name || "Anonymous"}</h1>
              <p className="text-sm text-[var(--muted)]">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] border border-[var(--border)] rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Edit Profile */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader>Profile</SectionHeader>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bio && <p className="text-sm text-[var(--muted)]">{bio}</p>}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--accent)] hover:underline block"
                >
                  {website}
                </a>
              )}
              {!bio && !website && (
                <p className="text-sm text-[var(--muted)]">No bio or website yet.</p>
              )}
            </div>
          )}
        </Card>

        {/* Claims */}
        <Card className="mb-6">
          <SectionHeader>Your Claims ({claims.length})</SectionHeader>
          {claims.length > 0 ? (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{claim.entity_name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {claim.claim_type} · {claim.role || "Member"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                      statusColors[claim.status]
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No claims yet. Visit an org or project page to claim your affiliation.
            </p>
          )}
        </Card>

        {/* Edit Suggestions */}
        <Card>
          <SectionHeader>Your Edit Suggestions ({suggestions.length})</SectionHeader>
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{suggestion.entity_name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {suggestion.field}: "{suggestion.suggested_value.slice(0, 50)}..."
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                      statusColors[suggestion.status]
                    }`}
                  >
                    {suggestion.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No edit suggestions yet. Visit any page and click "Suggest an edit" to contribute.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

