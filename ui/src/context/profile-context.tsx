"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { storageKeys } from "@/config/site";

export interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface SettingsData {
  launchAlerts: boolean;
  priceAlerts: boolean;
  activityAlerts: boolean;
}

interface OwnedState {
  items: string[];
  tokens: string[];
}

interface ProfileState {
  profile: ProfileData;
  settings: SettingsData;
  owned: OwnedState;
}

const DEFAULT_STATE: ProfileState = {
  profile: {
    displayName: "",
    bio: "",
    avatarUrl: "",
    coverUrl: "",
  },
  settings: {
    launchAlerts: true,
    priceAlerts: true,
    activityAlerts: true,
  },
  owned: {
    items: [],
    tokens: [],
  },
};

const listeners = new Set<() => void>();
let cache: ProfileState | null = null;

function readStored(): ProfileState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKeys.profile);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return {
      profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
      owned: { ...DEFAULT_STATE.owned, ...parsed.owned },
    };
  } catch {
    return null;
  }
}

function ensureCache() {
  if (cache === null) cache = readStored() ?? DEFAULT_STATE;
  return cache;
}

function getSnapshot(): ProfileState {
  return ensureCache();
}

function getServerSnapshot(): ProfileState {
  return DEFAULT_STATE;
}

type ProfilePatch = {
  profile?: Partial<ProfileData>;
  settings?: Partial<SettingsData>;
  owned?: OwnedState;
};

function write(patch: ProfilePatch): boolean {
  const next = {
    profile: { ...ensureCache().profile, ...patch.profile },
    settings: { ...ensureCache().settings, ...patch.settings },
    owned: {
      items: patch.owned?.items ?? ensureCache().owned.items,
      tokens: patch.owned?.tokens ?? ensureCache().owned.tokens,
    },
  };
  cache = next;
  let persisted = false;
  try {
    window.localStorage.setItem(storageKeys.profile, JSON.stringify(next));
    persisted = true;
  } catch {
    // storage unavailable — keep in-memory state
  }
  listeners.forEach((listener) => listener());
  return persisted;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface ProfileStore extends ProfileState {
  updateProfile: (patch: Partial<ProfileData>) => boolean;
  updateSettings: (patch: Partial<SettingsData>) => boolean;
  addOwnedItem: (id: string) => void;
  removeOwnedItem: (id: string) => void;
  addOwnedToken: (id: string) => void;
  removeOwnedToken: (id: string) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileStore | null>(null);

function withOwned(
  mutate: (owned: OwnedState) => OwnedState
) {
  const current = ensureCache();
  write({
    owned: mutate(current.owned),
  });
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateProfile = useCallback(
    (patch: Partial<ProfileData>) => write({ profile: patch }),
    []
  );
  const updateSettings = useCallback(
    (patch: Partial<SettingsData>) => write({ settings: patch }),
    []
  );
  const addOwnedItem = useCallback(
    (id: string) =>
      withOwned((owned) => ({
        items: owned.items.includes(id) ? owned.items : [...owned.items, id],
        tokens: owned.tokens,
      })),
    []
  );
  const removeOwnedItem = useCallback(
    (id: string) =>
      withOwned((owned) => ({
        items: owned.items.filter((ownedId) => ownedId !== id),
        tokens: owned.tokens,
      })),
    []
  );
  const addOwnedToken = useCallback(
    (id: string) =>
      withOwned((owned) => ({
        items: owned.items,
        tokens: owned.tokens.includes(id) ? owned.tokens : [...owned.tokens, id],
      })),
    []
  );
  const removeOwnedToken = useCallback(
    (id: string) =>
      withOwned((owned) => ({
        items: owned.items,
        tokens: owned.tokens.filter((ownedId) => ownedId !== id),
      })),
    []
  );
  const resetProfile = useCallback(() => write(DEFAULT_STATE), []);

  const value = useMemo<ProfileStore>(
    () => ({
      ...state,
      updateProfile,
      updateSettings,
      addOwnedItem,
      removeOwnedItem,
      addOwnedToken,
      removeOwnedToken,
      resetProfile,
    }),
    [
      state,
      updateProfile,
      updateSettings,
      addOwnedItem,
      removeOwnedItem,
      addOwnedToken,
      removeOwnedToken,
      resetProfile,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileStore {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}