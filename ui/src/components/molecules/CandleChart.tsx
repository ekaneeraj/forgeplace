"use client";

import { useMemo, useState } from "react";
import { CHART_RANGES, candleSeries } from "@/lib/token-stats";
import type { ChartRange, Candle } from "@/lib/token-stats";
import type { TokenCreation } from "@/lib/types";

const VIEW_W = 100;
const VIEW_H = 220;
const PAD_TOP = 10;
const PAD_BOTTOM = 8;

const UP = "#34d399";
const DOWN = "#f87171";

type ChartType = "candles" | "line";

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "candles", label: "Candles" },
  { id: "line", label: "Line" },
];

function priceLabel(value: number) {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
}

function timeLabel(time: number, range: ChartRange) {
  const d = new Date(time);
  switch (range) {
    case "1h":
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    case "1D":
      return `${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    case "1W":
      return `${d.toLocaleDateString("en-US", { weekday: "short" })} ${d.toLocaleTimeString("en-US", { hour: "numeric" })}`;
    case "1M":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "1Y":
      return d.toLocaleDateString("en-US", { month: "short" });
  }
}

function tooltipTime(time: number) {
  return new Date(time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function niceStep(range: number) {
  if (range <= 0) return 0.01;
  const pow = Math.pow(10, Math.floor(Math.log10(range)));
  for (const factor of [1, 1.5, 2, 2.5, 5, 7.5, 10]) {
    const step = factor * pow;
    if (step * 4 >= range) return step;
  }
  return 10 * pow;
}

interface CandleChartProps {
  token: TokenCreation;
}

export function CandleChart({ token }: CandleChartProps) {
  const [range, setRange] = useState<ChartRange>("1D");
  const [type, setType] = useState<ChartType>("candles");
  const [hover, setHover] = useState<number | null>(null);

  const { candles, current, change } = useMemo(
    () => candleSeries(token, range),
    [token, range]
  );

  const count = candles.length;
  const up = change >= 0;
  const trendColor = up ? UP : DOWN;

  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || (current * 0.02 || 0.01);
  const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM;

  const yFor = (v: number) => PAD_TOP + (1 - (v - min) / span) * plotH;
  const xFor = (i: number) => ((i + 0.5) / count) * VIEW_W;
  const bodyW = Math.max(0.5, (VIEW_W / count) * 0.6);

  const step = niceStep(span);
  const start = Math.floor(min / step) * step;
  const yTicks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    yTicks.push(v);
    if (yTicks.length >= 6) break;
  }

  const xStepIdx = Math.max(1, Math.ceil(count / 5));
  const xLabels = candles
    .map((c, i) => ({ i, label: timeLabel(c.time, range) }))
    .filter((_, i) => i % xStepIdx === 0);

  const maxVolume = Math.max(...candles.map((c) => c.volume));
  const volumeH = (v: number) => (v / maxVolume) * plotH * 0.16;

  const linePath = candles
    .map((c, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(c.close)}`)
    .join(" ");
  const areaPath = `${linePath} L${VIEW_W},${VIEW_H - PAD_BOTTOM} L0,${VIEW_H - PAD_BOTTOM} Z`;
  const lastX = xFor(count - 1);
  const lastY = yFor(candles[count - 1].close);

  function handleMove(clientX: number, rectWidth: number) {
    const fraction = clientX / rectWidth;
    const index = Math.min(
      count - 1,
      Math.max(0, Math.floor(fraction * count))
    );
    setHover(index);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Price
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-zinc-50">
              ${priceLabel(current)}
            </p>
            <span
              className={`text-xs font-semibold ${
                up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-1">
            {CHART_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  type === t.id
                    ? "bg-brand text-white"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-1">
            {CHART_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRange(r.id);
                  setHover(null);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  range === r.id
                    ? "bg-brand text-white"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <div
          className="relative flex-1 overflow-hidden"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleMove(e.clientX - rect.left, rect.width);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            className="block h-56 w-full"
            aria-label={`${range} ${type} chart for ${token.name}`}
          >
            <defs>
              <linearGradient id="chart-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={trendColor} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={VIEW_W}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#27272a"
                strokeWidth={0.4}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 3"
              />
            ))}

            {candles.map((candle, i) => {
              const x = xFor(i);
              const volY = VIEW_H - PAD_BOTTOM;
              const vh = volumeH(candle.volume);
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - bodyW / 2}
                  y={volY - vh}
                  width={bodyW}
                  height={vh}
                  fill={trendColor}
                  opacity={type === "line" ? 0.12 : i === count - 1 ? 0.5 : 0.2}
                />
              );
            })}

            {type === "line" ? (
              <g>
                <path d={areaPath} fill="url(#chart-area-fill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke={trendColor}
                  strokeWidth={1.1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={lastX} cy={lastY} r={1.6} fill={trendColor} />
              </g>
            ) : (
              candles.map((candle, i) => {
                const bullish = candle.close >= candle.open;
                const color = bullish ? UP : DOWN;
                const yOpen = yFor(candle.open);
                const yClose = yFor(candle.close);
                const x = xFor(i);
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      x2={x}
                      y1={yFor(candle.high)}
                      y2={yFor(candle.low)}
                      stroke={color}
                      strokeWidth={0.6}
                      vectorEffect="non-scaling-stroke"
                    />
                    <rect
                      x={x - bodyW / 2}
                      y={Math.min(yOpen, yClose)}
                      width={bodyW}
                      height={Math.max(Math.abs(yOpen - yClose), 0.6)}
                      rx={0.3}
                      fill={color}
                    />
                    {hover === i && (
                      <rect
                        x={x - bodyW / 2 - 1.5}
                        y={PAD_TOP}
                        width={bodyW + 3}
                        height={plotH}
                        fill="none"
                        stroke="#52525b"
                        strokeWidth={0.4}
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="2 3"
                      />
                    )}
                  </g>
                );
              })
            )}
          </svg>

          {hover !== null && candles[hover] && (
            <ChartTooltip candle={candles[hover]} count={count} index={hover} />
          )}
        </div>

        <div className="relative h-56 w-11 shrink-0" aria-hidden>
          {yTicks.map((tick) => (
            <span
              key={tick}
              className="absolute left-0 -translate-y-1/2 font-mono text-[10px] leading-none text-zinc-500"
              style={{ top: `${(yFor(tick) / VIEW_H) * 100}%` }}
            >
              {priceLabel(tick)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex justify-between gap-2 pr-[52px] font-mono text-[10px] text-zinc-500">
        {xLabels.map(({ i, label }) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function ChartTooltip({
  candle,
  count,
  index,
}: {
  candle: Candle;
  count: number;
  index: number;
}) {
  const bullish = candle.close >= candle.open;
  const left = Math.min(96, Math.max(4, ((index + 0.5) / count) * 100));

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-lg shadow-black/50"
      style={{ left: `${left}%` }}
    >
      <p className="text-[10px] text-muted">{tooltipTime(candle.time)}</p>
      <dl className="mt-1 space-y-0.5 font-mono text-[10px] leading-none">
        <Row label="O" value={priceLabel(candle.open)} />
        <Row label="H" value={priceLabel(candle.high)} />
        <Row label="L" value={priceLabel(candle.low)} />
        <Row
          label="C"
          value={priceLabel(candle.close)}
          tint={bullish ? "text-emerald-400" : "text-red-400"}
        />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  tint = "text-zinc-200",
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={tint}>{value}</dd>
    </div>
  );
}