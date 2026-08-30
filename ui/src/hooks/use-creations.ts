"use client";

import { useSyncExternalStore } from "react";
import {
  getCreationsServerSnapshot,
  getCreationsSnapshot,
  subscribeCreations,
} from "@/lib/data";
import type { Creation } from "@/lib/types";

export function useCreations(): Creation[] {
  return useSyncExternalStore(
    subscribeCreations,
    getCreationsSnapshot,
    getCreationsServerSnapshot
  );
}
