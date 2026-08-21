export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
export const TYPING_DEBOUNCE_MS = 800;
export const TYPING_STOP_TIMEOUT_MS = 1500;
export const MAX_ATTACHMENT_COUNT = 5;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const DISALLOWED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".js",
  ".vbs",
];

// User specified exactly 4 quick reaction emojis with no custom picker
export const QUICK_EMOJIS = ["👍", "❤️", "🎉", "🚀"] as const;
