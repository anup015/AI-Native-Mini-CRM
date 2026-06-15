"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { CustomerAnalyticsResponse, CustomerDetail, CustomerFilterOptions, CustomerListResponse } from "@/types/customer";

export type CustomerListParams = {
  page?: number;
  limit?: number;
  q?: string;
  city?: string;
  gender?: string;
  preferredChannel?: string;
  tag?: string;
  minSpend?: number;
  maxSpend?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

function queryString(params: CustomerListParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export function useCustomers(params: CustomerListParams) {
  const query = queryString(params);

  return useQuery({
    queryKey: ["customers", query],
    queryFn: () => apiClient<CustomerListResponse>(`/api/customers?${query}`)
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => apiClient<CustomerDetail>(`/api/customers/${id}`),
    enabled: !!id
  });
}

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer-analytics"],
    queryFn: () => apiClient<CustomerAnalyticsResponse>("/api/customers/analytics")
  });
}

export function useCustomerFilterOptions() {
  return useQuery({
    queryKey: ["customer-filter-options"],
    queryFn: () => apiClient<CustomerFilterOptions>("/api/customers/filter-options"),
    staleTime: 1000 * 60 * 10
  });
}
