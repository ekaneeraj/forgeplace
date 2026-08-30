import Link from "next/link";
import { ArrowLeftIcon } from "@/components/atoms/icons";
import { routes } from "@/config/site";

export function CreateNav() {
  return (
    <div className="sticky top-16 z-30 border-b border-zinc-800/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-11 max-w-6xl items-center px-4">
        <Link
          href={routes.create}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-zinc-100"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Launchpad
        </Link>
      </div>
    </div>
  );
}