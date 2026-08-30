import { randomAddress } from "./mock-data";
import type { TokenCreation } from "./types";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(rng: () => number, values: T[]): T {
  return values[Math.floor(rng() * values.length)];
}

export type ChartRange = "1h" | "1D" | "1W" | "1M" | "1Y";

export const CHART_RANGES: { id: ChartRange; label: string; count: number; stepMs: number }[] = [
  { id: "1h", label: "1H", count: 60, stepMs: 60_000 },
  { id: "1D", label: "1D", count: 24, stepMs: 3_600_000 },
  { id: "1W", label: "1W", count: 28, stepMs: 6 * 3_600_000 },
  { id: "1M", label: "1M", count: 30, stepMs: 86_400_000 },
  { id: "1Y", label: "1Y", count: 52, stepMs: 7 * 86_400_000 },
];

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandleSeries {
  candles: Candle[];
  current: number;
  change: number;
}

export function candleSeries(token: TokenCreation, range: ChartRange): CandleSeries {
  const rng = mulberry32(seedFromString(`${token.id}-${range}`));
  const base = Number(token.priceUsd) || 0.01;
  const spec = CHART_RANGES.find((r) => r.id === range) ?? CHART_RANGES[1];
  const { count, stepMs } = spec;

  const volatility =
    range === "1h" ? 0.004
    : range === "1D" ? 0.007
    : range === "1W" ? 0.01
    : range === "1M" ? 0.015
    : 0.02;

  const now = Date.now();
  const candles: Candle[] = [];
  let price = base * (0.45 + rng() * 0.6);

  for (let i = 0; i < count; i++) {
    const open = price;
    const move = (rng() - 0.5) * 2 * volatility;
    const close = Math.max(0.000001, price * (1 + move));
    const wick = volatility * (0.25 + rng() * 0.75);
    const high = Math.max(open, close) * (1 + wick);
    const low = Math.min(open, close) * (1 - wick);
    const volume = 0.6 + rng() * 1.4;
    candles.push({
      time: now - (count - 1 - i) * stepMs,
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }

  const scale = base / price;
  for (const c of candles) {
    c.open *= scale;
    c.high *= scale;
    c.low *= scale;
    c.close *= scale;
  }

  const first = candles[0];
  const last = candles[candles.length - 1];
  const change = ((last.close - first.open) / first.open) * 100;

  return { candles, current: last.close, change };
}

export interface TokenHolder {
  rank: number;
  address: string;
  amount: number;
  share: number;
}

export function topHolders(token: TokenCreation): TokenHolder[] {
  const rng = mulberry32(seedFromString(`${token.id}-holders`));
  const supply = Number(token.initialSupply) || 0;
  const holders: TokenHolder[] = [];
  let remaining = 0.98;

  for (let rank = 1; rank <= 10; rank++) {
    const share = rank === 1 ? 0.34 + rng() * 0.11 : remaining * (0.08 + rng() * 0.14);
    const clamped = Math.min(share, remaining);
    remaining -= clamped;
    holders.push({
      rank,
      address: rank === 1 ? token.creatorAddress : randomAddress(),
      amount: supply * clamped,
      share: clamped * 100,
    });
  }

  return holders;
}

export type TokenTxType = "Mint" | "Transfer" | "Swap" | "Burn";

export interface TokenTx {
  id: string;
  type: TokenTxType;
  address: string;
  amount: number;
  timestamp: number;
  txHash: string;
}

const TX_TYPES: TokenTxType[] = ["Swap", "Transfer", "Transfer", "Mint", "Swap", "Swap", "Burn", "Transfer"];

export function recentTransactions(token: TokenCreation): TokenTx[] {
  const rng = mulberry32(seedFromString(`${token.id}-txs`));
  const supply = Number(token.initialSupply) || 1;
  const now = Date.now();
  const txs: TokenTx[] = [];

  for (let i = 0; i < 20; i++) {
    const hoursAgo = 0.25 + i * (2 + rng() * 6);
    const amountScale = 0.001 + rng() * 0.04;
    txs.push({
      id: `${token.id}-tx-${i}`,
      type: pick(rng, TX_TYPES),
      address: randomAddress(),
      amount: supply * amountScale,
      timestamp: now - hoursAgo * 60 * 60 * 1000,
      txHash: `0x${token.txHash.slice(2).slice(0, 6)}${String(i).padStart(2, "0")}${new Array(56)
        .fill(0)
        .map(() => "0123456789abcdef"[Math.floor(rng() * 16)])
        .join("")}`,
    });
  }

  return txs;
}