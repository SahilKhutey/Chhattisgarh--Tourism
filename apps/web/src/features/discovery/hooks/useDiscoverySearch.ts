"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchPlaces,
  fetchSearchSuggestions,
  DiscoveryPlace,
  SearchSuggestion,
} from '../api/discovery-api';

export function useDiscoverySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [zone, setZone] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [results, setResults] = useState<DiscoveryPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const suggestionsTimer = useRef<NodeJS.Timeout | null>(null);

  // Suggestions fetcher
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (suggestionsTimer.current) {
      clearTimeout(suggestionsTimer.current);
    }

    suggestionsTimer.current = setTimeout(async () => {
      try {
        const items = await fetchSearchSuggestions(query, 6);
        setSuggestions(items);
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => {
      if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current);
    };
  }, [query]);

  // Main search fetcher
  const executeSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchPlaces({
        q: query.trim() || undefined,
        district: district || undefined,
        category: category || undefined,
        zone: zone || undefined,
        limit,
        offset: (page - 1) * limit,
      });

      setResults(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to search places. Please try again.');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, district, category, zone, page, limit]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      executeSearch();
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [executeSearch]);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
  };

  return {
    query,
    setQuery,
    district,
    setDistrict,
    category,
    setCategory,
    zone,
    setZone,
    page,
    setPage,
    results,
    total,
    loading,
    error,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    executeSearch,
  };
}
