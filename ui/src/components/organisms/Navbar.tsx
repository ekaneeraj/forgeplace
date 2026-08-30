"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, siteConfig } from "@/config/site";
import { MenuIcon, XIcon, ZapIcon } from "@/components/atoms/icons";
import { ConnectWalletButton } from "@/components/molecules/ConnectWalletButton";
import { useWallet } from "@/context/wallet-context";

export function Navbar() {
  const pathname = usePathname();
  const { connected } = useWallet();
  const links = navLinks.filter((link) => !link.requiresWallet || connected);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleClick = useCallback(
    (href: string, e: React.MouseEvent) => {
      setMenuOpen(false);
      if (href === pathname) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <Link
          href="/"
          onClick={(e) => handleClick("/", e)}
          className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
            <ZapIcon className="size-4" />
          </span>
          {siteConfig.name}
        </Link>

        <div className="ml-24 hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            if (!link.href) return null;

            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => link.href && handleClick(link.href, e)}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-white/10 font-medium text-zinc-100"
                    : "text-muted hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-zinc-100 sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 top-16 z-50 flex flex-col items-center justify-center bg-background transition-all duration-300 ease-in-out sm:hidden ${
          menuOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6">
          {links.map((link, i) => {
            if (!link.href) return null;

            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => link.href && handleClick(link.href, e)}
                aria-current={active ? "page" : undefined}
                className={`text-2xl font-medium transition-all duration-300 ease-in-out ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                } ${
                  active
                    ? "text-zinc-100"
                    : "text-muted hover:text-zinc-100"
                }`}
                style={{ transitionDelay: menuOpen ? `${100 + i * 75}ms` : "0ms" }}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            className={`mt-4 transition-all duration-300 ease-in-out ${
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? `${100 + links.length * 75}ms` : "0ms" }}
          >
            <ConnectWalletButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
