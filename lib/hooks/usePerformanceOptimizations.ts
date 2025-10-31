/**
 * Performance Optimization Hooks for Location Components
 *
 * Provides debouncing, virtualization, and rendering optimizations
 * for large location lists and frequent user interactions.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Debounce hook to limit frequent function calls
 * Useful for search inputs, API calls, and expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Optimized search hook with debouncing and filtering
 */
export function useOptimizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects like location.names.en
          return Object.values(value).some(
            (nestedValue) =>
              typeof nestedValue === 'string' && nestedValue.toLowerCase().includes(searchLower)
          );
        }
        return false;
      })
    );
  }, [items, debouncedSearchTerm, searchFields]);

  return {
    filteredItems,
    debouncedSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}

/**
 * Virtual scrolling hook for large lists
 * Only renders visible items to improve performance
 */
interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number; // Number of extra items to render above/below visible area
}

export function useVirtualScroll<T>(items: T[], options: UseVirtualScrollOptions) {
  const { itemHeight, containerHeight, bufferSize = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 2 * bufferSize);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex + 1),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
  };
}

/**
 * Performance monitor hook for debugging render performance
 */
export function usePerformanceMonitor(componentName: string, dependencyCount?: number) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${componentName}] Render #${renderCount.current}, ${timeSinceLastRender}ms since last render`
      );
    }
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && dependencyCount !== undefined) {
      console.log(`[${componentName}] Dependencies changed, count: ${dependencyCount}`);
    }
  }, [componentName, dependencyCount]);

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Optimized selection state hook with batching
 * Reduces re-renders when multiple selections change
 */
export function useBatchedSelection<T extends { id: string }>(
  items: T[],
  onSelectionChange?: (selectedIds: string[]) => void
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedOnSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        onSelectionChange?.(Array.from(newSelectedIds));
      }, 100); // 100ms batching delay
    },
    [onSelectionChange]
  );

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        debouncedOnSelectionChange(newSet);
        return newSet;
      });
    },
    [debouncedOnSelectionChange]
  );

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map((item) => item.id));
    setSelectedIds(allIds);
    debouncedOnSelectionChange(allIds);
  }, [items, debouncedOnSelectionChange]);

  const deselectAll = useCallback(() => {
    const emptySet = new Set<string>();
    setSelectedIds(emptySet);
    debouncedOnSelectionChange(emptySet);
  }, [debouncedOnSelectionChange]);

  const batchToggle = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => {
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
        });
        debouncedOnSelectionChange(newSet);
        return newSet;
      });
    },
    [debouncedOnSelectionChange]
  );

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    batchToggle,
    selectedCount: selectedIds.size,
  };
}

/**
 * Intersection Observer hook for lazy loading
 * Great for loading images or expanding sections only when visible
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, hasBeenVisible, options]);

  return { isVisible, hasBeenVisible };
}
