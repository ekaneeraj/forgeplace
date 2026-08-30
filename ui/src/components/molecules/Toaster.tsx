"use client";

import { useSyncExternalStore } from "react";
import { CheckIcon, XIcon } from "@/components/atoms/icons";
import { shortAddress } from "@/lib/format";
import {
  dismissToast,
  subscribeToasts,
  toastsServerSnapshot,
  toastsSnapshot,
} from "@/lib/toasts";
import type { Toast, ToastKind } from "@/lib/toasts";

const KIND_STYLES: Record<ToastKind, { border: string; icon: string }> = {
  success: {
    border: "border-emerald-500/40",
    icon: "bg-emerald-500/15 text-emerald-400",
  },
  error: {
    border: "border-red-500/40",
    icon: "bg-red-500/15 text-red-400",
  },
  info: {
    border: "border-violet-500/40",
    icon: "bg-brand/15 text-brand",
  },
};

function ToastIcon({ kind }: { kind: ToastKind }) {
  const styles = KIND_STYLES[kind];
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
    >
      {kind === "error" ? (
        <XIcon className="size-4" />
      ) : (
        <CheckIcon className="size-4" />
      )}
    </span>
  );
}

export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    toastsSnapshot,
    toastsServerSnapshot
  );

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-16 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const styles = KIND_STYLES[toast.kind];

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm animate-[slide-in_0.2s_ease-out] items-start gap-3 rounded-xl border bg-zinc-900/95 p-3.5 shadow-lg shadow-black/40 backdrop-blur ${styles.border}`}
    >
      <ToastIcon kind={toast.kind} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-50">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-5 text-muted">{toast.message}</p>
        )}
        {toast.txHash && <TxHash hash={toast.txHash} />}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="-mr-1 -mt-1 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
        aria-label="Dismiss notification"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

function TxHash({ hash }: { hash: string }) {
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1 font-mono text-[11px] text-zinc-300">
        {shortAddress(hash)}
      </span>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(hash)}
        className="rounded-md px-1.5 py-1 text-[11px] font-medium text-muted transition-colors hover:text-zinc-200"
      >
        Copy
      </button>
    </div>
  );
}