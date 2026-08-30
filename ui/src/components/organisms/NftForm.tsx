"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Select, Textarea } from "@/components/atoms/FormControls";
import { LaunchFeeRow } from "@/components/molecules/LaunchFeeRow";
import { NftPreview } from "@/components/molecules/NftPreview";
import { ConnectPrompt } from "@/components/molecules/ConnectPrompt";
import { TraitsEditor } from "@/components/molecules/TraitsEditor";
import { useWallet } from "@/context/wallet-context";
import { createItem } from "@/lib/data";
import { useCreations } from "@/hooks/use-creations";
import { delay, LAUNCH_DELAY_MS } from "@/lib/simulation";
import type { NftStandard, Trait } from "@/lib/types";

interface FormState {
  collectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  mintPrice: string;
  supply: string;
  traits: Trait[];
}

const INITIAL_STATE: FormState = {
  collectionId: "",
  name: "",
  description: "",
  imageUrl: "",
  mintPrice: "",
  supply: "1",
  traits: [],
};

function validate(state: FormState, standard: NftStandard) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!state.collectionId) errors.collectionId = "Select a collection";
  if (state.name.trim().length < 2) errors.name = "Enter at least 2 characters";

  if (state.mintPrice && Number(state.mintPrice) < 0)
    errors.mintPrice = "Must be zero or more";

  if (standard === "erc1155") {
    const supply = Number(state.supply);
    if (!Number.isInteger(supply) || supply < 1)
      errors.supply = "Whole number of at least 1";
  }

  return errors;
}

export function NftForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, address } = useWallet();

  const standard: NftStandard =
    searchParams.get("type") === "erc1155" ? "erc1155" : "erc721";

  const creations = useCreations();
  const collections = useMemo(
    () =>
      creations.filter(
        (creation): creation is Extract<typeof creation, { kind: "collection" }> =>
          creation.kind === "collection" && creation.standard === standard
      ),
    [creations, standard]
  );

  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setStandard(next: NftStandard) {
    router.replace(`/create/nft?type=${next}`, { scroll: false });
    setState({ ...INITIAL_STATE });
    setErrors({});
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCollectionChange(value: string) {
    set("collectionId", value);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(state, standard);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    await delay(LAUNCH_DELAY_MS);

    const item = createItem(
      {
        standard,
        collectionId: state.collectionId,
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        imageUrl: state.imageUrl.trim() || undefined,
        mintPriceEth: state.mintPrice || "0",
        supply: standard === "erc1155" ? Number(state.supply) : 1,
        traits: standard === "erc721" ? state.traits : [],
      },
      address ?? ""
    );

    router.push(`/item/${item.id}`);
  }

  if (!connected) {
    return (
      <ConnectPrompt
        title="Connect to launch"
        description="Items are minted through your connected wallet — connect to continue."
      />
    );
  }

  const hasCollections = collections.length > 0;
  const selectedCollection = collections.find(
    (collection) => collection.id === state.collectionId
  );

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

      <Field label="Collection" error={errors.collectionId}>
        {hasCollections ? (
          <Select
            value={state.collectionId}
            onChange={(e) => handleCollectionChange(e.target.value)}
          >
            <option value="">Select a collection…</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
                {collection.symbol ? ` (${collection.symbol})` : ""}
              </option>
            ))}
          </Select>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-700 p-4 text-center">
            <p className="text-sm text-muted">
              No {standard === "erc721" ? "ERC-721" : "ERC-1155"} collection
              yet — collections are separate contracts, so create one first,
              then come back to mint.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              href={`/collections/new?type=${standard}`}
            >
              Create a collection
            </Button>
          </div>
        )}
      </Field>

      <Field label="Name" error={errors.name}>
        <Input
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder={
            standard === "erc721" ? "Forge Blade #001" : "Forge Blade"
          }
        />
      </Field>

      <Field label="Description" optional>
        <Textarea
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tell people about this item…"
        />
      </Field>

      <Field label="Image URL" optional hint="Link to the image shown with this item">
        <Input
          value={state.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="ipfs://…"
        />
      </Field>

      {standard === "erc721" ? (
        <Field label="Traits" optional hint="Attributes like Color: Blue">
          <TraitsEditor
            traits={state.traits}
            onChange={(traits) => set("traits", traits)}
          />
        </Field>
      ) : (
        <Field label="Edition supply" error={errors.supply}>
          <Input
            type="number"
            min={1}
            step={1}
            value={state.supply}
            onChange={(e) => set("supply", e.target.value)}
          />
        </Field>
      )}

      <Field label="Mint price (ETH)" optional error={errors.mintPrice}>
        <Input
          type="number"
          min={0}
          step="any"
          value={state.mintPrice}
          onChange={(e) => set("mintPrice", e.target.value)}
          placeholder="0.05"
        />
      </Field>

      <LaunchFeeRow standard={standard} />

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        {submitting ? "Launching…" : "Launch item"}
      </Button>
      </form>

      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-36">
          <NftPreview
            standard={standard}
            name={state.name}
            collectionName={selectedCollection?.name ?? ""}
            description={state.description}
            imageUrl={state.imageUrl}
            mintPrice={state.mintPrice}
            supply={state.supply}
            traits={state.traits}
            address={address}
          />
        </div>
      </aside>
    </div>
  );
}
