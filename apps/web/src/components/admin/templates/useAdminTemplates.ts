"use client";

import { useCallback, useEffect, useState } from "react";
import { listAdminTemplates } from "@/lib/api/admin-templates";
import type { AdminTemplateListResponse } from "@/types/admin-template";

export interface UseAdminTemplatesParams {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
}

const DEFAULT_DATA: AdminTemplateListResponse = {
  items: [],
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0,
  draft_count: 0,
  published_count: 0,
  archived_count: 0,
};

export function useAdminTemplates(params: UseAdminTemplatesParams) {
  const [data, setData] = useState<AdminTemplateListResponse>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await listAdminTemplates({
        ...params,
        page_size: 20,
      });
      setData(response);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [params.search, params.status, params.category, params.page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData,
  };
}
