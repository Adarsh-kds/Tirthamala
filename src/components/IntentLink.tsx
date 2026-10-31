"use client";
import Link, { useLinkStatus } from "next/link";
import { useEffect, useState, type ComponentProps } from "react";

// Flags a pending navigation on <html> so the top progress bar can show while the next page loads.
function PendingSignal() {
  const { pending } = useLinkStatus();
  useEffect(() => {
    document.documentElement.toggleAttribute("data-navigating", pending);
    return () => document.documentElement.removeAttribute("data-navigating");
  }, [pending]);
  return null;
}

// Prefetches only when the visitor shows intent (hover, focus, touch), not when the link scrolls into view.
// Long lists and card grids otherwise download a page payload for every visible link.
export function IntentLink({
  onMouseEnter,
  onFocus,
  onTouchStart,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    >
      {children}
      <PendingSignal />
    </Link>
  );
}
