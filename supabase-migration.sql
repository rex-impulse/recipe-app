-- Run this in Supabase SQL Editor to set up the database

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_draft BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Steps
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_author ON public.recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(is_public, is_draft);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON public.recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_comments_recipe ON public.comments(recipe_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Anyone can read public recipes" ON public.recipes FOR SELECT USING (is_public = true OR auth.uid() = author_id);
CREATE POLICY "Auth users can create recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Owners can update recipes" ON public.recipes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Owners can delete recipes" ON public.recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe steps policies
CREATE POLICY "Anyone can read steps of visible recipes" ON public.recipe_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND (is_public = true OR auth.uid() = author_id))
);
CREATE POLICY "Auth users can create steps" ON public.recipe_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND auth.uid() = author_id)
);
CREATE POLICY "Owners can update steps" ON public.recipe_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND auth.uid() = author_id)
);
CREATE POLICY "Owners can delete steps" ON public.recipe_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND auth.uid() = author_id)
);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Comment owners can delete" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Storage bucket (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-images', 'recipe-images', true);
-- CREATE POLICY "Anyone can read images" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-images');
-- CREATE POLICY "Auth users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
