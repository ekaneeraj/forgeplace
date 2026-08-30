"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/FormControls";
import { Thumb } from "@/components/atoms/Thumb";
import {
  CoinIcon,
  LayersIcon,
  PenSquareIcon,
  WalletIcon,
  XIcon,
} from "@/components/atoms/icons";
import { ConnectPrompt } from "@/components/molecules/ConnectPrompt";
import { ItemCard } from "@/components/molecules/ItemCard";
import { Pagination } from "@/components/molecules/Pagination";
import { getChain } from "@/config/chains";
import { routes } from "@/config/site";
import { useProfile } from "@/context/profile-context";
import { useWallet } from "@/context/wallet-context";
import { useCreations } from "@/hooks/use-creations";
import { shortAddress } from "@/lib/format";
import { showToast } from "@/lib/toasts";
import type {
  CollectionCreation,
  ItemCreation,
  TokenCreation,
} from "@/lib/types";

type TabId =
  | "overview"
  | "nfts"
  | "tokens"
  | "collections"
  | "settings";

const TABS: { id: TabId; label: string; icon: typeof LayersIcon }[] = [
  { id: "overview", label: "Overview", icon: WalletIcon },
  { id: "nfts", label: "Owned NFTs", icon: LayersIcon },
  { id: "tokens", label: "Tokens", icon: CoinIcon },
  { id: "collections", label: "Collections", icon: LayersIcon },
  { id: "settings", label: "Settings", icon: PenSquareIcon },
];

// Page size for the Collections / Owned Tokens grids. Set small (4) so pagination
// is verifiable with the seed data; raise for production.
const LIMIT = 4;

const PANEL = "rounded-2xl border border-zinc-800 bg-zinc-900/50";

