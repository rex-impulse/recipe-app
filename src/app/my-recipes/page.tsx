"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/AuthProvider";
import type { Recipe } from "@/lib/types";

export default function MyRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      setRecipes((data as Recipe[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user, authLoading]);

  const toggleVisibility = async (recipe: Recipe) => {
    await supabase
      .from("recipes")
      .update({ is_public: !recipe.is_public })
      .eq("id", recipe.id);
    setRecipes(recipes.map((r) => r.id === recipe.id ? { ...r, is_public: !r.is_public } : r));
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    await supabase.from("recipe_steps").delete().eq("recipe_id", id);
    await supabase.from("comments").delete().eq("recipe_id", id);
    await supabase.from("recipes").delete().eq("id", id);
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Recipes</h1>
        <Link
          href="/create"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">You haven&apos;t created any recipes yet.</p>
          <Link href="/create" className="text-gray-900 underline text-sm mt-2 inline-block">
            Create your first recipe
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-4 rounded-md border border-gray-200 p-4"
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {recipe.cover_image_url ? (
                  <Image
                    src={recipe.cover_image_url}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/recipe/${recipe.id}`} className="font-medium text-gray-900 text-sm hover:underline">
                  {recipe.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${recipe.is_draft ? "bg-yellow-100 text-yellow-700" : recipe.is_public ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {recipe.is_draft ? "Draft" : recipe.is_public ? "Public" : "Private"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/edit/${recipe.id}`}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1"
                >
                  Edit
                </Link>
                <button
                  onClick={() => toggleVisibility(recipe)}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1"
                >
                  {recipe.is_public ? "Make Private" : "Make Public"}
                </button>
                <button
                  onClick={() => deleteRecipe(recipe.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
