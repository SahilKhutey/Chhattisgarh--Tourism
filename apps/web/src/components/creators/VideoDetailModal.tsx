"use client";

import React, { useState, useEffect } from "react";
import Image from "@/components/ui/NativeImage";
import { X, Heart, MessageCircle, Bookmark, Share2, MapPin, Compass, ShieldCheck, Play } from "lucide-react";
import { 
  CreatorVideo, Creator,
  authenticateTestUser, fetchComments, postComment,
  fetchPolls, voteOnPoll, saveTrip, unsaveTrip, fetchSavedTrips
} from "../../app/data/api";
import CreatorFollowButton from "../community/CreatorFollowButton";
import ReportContentButton from "../community/ReportContentButton";

interface VideoDetailModalProps {
  video: CreatorVideo;
  creator: Creator;
  onClose: () => void;
}

interface VideoComment {
  id: string;
  text: string;
  user?: {
    fullName?: string;
    avatar?: string;
  };
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface VideoPoll {
  id: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
}

interface SavedTripSummary {
  id: string;
}

export default function VideoDetailModal({ video, creator, onClose }: VideoDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "plan">("comments");
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [token, setToken] = useState("");
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [polls, setPolls] = useState<VideoPoll[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    authenticateTestUser().then(t => {
      if (t) {
        setToken(t);
        fetchSavedTrips(t).then((trips: SavedTripSummary[]) => {
          if (trips.some(trip => trip.id === video.id)) {
            setIsSaved(true);
          }
        });
      }
    });

    fetchComments(video.id).then(setComments);
    fetchPolls(video.id).then(setPolls);
  }, [video.id]);

