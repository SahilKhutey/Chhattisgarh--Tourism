"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export const LanguageSwitcher: React.FC = () => {
  const { lang, changeLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded ${lang === "en" ? "bg-forest-emerald text-white" : "bg-gray-200"}`}
      >
        English
      </button>
      <button 
        onClick={() => changeLanguage("hi")}
        className={`px-3 py-1 rounded ${lang === "hi" ? "bg-forest-emerald text-white" : "bg-gray-200"}`}
      >
        हिन्दी
      </button>
      <button 
        onClick={() => changeLanguage("cg")}
        className={`px-3 py-1 rounded ${lang === "cg" ? "bg-forest-emerald text-white" : "bg-gray-200"}`}
      >
        छत्तीसगढ़ी
      </button>
    </div>
  );
};