export function ProfilePage() {
  const { connected, address } = useWallet();
  const { profile, settings, owned, ...actions } = useProfile();
  const creations = useCreations();
  const [tab, setTab] = useState<TabId>("overview");

  const myTokens = useMemo(
    () =>
      creations.filter(
        (c): c is TokenCreation =>
          c.kind === "token" && c.creatorAddress === address
      ),
    [creations, address]
  );
  const myCollections = useMemo(
    () =>
      creations.filter(
        (c): c is CollectionCreation =>
          c.kind === "collection" && c.creatorAddress === address
      ),
    [creations, address]
  );
  const myItems = useMemo(
    () =>
      creations.filter(
        (c): c is ItemCreation => c.kind === "item" && c.creatorAddress === address
      ),
    [creations, address]
  );

  const ownedNfts = useMemo(() => {
    const byId = new Map<string, ItemCreation>();
    owned.items.forEach((id) => {
      const found = creations.find(
        (c): c is ItemCreation => c.kind === "item" && c.id === id
      );
      if (found) byId.set(found.id, found);
    });
    myItems.forEach((item) => byId.set(item.id, item));
    return [...byId.values()];
  }, [owned.items, myItems, creations]);

  const heldTokens = useMemo(
    () =>
      owned.tokens
        .map((id) =>
          creations.find(
            (c): c is TokenCreation => c.kind === "token" && c.id === id
          )
        )
        .filter((token): token is TokenCreation => Boolean(token)),
    [owned.tokens, creations]
  );

  if (!connected || !address) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        <ConnectPrompt
          title="Connect your wallet to manage your profile"
          description="See the NFTs you own, the tokens and collections you hold or launched, and customize your profile and notification settings."
        />
      </div>
    );
  }

  const displayName = profile.displayName.trim() || shortAddress(address);
  const createdTotal = myItems.length + myTokens.length + myCollections.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
      <div className={`${PANEL} overflow-hidden`}>
        {profile.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.coverUrl}
            alt="Profile cover"
            className="h-40 w-full object-cover sm:h-48"
          />
        ) : (
          <div className="h-40 w-full bg-gradient-to-r from-zinc-800/80 via-brand/20 to-zinc-800/80 sm:h-48" />
        )}

        <div className="px-4 pb-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="-mt-12 overflow-hidden rounded-2xl border-4 border-background bg-zinc-900">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={`${displayName} avatar`}
                    className="size-24 object-cover sm:size-28"
                  />
                ) : (
                  <Thumb
                    seed={address}
                    name={displayName}
                    className="size-24 text-2xl sm:size-28"
                  />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-50">
                  {displayName}
                </h1>
                <p className="mt-1 font-mono text-xs text-muted">
                  {shortAddress(address)}
                </p>
                {profile.bio && (
                  <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab("settings")}
              >
                <PenSquareIcon className="size-3.5" />
                Edit profile
              </Button>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <ProfileStat label="Owned NFTs" value={ownedNfts.length} />
            <ProfileStat label="Tokens held" value={heldTokens.length} />
            <ProfileStat label="Collections" value={myCollections.length} />
            <ProfileStat label="Items created" value={myItems.length} />
            <ProfileStat label="Total created" value={createdTotal} />
          </dl>
        </div>
      </div>

      <div className="sticky top-16 z-30 mt-8 -mx-4 flex flex-wrap gap-1 border-b border-zinc-800 bg-background/95 px-4 backdrop-blur">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand text-zinc-50"
                  : "border-transparent text-muted hover:text-zinc-100"
              }`}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {tab === "overview" && (
          <OverviewTab
            ownedNfts={ownedNfts}
            heldTokens={heldTokens}
            myCollections={myCollections}
          />
        )}
        {tab === "nfts" && (
          <OwnedNftsTab
            items={ownedNfts}
            ownedIds={owned.items}
            onRemove={actions.removeOwnedItem}
          />
        )}
        {tab === "tokens" && (
          <TokensTab
            held={heldTokens}
            launched={myTokens}
            onRemove={actions.removeOwnedToken}
          />
        )}
        {tab === "collections" && (
          <CollectionsTab collections={myCollections} />
        )}
        {tab === "settings" && (
          <SettingsTab
            profile={profile}
            settings={settings}
            onSaveProfile={actions.updateProfile}
            onUpdateSettings={actions.updateSettings}
            onReset={actions.resetProfile}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Tab content ------------------------------- */

const GRID_SCROLL_MARGIN = 112;

function useGridScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<number | null>(null);

  const scrollToPage = useCallback((page: number) => {
    if (prevPageRef.current === page) return;
    prevPageRef.current = page;
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
    window.scrollTo({
      top: Math.max(0, window.scrollY + sectionTop - GRID_SCROLL_MARGIN),
      behavior: "smooth",
    });
  }, []);

  return { sectionRef, listRef, scrollToPage };
}

function EmptyState({
  title,
  description,
  href,
  hrefLabel,
}: {
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center">
      <p className="font-medium text-zinc-200">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      <Button href={href} variant="outline" size="sm" className="mt-5">
        {hrefLabel}
      </Button>
    </div>
  );
}

function OverviewTab({
  ownedNfts,
  heldTokens,
  myCollections,
}: {
  ownedNfts: ItemCreation[];
  heldTokens: TokenCreation[];
  myCollections: CollectionCreation[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className={`${PANEL} p-4`}>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Owned NFTs
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-50">
          {ownedNfts.length}
        </p>
        <p className="text-xs text-muted">NFTs currently in your wallet.</p>
      </div>

      <div className={`${PANEL} p-4`}>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Tokens held
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-50">
          {heldTokens.length}
        </p>
        <p className="text-xs text-muted">
          Swap on the <Link className="text-brand hover:underline" href={routes.swap}>Swap page</Link> to add or remove tokens.
        </p>
      </div>

      <div className={`${PANEL} p-4`}>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Collections
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-50">
          {myCollections.length}
        </p>
        <p className="text-xs text-muted">Collections created by you.</p>
      </div>
    </div>
  );
}

function OwnedNftsTab({
  items,
  ownedIds,
  onRemove,
}: {
  items: ItemCreation[];
  ownedIds: string[];
  onRemove: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / LIMIT));
  const safePage = Math.min(page, totalPages);
  const visible = items.slice(
    (safePage - 1) * LIMIT,
    safePage * LIMIT
  );

  const { sectionRef, listRef, scrollToPage } = useGridScroll();
  useEffect(() => {
    scrollToPage(safePage);
  }, [safePage, scrollToPage]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No NFTs in your wallet"
        description="When you mint or buy an NFT on ForgePlace it will show up here so you can manage your collection."
        href={routes.explore}
        hrefLabel="Explore NFTs"
      />
    );
  }

  return (
    <div ref={sectionRef}>
      <div
        ref={listRef}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 xl:max-h-[calc(100dvh-13rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1"
      >
        {visible.map((item) => {
          const removable = ownedIds.includes(item.id);
          return (
            <div key={item.id} className="group/item relative">
              <ItemCard item={item} />
              {removable && (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name} from owned`}
                  title="Remove from owned"
                  className="absolute -right-1.5 -top-1.5 z-10 flex size-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 opacity-0 shadow-md transition-all hover:border-red-500/60 hover:text-red-400 group-hover/item:opacity-100"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Pagination current={safePage} total={totalPages} onChange={setPage} />
    </div>
  );
}

