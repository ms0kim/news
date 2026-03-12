"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const STORAGE_KEYS = {
  header: "customHeaderText",
  bottomSub: "customHeaderBottomSub",
} as const;

export const DEFAULT_BOTTOM_SUB = "Let's grow your wealth together today";

export function getDefaultGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후에요";
  return "좋은 저녁이에요";
}

const HeaderTextContext = createContext<{
  headerText: string;
  setHeaderText: (text: string) => void;
  bottomSubText: string;
  setBottomSubText: (text: string) => void;
}>({
  headerText: "",
  setHeaderText: () => {},
  bottomSubText: "",
  setBottomSubText: () => {},
});

export function HeaderTextProvider({ children }: { children: ReactNode }) {
  const [headerText, setHeaderTextState] = useState("");
  const [bottomSubText, setBottomSubTextState] = useState("");

  useEffect(() => {
    const h = localStorage.getItem(STORAGE_KEYS.header);
    const b = localStorage.getItem(STORAGE_KEYS.bottomSub);
    if (h) setHeaderTextState(h);
    if (b) setBottomSubTextState(b);
  }, []);

  const setHeaderText = (text: string) => {
    setHeaderTextState(text);
    text ? localStorage.setItem(STORAGE_KEYS.header, text) : localStorage.removeItem(STORAGE_KEYS.header);
  };
  const setBottomSubText = (text: string) => {
    setBottomSubTextState(text);
    text ? localStorage.setItem(STORAGE_KEYS.bottomSub, text) : localStorage.removeItem(STORAGE_KEYS.bottomSub);
  };

  return (
    <HeaderTextContext.Provider
      value={{
        headerText,
        setHeaderText,
        bottomSubText,
        setBottomSubText,
      }}
    >
      {children}
    </HeaderTextContext.Provider>
  );
}

export function useHeaderText() {
  return useContext(HeaderTextContext);
}
