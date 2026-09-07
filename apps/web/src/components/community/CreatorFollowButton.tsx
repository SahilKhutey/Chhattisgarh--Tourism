"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/auth-store";
import { getApiBase } from "../../app/data/api-config";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";

interface CreatorFollowButtonProps {
  creatorId: string;
  initialFollowing?: boolean;
  className?: string;
  onFollowChange?: (following: boolean) => void;
}

export default function CreatorFollowButton({
  creatorId,
  initialFollowing = false,
  className = "",
  onFollowChange,
}: CreatorFollowButtonProps) {
  const { user, token } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!token || !creatorId) return;

    fetch(`${getApiBase()}/community/creators/${creatorId}/following`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setIsFollowing(Boolean(data.following));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [creatorId, token]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !user) {
      alert("Please log in to follow creators.");
      return;
    }

    setIsLoading(true);
    const previous = isFollowing;
    const next = !previous;
    setIsFollowing(next);

    try {
      const res = await fetch(`${getApiBase()}/community/creators/${creatorId}/follow`, {
        method: next ? "POST" : "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setIsFollowing(previous);
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Could not update follow status.");
      } else {
        onFollowChange?.(next);
      }
    } catch {
      setIsFollowing(previous);
      alert("Network error while following creator.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFollowing ? "Unfollow creator" : "Follow creator"}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
        isFollowing
          ? "bg-white/80 hover:bg-red-50 text-forest-emerald hover:text-red-600 border border-forest-emerald/30 hover:border-red-300"
          : "bg-forest-emerald hover:bg-[#0A2A3B] text-white hover:text-sand-beige"
      } ${isLoading ? "opacity-75 cursor-not-allowed" : ""} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