function TokensTab({
  held,
  launched,
  onRemove,
}: {
  held: TokenCreation[];
  launched: TokenCreation[];
  onRemove: (id: string) => void;
}) {
  const list = [...held];
  for (const token of launched) {
    if (!list.some((t) => t.id === token.id)) list.push(token);
  }

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(list.length / LIMIT));
  const safePage = Math.min(page, totalPages);
  const visible = list.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const { sectionRef, listRef, scrollToPage } = useGridScroll();
  useEffect(() => {
    scrollToPage(safePage);
  }, [safePage, scrollToPage]);

  if (list.length === 0) {
    return (
      <EmptyState
        title="No tokens here"
        description="Swap any ERC-20 token or launch your own and it will appear in this list."
        href={routes.swap}
        hrefLabel="Open Swap"
      />
    );
  }

  return (
    <div ref={sectionRef}>
      <p className="mb-4 text-xs text-muted">
        {list.length} result{list.length === 1 ? "" : "s"} · {LIMIT} per page · page{" "}
        {safePage} of {totalPages}
      </p>
      <div
        ref={listRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:max-h-[calc(100dvh-13rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1"
      >
      {visible.map((token) => {
        const isHeld = held.some((t) => t.id === token.id);
        const chain = getChain(token.chain);
        return (
          <div key={token.id} className="group/token relative">
<Link
              href={routes.tokenDetail(token.id)}
              className="block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center gap-3 p-4 pb-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <CoinIcon className="size-5 text-zinc-400" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-100">
                    {token.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {token.symbol} · {chain?.label ?? token.chain}
                    {!isHeld ? " · created by you" : ""}
                  </span>
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/70 px-4 py-3">
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Price
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  ${token.priceUsd}
                </span>
              </div>
            </Link>
            {isHeld && (
              <button
                type="button"
                onClick={() => onRemove(token.id)}
                aria-label={`Remove ${token.name} from owned`}
                title="Remove from owned"
                className="absolute -right-1.5 -top-1.5 z-10 flex size-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 opacity-0 shadow-md transition-all hover:border-red-500/60 hover:text-red-400 group-hover/token:opacity-100"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        );
        })}
      </div>

      <Pagination current={safePage} total={totalPages} onChange={setPage} />
    </div>
  );
}

function CollectionsTab({
  collections,
}: {
  collections: CollectionCreation[];
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(collections.length / LIMIT));
  const safePage = Math.min(page, totalPages);
  const visible = collections.slice(
    (safePage - 1) * LIMIT,
    safePage * LIMIT
  );

  const { sectionRef, listRef, scrollToPage } = useGridScroll();
  useEffect(() => {
    scrollToPage(safePage);
  }, [safePage, scrollToPage]);

  if (collections.length === 0) {
    return (
      <EmptyState
        title="No collections yet"
        description="Launch your first collection from the Launchpad and manage it from here."
        href={routes.create}
        hrefLabel="Open Launchpad"
      />
    );
  }

  return (
    <div ref={sectionRef}>
      <p className="mb-4 text-xs text-muted">
        {collections.length} result
        {collections.length === 1 ? "" : "s"} · {LIMIT} per page · page {safePage} of{" "}
        {totalPages}
      </p>
      <div
        ref={listRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:max-h-[calc(100dvh-13rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1"
      >
        {visible.map((collection) => (
          <Link
            key={collection.id}
            href={routes.collectionDetail(collection.id)}
            className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
          >
            <div className="relative aspect-[2/1] overflow-hidden bg-zinc-950">
              {collection.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collection.imageUrl}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand/25 via-brand/5 to-transparent" />
              )}
              <Thumb
                seed={collection.id}
                name={collection.name}
                className="absolute bottom-2 left-2 size-12 rounded-xl text-sm shadow-lg"
              />
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {collection.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {collection.symbol} · {getChain(collection.chain)?.label ?? collection.chain}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800/70 pt-3">
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  Floor
                </span>
                <span className="text-sm font-semibold text-zinc-100">
                  {collection.floorPriceEth} ETH
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Pagination current={safePage} total={totalPages} onChange={setPage} />
    </div>
  );
}

function SettingsTab({
  profile,
  settings,
  onSaveProfile,
  onUpdateSettings,
  onReset,
}: {
  profile: { displayName: string; bio: string; avatarUrl?: string; coverUrl?: string };
  settings: { launchAlerts: boolean; priceAlerts: boolean; activityAlerts: boolean };
  onSaveProfile: (patch: Partial<typeof profile>) => boolean;
  onUpdateSettings: (patch: Partial<typeof settings>) => void;
  onReset: () => void;
}) {
  const [name, setName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl ?? "");

  function save() {
    const persisted = onSaveProfile({
      displayName: name.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl || undefined,
      coverUrl: coverUrl || undefined,
    });
    if (persisted) {
      showToast({
        kind: "success",
        title: "Profile updated",
        message: "Your profile and images have been saved.",
      });
    } else {
      showToast({
        kind: "error",
        title: "Could not save",
        message:
          "Your images may be too large to store. Try a smaller image or two smaller files.",
      });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${PANEL} p-5`}>
        <h2 className="text-sm font-semibold text-zinc-50">Profile</h2>
        <p className="mt-1 text-xs text-muted">
          Update your display name, bio, and images.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Display name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ForgeFan"
            />
          </Field>

          <Field label="Bio">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community a little about yourself…"
            />
          </Field>

          <ImagePicker
            label="Avatar"
            hint="Upload a square image. Stored locally on this device."
            alt="Profile avatar preview"
            value={avatarUrl}
            onChange={setAvatarUrl}
          />

          <ImagePicker
            label="Cover"
            hint="Upload a wide banner. Stored locally on this device."
            alt="Profile cover preview"
            value={coverUrl}
            onChange={setCoverUrl}
          />

          <Button onClick={save} className="w-full">
            Save changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`${PANEL} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-50">Notifications</h2>
          <p className="mt-1 text-xs text-muted">
            Choose which updates you want to hear about.
          </p>

          <div className="mt-5 space-y-3">
            <ToggleRow
              label="Launch alerts"
              description="New token, NFT and collection launches."
              checked={settings.launchAlerts}
              onChange={(checked) => onUpdateSettings({ launchAlerts: checked })}
            />
            <ToggleRow
              label="Price alerts"
              description="Price moves on tokens you own or watch."
              checked={settings.priceAlerts}
              onChange={(checked) => onUpdateSettings({ priceAlerts: checked })}
            />
            <ToggleRow
              label="Activity alerts"
              description="Bids, offers and wallet activity."
              checked={settings.activityAlerts}
              onChange={(checked) =>
                onUpdateSettings({ activityAlerts: checked })
              }
            />
          </div>
        </div>

        <div className={`${PANEL} p-5`}>
          <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
          <p className="mt-1 text-xs text-muted">
            Reset your profile, images and owned items to defaults.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => {
              if (window.confirm("Reset your profile to defaults?")) {
                onReset();
                showToast({
                  kind: "info",
                  title: "Profile reset",
                  message: "Your profile has been restored to default settings.",
                });
              }
            }}
          >
            Reset profile
          </Button>
        </div>
      </div>
    </div>
  );
}

function ImagePicker({
  label,
  hint,
  alt,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  alt: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({
        kind: "error",
        title: "Not an image",
        message: "Choose an image file to upload.",
      });
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      showToast({
        kind: "error",
        title: "Image too large",
        message: "Choose an image under 1.5 MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setBusy(false);
      showToast({
        kind: "success",
        title: "Image added",
        message: `${label} preview updated. Press Save changes to keep it.`,
      });
    };
    reader.onerror = () => {
      setBusy(false);
      showToast({
        kind: "error",
        title: "Could not read image",
        message: "Try a different file.",
      });
    };
    setBusy(true);
    reader.readAsDataURL(file);
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt} className="size-full object-cover" />
          ) : (
            <span className="text-xs text-muted">No image</span>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Reading…" : "Upload image"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}