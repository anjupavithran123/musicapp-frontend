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
      // Step 1: Get duration from local file
      const duration = await new Promise((resolve, reject) => {
        const audioEl = new Audio();
        audioEl.src = URL.createObjectURL(audio);
        audioEl.addEventListener("loadedmetadata", () => {
          resolve(Math.floor(audioEl.duration));
        });
        audioEl.addEventListener("error", () =>
          reject("Failed to read audio file")
        );
      });

      // Step 2: Upload file to Supabase Storage
      const fileExt = audio.name.split(".").pop();
      const fileName = `episodes/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("podcast-audio")
        .upload(fileName, audio, { upsert: true });

      if (uploadError) throw uploadError;

      // Step 3: Get public URL
      const { data: audioData } = supabase.storage
        .from("podcast-audio")
        .getPublicUrl(fileName);

      // Step 4: Insert into DB
      const { error: dbError } = await supabase.from("podcast_episodes").insert({
        podcast_id: podcastId,
        title,
        audio_url: audioData.publicUrl,
        duration
      });

      if (dbError) throw dbError;

      alert("Episode uploaded successfully!");
      setTitle("");
      setAudio(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload episode: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="font-bold text-2xl text-indigo-700">🎧 Upload Episode</h1>
        <p className="text-gray-600">
          Podcast: <strong>{podcastTitle}</strong>
        </p>

        {/* Episode Title */}
        <input
          className="border border-gray-300 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Episode Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Audio Upload */}
        <label className="block">
          <span className="text-gray-600 text-sm mb-1 block">Select Audio File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-indigo-600 file:text-white hover:file:bg-indigo-500
                       focus:outline-none"
          />
          {audio && <p className="mt-1 text-gray-500 text-sm">Selected: {audio.name}</p>}
        </label>

        {/* Upload Button */}
        <button
          onClick={uploadEpisode}
          disabled={loading}
          className={`w-full mt-4 py-3 rounded-xl text-white font-semibold 
                      bg-gradient-to-r from-indigo-600 to-purple-600 
                      shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200
                      ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Uploading..." : "Upload Episode"}
        </button>
      </div>
    </div>
  );
}
