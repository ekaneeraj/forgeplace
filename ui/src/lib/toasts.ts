export type ToastKind = "success" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  txHash?: string;
}

let toasts: Toast[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const EMPTY_TOASTS: Toast[] = [];

export function toastsSnapshot(): Toast[] {
  return toasts;
}

export function toastsServerSnapshot(): Toast[] {
  return EMPTY_TOASTS;
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

const TOAST_DURATION_MS = 6000;

export function showToast(input: Omit<Toast, "id">, duration = TOAST_DURATION_MS) {
  const id = ++counter;
  toasts = [...toasts, { ...input, id }];
  emit();
  window.setTimeout(() => dismissToast(id), duration);
}

export function txToast(
  kind: ToastKind,
  title: string,
  txHash: string,
  message?: string
) {
  showToast({ kind, title, message, txHash });
}

export function txSuccess(title: string, txHash: string, message?: string) {
  txToast("success", title, txHash, message);
}

export function txError(title: string, txHash: string, message?: string) {
  txToast("error", title, txHash, message);
}