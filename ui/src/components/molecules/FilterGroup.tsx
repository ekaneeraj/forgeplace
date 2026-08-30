import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/atoms/icons";

export interface FilterOption {
  id: string;
  label: string;
  helper?: string;
}

interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  collapsible?: boolean;
}

export function FilterGroup({
  label,
  options,
  value,
  onChange,
  collapsible = true,
}: FilterGroupProps) {
  const name = useId();
  const [open, setOpen] = useState(true);
  const selected = options.find((option) => option.id === value);

  const list = (
    <div className={collapsible ? "mt-3 flex flex-col gap-1" : "flex flex-col gap-1"}>
      {options.map((option) => {
        const selectedOption = value === option.id;
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={selectedOption}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <span
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                selectedOption ? "border-brand bg-brand" : "border-zinc-600"
              }`}
            >
              {selectedOption && <span className="size-1.5 rounded-full bg-white" />}
            </span>
            <span className="flex flex-col">
              <span className={selectedOption ? "text-zinc-100" : undefined}>
                {option.label}
              </span>
              {option.helper && (
                <span className="text-xs text-zinc-500">{option.helper}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );

  if (!collapsible) {
    return (
      <div role="group" aria-label={label}>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        {list}
      </div>
    );
  }

  return (
    <div role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <span className="flex items-center gap-1.5">
          {selected && selected.id !== "all" && (
            <span className="max-w-28 truncate rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">
              {selected.label}
            </span>
          )}
          <ChevronDownIcon
            className={`size-4 text-zinc-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>
      {open && list}
    </div>
  );
}