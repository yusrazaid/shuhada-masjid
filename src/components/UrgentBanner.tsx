"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import type { Announcement } from "@/lib/schemas";

export function UrgentBanner({ announcement }: { announcement: Announcement }) {
  const [visible, setVisible] = useState(true);
  const storageKey = "shuhada.dismissed-announcement." + announcement.id;

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(storageKey) !== "true");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch {
      // The banner remains dismissible for the current view when storage is unavailable.
    }
  }

  if (!visible) return null;
  return (
    <aside className="urgent-banner bg-[#efe3c5] px-5 py-3 text-forest" aria-live="polite">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <AlertCircle className="shrink-0 text-gold" size={18} />
        <p className="flex-1 text-sm font-medium">
          {announcement.href ? <a className="underline underline-offset-2" href={announcement.href}>{announcement.message}</a> : announcement.message}
        </p>
        <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-forest/10" onClick={dismiss} aria-label="Dismiss announcement"><X size={16} /></button>
      </div>
    </aside>
  );
}
