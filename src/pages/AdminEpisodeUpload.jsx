// src/pages/AdminEpisodeUpload.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useSearchParams } from "react-router-dom";

export default function AdminEpisodeUpload() {
  const [searchParams] = useSearchParams();
  const podcastId = searchParams.get("podcastId");
  const podcastTitle = searchParams.get("title");

  const [title, setTitle] = useState("");
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadEpisode = async () => {
    if (!title || !audio) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const audioPath = `episodes/${Date.now()}-${audio.name}`;

      // Upload audio to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("podcast-audio")
        .upload(audioPath, audio);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: audioData } = supabase.storage
        .from("podcast-audio")
        .getPublicUrl(audioPath);

      const audioEl = new Audio(audioData.publicUrl);
      audioEl.onloadedmetadata = async () => {
        await supabase.from("podcast_episodes").insert({
          podcast_id: podcastId,
          title,
          audio_url: audioData.publicUrl,
          duration: Math.floor(audioEl.duration)
        });

        alert("Episode uploaded successfully!");
        setTitle("");
        setAudio(null);
      };
    } catch (err) {
      console.error(err);
      alert("Failed to upload episode. Check RLS & storage permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="font-bold text-xl mb-4">Upload Episode</h1>
      <p className="mb-4">
        Podcast: <strong>{podcastTitle}</strong>
      </p>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Episode Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudio(e.target.files[0])}
        className="mb-2"
      />

      <button
        onClick={uploadEpisode}
        disabled={loading}
        className="bg-black text-white px-4 py-2 mt-3"
      >
        {loading ? "Uploading..." : "Upload Episode"}
      </button>
    </div>
  );
}
