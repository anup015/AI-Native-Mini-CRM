"use client";

import { QueryClient } from "@tanstack/react-query";

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  });
}
