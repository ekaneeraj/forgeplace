"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChainBadge,
  StandardBadge,
} from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ArrowLeftIcon } from "@/components/atoms/icons";
import { Thumb } from "@/components/atoms/Thumb";
import { ConnectWalletButton } from "@/components/molecules/ConnectWalletButton";
import { Nft3DViewer } from "@/components/molecules/Nft3DViewer";
import { routes } from "@/config/site";
import { useWallet } from "@/context/wallet-context";
import { useProfile } from "@/context/profile-context";
import { useCreations } from "@/hooks/use-creations";
import { updateItem } from "@/lib/data";
import { randomTxHash } from "@/lib/mock-data";
import { delay, LAUNCH_DELAY_MS } from "@/lib/simulation";
import { txError, txSuccess } from "@/lib/toasts";
import { ItemCard } from "@/components/molecules/ItemCard";
import { formatAmount, formatDate, itemPriceInfo, shortAddress } from "@/lib/format";
import type { ItemCreation } from "@/lib/types";

interface ItemDetailsProps {
  id: string;
}

export function ItemDetails({ id }: ItemDetailsProps) {
  const creations = useCreations();
  const { connected, address } = useWallet();
  const item = creations.find((creation) => creation.kind === "item" && creation.id === id);
  const collection =
    item?.kind === "item"
      ? creations.find((creation) => creation.kind === "collection" && creation.id === item.collectionId)
      : undefined;
  const isOwner = connected && address === item?.creatorAddress;

  if (!item || item.kind !== "item") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-100">Item not found</p>
          <p className="mt-2 text-sm text-muted">
            This NFT doesn&apos;t exist or isn&apos;t available on this device.
          </p>
          <Button href={routes.explore} variant="outline" className="mt-6">
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const mintEnabled = item.mintEnabled ?? item.listingStatus === "mintable";
  const sameCollectionItems = creations
    .filter(
      (creation): creation is Extract<typeof creation, { kind: "item" }> =>
        creation.kind === "item" &&
        creation.collectionId === item.collectionId &&
        creation.id !== item.id
    )
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={routes.explore}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-100"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        {collection && (
          <>
            <span aria-hidden>·</span>
            <Link
              href={routes.collectionDetail(collection.id)}
              className="transition-colors hover:text-zinc-100"
            >
              {collection.name}
            </Link>
          </>
        )}
        <span aria-hidden>·</span>
        <span className="text-zinc-100">#{item.tokenId}</span>
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
            {item.imageUrl ? (
              <Nft3DViewer src={item.imageUrl} alt={item.name} />
            ) : (
              <Thumb
                seed={`${item.name}-${item.id}`}
                name={item.name}
                className="h-full w-full rounded-none text-6xl"
              />
            )}
            <div className="absolute left-3 top-3 flex gap-2">
              <StandardBadge standard={item.standard} />
            </div>
            <div className="absolute right-3 top-3">
              <ChainBadge chain={item.chain} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Minting metadata live
            </span>
            <span>{item.standard.toUpperCase()}</span>
          </div>
        </div>

        <div className="min-w-0">
          {collection && (
            <Link
              href={routes.collectionDetail(collection.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-1.5 pl-1.5 pr-3 text-sm text-zinc-200 transition-colors hover:border-zinc-700"
            >
              <Thumb
                seed={collection.id}
                name={collection.name}
                className="size-7 rounded-md"
              />
              {collection.name}
            </Link>
          )}

          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            {item.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>
              Owned by{" "}
              <span className="font-mono text-zinc-300">
                {shortAddress(item.creatorAddress)}
              </span>
            </span>
          </div>

          {isOwner ? (
            <div className="mt-6">
              <OwnerPanel item={item} mintEnabled={mintEnabled} />
            </div>
          ) : (
            <div className="mt-6">
              <BuyerPanel item={item} mintEnabled={mintEnabled} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 border-t border-zinc-800/70 pt-6">
        <ItemTabs item={item} />
      </div>

      {sameCollectionItems.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between gap-4 border-t border-zinc-800/70 pt-6">
            <h2 className="text-lg font-semibold text-zinc-50">
              More from {collection?.name ?? "this collection"}
            </h2>
            {collection && (
              <Link
                href={routes.collectionDetail(collection.id)}
                className="text-sm font-medium text-brand transition-colors hover:underline"
              >
                View collection
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sameCollectionItems.map((other) => (
              <ItemCard key={other.id} item={other} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------------------------- Tabs ----------------------------------- */

function ItemTabs({ item }: { item: ItemCreation }) {
  const [active, setActive] = useState<"about" | "details" | "attributes">("about");
  const hasAttributes = item.traits.length > 0;

  return (
    <div>
      <div className="flex gap-1 border-b border-zinc-800">
        <TabButton
          active={active === "about"}
          onClick={() => setActive("about")}
        >
          About
        </TabButton>
        <TabButton
          active={active === "details"}
          onClick={() => setActive("details")}
        >
          Details
        </TabButton>
        {hasAttributes && (
          <TabButton
            active={active === "attributes"}
            onClick={() => setActive("attributes")}
          >
            Properties
            <span className="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
              {item.traits.length}
            </span>
          </TabButton>
        )}
      </div>

      <div className="py-6">
        {active === "about" &&
          (item.description ? (
            <p className="max-w-3xl text-sm leading-7 text-muted">
              {item.description}
            </p>
          ) : (
            <p className="text-sm text-muted">No description for this item.</p>
          ))}

        {active === "details" && (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Token ID" value={`#${item.tokenId}`} mono />
            <DetailItem label="Standard" value={item.standard.toUpperCase()} />
            <DetailItem label="Chain" value={getChainLabel(item.chain)} />
            <DetailItem label="Supply" value={item.standard === "erc1155" ? formatAmount(item.supply) : "Unique"} />
            <DetailItem label="Created" value={formatDate(item.createdAt)} />
            <DetailItem label="Creator" value={shortAddress(item.creatorAddress)} mono />
            <DetailItem label="Contract" value={shortAddress(item.contractAddress)} mono />
            {item.lastSoldEth && (
              <DetailItem label="Last sold" value={`${item.lastSoldEth} ETH`} />
            )}
          </dl>
        )}

        {active === "attributes" && hasAttributes && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {item.traits.map((trait) => (
              <div
                key={`${trait.traitType}-${trait.value}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5"
              >
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {trait.traitType}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">
                  {trait.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px inline-flex items-center border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-brand text-zinc-50"
          : "border-transparent text-muted hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd
        className={`mt-0.5 truncate text-sm font-semibold text-zinc-100 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function getChainLabel(chainId: string) {
  return chainId.charAt(0).toUpperCase() + chainId.slice(1);
}

const panel =
  "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4";

/* -------------------------------- Owner panel -------------------------------- */

function OwnerPanel({
  item,
  mintEnabled,
}: {
  item: ItemCreation;
  mintEnabled: boolean;
}) {
  const [saleOpen, setSaleOpen] = useState(false);
  const [salePrice, setSalePrice] = useState(item.buyPriceEth ?? "");
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [minBid, setMinBid] = useState(item.auctionBaseEth ?? "");
  const [mintOpen, setMintOpen] = useState(false);
  const [mintPrice, setMintPrice] = useState(item.mintPriceEth);
  const [busy, setBusy] = useState<"mint" | "sale" | "auction" | null>(null);
  const [message, setMessage] = useState("");

  async function run(
    key: "mint" | "sale" | "auction",
    patch: () => Partial<ItemCreation>,
    title: string,
    successMessage: string
  ) {
    setBusy(key);
    await delay(LAUNCH_DELAY_MS);
    const updated = updateItem(item.id, { ...patch(), txHash: randomTxHash() });
    if (!updated) {
      txError(title, randomTxHash(), "Transaction failed — please try again.");
      setBusy(null);
      return;
    }
    txSuccess(title, updated.txHash, successMessage);
    setMessage(successMessage);
    setSaleOpen(false);
    setAuctionOpen(false);
    setMintOpen(false);
    setBusy(null);
  }

  const isBuy = item.listingStatus === "buy";
  const isAuction = item.listingStatus === "auction";

  return (
    <div className={`${panel} space-y-4`}>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Owner controls
        </p>
        <p className="mt-0.5 text-2xl font-semibold text-zinc-50">
          {item.mintPriceEth} ETH
        </p>
        <p className="text-xs text-muted">Mint price</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={mintEnabled ? "outline" : "primary"}
          loading={busy === "mint"}
          onClick={() => {
            if (mintEnabled) {
              run(
                "mint",
                () => ({ mintEnabled: false }),
                "Minting disabled",
                "Minting is now off."
              );
            } else {
              setSaleOpen(false);
              setAuctionOpen(false);
              setMintOpen((open) => !open);
            }
          }}
        >
          {mintEnabled ? "Disable mint" : "Enable mint"}
        </Button>
        {!isBuy && (
          <Button
            variant="outline"
            onClick={() => {
              setMintOpen(false);
              setAuctionOpen(false);
              setSaleOpen((open) => !open);
            }}
          >
            Start sale
          </Button>
        )}
        {!isAuction && (
          <Button
            variant="outline"
            onClick={() => {
              setMintOpen(false);
              setSaleOpen(false);
              setAuctionOpen((open) => !open);
            }}
          >
            Set for auction
          </Button>
        )}
      </div>

      {mintOpen && !mintEnabled && (
        <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
          <input
            type="number"
            min={0}
            step="any"
            value={mintPrice}
            onChange={(e) => setMintPrice(e.target.value)}
            placeholder="Mint price (ETH)"
            className="w-full rounded-lg border border-zinc-700 bg-white/5 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-brand"
          />
          <Button
            size="sm"
            loading={busy === "mint"}
            disabled={!mintPrice || Number(mintPrice) < 0}
            onClick={() =>
              run(
                "mint",
                () => ({
                  mintEnabled: true,
                  mintPriceEth: mintPrice,
                  listingStatus: "mintable",
                }),
                "Minting enabled",
                `Minting is open at ${mintPrice} ETH.`
              )
            }
          >
            Enable
          </Button>
        </div>
      )}

      {saleOpen && !isBuy && (
        <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
          <input
            type="number"
            min={0}
            step="any"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Sale price (ETH)"
            className="w-full rounded-lg border border-zinc-700 bg-white/5 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-brand"
          />
          <Button
            size="sm"
            loading={busy === "sale"}
            disabled={!salePrice || Number(salePrice) < 0}
            onClick={() =>
              run(
                "sale",
                () => ({
                  listingStatus: "buy",
                  buyPriceEth: salePrice,
                  mintEnabled: false,
                }),
                "Listed for sale",
                `This item is now listed at ${salePrice} ETH.`
              )
            }
          >
            List
          </Button>
        </div>
      )}

      {auctionOpen && !isAuction && (
        <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2">
          <input
            type="number"
            min={0}
            step="any"
            value={minBid}
            onChange={(e) => setMinBid(e.target.value)}
            placeholder="Minimum bid (ETH)"
            className="w-full rounded-lg border border-zinc-700 bg-white/5 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-brand"
          />
          <Button
            size="sm"
            loading={busy === "auction"}
            disabled={!minBid || Number(minBid) < 0}
            onClick={() =>
              run(
                "auction",
                () => ({
                  listingStatus: "auction",
                  auctionBaseEth: minBid,
                  highestBidEth: undefined,
                  highestBidder: undefined,
                  mintEnabled: false,
                }),
                "Auction started",
                `Bidding opens from ${minBid} ETH.`
              )
            }
          >
            Start
          </Button>
        </div>
      )}

      {(isBuy || isAuction) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5 text-sm">
          <span className="text-zinc-300">
            {isBuy ? `For sale at ${item.buyPriceEth} ETH` : `Auction · min ${item.auctionBaseEth} ETH`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            loading={busy === (isBuy ? "sale" : "auction")}
            onClick={() =>
              run(
                isBuy ? "sale" : "auction",
                () =>
                  isBuy
                    ? { listingStatus: "mintable", buyPriceEth: undefined, mintEnabled: false }
                    : {
                        listingStatus: "mintable",
                        auctionBaseEth: undefined,
                        highestBidEth: undefined,
                        highestBidder: undefined,
                        mintEnabled: false,
                      },
                isBuy ? "Sale ended" : "Auction ended",
                isBuy
                  ? "This item is no longer listed for sale."
                  : "This auction has been closed."
              )
            }
          >
            {isBuy ? "End sale" : "End auction"}
          </Button>
        </div>
      )}

      {message && <p className="text-sm font-medium text-brand">{message}</p>}
    </div>
  );
}

/* -------------------------------- Buyer panel -------------------------------- */

function BuyerPanel({
  item,
  mintEnabled,
}: {
  item: ItemCreation;
  mintEnabled: boolean;
}) {
  const { connected, address } = useWallet();
  const { addOwnedItem } = useProfile();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  if (!connected) {
    return (
      <div className={`${panel} flex flex-col items-start gap-3`}>
        <p className="text-sm text-muted">
          Connect your wallet to mint, buy or bid on this item.
        </p>
        <ConnectWalletButton />
      </div>
    );
  }

  const currentBid = Number(item.highestBidEth ?? "0");
  const minBid = Number(item.auctionBaseEth ?? "0");
  const isHighestBidder = item.highestBidder === address;
  const price = itemPriceInfo(item);

  async function purchase(eth: string, verb: string) {
    setBusy(true);
    await delay(LAUNCH_DELAY_MS);
    const leftover = item.supply - 1;
    const updated = updateItem(item.id, {
      txHash: randomTxHash(),
      ...(item.standard === "erc721"
        ? { listingStatus: "sold", lastSoldEth: eth }
        : {
            supply: Math.max(0, leftover),
            listingStatus: leftover <= 0 ? "sold" : item.listingStatus,
          }),
    });
    setBusy(false);
    if (!updated) {
      txError(verb, randomTxHash(), "Transaction failed — please try again.");
      return;
    }
    addOwnedItem(item.id);
    const owned = verb === "Minted" ? "minted" : "purchased";
    setMessage(`${verb} — you now own this item.`);
    txSuccess(verb, updated.txHash, `You ${owned} this item for ${eth} ETH.`);
  }

  async function placeBid() {
    setBusy(true);
    await delay(LAUNCH_DELAY_MS);
    const updated = updateItem(item.id, {
      txHash: randomTxHash(),
      highestBidEth: bidAmount,
      highestBidder: address ?? "",
    });
    setBusy(false);
    if (!updated) {
      txError("Bid failed", randomTxHash(), "Transaction failed — please try again.");
      return;
    }
    setBidAmount("");
    setMessage("Bid placed — you are the highest bidder.");
    txSuccess("Bid placed", updated.txHash, "You are now the highest bidder.");
  }

  const isSold = item.listingStatus === "sold";
  const bidTooLow = Boolean(bidAmount && Number(bidAmount) <= Math.max(currentBid, minBid));

  return (
    <div className={`${panel} space-y-4`}>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted">
          {price.label}
        </p>
        <p className="mt-0.5 text-2xl font-semibold text-zinc-50">
          {price.value}
        </p>
        <p className="text-xs text-muted">
          {item.standard === "erc1155" ? `${formatAmount(item.supply)} available` : "1 of 1"}
        </p>
      </div>

      {item.listingStatus === "buy" && (
        <Button
          size="lg"
          className="w-full"
          loading={busy}
          onClick={() => purchase(item.buyPriceEth ?? "0", "Purchased")}
        >
          Buy now
        </Button>
      )}

      {item.listingStatus === "auction" && (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            {isHighestBidder
              ? "You are the highest bidder."
              : currentBid > 0
                ? `Highest bid: ${item.highestBidEth} ETH`
                : `Minimum bid: ${item.auctionBaseEth} ETH`}
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step="any"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Your bid (ETH)"
              className="w-full rounded-lg border border-zinc-700 bg-white/5 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-brand"
            />
            <Button
              size="lg"
              loading={busy}
              disabled={!bidAmount || bidTooLow}
              onClick={placeBid}
            >
              Place bid
            </Button>
          </div>
          {bidTooLow && (
            <p className="text-xs text-red-400">
              Bid must be higher than {Math.max(currentBid, minBid)} ETH.
            </p>
          )}
        </div>
      )}

      {item.listingStatus === "mintable" && mintEnabled && (
        <Button
          size="lg"
          className="w-full"
          loading={busy}
          onClick={() => purchase(item.mintPriceEth, "Minted")}
        >
          Mint for {item.mintPriceEth} ETH
        </Button>
      )}

      {isSold && <p className="text-sm text-muted">This item has been sold.</p>}

      {mintEnabled === false &&
        item.listingStatus === "mintable" && (
          <p className="text-sm text-muted">
            Not for sale yet — check back soon.
          </p>
        )}

      {message && <p className="text-sm font-medium text-brand">{message}</p>}
    </div>
  );
}