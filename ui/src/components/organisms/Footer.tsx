import Link from "next/link";
import { ZapIcon } from "@/components/atoms/icons";
import { routes, siteConfig } from "@/config/site";

const PRODUCT_LINKS = [
  { label: "Explore", href: routes.explore },
  { label: "Launchpad", href: routes.create },
  { label: "Marketplace", href: routes.explore },
  { label: "Staking", href: routes.explore },
  { label: "Swap", href: routes.explore },
];

const RESOURCE_LINKS = [
  { label: "Documentation" },
  { label: "FAQ" },
  { label: "Support" },
  { label: "Blog" },
  { label: "Status" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-4 pb-8 pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <Link
              href={routes.home}
              className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
                <ZapIcon className="size-4" />
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 text-sm leading-6 text-muted">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">Product</h4>
              <ul className="mt-3 space-y-2">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-zinc-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">Resources</h4>
              <ul className="mt-3 space-y-2">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.label}>
                    <span className="cursor-default text-sm text-muted">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
