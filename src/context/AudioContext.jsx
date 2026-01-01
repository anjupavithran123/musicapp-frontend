import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AudioPlayerContext = createContext(null);
export const useAudio = () => useContext(AudioPlayerContext);

export function AudioProvider({ children }) {
  const audioRef = useRef(new Audio());
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const playPromiseRef = useRef(null);
  const playlistRef = useRef([]);

  const [current, setCurrent] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [session, setSession] = useState(null);

  /* =========================
     SAFE PLAYLIST SETTER
  ========================= */
  const setSafePlaylist = (list) => {
    playlistRef.current = list;
    setPlaylist(list);
  };

  /* =========================
     AUTH SESSION
  ========================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  /* =========================
     INIT WEB AUDIO (ONCE)
  ========================= */
  useEffect(() => {
    if (audioCtxRef.current) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioCtx();

    analyserRef.current = audioCtxRef.current.createAnalyser();
    analyserRef.current.fftSize = 1024;

    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.preload = "auto";

    sourceRef.current =
      audioCtxRef.current.createMediaElementSource(audioRef.current);

    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioCtxRef.current.destination);
  }, []);

  /* =========================
     SAFE PLAY (AbortError FIX)
  ========================= */
  const safePlay = async () => {
    try {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }

      playPromiseRef.current = audioRef.current.play();
      await playPromiseRef.current;

      setIsPlaying(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Audio play error:", err);
      }
    }
  };

  /* =========================
     LOAD AUDIO SOURCE
  ========================= */
  const loadTrackSource = async (track, startTime = 0) => {
    if (!track?.audio_path) return;

    const { data } = supabase
      .storage
      .from("audio-files")
      .getPublicUrl(track.audio_path);

    if (!data?.publicUrl) return;

    const audio = audioRef.current;

    audio.pause();
    audio.src = data.publicUrl;
    audio.load();
    audio.currentTime = startTime;

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    await safePlay();
  };

  /* =========================
     RESTORE LAST TRACK
  ========================= */
  useEffect(() => {
    if (!session) return;

    const restore = async () => {
      const saved = localStorage.getItem("currentTrack");
      if (!saved) return;

      const track = JSON.parse(saved);
      let resumeTime = Number(localStorage.getItem("currentTime")) || 0;

      const { data } = await supabase
        .from("recently_played")
        .select("last_position")
        .eq("user_id", session.user.id)
        .eq("track_id", track.id)
        .single();

      if (data?.last_position) resumeTime = data.last_position;

      setCurrent(track);
      await loadTrackSource(track, resumeTime);
    };

    restore();
  }, [session]);

/* =========================
   TIME / META / AUTO NEXT
========================= */
useEffect(() => {
  const audio = audioRef.current;

  const onTime = () => {
    setCurrentTime(audio.currentTime);
    localStorage.setItem("currentTime", audio.currentTime);
  };

  const onMeta = () => {
    if (Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const onEnded = async () => {
    const list = playlistRef.current;

    if (!list.length || !current) {
      setIsPlaying(false);
      return;
    }

    const index = list.findIndex(t => t.id === current.id);
    const nextIndex = index + 1;

    if (nextIndex < list.length) {
      const nextTrack = list[nextIndex];

      setCurrent(nextTrack);
      localStorage.setItem("currentTrack", JSON.stringify(nextTrack));
      localStorage.setItem("currentTime", "0");

      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }

      await loadTrackSource(nextTrack, 0);
    } else {
      setIsPlaying(false);
    }
  };

  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("loadedmetadata", onMeta);
  audio.addEventListener("ended", onEnded);

  return () => {
    audio.removeEventListener("timeupdate", onTime);
    audio.removeEventListener("loadedmetadata", onMeta);
    audio.removeEventListener("ended", onEnded);
  };
}, [current]);

   // We must include 'current' so the 'ended' closure sees the right track
 // Effect re-binds when current track changes to avoid stale closures
  /* =========================
     SAVE PROGRESS
  ========================= */
  useEffect(() => {
    if (!session || !current) return;

    supabase.from("recently_played").upsert(
      {
        user_id: session.user.id,
        track_id: current.id,
        last_position: audioRef.current.currentTime,
        updated_at: new Date(),
      },
      { onConflict: "user_id,track_id" }
    );
  }, [current, session]);

  /* =========================
     CONTROLS
  ========================= */
  const playTrack = async (track, list = []) => {
    if (!track) return;

    if (list.length) {
      setSafePlaylist(list);
    }

    setCurrent(track);
    localStorage.setItem("currentTrack", JSON.stringify(track));
    localStorage.setItem("currentTime", "0");

    await loadTrackSource(track, 0);
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const forward = () => seek(Math.min(currentTime + 10, duration));
  const backward = () => seek(Math.max(currentTime - 10, 0));

  return (
    <AudioPlayerContext.Provider
      value={{
        current,
        playlist,
        isPlaying,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        seek,
        forward,
        backward,
        audioRef,
        analyser: analyserRef.current,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
