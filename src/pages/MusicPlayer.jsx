import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAudio } from "../context/AudioContext";
import Waveform from "../components/Waveform";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
} from "lucide-react";

export default function MusicPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    audioRef,
  } = useAudio();

  useEffect(() => {
    if (current && String(current.id) === id) return;

    const loadTrack = async () => {
      const { data } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", id)
        .single();

      if (data) playTrack(data);
    };

    loadTrack();
  }, [id]);

  if (!current) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-gray-400">
        Loading track...
      </div>
    );
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const format = (s = 0) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="h-screen bg-black flex items-center justify-center px-1">
      {/* 🎧 PLAYER CARD */}
      <div
        className="
          relative
          w-full max-w-lg
          h-[90vh]        /* fit 90% of viewport height */
          bg-gradient-to-b from-purple-700 to-purple-900
          rounded-3xl
          shadow-2xl
          p-4
          flex flex-col
          text-white
        "
      >
        {/* ⬅ BACK */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center z-10"
        >
          <ArrowLeft size={20} />
        </button>

        {/* COVER */}
        <div className="flex justify-center flex-shrink-0 mt-2">
          <img
            src={
              current.cover_path
                ? supabase.storage
                    .from("cover-images")
                    .getPublicUrl(current.cover_path).data.publicUrl
                : "https://via.placeholder.com/300"
            }
            className="w-[40vw] max-w-[240px] h-[40vw] max-h-[240px] rounded-2xl object-cover shadow-xl"
            alt={current.title}
          />
        </div>

        {/* TITLE */}
        <div className="text-center mt-2 flex-shrink-0">
          <h1 className="text-lg sm:text-xl font-bold truncate">{current.title}</h1>
          <p className="text-purple-200 text-sm truncate">{current.artist}</p>
        </div>

        {/* WAVEFORM */}
        <div className="mt-2 flex-grow">
          <Waveform audioRef={audioRef} isPlaying={isPlaying} />
        </div>

        {/* PROGRESS */}
        <div
          className="mt-2 h-1 bg-white/30 rounded cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
          }}
        >
          <div
            className="h-full bg-white rounded"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* TIME */}
        <div className="flex justify-between text-xs sm:text-sm text-purple-200 mt-1 flex-shrink-0">
          <span>{format(currentTime)}</span>
          <span>{format(duration)}</span>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 flex-shrink-0">
          <button onClick={backward}>
            <SkipBack size={28} />
          </button>

          <button
            onClick={() =>
              isPlaying ? pauseTrack() : playTrack(current)
            }
            className="bg-white text-purple-700 p-3 sm:p-4 rounded-full hover:scale-110 transition shadow-xl"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button onClick={forward}>
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
