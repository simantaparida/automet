import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

/**
 * Custom hook to sync filter state with URL query parameters
 * Allows filters to be bookmarkable and shareable
 *
 * @param defaults - Default values for filters
 * @returns [filters, setFilters] - Current filter values and setter function
 */
export function useURLFilters<T extends Record<string, string>>(
  defaults: T
): [T, (filters: Partial<T>) => void] {
  const router = useRouter();

  // Initialize from URL params or defaults
  const [filters, setFiltersState] = useState<T>(() => {
    const initial = { ...defaults };

    // Only initialize from URL on client side
    if (typeof window !== 'undefined') {
      Object.keys(defaults).forEach((key) => {
        if (router.query[key] && typeof router.query[key] === 'string') {
          (initial as any)[key] = router.query[key];
        }
      });
    }

    return initial;
  });

  // Sync filters to URL whenever they change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      // Only add to URL if different from default
      if (value && value !== defaults[key as keyof T]) {
        params.set(key, value as string);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString
      ? `${router.pathname}?${queryString}`
      : router.pathname;

    // Only update if URL actually changed (avoid infinite loops)
    const currentUrl = router.asPath;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [filters, router.pathname]);

  // Update filters (merge with existing state)
  const setFilters = (newFilters: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  return [filters, setFilters];
}
