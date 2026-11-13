"use client";

import { useState } from "react";

const BUTTON =
  "inline-flex items-center justify-center min-h-11 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-bold text-brand-navy hover:border-teal-500/40 hover:text-teal-aa transition-colors cursor-pointer";

/** Copying for browsers that refuse the clipboard API, such as the ones inside WhatsApp and LinkedIn. */
function copyWithSelection(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch {}
  field.remove();
  return copied;
}

/** Share the article: WhatsApp, LinkedIn, or copy its address. */
export default function ArticleShare({ title, url }: { title: string; url: string }) {
  const [copy, setCopy] = useState<"Copy link" | "Link copied" | "Couldn't copy">("Copy link");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopy("Link copied");
    } catch {
      setCopy(copyWithSelection(url) ? "Link copied" : "Couldn't copy");
    }
    setTimeout(() => setCopy("Copy link"), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-aa mr-1">Share this article</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-click="Share on WhatsApp"
        className={BUTTON}
      >
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-click="Share on LinkedIn"
        className={BUTTON}
      >
        LinkedIn
      </a>
      <button type="button" onClick={copyLink} data-analytics-click="Copy article link" className={BUTTON}>
        <span aria-live="polite">{copy}</span>
      </button>
    </div>
  );
}
