"use client";

import React from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  type: "morning" | "afternoon" | "sunset" | "nightlife";
}

interface StoryTimelineProps {
  events: TimelineEvent[];
}

export default function StoryTimeline({ events }: StoryTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "morning": return <Sunrise className="w-5 h-5 text-orange-400" />;
      case "afternoon": return <Sun className="w-5 h-5 text-yellow-500" />;
      case "sunset": return <Sunset className="w-5 h-5 text-tribal-terracotta" />;
      case "nightlife": return <Moon className="w-5 h-5 text-indigo-400" />;
      default: return <Sun className="w-5 h-5 text-forest-emerald" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-charcoal-stone/10">
      <h3 className="text-xl font-serif font-bold text-[#0A2A3B] mb-6">Suggested Itinerary</h3>
      <div className="relative border-l-2 border-charcoal-stone/10 ml-3 md:ml-4 space-y-8">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6 md:pl-8">
            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-sand-beige border-2 border-white flex items-center justify-center shadow-md">
              {getIcon(event.type)}
            </div>
            <div>
              <span className="text-xs font-bold text-forest-emerald uppercase tracking-wider">{event.time}</span>
              <h4 className="text-lg font-bold text-[#0A2A3B] mt-1">{event.title}</h4>
              <p className="text-sm text-charcoal-stone/70 mt-2 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
