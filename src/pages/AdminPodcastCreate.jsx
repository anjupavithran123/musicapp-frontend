import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminPodcastCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !description || !cover) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      // Upload cover
      const coverPath = `covers/${Date.now()}-${cover.name}`;
      const { error: uploadError } = await supabase.storage
        .from("podcast-covers")
        .upload(coverPath, cover);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("podcast-covers")
        .getPublicUrl(coverPath);

      // Insert podcast
      const { error: insertError } = await supabase.from("podcasts").insert({
        title,
        description,
        cover_url: data.publicUrl,
      });

      if (insertError) throw insertError;

      navigate("/admin/podcasts");
    } catch (err) {
      console.error(err);
      alert("Podcast creation failed. Check RLS & storage permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-start py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          🎙 Create Podcast
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Add a new podcast episode to your platform
        </p>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Podcast Title
          </label>
          <input
            type="text"
            placeholder="Enter podcast title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500
            "
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Write a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500
            "
          />
        </div>

        {/* Cover Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Podcast Cover
          </label>

          <div className="flex items-center gap-4">
            <label
              className="
                cursor-pointer px-4 py-2 rounded-lg
                bg-purple-600 text-white text-sm font-medium
                hover:bg-purple-700 transition
              "
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  setCover(file);
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/admin/podcasts")}
            className="
              px-4 py-2 rounded-lg text-sm
              text-gray-600 hover:text-gray-800
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-6 py-2 rounded-lg text-sm font-semibold text-white
              bg-gradient-to-r from-purple-600 to-indigo-600
              hover:from-purple-700 hover:to-indigo-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Creating..." : "Create Podcast"}
          </button>
        </div>
      </div>
    </div>
  );
}
