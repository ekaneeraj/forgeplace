# ForgePlace UI — Build Plan

Web3 launchpad frontend. **UI-only phase**: no wallet integration, no API, no smart contracts.
Stack: Next.js 16.3.2 (App Router), React 19 + React Compiler, Tailwind v4, TypeScript, Bun.
Design: **light & minimal**, custom Tailwind components (no UI library).

> Read `node_modules/next/dist/docs/` before writing code (Next 16 has breaking changes vs older
> versions). Use typed route helpers `PageProps<'/route'>` / `LayoutProps<'/route'>`.
> Run `bun run lint` and `bun run build` to verify.

## Decisions locked during planning

- **Wallet**: "Connect Wallet" toggles a **mock connected state** (truncated address like
  `0x1234…abcd`). Gated sections (Recent Launches, My Creations) render against this mock state.
- **Data**: all data lives in a **separate mock-data layer** behind a single access module
  (`src/lib/data.ts`). When real integration arrives, only this file's internals get swapped to
  API/contract calls — pages keep importing from the same path.
- **Launch action**: simulated success flow — validate → spinner (~1.5s fake tx) → redirect to the
  detail page of the created item. New items appear instantly in Recent Launches / My Creations
  (persisted to `localStorage`, merged over seed data).
- **Collections**: ERC721/ERC1155 items must belong to a collection of the matching type.
  ERC20 has none. If no suitable collection exists → prompt/link to create one first; otherwise
  select existing or create new. Collections are type-specific (ERC721 collections only appear for
  ERC721 creation, same for ERC1155).
- **Create routing**: `/create/token` is a dedicated ERC20 page. ERC721 + ERC1155 share one common
  form (`/create/nft`) with a type toggle that swaps fields and filters collections.
  `/create` options page shows **2 cards**: Token (ERC20) and NFT (ERC721/1155).
- **Collection creation**: separate page (`/collections/new?type=…&return=…`) which redirects back
  to the form afterwards with the new collection pre-selected.
- **Navbar** (flat links): Logo | Home | Create | My Creations | Connect Wallet button.
  No public Explore — we only show what the connected wallet created via our factory.
- **Homepage sections**: Hero + CTA → modal with 3 options (ERC20/ERC721/ERC1155) routing to the
  right form · About-the-standards section (3 explainer cards) · How it works (3 steps) ·
  Recent Launches (visible only when wallet connected; horizontal scroll; "View all" →
  `/my-creations`) · Footer.

## Routes (`src/app`)

| Route | Page | Rendering |
|---|---|---|
| `/` | Homepage | Server |
| `/create` | 2 launch-type cards (Token / NFT) | Server |
| `/create/token` | ERC20 form: Name, Symbol, Decimals (default 18), Initial Supply | Client |
| `/create/nft` (`?type=erc721\|erc1155`) | Common form: type toggle swaps fields (ERC721: name, symbol, max supply, mint price, base URI, description · ERC1155: name, URI template, editions/supply per ID, mint price, description) + collection selector filtered by type | Client |
| `/collections/new?type=…&return=…` | Collection form (name, symbol, description, image); redirects back with new collection pre-selected | Client |
| `/my-creations` | All creations by connected wallet; filter tabs All / Tokens / Collections / NFTs; connect-gated | Server + Client tabs |
| `/token/[id]` | ERC20 details: name, symbol, supply, decimals, mock contract address + tx hash | Server |
| `/collection/[id]` | Cover image, stats (items, volume, floor), items grid | Server |
| `/item/[id]` | Image, traits/attributes, owner, supply (ERC1155), collection link | Server |

## Architecture

```
src/
  app/                    # routes above (root layout renders Navbar + Footer)
  components/
    ui/                   # Button, Card, Input, Select, Modal, Badge, Field…
    layout/               # Navbar, Footer
    home/                 # Hero, LaunchTypeModal, AboutStandards, HowItWorks, RecentLaunches
    create/               # TokenForm, NftForm, CollectionForm, TypeToggle
    shared/               # CreationCard, StatPill, ConnectPrompt
  lib/
    data.ts               # single data-access layer (getCreations, getCreation(id),
                          #   getCollections(type), addCreation…) — swap internals for real API later
    mock-data.ts          # seed tokens/collections/items + mock address & tx-hash generators
    types.ts              # TokenStandard = 'erc20'|'erc721'|'erc1155', Creation, Collection…
  context/
    wallet-context.tsx    # "use client"; mock connected state + address; persisted to localStorage
```

- Forms: native React state + HTML validation (no extra deps in this phase).
- Theme tokens in `src/app/globals.css`; Geist fonts already wired in layout.
- Per-page metadata; `"use client"` only where interactivity is required.

## Implementation order

1. Types + mock data layer + wallet context
2. UI primitives + Navbar/Footer wired into root layout
3. Homepage (hero, launch-type modal, about/how-it-works/recent-launches sections)
4. Create flow: `/create`, `/create/token`, `/create/nft`, `/collections/new` + simulated launch
5. Detail pages (`/token/[id]`, `/collection/[id]`, `/item/[id]`) + `/my-creations`
6. Polish: empty states, loading states, responsive pass, lint + build green
