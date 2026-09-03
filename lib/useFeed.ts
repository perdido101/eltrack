"use client";
import useSWR from "swr";
import type { Ok, Result } from "@/lib/result";

class FeedError extends Error {
  lastGoodAt?: string;
}

async function fetcher<T>(url: string): Promise<Ok<T>> {
  const res = await fetch(url);
  const body = (await res.json()) as Result<T>;
  if (!body.ok) {
    const err = new FeedError(body.error);
    err.lastGoodAt = body.lastGoodAt;
    throw err;
  }
  return body;
}

export type Feed<T> = {
  data: T | undefined;
  fetchedAt: string | undefined;
  /** Set when the most recent fetch failed; `data` may still hold the last good value. */
  error: string | undefined;
  lastGoodAt: string | undefined;
  isLoading: boolean;
};

/** SWR wrapper: polls `/api/<path>` on `refreshMs`, keeps the last good payload on failure. */
export function useFeed<T>(path: string, refreshMs: number): Feed<T> {
  const { data, error } = useSWR<Ok<T>, FeedError>(`/api/${path}`, fetcher<T>, {
    refreshInterval: refreshMs,
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 10_000,
  });
  return {
    data: data?.data,
    fetchedAt: data?.fetchedAt,
    error: error?.message,
    lastGoodAt: error?.lastGoodAt ?? data?.fetchedAt,
    isLoading: !data && !error,
  };
}
