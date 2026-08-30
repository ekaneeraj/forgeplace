"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/FormControls";
import { LaunchFeeRow } from "@/components/molecules/LaunchFeeRow";
import { TokenPreview } from "@/components/molecules/TokenPreview";
import { ConnectPrompt } from "@/components/molecules/ConnectPrompt";
import { useWallet } from "@/context/wallet-context";
import { createToken } from "@/lib/data";
import { delay, LAUNCH_DELAY_MS } from "@/lib/simulation";

interface FormState {
  name: string;
  symbol: string;
  decimals: string;
  initialSupply: string;
  price: string;
  description: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  symbol: "",
  decimals: "18",
  initialSupply: "",
  price: "",
  description: "",
};

function validate(state: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (state.name.trim().length < 2) errors.name = "Enter at least 2 characters";
  if (!/^[A-Z]{2,11}$/.test(state.symbol))
    errors.symbol = "2–11 letters (A–Z)";
  const decimals = Number(state.decimals);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18)
    errors.decimals = "Whole number between 0 and 18";
  const supply = Number(state.initialSupply);
  if (!supply || supply <= 0) errors.initialSupply = "Enter a positive amount";
  const price = Number(state.price);
  if (!price || price <= 0) errors.price = "Enter a positive price";

  return errors;
}

export function TokenForm() {
  const router = useRouter();
  const { connected, address } = useWallet();
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(state);
    if (Object.keys(nextErrors).some((key) => nextErrors[key as keyof typeof nextErrors])) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    await delay(LAUNCH_DELAY_MS);

    const token = createToken(
      {
        name: state.name.trim(),
        symbol: state.symbol,
        decimals: Number(state.decimals),
        initialSupply: state.initialSupply,
        priceUsd: state.price,
        description: state.description.trim() || undefined,
      },
      address ?? ""
    );

    router.push(`/token/${token.id}`);
  }

  if (!connected) {
    return (
      <ConnectPrompt
        title="Connect to launch"
        description="Tokens are launched through the factory with your wallet — connect to continue."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Name" error={errors.name}>
          <Input
            value={state.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ForgeCoin"
            autoFocus
          />
        </Field>

        <Field label="Symbol" error={errors.symbol}>
          <Input
            value={state.symbol}
            onChange={(e) =>
              set("symbol", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
            }
            placeholder="FORGE"
            maxLength={11}
            className="font-mono uppercase"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Decimals" hint="18 is the standard" error={errors.decimals}>
            <Input
              type="number"
              min={0}
              max={18}
              step={1}
              value={state.decimals}
              onChange={(e) => set("decimals", e.target.value)}
            />
          </Field>
          <Field label="Initial supply" error={errors.initialSupply}>
            <Input
              type="number"
              min={0}
              step="any"
              value={state.initialSupply}
              onChange={(e) => set("initialSupply", e.target.value)}
              placeholder="1000000"
            />
          </Field>
        </div>

        <Field label="Initial price (USD)" hint="Used as the swap rate" error={errors.price}>
          <Input
            type="number"
            min={0}
            step="any"
            value={state.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.42"
          />
        </Field>

        <Field label="Description" optional>
          <Textarea
            value={state.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What is this token for?"
          />
        </Field>

        <LaunchFeeRow standard="erc20" />

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? "Launching…" : "Launch token"}
        </Button>
      </form>

      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-36">
          <TokenPreview
            name={state.name}
            symbol={state.symbol}
            decimals={state.decimals}
            supply={state.initialSupply}
            description={state.description}
            address={address}
          />
        </div>
      </aside>
    </div>
  );
}
