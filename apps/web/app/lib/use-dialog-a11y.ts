"use client";

import { useEffect, useRef } from "react";

/**
 * Accessibility wiring for modal dialogs:
 *
 *  1. Listens for Escape and calls `onClose`.
 *  2. Traps Tab focus inside the dialog (cycles between first/last focusable).
 *  3. Auto-focuses the first focusable element when the dialog mounts.
 *  4. Restores focus to whatever was active before the dialog opened, when
 *     the dialog unmounts (so screen readers / keyboard users land back where
 *     they started).
 *
 * Returns a ref that the caller must attach to the dialog's outer container.
 *
 * Usage:
 *   const ref = useDialogA11y(onClose);
 *   <div ref={ref} role="dialog" aria-modal="true">…</div>
 */
export function useDialogA11y(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Remember which element had focus so we can restore it on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    // Focus the first focusable element (or the dialog itself as a fallback).
    const initial = focusables()[0] ?? node;
    initial.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }

      const first = list[0]!;
      const last = list[list.length - 1]!;
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    node.addEventListener("keydown", handleKey);
    return () => {
      node.removeEventListener("keydown", handleKey);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  return ref;
}
