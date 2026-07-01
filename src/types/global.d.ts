declare global {
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type ID = string;

  interface Coordinates {
    x: number;
    y: number;
  }
}

export {};

/**
 ** uses:
 ** anywhere in your app — no import needed
 ** const userId: ID = "123";
 ** const name: Nullable<string> = null;
 */
