"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { createClient } from "../lib/supabase/client";

type EditButtonProps = {
  entityType: "org" | "person" | "project" | "benchmark";
  entitySlug: string;
  entityName: string;
  fields: { name: string; label: string; currentValue: string | null }[];
};

export function EditButton({ entityType, entitySlug, entityName, fields }: EditButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedField, setSelectedField] = useState(fields[0]?.name || "");
  const [suggestedValue, setSuggestedValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const currentField = fields.find((f) => f.name === selectedField);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !suggestedValue.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.from("edit_suggestions").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_slug: entitySlug,
      entity_name: entityName,
      field: selectedField,
      current_value: currentField?.currentValue || null,
      suggested_value: suggestedValue.trim(),
      reason: reason.trim() || null,
    });

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSuggestedValue("");
        setReason("");
      }, 2000);
    }
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="text-[var(--accent)] hover:underline"
      >
        Suggest an edit
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-[var(--accent)] hover:underline">
        Suggest an edit
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
                <h3 className="text-lg font-semibold mb-2">Edit submitted!</h3>
                <p className="text-sm text-[var(--muted)]">Thanks for helping improve the data.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Suggest an edit</h3>
                <p className="text-sm text-[var(--muted)] mb-6">
                  Help us keep <strong>{entityName}</strong> up to date
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Field to edit</label>
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                    >
                      {fields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentField?.currentValue && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Current value</label>
                      <p className="text-sm text-[var(--muted)] p-3 bg-[var(--background)] rounded-lg">
                        {currentField.currentValue.slice(0, 200)}
                        {currentField.currentValue.length > 200 && "..."}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Suggested value</label>
                    <textarea
                      value={suggestedValue}
                      onChange={(e) => setSuggestedValue(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                      placeholder="Enter the correct information..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Reason (optional)</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)]"
                      placeholder="Why should this be changed?"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting || !suggestedValue.trim()}
                      className="flex-1 py-2.5 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit suggestion"}
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

