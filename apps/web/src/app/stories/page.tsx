"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Volume2, VolumeX, Play, Pause, Square, Mic, ChevronRight, Activity, RotateCcw, Plus, X, Upload, CircleDot
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { useLanguage } from "../../context/LanguageContext";
import LiveTranslatedText from "../../components/LiveTranslatedText";
import { getApiBase } from "../data/api-config";

interface StoryCard {
  id: string;
  destinationName: string;
  title: string;
  category: string;
  folklore: string;
  origin: string;
  narrator: string;
  narratorRole: string;
  audioLength: string;
  biodiversityFocus: string;
  audioUrl?: string;
  audioNarrator?: string;
}

interface StorySubmitError {
  message?: string;
}

const mockStories: StoryCard[] = [
  {
    id: "chitrakote-story",
    destinationName: "Chitrakote Falls",
    title: "The Legend of the Indravati Descent",
    category: "Indigenous Folklore",
    folklore: "In ancient Bastar oral narratives, the Indravati River is represented as a majestic celestial mother. The local tribal elders narrate that in primordial times, during a severe drought that parched the plains, a sacred forest Myna flew to the heavens and pleaded with the rain spirits. The Indravati river was released from the crown of Lord Shiva. She descended in massive steps, creating Chitrakote, to provide life-giving water to the tribal children. The roaring mist rising from the gorge is believed to represent the spiritual breath of the ancestors protecting the valley.",
    origin: "Maria & Muria Tribal Lore",
    narrator: "Shri Somnath Nag",
    narratorRole: "Bastar Tribal Clan Elder",
    audioLength: "4 min 12 sec",
    biodiversityFocus: "River system protection & aquatic ecosystem preservation",
    audioUrl: "/audio/chitrakote_falls.mp3",
    audioNarrator: "Shri Somnath Nag"
  },
  {
    id: "sirpur-story",
    destinationName: "Sirpur Heritage Complex",
    title: "The Sacred Red Clay Architecture",
    category: "Ancient Chronicles",
    folklore: "Sirpur stood as a golden intersection of Buddhist, Hindu, and Jain learning in the 6th century. The Queen Mother Vasata, grieving the death of her king, resolved to build the Laxman Temple as a celestial monument. Local brick artisans worked with refined river silt mixed with resinous tree extracts, creating bricks that could withstand centuries without deteriorating. The mystical carvings depict deities holding local medicinal herbs, symbolizing the integration of cosmic healthcare and architectural systems.",
    origin: "Panduvanshi Royal Inscriptions",
    narrator: "Shrimati Rukmani Satnami",
    narratorRole: "Local Historical Archivist",
    audioLength: "5 min 45 sec",
    biodiversityFocus: "Preservation of ancient structural red clay formulations",
    audioUrl: "/audio/sirpur_monuments.mp3",
    audioNarrator: "Shrimati Rukmani Satnami"
  }
];

