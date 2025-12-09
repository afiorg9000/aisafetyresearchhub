export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  user_id: string;
  claim_type: "org" | "project" | "benchmark";
  entity_slug: string;
  entity_name: string;
  role: string | null;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  verified_at: string | null;
};

export type EditSuggestion = {
  id: string;
  user_id: string;
  entity_type: "org" | "person" | "project" | "benchmark";
  entity_slug: string;
  entity_name: string;
  field: string;
  current_value: string | null;
  suggested_value: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export type EntitySubmission = {
  id: string;
  user_id: string;
  entity_type: "org" | "person" | "project" | "benchmark";
  data: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

