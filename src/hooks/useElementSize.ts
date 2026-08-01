import { useCallback, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const ref = useCallback((element: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!element) return;

    const updateSize = (width: number, height: number) => {
      setSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    };

    const bounds = element.getBoundingClientRect();
    updateSize(bounds.width, bounds.height);

    observerRef.current = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });
    observerRef.current.observe(element);
  }, []);

  return [ref, size] as const;
}
