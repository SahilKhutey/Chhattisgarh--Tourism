"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Camera,
  Video,
  Settings,
  BarChart2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Info,
  Lock,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { createCreatorPost } from "../data/api";
import { Star, Award, Zap } from "lucide-react";
import { getApiBase } from "../data/api-config";

interface CreatorIntegration {
  platform: "INSTAGRAM" | "YOUTUBE" | string;
  platformUserId?: string;
  syncTravelOnly?: boolean;
  autoApprove?: boolean;
  autoGenerateTags?: boolean;
}

interface CreatorIntegrationsResponse {
  integrations?: CreatorIntegration[];
}

interface CreatorProfileResponse {
  creatorProfile?: {
    tourismScore?: number;
    ecoSafeScore?: number;
    contentCount?: number;
  };
}

function CreatorOnboarding({ onComplete, API, token }: { onComplete: () => void, API: string, token: string }) {
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/users/creator-registry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bio, instagram, youtube })
      });
      if (!res.ok) throw new Error("Registration failed");
      onComplete();
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4 w-full bg-sand-beige">
      <div className="w-24 h-24 bg-forest-emerald/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
        <Camera className="w-12 h-12 text-forest-emerald" />
      </div>
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0A2A3B]">Become a Certified Creator</h2>
      <p className="text-charcoal-stone/70 max-w-lg mb-4 leading-relaxed text-lg">
        Join the Chhattisgarh Tourism Creators Network. Upload high-quality travel reels, showcase hidden gems, and earn exclusive rewards as you climb the Creator Tiers.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl text-left border border-charcoal-stone/10 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest-emerald to-purple-600"></div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-stone/60 mb-2 block">Your Creator Bio</label>
          <textarea required value={bio} onChange={e => setBio(e.target.value)} placeholder="I love exploring the tribal culture of Bastar..." className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none min-h-[100px] resize-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-stone/60 mb-2 block">Instagram Handle (Optional)</label>
          <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@your_handle" className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-stone/60 mb-2 block">YouTube Channel (Optional)</label>
          <input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="Channel Name" className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-forest-emerald hover:bg-forest-emerald/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50">
          {isSubmitting ? "Submitting Application..." : "Apply Now"}
        </button>
      </form>
    </div>
  );
}

