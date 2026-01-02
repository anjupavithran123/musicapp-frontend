import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminPodcastEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing podcast
  useEffect(() => {
    const fetchPodcast = async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Failed to load podcast");
        return;
      }

      setTitle(data.title);
      setDescription(data.description || "");
      setCoverPreview(data.cover_url || null);
      setLoading(false);
    };

    fetchPodcast();
  }, [id]);

  const handleUpdate = async () => {
    if (!title) {
      alert("Title is required");
      return;
    }

    setLoading(true);

    let coverUrl = null;

    // Upload new cover if selected
    if (cover) {
      const filePath = `podcast-covers/${Date.now()}-${cover.name}`;
      const { error: uploadError } = await supabase.storage
        .from("podcast-covers")
        .upload(filePath, cover, { upsert: true });

      if (uploadError) {
        alert("Cover upload failed");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("podcast-covers")
        .getPublicUrl(filePath);

      coverUrl = data.publicUrl;
    }

    // Update podcast record
    const { error } = await supabase
      .from("podcasts")
      .update({
        title,
        description,
        ...(coverUrl && { cover_url: coverUrl })
      })
      .eq("id", id);

    if (error) {
      alert("Update failed");
    } else {
      alert("Podcast updated successfully");
      navigate("/admin/podcasts");
    }

    setLoading(false);
  };

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:text-indigo-800 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-indigo-700">✏️ Edit Podcast</h1>

        {/* Podcast Title */}
        <input
          className="border border-gray-300 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Podcast Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="border border-gray-300 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Cover Upload */}
        <label className="block">
          <span className="text-gray-600 text-sm mb-1 block">Podcast Cover</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setCover(e.target.files[0]);
              setCoverPreview(URL.createObjectURL(e.target.files[0]));
            }}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
        </label>

        {/* Preview Cover */}
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Cover Preview"
            className="mt-2 w-40 h-40 object-cover rounded-lg shadow-md"
          />
        )}

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full mt-4 py-3 rounded-xl text-white font-semibold 
                      bg-gradient-to-r from-indigo-600 to-purple-600 
                      shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200
                      ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Updating..." : "Update Podcast"}
        </button>
      </div>
    </div>
  );
}
