import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminUpload({ session, profile }) {
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const userId = session?.user?.id;

  if (!session || profile?.role !== "admin") {
    return (
      <p className="p-4 text-red-500 text-center font-semibold">
        Access denied (Admin only)
      </p>
    );
  }

  // --- Get audio duration in seconds ---
  const getAudioDuration = (file) =>
    new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        resolve(Math.floor(audio.duration));
      });
      audio.addEventListener("error", (e) => reject(e));
    });

  const handleUpload = async () => {
    if (!title || !artist || !audioFile || !coverFile || !category) {
      alert("Please fill all fields");
      return;
    }

    setUploading(true);

    try {
      // 1️⃣ Calculate duration
      const audioDuration = await getAudioDuration(audioFile);

      // Optional: file size check (Supabase free limit 50MB)
      if (audioFile.size > 50 * 1024 * 1024) {
        throw new Error("Audio file exceeds 50MB limit");
      }

      // 2️⃣ Upload audio
      const audioName = `${Date.now()}_${audioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from("audio-files")
        .upload(audioName, audioFile, { upsert: true, cacheControl: "3600" });
      if (audioError) throw new Error(audioError.message);

      // 3️⃣ Upload cover
      const coverName = `${Date.now()}_${coverFile.name}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from("cover-images")
        .upload(coverName, coverFile, { upsert: true, cacheControl: "3600" });
      if (coverError) throw new Error(coverError.message);

      // 4️⃣ Insert DB (duration in numeric seconds)
      const { error: dbError } = await supabase.from("tracks").insert({
        title,
        artist,
        category,
        duration: audioDuration,
        audio_path: audioData.path,
        cover_path: coverData.path,
        user_id: userId,
      });
      if (dbError) throw dbError;

      alert(`✅ Upload successful! Duration: ${Math.floor(audioDuration / 60)}:${(
        audioDuration % 60
      )
        .toString()
        .padStart(2, "0")}`);

      // Reset form
      setTitle("");
      setArtist("");
      setCategory("");
      setAudioFile(null);
      setCoverFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Music Upload
        </h2>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Title"
            className="w-full rounded-xl bg-gray-100 p-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Artist"
            className="w-full rounded-xl bg-gray-100 p-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />

          <select
            className="w-full rounded-xl bg-gray-100 p-4 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="NewRelease">New Release</option>
            <option value="Rock">Rock</option>
            <option value="Evergreen">Evergreen</option>
            <option value="Popular">Popular</option>
            <option value="Classical">Classical</option>
          </select>

          <input
            type="file"
            accept="audio/*"
            className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            onChange={(e) => setAudioFile(e.target.files[0])}
          />

          <input
            type="file"
            accept="image/*"
            className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
            onChange={(e) => setCoverFile(e.target.files[0])}
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-purple-700 hover:bg-purple-500 text-white-800 py-3 rounded-xl font-semibold transition"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
