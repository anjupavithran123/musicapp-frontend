import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminPodcastCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !description || !cover) {
      alert("All fields required");
      return;
    }

    setLoading(true);
    try {
      // Upload cover
      const coverPath = `covers/${Date.now()}-${cover.name}`;
      const { error: uploadError } = await supabase.storage
        .from("podcast-covers") // ✅ your bucket name
        .upload(coverPath, cover);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("podcast-covers")
        .getPublicUrl(coverPath);

      // Insert into table
      const { error: insertError } = await supabase.from("podcasts").insert({
        title,
        description,
        cover_url: data.publicUrl // make sure table column matches
      });

      if (insertError) throw insertError;

      // Navigate to podcast list
      navigate("/admin/podcasts");

    } catch (err) {
      console.error(err);
      alert("Podcast creation failed. Check RLS policy & storage permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Create Podcast</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Podcast Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCover(e.target.files[0])}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 mt-3"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
