-- Interviews: one row per completed interview session
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  difficulty text not null,
  created_at timestamptz not null default now()
);

-- Interview questions: one row per question within an interview
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_order int not null,
  question text not null,
  answer text not null,
  feedback text not null,
  score int not null check (score between 1 and 10),
  created_at timestamptz not null default now()
);

create index interviews_user_id_idx on public.interviews (user_id);
create index interview_questions_interview_id_idx on public.interview_questions (interview_id);
create index interview_questions_user_id_idx on public.interview_questions (user_id);

alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;

create policy "Users can manage their own interviews"
  on public.interviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own interview questions"
  on public.interview_questions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
