"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { createClient } from "../lib/supabase/client";

type ClaimButtonProps = {
  entityType: "org" | "project" | "benchmark";
  entitySlug: string;
  entityName: string;
};

export function ClaimButton({ entityType, entitySlug, entityName }: ClaimButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    const { error } = await supabase.from("claims").insert({
      user_id: user.id,
      claim_type: entityType,
      entity_slug: entitySlug,
      entity_name: entityName,
      role: role || null,
    });

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setRole("");
      }, 2000);
    }
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        Sign in to claim
      </button>
    );
  }

  const labels = {
    org: "I work here",
    project: "I'm working on this",
    benchmark: "I contributed to this",
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        {labels[entityType]}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Claim submitted!</h3>
                <p className="text-sm text-[var(--muted)]">Your claim is pending review.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Claim your affiliation</h3>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Let others know you're affiliated with <strong>{entityName}</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Your role (optional)
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                      placeholder="e.g. Research Scientist, Engineer..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit claim"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

