"use client";

import { useCallback, useSyncExternalStore } from "react";
import { storageKeys } from "@/config/site";
import { MOCK_ADDRESS } from "@/lib/mock-data";

interface WalletValue {
  address: string | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const listeners = new Set<() => void>();
let cache: { value: string | null } | null = null;

function getSnapshot(): string | null {
  if (!cache) {
    cache = { value: window.localStorage.getItem(storageKeys.wallet) };
  }
  return cache.value;
}

function getServerSnapshot(): string | null {
  return null;
}

function write(value: string | null) {
  if (value) window.localStorage.setItem(storageKeys.wallet, value);
  else window.localStorage.removeItem(storageKeys.wallet);
  cache = { value };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => {
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWallet(): WalletValue {
  const address = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const connect = useCallback(() => write(MOCK_ADDRESS), []);
  const disconnect = useCallback(() => write(null), []);

  return { address, connected: address !== null, connect, disconnect };
}
