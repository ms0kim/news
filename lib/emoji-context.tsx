"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export const EMOJIS = ["🐰", "🍧", "🩰", "🍦", "🍨", "🐶", "🐹", "🩰", "🧴"];

const EmojiContext = createContext<string>(EMOJIS[0]);

export function EmojiProvider({ children }: { children: ReactNode }) {
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  useEffect(() => {
    setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const encoded = encodeURIComponent(emoji);
    const iconUrl = `/api/icon/192?e=${encoded}`;
    const faviconUrl = `/api/icon/128?e=${encoded}&bg=0`;
    const manifestHref = `/api/manifest?e=${encoded}`;

    const removeLinks = (rel: string) => {
      document.querySelectorAll(`link[rel="${rel}"]`).forEach((el) => el.remove());
    };

    const addLink = (rel: string, href: string, extra?: Record<string, string>) => {
      removeLinks(rel);
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (extra) Object.entries(extra).forEach(([k, v]) => link.setAttribute(k, v));
      document.head.appendChild(link);
    };

    removeLinks("icon");
    removeLinks("shortcut icon");
    addLink("icon", faviconUrl, { type: "image/svg+xml", sizes: "128x128" });

    removeLinks("apple-touch-icon");
    addLink("apple-touch-icon", iconUrl, { sizes: "192x192" });

    removeLinks("manifest");
    addLink("manifest", manifestHref);
  }, [emoji]);

  return (
    <EmojiContext.Provider value={emoji}>{children}</EmojiContext.Provider>
  );
}

export function useEmoji() {
  return useContext(EmojiContext);
}
