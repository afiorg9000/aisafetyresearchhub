-- Run this in your Supabase SQL Editor to set up the database

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Claims table
create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  claim_type text not null check (claim_type in ('org', 'project', 'benchmark')),
  entity_slug text not null,
  entity_name text not null,
  role text,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now() not null,
  verified_at timestamptz,
  unique(user_id, claim_type, entity_slug)
);

alter table public.claims enable row level security;

create policy "Claims are viewable by everyone"
  on public.claims for select
  using (true);

create policy "Users can create own claims"
  on public.claims for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own claims"
  on public.claims for delete
  using (auth.uid() = user_id);

-- Edit suggestions table
create table if not exists public.edit_suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  entity_type text not null check (entity_type in ('org', 'person', 'project', 'benchmark')),
  entity_slug text not null,
  entity_name text not null,
  field text not null,
  current_value text,
  suggested_value text not null,
  reason text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null,
  reviewed_at timestamptz
);

alter table public.edit_suggestions enable row level security;

create policy "Edit suggestions are viewable by everyone"
  on public.edit_suggestions for select
  using (true);

create policy "Authenticated users can create edit suggestions"
  on public.edit_suggestions for insert
  with check (auth.uid() = user_id);

-- Entity submissions table
create table if not exists public.entity_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  entity_type text not null check (entity_type in ('org', 'person', 'project', 'benchmark')),
  data jsonb not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null,
  reviewed_at timestamptz
);

alter table public.entity_submissions enable row level security;

create policy "Entity submissions viewable by creator"
  on public.entity_submissions for select
  using (auth.uid() = user_id);

create policy "Authenticated users can create submissions"
  on public.entity_submissions for insert
  with check (auth.uid() = user_id);

-- =============================================
-- OPEN PROBLEMS SYSTEM
-- =============================================

-- Open Problems table
create table if not exists public.open_problems (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  focus_area text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'solved', 'closed')),
  submitted_by uuid references public.profiles on delete set null,
  related_project_slugs text[], -- links to existing projects
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.open_problems enable row level security;

create policy "Open problems are viewable by everyone"
  on public.open_problems for select
  using (true);

create policy "Authenticated users can create problems"
  on public.open_problems for insert
  with check (auth.uid() = submitted_by);

create policy "Users can update own problems"
  on public.open_problems for update
  using (auth.uid() = submitted_by);

-- Problem votes table (upvote/downvote)
create table if not exists public.problem_votes (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references public.open_problems on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  vote_type smallint not null check (vote_type in (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at timestamptz default now() not null,
  unique(problem_id, user_id)
);

alter table public.problem_votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.problem_votes for select
  using (true);

create policy "Authenticated users can vote"
  on public.problem_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.problem_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.problem_votes for delete
  using (auth.uid() = user_id);

-- Problem comments table (threaded)
create table if not exists public.problem_comments (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references public.open_problems on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  parent_id uuid references public.problem_comments on delete cascade, -- for threading
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.problem_comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.problem_comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.problem_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.problem_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.problem_comments for delete
  using (auth.uid() = user_id);

-- Problem workers table ("I'm working on this")
create table if not exists public.problem_workers (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references public.open_problems on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  project_url text, -- optional link to their project
  notes text,
  created_at timestamptz default now() not null,
  unique(problem_id, user_id)
);

alter table public.problem_workers enable row level security;

create policy "Workers are viewable by everyone"
  on public.problem_workers for select
  using (true);

create policy "Authenticated users can mark working"
  on public.problem_workers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own work status"
  on public.problem_workers for update
  using (auth.uid() = user_id);

create policy "Users can remove work status"
  on public.problem_workers for delete
  using (auth.uid() = user_id);

-- Activity feed table
create table if not exists public.activity_feed (
  id uuid default gen_random_uuid() primary key,
  event_type text not null check (event_type in (
    'problem_created', 'problem_solved', 
    'worker_joined', 'comment_added',
    'entity_added', 'entity_updated'
  )),
  actor_id uuid references public.profiles on delete set null,
  entity_type text, -- 'problem', 'org', 'project', etc.
  entity_id text,   -- slug or uuid
  entity_name text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

alter table public.activity_feed enable row level security;

create policy "Activity is viewable by everyone"
  on public.activity_feed for select
  using (true);

-- Indexes
create index if not exists claims_user_id_idx on public.claims(user_id);
create index if not exists claims_entity_idx on public.claims(claim_type, entity_slug);
create index if not exists edit_suggestions_user_id_idx on public.edit_suggestions(user_id);
create index if not exists edit_suggestions_entity_idx on public.edit_suggestions(entity_type, entity_slug);
create index if not exists entity_submissions_user_id_idx on public.entity_submissions(user_id);
create index if not exists open_problems_slug_idx on public.open_problems(slug);
create index if not exists open_problems_focus_area_idx on public.open_problems(focus_area);
create index if not exists open_problems_status_idx on public.open_problems(status);
create index if not exists problem_votes_problem_idx on public.problem_votes(problem_id);
create index if not exists problem_comments_problem_idx on public.problem_comments(problem_id);
create index if not exists problem_workers_problem_idx on public.problem_workers(problem_id);
create index if not exists activity_feed_created_idx on public.activity_feed(created_at desc)