export default function CreatorDashboard() {
  const { user, token, refreshToken, isAuthenticated, setAuth, logout } = useAuthStore();
  
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isYoutubeConnected, setIsYoutubeConnected] = useState(false);

  // Social Handles
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [instagramHandleInput, setInstagramHandleInput] = useState("");
  const [youtubeHandleInput, setYoutubeHandleInput] = useState("");
  
  // Settings
  const [syncTravelOnly, setSyncTravelOnly] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoGenerateTags, setAutoGenerateTags] = useState(true);

  // Native Publishing State
  const [nativePostTitle, setNativePostTitle] = useState("");
  const [nativePostLocation, setNativePostLocation] = useState("");
  const [nativePostDistrict, setNativePostDistrict] = useState("Bastar");
  const [nativePostCategory, setNativePostCategory] = useState("Waterfalls");
  const [nativePostFile, setNativePostFile] = useState<File | null>(null);
  const [nativePostPreview, setNativePostPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");

  // Gamification Scores
  const [creatorScores, setCreatorScores] = useState({ tourismScore: 0, ecoSafeScore: 0, contentCount: 0 });

  const API = getApiBase();

  // Fetch initial state from Backend
  useEffect(() => {
    if (!isAuthenticated() || !token) return;

    // Fetch integrations
    fetch(`${API}/integrations/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          // Token expired or invalid
          logout();
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch integrations");
        return res.json();
      })
      .then(data => {
        const typedData = data as CreatorIntegrationsResponse | null;
        if (typedData?.integrations) {
          const ig = typedData.integrations.find((i) => i.platform === 'INSTAGRAM');
          const yt = typedData.integrations.find((i) => i.platform === 'YOUTUBE');
          
          setIsInstagramConnected(!!ig);
          if (ig?.platformUserId) setInstagramHandle(ig.platformUserId);

          setIsYoutubeConnected(!!yt);
          if (yt?.platformUserId) setYoutubeHandle(yt.platformUserId);

          // We use the first integration's preferences for the dashboard toggles
          const pref = ig || yt;
          if (pref) {
            setSyncTravelOnly(pref.syncTravelOnly ?? true);
            setAutoApprove(pref.autoApprove ?? false);
            setAutoGenerateTags(pref.autoGenerateTags ?? true);
          }
        }
      })
      .catch(err => console.error("Failed to load integrations", err));

    // Fetch user profile for gamification scores
    if (user?.role === 'CREATOR' || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()).then((data: CreatorProfileResponse) => {
        if (data.creatorProfile) {
          setCreatorScores({
            tourismScore: data.creatorProfile.tourismScore || 150,
            ecoSafeScore: data.creatorProfile.ecoSafeScore || 50,
            contentCount: data.creatorProfile.contentCount || 2
          });
        }
      }).catch(err => console.error("Failed to load scores", err));
    }
  }, [isAuthenticated, token, API, user?.role, logout]);

  const togglePlatform = async (platform: string, currentState: boolean) => {
    const endpoint = currentState ? 'disconnect' : 'connect';
    let handleToUse = "";
    
    if (endpoint === 'connect') {
      if (platform === 'INSTAGRAM' && !instagramHandleInput) return alert("Please enter your Instagram handle");
      if (platform === 'YOUTUBE' && !youtubeHandleInput) return alert("Please enter your YouTube handle");
      handleToUse = platform === 'INSTAGRAM' ? instagramHandleInput : youtubeHandleInput;
    }

    // Optimistic UI update
    if (platform === 'INSTAGRAM') {
      setIsInstagramConnected(!currentState);
      if (!currentState) setInstagramHandle(handleToUse);
    }
    if (platform === 'YOUTUBE') {
      setIsYoutubeConnected(!currentState);
      if (!currentState) setYoutubeHandle(handleToUse);
    }

    try {
      const res = await fetch(`${API}/integrations/me/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ platform, handle: handleToUse })
      });
      
      if (!res.ok) throw new Error("Failed to connect");
      
      // Auto-provisioning UI update: if they were just a USER, update frontend auth state to reflect CREATOR role
      if (endpoint === 'connect' && user?.role === 'USER') {
        setAuth({ ...user, role: 'CREATOR' }, token as string, refreshToken as string);
      }
      
    } catch {
      console.error(`Failed to ${endpoint} ${platform}`);
      // Revert optimistic update
      if (platform === 'INSTAGRAM') setIsInstagramConnected(currentState);
      if (platform === 'YOUTUBE') setIsYoutubeConnected(currentState);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    // Optimistic UI update
    if (key === 'syncTravelOnly') setSyncTravelOnly(value);
    if (key === 'autoApprove') setAutoApprove(value);
    if (key === 'autoGenerateTags') setAutoGenerateTags(value);

    try {
      const res = await fetch(`${API}/integrations/me/preferences`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      console.error(`Failed to update ${key}`);
      // Revert optimistic update
      if (key === 'syncTravelOnly') setSyncTravelOnly(!value);
      if (key === 'autoApprove') setAutoApprove(!value);
      if (key === 'autoGenerateTags') setAutoGenerateTags(!value);
    }
  };

  const manualSync = async () => {
    try {
      // In production, we'd pass token if the endpoint was protected. Currently aggregation sync-all is a public global trigger.
      const res = await fetch(`${API}/aggregation/sync-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      alert(`Sync Complete! Processed: ${data.result.totalProcessed}, Approved: ${data.result.totalApproved}`);
    } catch {
      alert("Failed to run sync. Ensure backend is running.");
    }
  };

  const handleNativePostUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nativePostFile || !nativePostTitle || !nativePostLocation) return alert("Please fill required fields and upload media.");
    setIsPublishing(true);
    setPublishStatus("");

    try {
      // 1. Upload File
      const fileData = new FormData();
      fileData.append("file", nativePostFile);
      const uploadRes = await fetch(`${API}/storage/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fileData
      });
      if (!uploadRes.ok) throw new Error("File upload failed");
      const uploadData = await uploadRes.json();
      
      const isVideo = nativePostFile.type.includes("video");
      
      // 2. Create Post
      await createCreatorPost(token as string, {
        title: nativePostTitle,
        location: nativePostLocation,
        district: nativePostDistrict,
        category: nativePostCategory,
        thumbnailUrl: isVideo ? "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG" : uploadData.url,
        videoUrl: isVideo ? uploadData.url : null
      });

      setPublishStatus("Post published successfully!");
      setNativePostTitle("");
      setNativePostLocation("");
      setNativePostFile(null);
      if (nativePostPreview) URL.revokeObjectURL(nativePostPreview);
      setNativePostPreview(null);
      setTimeout(() => setPublishStatus(""), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Publishing failed.";
      setPublishStatus(`Error: ${message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNativePostFile(file);
      setNativePostPreview(URL.createObjectURL(file));
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 w-full">
        <Lock className="w-16 h-16 text-purple-600 mb-4" />
        <h2 className="text-3xl font-serif font-bold text-forest-emerald">Creator Studio Access</h2>
        <p className="text-charcoal-stone/70 max-w-md">
          You must be logged in to connect your social platforms and sync your travel content with the Chhattisgarh Tourism Engine.
        </p>
        <Link href="/login" className="bg-[#0A2A3B] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0A2A3B]/90 transition-all mt-4">
          Log In to Continue
        </Link>
      </div>
    );
  }

  if (user?.role === 'TRAVELER' || user?.role === 'USER') {
    return (
      <CreatorOnboarding 
        onComplete={() => setAuth({ ...user, role: 'CREATOR' }, token as string, refreshToken as string)} 
        API={API} 
        token={token as string} 
      />
    );
  }

  const isGold = creatorScores.tourismScore >= 500;
  const isSilver = creatorScores.tourismScore >= 200 && !isGold;
  const nextTierPoints = isGold ? 1000 : (isSilver ? 500 : 200);
  const progressPercent = Math.min(100, Math.max(0, (creatorScores.tourismScore / nextTierPoints) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-[#0A2A3B] bg-sand-beige min-h-[85vh] font-sans">
      
      {/* Dashboard Header */}
      <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6">
        <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
          Creator Ecosystem
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-emerald flex items-center gap-3">
          <Settings className="w-8 h-8 text-tribal-terracotta" />
          Integration Dashboard
        </h1>
        <p className="text-sm text-charcoal-stone/70 leading-relaxed max-w-2xl font-medium mt-2">
          Hello, {user?.fullName}! Connect your social accounts to automatically sync your content with the Chhattisgarh Tourism Engine. Your videos will be converted into interactive tourism guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Integrations & Settings */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Native Publishing */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-charcoal-stone/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest-emerald to-purple-600"></div>
            <h2 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-forest-emerald" /> Native Publishing
            </h2>
            <p className="text-sm text-charcoal-stone/60 mb-6">Upload high-quality photo stories or video reels directly to the Chhattisgarh Tourism feed.</p>
            
            {publishStatus && (
              <div className="mb-6 p-3 rounded-xl bg-forest-emerald/10 text-forest-emerald text-sm font-bold text-center border border-forest-emerald/20">
                {publishStatus}
              </div>
            )}

            <form onSubmit={handleNativePostUpload} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-4">
                  <input 
                    required 
                    value={nativePostTitle} 
                    onChange={e => setNativePostTitle(e.target.value)} 
                    placeholder="Story or Post Title" 
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none"
                  />
                  <div className="flex gap-4">
                    <input 
                      required 
                      value={nativePostLocation} 
                      onChange={e => setNativePostLocation(e.target.value)} 
                      placeholder="Specific Location" 
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none"
                    />
                    <select 
                      value={nativePostDistrict} 
                      onChange={e => setNativePostDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none bg-white"
                    >
                      {["Bastar", "Jagdalpur", "Raipur", "Bilaspur", "Dantewada"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <select 
                    value={nativePostCategory} 
                    onChange={e => setNativePostCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/20 text-sm focus:border-forest-emerald outline-none bg-white"
                  >
                    {["Waterfalls", "Tribal Culture", "Adventure", "Heritage", "Food"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="w-full md:w-1/3 min-h-[160px] border-2 border-dashed border-charcoal-stone/20 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-sand-beige/30 hover:bg-sand-beige/50 transition-colors group">
                  {nativePostPreview ? (
                    nativePostFile?.type.includes("video") ? (
                      <video src={nativePostPreview} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={nativePostPreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    )
                  ) : (
                    <div className="flex flex-col items-center text-charcoal-stone/40 group-hover:text-forest-emerald transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">Add Media</span>
                    </div>
                  )}
                  <input type="file" accept="image/*,video/*" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPublishing}
                className="w-full bg-[#0A2A3B] hover:bg-[#0A2A3B]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isPublishing ? "Uploading & Publishing..." : "Publish Post"}
              </button>
            </form>
          </div>

          {/* Social Platforms */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-charcoal-stone/10">
            <h2 className="text-xl font-serif font-bold mb-6">Connected Platforms</h2>
            
            <div className="flex flex-col gap-4">
              {/* Instagram */}
              <div className="flex items-center justify-between p-4 border border-charcoal-stone/10 rounded-2xl bg-sand-beige/30 transition-colors hover:bg-sand-beige/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isInstagramConnected ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white' : 'bg-charcoal-stone/10 text-charcoal-stone/40'}`}>
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Instagram</h3>
                    <p className="text-xs text-charcoal-stone/60 font-medium">
                      {isInstagramConnected ? `Connected as ${instagramHandle}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                {!isInstagramConnected ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="@handle" 
                      className="px-3 py-1.5 text-sm rounded-lg border border-charcoal-stone/20 outline-none focus:border-forest-emerald w-32"
                      value={instagramHandleInput}
                      onChange={e => setInstagramHandleInput(e.target.value)}
                    />
                    <button 
                      onClick={() => togglePlatform('INSTAGRAM', false)}
                      className="px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm bg-[#0A2A3B] text-white hover:bg-[#0A2A3B]/90"
                    >
                      Connect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => togglePlatform('INSTAGRAM', true)}
                    className="px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm bg-white text-red-500 border border-red-200 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {/* YouTube */}
              <div className="flex items-center justify-between p-4 border border-charcoal-stone/10 rounded-2xl bg-sand-beige/30 transition-colors hover:bg-sand-beige/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isYoutubeConnected ? 'bg-red-600 text-white' : 'bg-charcoal-stone/10 text-charcoal-stone/40'}`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">YouTube</h3>
                    <p className="text-xs text-charcoal-stone/60 font-medium">
                      {isYoutubeConnected ? `Connected as ${youtubeHandle}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                {!isYoutubeConnected ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Channel ID" 
                      className="px-3 py-1.5 text-sm rounded-lg border border-charcoal-stone/20 outline-none focus:border-forest-emerald w-32"
                      value={youtubeHandleInput}
                      onChange={e => setYoutubeHandleInput(e.target.value)}
                    />
                    <button 
                      onClick={() => togglePlatform('YOUTUBE', false)}
                      className="px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm bg-[#0A2A3B] text-white hover:bg-[#0A2A3B]/90"
                    >
                      Connect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => togglePlatform('YOUTUBE', true)}
                    className="px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm bg-white text-red-500 border border-red-200 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sync Preferences */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-charcoal-stone/10">
            <h2 className="text-xl font-serif font-bold mb-2">Sync Preferences</h2>
            <p className="text-sm text-charcoal-stone/60 mb-6">Control how your content is processed by our AI Tourism Engine.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0A2A3B]">Sync Travel Content Only</h4>
                  <p className="text-xs text-charcoal-stone/60 max-w-[250px]">AI will filter out personal posts, memes, and non-tourism content.</p>
                </div>
                <button onClick={() => updatePreference('syncTravelOnly', !syncTravelOnly)}>
                  {syncTravelOnly ? <ToggleRight className="w-10 h-10 text-forest-emerald" /> : <ToggleLeft className="w-10 h-10 text-charcoal-stone/30" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0A2A3B]">Auto-Approve for Feed</h4>
                  <p className="text-xs text-charcoal-stone/60 max-w-[250px]">Publish detected tourism content automatically without manual review.</p>
                </div>
                <button onClick={() => updatePreference('autoApprove', !autoApprove)}>
                  {autoApprove ? <ToggleRight className="w-10 h-10 text-forest-emerald" /> : <ToggleLeft className="w-10 h-10 text-charcoal-stone/30" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0A2A3B]">Auto-Generate Tourism Tags</h4>
                  <p className="text-xs text-charcoal-stone/60 max-w-[250px]">Let AI automatically tag the district, best season, and category.</p>
                </div>
                <button onClick={() => updatePreference('autoGenerateTags', !autoGenerateTags)}>
                  {autoGenerateTags ? <ToggleRight className="w-10 h-10 text-forest-emerald" /> : <ToggleLeft className="w-10 h-10 text-charcoal-stone/30" />}
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-900">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-xs leading-relaxed font-medium">
                Our system fetches new content every hour. Content marked as &quot;Tourism Related&quot; by our AI will appear in your moderation queue or be published directly based on your settings.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Status */}
        <div className="flex flex-col gap-8">
          
          <div className="bg-gradient-to-br from-[#0A2A3B] to-forest-emerald p-6 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6 flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" /> Tourism Impact
            </h2>
            
            <div className="space-y-6 relative z-10">
              <div>
                <span className="text-white/60 text-xs font-bold uppercase">Estimated Reach</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black">124K</span>
                  <span className="text-sm text-green-300 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> 12%</span>
                </div>
              </div>
              
              <div>
                <span className="text-white/60 text-xs font-bold uppercase">Trip Conversions</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black">8,402</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">People Saved Routes</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <span className="text-white/60 text-xs font-bold uppercase block mb-3">Top District</span>
                <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-tribal-terracotta flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Bastar</h4>
                    <p className="text-[10px] text-white/60">14 Active Integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-charcoal-stone/10">
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center justify-between">
              Sync Status
              <button onClick={manualSync} className="p-1.5 hover:bg-sand-beige rounded-full transition-colors text-charcoal-stone/50 hover:text-forest-emerald" title="Trigger Manual Sync">
                <RefreshCw className="w-4 h-4" />
              </button>
            </h2>
            
            {isInstagramConnected || isYoutubeConnected ? (
              <div className="space-y-4">
                {isInstagramConnected && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">Instagram Active</h4>
                      <p className="text-xs text-charcoal-stone/60">Ready to sync. Click the refresh icon above to pull latest content manually.</p>
                    </div>
                  </div>
                )}
                {isYoutubeConnected && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">YouTube Active</h4>
                      <p className="text-xs text-charcoal-stone/60">Ready to sync. Click the refresh icon above to pull latest content manually.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-sand-beige flex items-center justify-center mx-auto mb-3">
                  <Info className="w-6 h-6 text-charcoal-stone/40" />
                </div>
                <p className="text-sm font-bold text-charcoal-stone/60">No platforms connected.</p>
                <p className="text-xs text-charcoal-stone/40 mt-1">Connect a platform to see sync status.</p>
              </div>
            )}
          </div>

          {/* Gamification & Retention Block */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-tribal-terracotta/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tribal-terracotta/5 rounded-full blur-3xl" />
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-tribal-terracotta" /> Creator Rewards
            </h2>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-charcoal-stone uppercase tracking-wider">Current Tier</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-md">
                {isGold ? 'Gold' : isSilver ? 'Silver' : 'Bronze'} Creator
              </span>
            </div>

            <div className="w-full bg-sand-beige h-3 rounded-full overflow-hidden mb-2 shadow-inner">
              <div className="h-full bg-gradient-to-r from-tribal-terracotta to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
            
            <p className="text-xs text-charcoal-stone/60 mb-6 flex justify-between font-mono">
              <span>{creatorScores.tourismScore} pts</span>
              <span>Next Tier: {nextTierPoints} pts</span>
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-forest-emerald/5 rounded-xl border border-forest-emerald/10">
                <Star className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5 fill-forest-emerald" />
                <div>
                  <h4 className="text-sm font-bold text-[#0A2A3B]">Eco-Safe Score: {creatorScores.ecoSafeScore}</h4>
                  <p className="text-[11px] text-charcoal-stone/70">Points awarded for promoting sustainable and eco-friendly tourism practices.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-600/5 rounded-xl border border-purple-600/10">
                <Zap className="w-5 h-5 text-purple-600 shrink-0 mt-0.5 fill-purple-600" />
                <div>
                  <h4 className="text-sm font-bold text-[#0A2A3B]">Boost Your Tier</h4>
                  <p className="text-[11px] text-charcoal-stone/70">
                    Earn <span className="font-bold">+50 pts</span> per native Reel upload.<br/>
                    Earn <span className="font-bold">+20 pts</span> for tagging Eco-Destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

