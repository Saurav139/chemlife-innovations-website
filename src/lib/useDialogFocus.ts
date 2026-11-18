import { useEffect, useRef, type RefObject } from "react";

// Keyboard focus for an overlay that covers the page (search, a form, a video player). While it's open, focus
// moves inside it and Tab stays inside it; when it closes, focus goes back to whatever opened it. Put the returned
// ref on the element with role="dialog". Each overlay keeps its own Escape handling.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export function useDialogFocus<T extends HTMLElement>(open: boolean, initialFocus?: RefObject<HTMLElement | null>) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

    if (!dialog.contains(document.activeElement)) {
      (initialFocus?.current ?? focusable()[0] ?? dialog).focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !dialog.contains(document.activeElement);
      if (e.shiftKey && (outside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Back to the button that opened it, if it's still on the page.
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, initialFocus]);

  return ref;
}
