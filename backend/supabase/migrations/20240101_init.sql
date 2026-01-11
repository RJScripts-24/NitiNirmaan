-- 1. PROFILES (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  org_name text,
  avatar_url text,
  role text default 'editor', 
  gamification_level text default 'Level 1: Novice',
  xp integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. PROJECTS (The Missions)
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- The Owner
  title text not null,
  description text,
  theme text, 
  location text, 
  status text default 'draft', 
  logic_health_score integer default 0,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROJECT MEMBERS (Multiplayer Access)
create table project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'viewer', -- 'editor', 'viewer'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

-- Enable RLS for Projects
alter table projects enable row level security;

-- Policy: Users can view projects effectively if they are the Owner OR a Member
create policy "Users can view own or shared projects"
  on projects for select
  using ( 
    auth.uid() = user_id or 
    exists (
      select 1 from project_members 
      where project_id = projects.id and user_id = auth.uid()
    ) 
  );

create policy "Users can create projects"
  on projects for insert
  with check ( auth.uid() = user_id );

-- Policy: Only Owner or Editors can update
create policy "Owners and Editors can update projects"
  on projects for update
  using ( 
    auth.uid() = user_id or 
    exists (
      select 1 from project_members 
      where project_id = projects.id and user_id = auth.uid() and role = 'editor'
    ) 
  );

create policy "Users can delete their own projects"
  on projects for delete
  using ( auth.uid() = user_id );

-- Enable RLS for Members
alter table project_members enable row level security;

create policy "Members are viewable by project participants"
  on project_members for select
  using (
    exists (
      select 1 from projects 
      where id = project_members.project_id and (user_id = auth.uid())
    ) or
    exists (
      select 1 from project_members pm
      where pm.project_id = project_members.project_id and pm.user_id = auth.uid()
    )
  );

-- Only Owners can add members (Simplified for Hackathon)
create policy "Owners can add members"
  on project_members for insert
  with check (
    exists (
      select 1 from projects 
      where id = project_members.project_id and user_id = auth.uid()
    )
  );
