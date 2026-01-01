import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminPodcastEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
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
      setLoading(false);
    };

    fetchPodcast();
  }, [id]);

  const handleUpdate = async () => {
    setLoading(true);

    let coverUrl = null;

    // Upload new cover if changed
    if (cover) {
      const filePath = `podcast-covers/${Date.now()}-${cover.name}`;

      const { error: uploadError } = await supabase.storage
        .from("podcast-covers")
        .upload(filePath, cover);

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

    // Update podcast
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

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Podcast</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Podcast Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCover(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Updating..." : "Update Podcast"}
      </button>
    </div>
  );
}