  const handlePostComment = async () => {
    if (!commentText.trim() || !token) return;
    try {
      const newComment = await postComment(video.id, commentText, token);
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!token) return;
    try {
      await voteOnPoll(pollId, optionId, token);
      const updatedPolls = await fetchPolls(video.id);
      setPolls(updatedPolls);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSave = async () => {
    if (!token) return;
    try {
      if (isSaved) {
        await unsaveTrip(video.id, token);
        setIsSaved(false);
      } else {
        await saveTrip(video.id, token);
        setIsSaved(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="w-full max-w-6xl h-[90vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 md:left-auto md:right-4 z-50 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player Section */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-black relative flex items-center justify-center">
           {video.videoUrl ? (
             <video 
               src={video.videoUrl} 
               autoPlay 
               controls
               loop 
               className="w-full h-full object-contain"
             />
           ) : (
             <div className="relative w-full h-full">
               <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <Play className="w-10 h-10 text-white fill-white ml-2" />
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Interaction Sidebar */}
        <div className="w-full md:w-[40%] h-[50vh] md:h-full bg-sand-beige overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-charcoal-stone/10">
            <div className="flex items-center gap-3 mb-4">
              <Image src={creator.avatarUrl} alt={creator.name} width={48} height={48} className="rounded-full border-2 border-forest-emerald/30" />
              <div>
                <h3 className="font-bold text-charcoal-stone flex items-center gap-1">
                  {creator.name}
                  {creator.verificationBadges.includes("BLUE") && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                </h3>
                <p className="text-xs text-charcoal-stone/60">{video.location} • {video.views} views</p>
              </div>
              <CreatorFollowButton creatorId={creator.id} className="ml-auto" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#0A2A3B] leading-tight mb-2">
              {video.title}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-tribal-terracotta/10 text-tribal-terracotta px-2 py-1 rounded-md font-bold uppercase tracking-wider">{video.category}</span>
              <span className="text-xs bg-forest-emerald/10 text-forest-emerald px-2 py-1 rounded-md font-bold tracking-wider">{video.language}</span>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-charcoal-stone/10 pt-4">
              <div className="flex gap-4 items-center">
                <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-2 text-charcoal-stone hover:text-tribal-terracotta transition-colors">
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-tribal-terracotta text-tribal-terracotta' : ''}`} />
                  <span className="text-sm font-bold">12.4k</span>
                </button>
                <button className="flex items-center gap-2 text-charcoal-stone hover:text-forest-emerald transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-bold">342</span>
                </button>
                <button className="flex items-center gap-2 text-charcoal-stone hover:text-blue-500 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
                <ReportContentButton targetType="VIDEO" targetId={video.id} variant="icon" />
              </div>
              <button onClick={handleToggleSave} className="flex items-center gap-2 text-charcoal-stone hover:text-forest-emerald transition-colors">
                 <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-forest-emerald text-forest-emerald' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-charcoal-stone/10">
            <button 
              onClick={() => setActiveTab("comments")}
              className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'comments' ? 'border-b-2 border-forest-emerald text-forest-emerald' : 'text-charcoal-stone/60'}`}
            >
              Comments
            </button>
            <button 
              onClick={() => setActiveTab("plan")}
              className={`flex-1 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 ${activeTab === 'plan' ? 'border-b-2 border-tribal-terracotta text-tribal-terracotta' : 'text-charcoal-stone/60'}`}
            >
              <Compass className="w-4 h-4" /> Plan Your Trip
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "comments" ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.user?.avatar ? (
                       <Image src={comment.user.avatar} alt={comment.user.fullName ?? "User"} width={32} height={32} className="rounded-full shrink-0 object-cover" />
                    ) : (
                       <div className="w-8 h-8 rounded-full bg-charcoal-stone/20 shrink-0" />
                    )}
                    <div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <p className="text-xs font-bold text-charcoal-stone mb-1">{comment.user?.fullName || "User"}</p>
                        <p className="text-sm text-charcoal-stone">{comment.text}</p>
                      </div>
                      <div className="flex gap-4 items-center mt-1 ml-2">
                        <button className="text-xs font-bold text-charcoal-stone/60 hover:text-forest-emerald">Reply</button>
                        <button className="text-xs font-bold text-charcoal-stone/60 hover:text-tribal-terracotta">Like</button>
                        <ReportContentButton targetType="COMMENT" targetId={comment.id} variant="icon" className="!p-0 text-charcoal-stone/40 hover:text-red-600" />
                      </div>
                    </div>
                  </div>
                ))}

                {polls.map((poll) => (
                  <div key={poll.id} className="mt-8 bg-white rounded-2xl p-4 border border-charcoal-stone/10 shadow-sm">
                    <h4 className="font-bold text-charcoal-stone mb-3 text-sm">{poll.question}</h4>
                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        return (
                          <button 
                            key={opt.id}
                            onClick={() => handleVote(poll.id, opt.id)}
                            className="w-full text-left px-4 py-2 rounded-xl bg-sand-beige hover:bg-forest-emerald/10 border border-charcoal-stone/10 transition-colors text-sm text-charcoal-stone flex justify-between"
                          >
                            {opt.text} <span>{percent}%</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-charcoal-stone/50 mt-3 text-right">{poll.totalVotes} votes</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-charcoal-stone/10 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-forest-emerald/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-forest-emerald" />
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal-stone">Location & Route</h4>
                    <p className="text-sm text-charcoal-stone/70 mb-2">{video.district}, 45km from City Center.</p>
                    <button className="text-sm font-bold text-forest-emerald hover:underline">Open in Maps</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-charcoal-stone/10 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-tribal-terracotta/10 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-tribal-terracotta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal-stone">Best Time to Visit</h4>
                    <p className="text-sm text-charcoal-stone/70 mb-2">Monsoon & Post-Monsoon (July to October)</p>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Current Status: Open</span>
                  </div>
                </div>

                <button 
                  onClick={handleToggleSave}
                  className={`w-full font-bold py-3.5 rounded-xl mt-4 transition-colors shadow-lg ${isSaved ? 'bg-forest-emerald text-white hover:bg-forest-emerald/90' : 'bg-[#0A2A3B] text-white hover:bg-[#0A2A3B]/90'}`}
                >
                  {isSaved ? 'Saved to Itinerary' : 'Save to My Itinerary'}
                </button>
                <button className="w-full bg-white text-[#0A2A3B] border border-charcoal-stone/20 font-bold py-3.5 rounded-xl mt-2 hover:bg-sand-beige transition-colors">
                  Find Nearby Hotels
                </button>
              </div>
            )}
          </div>

          {/* Comment Input */}
          {activeTab === "comments" && (
            <div className="p-4 bg-white border-t border-charcoal-stone/10">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  placeholder="Add a comment..." 
                  className="flex-1 bg-sand-beige rounded-full px-4 py-2.5 text-sm outline-none border border-transparent focus:border-forest-emerald/50"
                />
                <button 
                  onClick={handlePostComment}
                  className="w-10 h-10 rounded-full bg-forest-emerald text-white flex items-center justify-center font-bold"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

