"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type NavbarHeroContextValue = {
  isHeroActive: boolean;
  setIsHeroActive: (value: boolean) => void;
};

const NavbarHeroContext = createContext<NavbarHeroContextValue | null>(null);

export function NavbarHeroProvider({
  children
}: {
  children: ReactNode;
}) {
  const [isHeroActive, setIsHeroActive] = useState(false);
  const value = useMemo(
    () => ({ isHeroActive, setIsHeroActive }),
    [isHeroActive]
  );

  return (
    <NavbarHeroContext.Provider value={value}>
      {children}
    </NavbarHeroContext.Provider>
  );
}

export function useNavbarHero() {
  const context = useContext(NavbarHeroContext);
  if (!context) {
    return {
      isHeroActive: false,
      setIsHeroActive: () => {}
    };
  }
  return context;
}
