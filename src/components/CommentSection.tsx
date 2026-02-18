"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "./AuthProvider";
import type { Comment } from "@/lib/types";

export function CommentSection({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: true });
    if (data) setComments(data as Comment[]);
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);

    await supabase.from("comments").insert({
      recipe_id: recipeId,
      author_id: user.id,
      content: content.trim(),
    });

    setContent("");
    setLoading(false);
    fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    fetchComments();
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-gray-500">
          <a href="/login" className="text-gray-900 underline">Sign in</a> to leave a comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.profiles?.display_name ?? "Anonymous"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
