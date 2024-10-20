/// <reference types="vite/client" />

interface Cabin {
  event(content: string): void;
}

declare const cabin: Cabin;
