"use client";

import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="group block">
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="relative aspect-[4/3] bg-gray-100">
          {recipe.cover_image_url ? (
            <Image
              src={recipe.cover_image_url}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{recipe.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {recipe.profiles?.display_name ?? "Anonymous"} · {new Date(recipe.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
