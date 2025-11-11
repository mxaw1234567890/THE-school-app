-- Users profile table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Todos/Tasks table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'medium',
  status text default 'pending',
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Assignments table
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  title text not null,
  description text,
  due_date timestamp with time zone not null,
  status text default 'pending',
  grade numeric,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Flashcard decks table
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  subject text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Flashcards table
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Study sessions table
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid references public.flashcard_decks(id) on delete set null,
  duration_minutes integer,
  cards_studied integer,
  created_at timestamp with time zone default now()
);

-- Collaborations table
create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.flashcard_decks(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'viewer',
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.todos enable row level security;
alter table public.assignments enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_sessions enable row level security;
alter table public.collaborations enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for todos
create policy "todos_select_own"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "todos_insert_own"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "todos_update_own"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "todos_delete_own"
  on public.todos for delete
  using (auth.uid() = user_id);

-- RLS Policies for assignments
create policy "assignments_select_own"
  on public.assignments for select
  using (auth.uid() = user_id);

create policy "assignments_insert_own"
  on public.assignments for insert
  with check (auth.uid() = user_id);

create policy "assignments_update_own"
  on public.assignments for update
  using (auth.uid() = user_id);

create policy "assignments_delete_own"
  on public.assignments for delete
  using (auth.uid() = user_id);

-- RLS Policies for flashcard_decks
create policy "decks_select_own"
  on public.flashcard_decks for select
  using (auth.uid() = user_id);

create policy "decks_insert_own"
  on public.flashcard_decks for insert
  with check (auth.uid() = user_id);

create policy "decks_update_own"
  on public.flashcard_decks for update
  using (auth.uid() = user_id);

create policy "decks_delete_own"
  on public.flashcard_decks for delete
  using (auth.uid() = user_id);

-- RLS Policies for flashcards
create policy "flashcards_select_deck_owner"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

create policy "flashcards_insert_deck_owner"
  on public.flashcards for insert
  with check (
    exists (
      select 1 from public.flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

create policy "flashcards_update_deck_owner"
  on public.flashcards for update
  using (
    exists (
      select 1 from public.flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

create policy "flashcards_delete_deck_owner"
  on public.flashcards for delete
  using (
    exists (
      select 1 from public.flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

-- RLS Policies for study_sessions
create policy "sessions_select_own"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

-- RLS Policies for collaborations
create policy "collaborations_select"
  on public.collaborations for select
  using (auth.uid() = user_id);

create policy "collaborations_insert"
  on public.collaborations for insert
  with check (auth.uid() = user_id);
