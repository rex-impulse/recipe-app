"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase-browser";
import { CommentSection } from "@/components/CommentSection";
import type { Recipe, RecipeStep } from "@/lib/types";

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetch = async () => {
      const [recipeRes, stepsRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("*, profiles(display_name, avatar_url)")
          .eq("id", id)
          .single(),
        supabase
          .from("recipe_steps")
          .select("*")
          .eq("recipe_id", id)
          .order("step_number", { ascending: true }),
      ]);

      if (recipeRes.data) setRecipe(recipeRes.data as Recipe);
      if (stepsRes.data) setSteps(stepsRes.data as RecipeStep[]);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="aspect-[4/3] bg-gray-100 rounded-md" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-xl font-medium text-gray-900">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">{recipe.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        by {recipe.profiles?.display_name ?? "Anonymous"} · {new Date(recipe.created_at).toLocaleDateString()}
      </p>
      {recipe.description && (
        <p className="text-gray-700 mt-3">{recipe.description}</p>
      )}

      {/* Steps */}
      <div className="mt-8 space-y-6">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-xs font-medium text-white">
                {step.step_number}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={step.image_url}
                  alt={`Step ${step.step_number}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
              {step.description && (
                <p className="mt-2 text-sm text-gray-700">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <CommentSection recipeId={id} />
    </div>
  );
}
