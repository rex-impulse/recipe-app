export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_draft: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  image_url: string;
  description: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  recipe_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}
