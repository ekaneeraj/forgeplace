import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { ReactNode } from "react";

const CONTROL_CLASSES =
  "w-full rounded-lg border border-zinc-700 bg-white/5 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-brand focus:bg-white/[0.07] disabled:opacity-60";

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={`${CONTROL_CLASSES} h-10 ${className}`} {...rest} />
  );
}

export function Textarea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${CONTROL_CLASSES} min-h-[88px] resize-y py-2 ${className}`}
      {...rest}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${CONTROL_CLASSES} h-10 [&>option]:bg-zinc-900 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  optional,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        {optional && <span className="text-xs text-zinc-500">Optional</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && !error && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
