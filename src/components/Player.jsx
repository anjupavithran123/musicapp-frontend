import React, { useEffect, useState } from "react";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../lib/supabase";

export default function Player() {
  const {
    current,
    isPlaying,
    playTrack,
    pauseTrack,
    currentTime,
    duration,
    seek,
    forward,
    backward,
  } = useAudio();

  const [localProgress, setLocalProgress] = useState(0);
  const [coverUrl, setCoverUrl] = useState("/default-cover.png");

  useEffect(() => {
    setLocalProgress(currentTime);
  }, [currentTime]);

  // Fetch cover image from Supabase
  useEffect(() => {
    const fetchCover = async () => {
      if (!current?.cover_Path) return;
      const { data, error } = supabase.storage
        .from("cover_images") // your bucket name
        .getPublicUrl(current.cover_Path);
      if (!error && data?.publicUrl) {
        setCoverUrl(data.publicUrl);
      }
    };
    fetchCover();
  }, [current]);

  if (!current) return null; // hide player if no track is selected

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-purple-900 text-white flex items-center px-4 z-[9999] shadow-lg">
      {/* Cover */}
      <img
        src={coverUrl}
        alt={current.title}
        className="w-12 h-12 rounded object-cover"
      />

      {/* Info & Progress */}
      <div className="ml-3 flex-1 flex flex-col justify-center overflow-hidden">
        <p className="font-semibold truncate">{current.title}</p>
        <p className="text-xs opacity-70 truncate">{current.artist}</p>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={localProgress}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1 mt-1 accent-white"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center ml-3 space-x-2">
        <button
          onClick={backward}
          className="p-2 bg-white text-purple-900 rounded-full"
        >
          ⏪
        </button>

        <button
          onClick={() => (isPlaying ? pauseTrack() : playTrack(current))}
          className="p-2 bg-white text-purple-900 rounded-full"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          onClick={forward}
          className="p-2 bg-white text-purple-900 rounded-full"
        >
          ⏩
        </button>
      </div>
    </div>
  );
}
