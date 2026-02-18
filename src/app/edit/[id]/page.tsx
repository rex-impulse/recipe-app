"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/AuthProvider";
import { StepEditor, StepData } from "@/components/StepEditor";
import { uploadImage } from "@/lib/image-utils";
import type { Recipe, RecipeStep } from "@/lib/types";

export default function EditRecipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createBrowserClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const fetch = async () => {
      const [recipeRes, stepsRes] = await Promise.all([
        supabase.from("recipes").select("*").eq("id", id).single(),
        supabase.from("recipe_steps").select("*").eq("recipe_id", id).order("step_number"),
      ]);

      const recipe = recipeRes.data as Recipe;
      if (!recipe || recipe.author_id !== user.id) {
        router.push("/my-recipes");
        return;
      }

      setTitle(recipe.title);
      setDescription(recipe.description || "");
      setIsPublic(recipe.is_public);
      setIsDraft(recipe.is_draft);

      const existingSteps: StepData[] = ((stepsRes.data as RecipeStep[]) || []).map((s) => ({
        id: s.id,
        imageUrl: s.image_url,
        description: s.description || "",
      }));
      setSteps(existingSteps.length > 0 ? existingSteps : [{ id: "step-1", description: "" }]);
      setLoading(false);
    };
    fetch();
  }, [id, user, authLoading]);

  const handleSubmit = async (saveDraft: boolean) => {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);

    try {
      const uploadedSteps = await Promise.all(
        steps.map(async (step, index) => {
          let imageUrl = step.imageUrl || "";
          if (step.imageFile) {
            imageUrl = await uploadImage(supabase, step.imageFile);
          }
          return { ...step, imageUrl, step_number: index + 1 };
        })
      );

      const validSteps = uploadedSteps.filter((s) => s.imageUrl);
      const coverUrl = validSteps[0]?.imageUrl || null;

      await supabase
        .from("recipes")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          is_draft: saveDraft,
          cover_image_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Replace steps
      await supabase.from("recipe_steps").delete().eq("recipe_id", id);
      if (validSteps.length > 0) {
        await supabase.from("recipe_steps").insert(
          validSteps.map((s) => ({
            recipe_id: id,
            step_number: s.step_number,
            image_url: s.imageUrl,
            description: s.description || null,
          }))
        );
      }

      router.push(`/recipe/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Recipe</h1>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
          <StepEditor steps={steps} setSteps={setSteps} />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900"></div>
          </label>
          <span className="text-sm text-gray-700">{isPublic ? "Public" : "Private"}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex-1 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update & Publish"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
