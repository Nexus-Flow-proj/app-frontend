import { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import type { CalendarColorScheme } from "../types";

function getSystemColorScheme(): CalendarColorScheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useCalendarColorScheme(): CalendarColorScheme {
  const { theme } = useTheme();
  const [systemScheme, setSystemScheme] = useState<CalendarColorScheme>(() =>
    getSystemColorScheme(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemScheme(event.matches ? "dark" : "light");
    };

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return theme === "system" ? systemScheme : theme;
}
