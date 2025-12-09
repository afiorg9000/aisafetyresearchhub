"use client";

import Link from "next/link";

// Activity data will be loaded from Supabase when connected
// For now, showing empty state

export function ActivityFeed({ limit = 5 }: { limit?: number }) {
  // Will be replaced with Supabase query
  const activities: Array<{
    id: string;
    type: string;
    actor: string;
    entity_name: string;
    entity_url: string;
    created_at: string;
  }> = [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-[var(--muted)]">
        <p>No activity yet.</p>
        <p className="text-xs mt-1">Activity will appear here once Supabase is connected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, limit).map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-medium">{activity.actor}</span>{" "}
              {activity.entity_url.startsWith("http") ? (
                <a
                  href={activity.entity_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {activity.entity_name}
                </a>
              ) : (
                <Link
                  href={activity.entity_url}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {activity.entity_name}
                </Link>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeedCompact({ limit = 3 }: { limit?: number }) {
  // Will be replaced with Supabase query
  const activities: Array<{
    id: string;
    type: string;
    actor: string;
    entity_name: string;
    entity_url: string;
    created_at: string;
  }> = [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-[var(--muted)]">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.slice(0, limit).map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-2 text-sm"
        >
          <span className="truncate">
            <span className="text-[var(--muted)]">{activity.actor}</span>{" "}
            {activity.entity_url.startsWith("http") ? (
              <a
                href={activity.entity_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                {activity.entity_name.length > 40 
                  ? activity.entity_name.slice(0, 40) + "..." 
                  : activity.entity_name}
              </a>
            ) : (
              <Link
                href={activity.entity_url}
                className="text-[var(--accent)] hover:underline"
              >
                {activity.entity_name.length > 40 
                  ? activity.entity_name.slice(0, 40) + "..." 
                  : activity.entity_name}
              </Link>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
