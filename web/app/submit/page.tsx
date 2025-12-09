"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth-provider";
import { createClient } from "../lib/supabase/client";
import { BackButton, Card } from "../components/ui";

const ENTITY_TYPES = [
  { value: "org", label: "Organization", description: "AI safety org, lab, or institute" },
  { value: "project", label: "Project", description: "Research project or initiative" },
  { value: "benchmark", label: "Benchmark", description: "Evaluation benchmark or dataset" },
  { value: "person", label: "Person", description: "Researcher or team member" },
];

const ORG_TYPES = [
  "Government AISI",
  "Lab Safety Team",
  "Nonprofit",
  "Academic",
  "Think Tank",
  "Funder",
];

const FOCUS_AREAS = [
  "Evals",
  "Interpretability",
  "Alignment",
  "Governance",
  "Policy",
  "Biosecurity",
  "Cyber",
  "Control",
  "Monitoring",
  "Benchmarks",
];

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entityType, setEntityType] = useState("org");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // Form fields
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [orgType, setOrgType] = useState("");
  const [country, setCountry] = useState("");
  const [mission, setMission] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState("");
  const [measures, setMeasures] = useState("");
  const [paperUrl, setPaperUrl] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  function toggleFocusArea(area: string) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    let data: Record<string, unknown> = { name };

    if (entityType === "org") {
      data = {
        name,
        url,
        type: orgType,
        country,
        mission,
        focus_areas: focusAreas,
      };
    } else if (entityType === "project") {
      data = {
        name,
        org_name: orgName,
        description,
        status,
        focus_areas: focusAreas,
      };
    } else if (entityType === "benchmark") {
      data = {
        name,
        org_name: orgName,
        measures,
        paper_url: paperUrl || null,
      };
    } else if (entityType === "person") {
      data = {
        name,
        org_name: orgName,
        role,
        focus_areas: focusAreas,
      };
    }

    const { error } = await supabase.from("entity_submissions").insert({
      user_id: user.id,
      entity_type: entityType,
      data,
    });

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Submission received!</h1>
          <p className="text-[var(--muted)] mb-6">
            Your submission is pending review. We'll add it to the directory soon.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setName("");
                setUrl("");
                setOrgType("");
                setCountry("");
                setMission("");
                setFocusAreas([]);
                setDescription("");
                setOrgName("");
                setRole("");
                setMeasures("");
                setPaperUrl("");
              }}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg"
            >
              Submit another
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <BackButton href="/" label="Back to home" />

        <h1 className="text-2xl font-semibold mb-2">Submit new entity</h1>
        <p className="text-[var(--muted)] mb-8">
          Help us expand the directory by adding organizations, projects, or people.
        </p>

        {/* Entity Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setEntityType(type.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                entityType === type.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--muted)]/50"
              }`}
            >
              <p className="text-sm font-medium">{type.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{type.description}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name - always shown */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
              required
            />
          </div>

          {/* Organization-specific fields */}
          {entityType === "org" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Website URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type *</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                    required
                  >
                    <option value="">Select type</option>
                    {ORG_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Country *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Mission</label>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                  placeholder="Brief description of what the organization does..."
                />
              </div>
            </>
          )}

          {/* Project-specific fields */}
          {entityType === "project" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Organization *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Which org runs this project?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </>
          )}

          {/* Benchmark-specific fields */}
          {entityType === "benchmark" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Created by (organization) *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">What it measures *</label>
                <textarea
                  value={measures}
                  onChange={(e) => setMeasures(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Paper URL</label>
                <input
                  type="url"
                  value={paperUrl}
                  onChange={(e) => setPaperUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          {/* Person-specific fields */}
          {entityType === "person" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Organization *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="e.g. Research Scientist"
                />
              </div>
            </>
          )}

          {/* Focus Areas - for org, project, person */}
          {["org", "project", "person"].includes(entityType) && (
            <div>
              <label className="block text-sm font-medium mb-2">Focus areas</label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      focusAreas.includes(area)
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name}
            className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </div>
    </div>
  );
}

