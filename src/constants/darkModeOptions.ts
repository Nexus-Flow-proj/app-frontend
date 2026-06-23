import type { Theme } from "@/providers/ThemeProvider";
import { Monitor, Moon, Sun } from "lucide-react";

interface DarkModeOptions {
  option: Theme;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const DARK_MODE_OPTIONS: DarkModeOptions[] = [
  { option: "light", icon: Sun },
  { option: "dark", icon: Moon },
  { option: "system", icon: Monitor },
];
