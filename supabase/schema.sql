-- Recipe App Schema for Supabase
-- Run this in the Supabase SQL Editor after creating your project

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Recipes table
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default true not null,
  is_draft boolean default false not null,
  cover_image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.recipes enable row level security;

create policy "Public recipes are viewable by everyone"
  on public.recipes for select using (is_public = true and is_draft = false);

create policy "Users can view their own recipes"
  on public.recipes for select using (auth.uid() = author_id);

create policy "Users can insert their own recipes"
  on public.recipes for insert with check (auth.uid() = author_id);

create policy "Users can update their own recipes"
  on public.recipes for update using (auth.uid() = author_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete using (auth.uid() = author_id);

-- Recipe steps table
create table public.recipe_steps (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  step_number integer not null,
  image_url text not null,
  description text,
  created_at timestamptz default now() not null
);

alter table public.recipe_steps enable row level security;

create policy "Steps are viewable if recipe is viewable"
  on public.recipe_steps for select using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id
      and (r.is_public = true and r.is_draft = false or r.author_id = auth.uid())
    )
  );

create policy "Users can insert steps for their recipes"
  on public.recipe_steps for insert with check (
    exists (select 1 from public.recipes where id = recipe_id and author_id = auth.uid())
  );

create policy "Users can update steps for their recipes"
  on public.recipe_steps for update using (
    exists (select 1 from public.recipes where id = recipe_id and author_id = auth.uid())
  );

create policy "Users can delete steps for their recipes"
  on public.recipe_steps for delete using (
    exists (select 1 from public.recipes where id = recipe_id and author_id = auth.uid())
  );

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can insert comments"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = author_id);

-- Storage bucket for recipe images
-- Run in Supabase Dashboard > Storage > Create bucket: "recipe-images" (public)
-- Or via SQL:
insert into storage.buckets (id, name, public) values ('recipe-images', 'recipe-images', true);

create policy "Anyone can view recipe images"
  on storage.objects for select using (bucket_id = 'recipe-images');

create policy "Authenticated users can upload recipe images"
  on storage.objects for insert with check (bucket_id = 'recipe-images' and auth.role() = 'authenticated');

create policy "Users can delete their own uploads"
  on storage.objects for delete using (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