export default function StoriesPage() {
  const { token, isAuthenticated } = useAuthStore();
  const [activeStoryId, setActiveStoryId] = useState<string>("chitrakote-story");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const {
    speakText, stopSpeaking, isSpeaking,
    isPlayingAudio, audioProgress, audioDuration, audioNarrator,
    playAudioFile, pauseAudioFile, stopAudioFile,
    lang,
  } = useLanguage();
  const [stories, setStories] = useState<StoryCard[]>(mockStories);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    monument: "",
    location: "",
    description: "",
    audioNarrator: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrlPreview, setAudioUrlPreview] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const API = getApiBase();

  const fetchFolklore = async () => {
    try {
      const res = await fetch(`${API}/folklore`);
      const data = await res.json();
      if (res.ok && data.length > 0) {
        interface FolkloreItem { id: string; monument: string; title: string; description: string; location: string; author?: { fullName: string; role: string; }; audioUrl?: string; audioNarrator?: string; }
        const mapped = data.map((d: FolkloreItem) => ({
          id: d.id,
          destinationName: d.monument,
          title: d.title,
          category: "Community Contribution",
          folklore: d.description,
          origin: d.location,
          narrator: d.author?.fullName || "Citizen",
          narratorRole: d.author?.role || "Contributor",
          audioLength: d.audioUrl ? "Audio Playback" : "Reading",
          biodiversityFocus: "Cultural Heritage",
          audioUrl: d.audioUrl,
          audioNarrator: d.audioNarrator || d.author?.fullName || "Citizen",
        }));
        setStories([...mockStories, ...mapped]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchFolklore();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopAudioFile();
    };
  }, [stopSpeaking, stopAudioFile]);

  useEffect(() => {
    stopSpeaking();
    stopAudioFile();
  }, [activeStoryId, stopSpeaking, stopAudioFile]);

  const handlePlayToggle = () => {
    const story = stories.find(s => s.id === activeStoryId) || stories[0];
    if (story.audioUrl) {
      if (isPlayingAudio) {
        pauseAudioFile();
      } else {
        playAudioFile(story.audioUrl, story.audioNarrator || story.narrator);
      }
    } else {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speakText(`${story.title}. ${story.folklore}`);
      }
    }
  };

  const handleStop = () => {
    stopSpeaking();
    stopAudioFile();
  };

  const handleMuteToggle = () => setIsMuted(!isMuted);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  const activeStory = stories.find(s => s.id === activeStoryId) || stories[0];
  const isActivelyPlaying = activeStory.audioUrl ? isPlayingAudio : isSpeaking;

  // Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudio(audioBlob);
        setAudioUrlPreview(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record folklore.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRecordedAudio(file);
      setAudioUrlPreview(URL.createObjectURL(file));
    }
  };

  const resetAudio = () => {
    setRecordedAudio(null);
    if (audioUrlPreview) {
      URL.revokeObjectURL(audioUrlPreview);
      setAudioUrlPreview(null);
    }
  };

  const handleSubmitFolklore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    setSubmitting(true);
    try {
      let finalAudioUrl = "";
      
      // Upload Audio to Storage if provided
      if (recordedAudio) {
        const fileData = new FormData();
        fileData.append("file", recordedAudio, recordedAudio.type.includes("webm") ? "folklore_audio.webm" : "folklore_audio.mp3");
        
        const uploadRes = await fetch(`${API}/storage/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: fileData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalAudioUrl = uploadData.url;
        } else {
          throw new Error("Failed to upload audio recording.");
        }
      }

      // Submit Folklore Meta Data
      const res = await fetch(`${API}/folklore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          audioUrl: finalAudioUrl || undefined,
          audioNarrator: formData.audioNarrator || undefined,
        })
      });
      
      if (res.ok) {
        setSubmitMsg("Folklore oral history submitted successfully! Awaiting moderator verification.");
        setFormData({ title: "", monument: "", location: "", description: "", audioNarrator: "" });
        resetAudio();
        setTimeout(() => {
          setShowSubmitModal(false);
          setSubmitMsg("");
        }, 4000);
      } else {
        const err = await res.json() as StorySubmitError;
        setSubmitMsg(err.message || "Submission failed.");
      }
    } catch (e: unknown) {
      setSubmitMsg(e instanceof Error ? e.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-300 bg-purple-100/30 text-xs font-mono font-bold text-purple-700 w-fit uppercase">
            <Mic className="w-3.5 h-3.5" />
            Oral History & Folklore Archive
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-forest-emerald">
            Cultural Storytelling Console
          </h1>
          <p className="text-sm text-charcoal-stone/60 max-w-xl leading-relaxed">
            Listen to oral folklore legends, historical temple logs, and forest preservation mythologies. Authorized citizens can also submit regional stories to the sovereign registry.
          </p>
        </div>
        {isAuthenticated() && (
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="shrink-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Contribute Folklore
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Interactive Folklore List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
            Verified Archives ({stories.length})
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stories.map(story => {
              const isSelected = activeStoryId === story.id;
              return (
                <button
                  key={story.id}
                  onClick={() => {
                    setActiveStoryId(story.id);
                    stopSpeaking();
                  }}
                  className={`w-full text-left p-6 rounded-2xl transition-all cursor-pointer border flex flex-col gap-3 group ${
                    isSelected
                      ? "bg-white border-purple-600 shadow-lg shadow-purple-600/5"
                      : "bg-white/60 border-white/40 hover:bg-white/80 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-mono font-bold text-purple-600 uppercase bg-purple-100 px-2 py-0.5 rounded">
                      {story.category}
                    </span>
                    <span className="text-[9px] font-mono text-charcoal-stone/40">
                      {story.audioLength}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-base text-forest-emerald group-hover:text-purple-600 transition-colors">
                    {story.title}
                  </h3>

                  <span className="text-[10px] text-charcoal-stone/50 font-sans leading-tight">
                    Origin: <strong>{story.origin}</strong>
                  </span>

                  <p className="text-xs text-charcoal-stone/60 leading-relaxed line-clamp-3">
                    {story.folklore}
                  </p>

                  <div className="mt-auto pt-4 border-t border-charcoal-stone/10 flex items-center justify-between w-full">
                    <span className="text-[9px] font-mono text-tribal-terracotta uppercase">
                      BY: {story.narrator.split(" ").slice(-1)[0]}
                    </span>
                    <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                      Read/Play <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Embedded Cinematic Audio Ingestion Player */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col gap-6">
            {/* Player Header */}
            <div className="flex flex-col gap-1 pb-4 border-b border-charcoal-stone/10">
              <span className="text-[9px] font-mono text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                {isActivelyPlaying
                  ? <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  : <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                }
                {activeStory.audioUrl ? "Pre-Recorded Audio Guide" : "AI Voice Narration"}
              </span>
              <h3 className="font-sans font-bold text-lg text-forest-emerald leading-snug">
                {activeStory.title}
              </h3>
            </div>

            {/* Narrator Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                {(audioNarrator || activeStory.narrator).charAt(0)}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold text-charcoal-stone leading-tight">
                  {audioNarrator || activeStory.narrator}
                </span>
                <span className="text-[10px] font-mono text-purple-600">
                  {activeStory.narratorRole}
                  {activeStory.audioUrl && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-600/10 text-purple-700 font-bold">
                      🎙 Pre-Recorded
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Progress Bar — shows for physical audio files */}
            {activeStory.audioUrl && audioDuration > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-charcoal-stone/40">
                  <span>{formatTime(audioProgress)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>
            )}

            {/* Folklore Text */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Full Folk Legend Transcription</span>
              <div className="text-xs text-charcoal-stone/70 leading-relaxed bg-white/40 p-4 rounded-xl border border-white/30 h-44 overflow-y-auto font-sans">
                {activeStory.category === "Community Contribution" ? (
                  <LiveTranslatedText
                    text={activeStory.folklore}
                    className="whitespace-pre-wrap"
                    showBadge
                  />
                ) : (
                  <span className="whitespace-pre-wrap">{activeStory.folklore}</span>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-stone/10">
              <button
                onClick={handleStop}
                className="w-8 h-8 rounded-lg bg-charcoal-stone/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-charcoal-stone/60 transition-colors cursor-pointer"
                aria-label="Stop"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePlayToggle}
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md hover:scale-[1.05] transition-all cursor-pointer ${
                  isActivelyPlaying
                    ? "bg-purple-700 hover:bg-purple-800 shadow-purple-700/20"
                    : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                }`}
                aria-label={isActivelyPlaying ? "Pause" : "Play"}
              >
                {isActivelyPlaying
                  ? <Pause className="w-5 h-5 text-white" fill="white" />
                  : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                }
              </button>
              <button
                onClick={handleMuteToggle}
                className="w-8 h-8 rounded-lg bg-charcoal-stone/5 hover:bg-charcoal-stone/10 flex items-center justify-center text-charcoal-stone/60 transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-purple-600" />}
              </button>
            </div>

            {/* Live Status Indicator */}
            {isActivelyPlaying && (
              <div className="flex items-center justify-center gap-2 -mt-2 text-[10px] font-mono text-purple-600 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                {activeStory.audioUrl
                  ? (lang === "cg" ? "ऑडियो बजत हे..." : lang === "hi" ? "ऑडियो चल रहा है..." : "Playing Audio Guide...")
                  : (lang === "cg" ? "बोलत हे... / Reading Aloud" : lang === "hi" ? "पढ़कर सुनाया जा रहा है..." : "Reading Aloud...")
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-charcoal-stone/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sand-beige w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col relative max-h-[95vh]">
            <button onClick={() => setShowSubmitModal(false)} className="absolute top-4 right-4 p-2 text-charcoal-stone/50 hover:text-red-500 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 sm:p-8 overflow-y-auto w-full">
              <h2 className="text-2xl font-bold font-sans text-forest-emerald mb-2">Contribute Oral Folklore</h2>
              <p className="text-sm text-charcoal-stone/60 mb-6 font-mono">Preserve a local legend, story, or historical account in the sovereign registry. We highly recommend recording the folklore directly to retain the original dialect and cultural inflection.</p>
              
              {submitMsg && (
                <div className="mb-6 p-3 rounded-xl bg-purple-100 text-purple-800 text-sm font-bold text-center border border-purple-200">
                  {submitMsg}
                </div>
              )}

              <form onSubmit={handleSubmitFolklore} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Audio Recording Console */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white/80 border border-charcoal-stone/10 p-5 rounded-2xl flex flex-col gap-4 shadow-sm h-full">
                    <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-600 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" />
                        Oral Recording Console
                      </span>
                      {isRecording && <span className="text-[9px] font-mono text-red-600 font-bold uppercase animate-pulse flex items-center gap-1"><CircleDot className="w-3 h-3 fill-red-600" /> Live</span>}
                    </div>

                    {!audioUrlPreview ? (
                      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-6">
                        {isRecording ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all cursor-pointer animate-pulse"
                          >
                            <Square className="w-6 h-6 fill-white" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer"
                          >
                            <Mic className="w-6 h-6" />
                          </button>
                        )}
                        <span className="text-xs font-mono text-charcoal-stone/60">
                          {isRecording ? "Recording... Click to Stop" : "Click to Start Recording"}
                        </span>
                        
                        <div className="flex items-center gap-3 w-full max-w-[200px] mt-4">
                          <div className="h-[1px] bg-charcoal-stone/10 flex-1"></div>
                          <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">OR</span>
                          <div className="h-[1px] bg-charcoal-stone/10 flex-1"></div>
                        </div>

                        <label className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl border border-purple-200 cursor-pointer transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Audio File
                          <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1 gap-4 items-center justify-center py-4">
                        <div className="w-full bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col gap-3">
                          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">Audio Preview</span>
                          <audio src={audioUrlPreview} controls className="w-full h-10 outline-none" />
                        </div>
                        <button
                          type="button"
                          onClick={resetAudio}
                          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 px-4 py-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Discard & Re-record
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 mt-auto border-t border-charcoal-stone/10 pt-4">
                      <label className="text-[10px] font-mono font-bold uppercase text-charcoal-stone/60">Narrator Name (Optional)</label>
                      <input value={formData.audioNarrator} onChange={e => setFormData({...formData, audioNarrator: e.target.value})} className="px-4 py-2 rounded-xl border border-charcoal-stone/20 bg-white/50 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. Grandma Sita" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Metadata Form */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-charcoal-stone/60">Story Title</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white/50 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. The Legend of the Waterfall" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-charcoal-stone/60">Related Monument / Place</label>
                      <input required value={formData.monument} onChange={e => setFormData({...formData, monument: e.target.value})} className="px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white/50 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. Sirpur Temple" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-charcoal-stone/60">Location / District</label>
                      <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white/50 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. Bastar" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-charcoal-stone/60">Transcription / Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="px-4 py-2.5 rounded-xl border border-charcoal-stone/20 bg-white/50 text-sm focus:outline-none focus:border-purple-500 resize-none flex-1" placeholder="Write down the transcription or context of the folklore..." />
                  </div>

                  <button disabled={submitting} type="submit" className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                    {submitting ? "Transmitting payload & audio..." : "Submit to Moderation Queue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
