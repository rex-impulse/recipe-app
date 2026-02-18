"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/AuthProvider";
import { StepEditor, StepData } from "@/components/StepEditor";
import { uploadImage } from "@/lib/image-utils";

export default function CreateRecipePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [steps, setSteps] = useState<StepData[]>([
    { id: "step-1", description: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (isDraft: boolean) => {
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const stepsWithImages = steps.filter((s) => s.imageFile || s.imageUrl);
    if (stepsWithImages.length === 0 && !isDraft) {
      setError("Add at least one step with a photo");
      return;
    }

    setSaving(true);
    try {
      // Upload images
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

      // Create recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          author_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          is_draft: isDraft,
          cover_image_url: coverUrl,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Create steps
      if (validSteps.length > 0) {
        const { error: stepsError } = await supabase.from("recipe_steps").insert(
          validSteps.map((s) => ({
            recipe_id: recipe.id,
            step_number: s.step_number,
            image_url: s.imageUrl,
            description: s.description || null,
          }))
        );
        if (stepsError) throw stepsError;
      }

      router.push(`/recipe/${recipe.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Recipe</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you cooking?"
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of your recipe..."
            rows={2}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
          <StepEditor steps={steps} setSteps={setSteps} />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900"></div>
          </label>
          <span className="text-sm text-gray-700">{isPublic ? "Public" : "Private"}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex-1 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
