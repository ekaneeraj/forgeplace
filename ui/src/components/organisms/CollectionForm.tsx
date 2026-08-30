"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/FormControls";
import { CollectionPreview } from "@/components/molecules/CollectionPreview";
import { ConnectPrompt } from "@/components/molecules/ConnectPrompt";
import { useWallet } from "@/context/wallet-context";
import { createCollection } from "@/lib/data";
import { delay, LAUNCH_DELAY_MS } from "@/lib/simulation";
import type { NftStandard } from "@/lib/types";

interface FormState {
  name: string;
  symbol: string;
  description: string;
  coverUrl: string;
  profileUrl: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  symbol: "",
  description: "",
  coverUrl: "",
  profileUrl: "",
};

function validate(state: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (state.name.trim().length < 2) errors.name = "Enter at least 2 characters";
  if (!/^[A-Z]{2,6}$/.test(state.symbol)) errors.symbol = "2–6 letters (A–Z)";

  return errors;
}

export function CollectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, address } = useWallet();

  const standard: NftStandard =
    searchParams.get("type") === "erc1155" ? "erc1155" : "erc721";

  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setStandard(next: NftStandard) {
    router.replace(`/collections/new?type=${next}`, { scroll: false });
    setState({ ...INITIAL_STATE });
    setErrors({});
  }

  function set<K extends keyof FormState>(key: K, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(state);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    await delay(LAUNCH_DELAY_MS);

    const collection = createCollection(
      {
        standard,
        name: state.name.trim(),
        symbol: state.symbol,
        description: state.description.trim() || undefined,
        imageUrl: state.coverUrl.trim() || undefined,
        profileImageUrl: state.profileUrl.trim() || undefined,
      },
      address ?? ""
    );

    router.push(`/collection/${collection.id}`);
  }

  if (!connected) {
    return (
      <ConnectPrompt
        title="Connect to continue"
        description="Collections are deployed with your wallet — connect to continue."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        {(["erc721", "erc1155"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStandard(option)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              standard === option
                ? "bg-brand text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {option === "erc721"
              ? "ERC-721 · Unique items"
              : "ERC-1155 · Editions"}
          </button>
        ))}
      </div>

      <Field label="Name" error={errors.name}>
        <Input
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Forge Blades"
          autoFocus
        />
      </Field>

      <Field label="Symbol" error={errors.symbol}>
        <Input
          value={state.symbol}
          onChange={(e) =>
            set("symbol", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
          }
          placeholder="BLADE"
          maxLength={6}
          className="font-mono uppercase"
        />
      </Field>

      <Field label="Description" optional>
        <Textarea
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What is this collection about?"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Cover image" optional hint="Main banner image">
          <Input
            value={state.coverUrl}
            onChange={(e) => set("coverUrl", e.target.value)}
            placeholder="https://…/cover.png"
          />
        </Field>
        <Field label="Profile image" optional hint="Avatar shown on cards">
          <Input
            value={state.profileUrl}
            onChange={(e) => set("profileUrl", e.target.value)}
            placeholder="https://…/avatar.png"
          />
        </Field>
      </div>

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        {submitting ? "Creating…" : "Create collection"}
      </Button>
      </form>

      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-36">
          <CollectionPreview
            standard={standard}
            name={state.name}
            symbol={state.symbol}
            description={state.description}
            imageUrl={state.coverUrl}
            profileImageUrl={state.profileUrl}
            address={address}
          />
        </div>
      </aside>
    </div>
  );
}
