"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe } from "@/lib/types";

export default function FeedPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchRecipes = async () => {
      let query = supabase
        .from("recipes")
        .select("*, profiles(display_name, avatar_url)")
        .eq("is_public", true)
        .eq("is_draft", false)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data } = await query;
      setRecipes((data as Recipe[]) ?? []);
      setLoading(false);
    };
    fetchRecipes();
  }, [search]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-md border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">No recipes yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Be the first to share a recipe!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
