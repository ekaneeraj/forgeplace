"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/FormControls";
import { XIcon } from "@/components/atoms/icons";
import type { Trait } from "@/lib/types";

interface TraitsEditorProps {
  traits: Trait[];
  onChange: (traits: Trait[]) => void;
}

export function TraitsEditor({ traits, onChange }: TraitsEditorProps) {
  function update(index: number, patch: Partial<Trait>) {
    onChange(traits.map((trait, i) => (i === index ? { ...trait, ...patch } : trait)));
  }

  return (
    <div className="space-y-2">
      {traits.map((trait, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Trait"
            value={trait.traitType}
            onChange={(e) => update(index, { traitType: e.target.value })}
          />
          <Input
            placeholder="Value"
            value={trait.value}
            onChange={(e) => update(index, { value: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Remove trait"
            onClick={() => onChange(traits.filter((_, i) => i !== index))}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...traits, { traitType: "", value: "" }])}
      >
        Add trait
      </Button>
    </div>
  );
}
