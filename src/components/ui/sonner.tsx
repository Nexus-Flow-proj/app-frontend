import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { resolvedTheme, theme = "system" } = useTheme();
  const activeTheme = resolvedTheme ?? theme;

  return (
    <Sonner
      theme={activeTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-[var(--chart-2)]" />,
        warning: <TriangleAlertIcon className="size-4 text-[var(--chart-4)]" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: "nexus-toast",
          icon: "nexus-toast-icon",
          content: "nexus-toast-content",
          title: "nexus-toast-title",
          description: "nexus-toast-description",
          actionButton: "nexus-toast-action",
          cancelButton: "nexus-toast-cancel",
          closeButton: "nexus-toast-close",
          success: "nexus-toast-success",
          error: "nexus-toast-error",
          warning: "nexus-toast-warning",
          info: "nexus-toast-info",
          loading: "nexus-toast-loading",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
