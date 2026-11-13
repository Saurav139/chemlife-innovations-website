"use client";

import { useState } from "react";

// Round icon buttons; the name of each is read out and shown as a tooltip.
const BUTTON =
  "inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-brand-navy hover:border-teal-500/40 hover:text-teal-aa hover:bg-teal-50 transition-colors cursor-pointer";

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4.1 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.3A1.8 1.8 0 1 1 6.5 4.7a1.8 1.8 0 0 1 0 3.6zM19 19h-3v-4.7c0-1.4-.5-2.1-1.6-2.1-1.2 0-1.9.8-1.9 2.1V19h-3v-9h3v1.3a3.4 3.4 0 0 1 3-1.6c2.1 0 3.5 1.3 3.5 3.9z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L1.5 3h6.4l4.4 5.9zm-1.1 16.1h1.7L7.1 4.8H5.2z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

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

  const text = `${title} ${url}`;
  const links = [
    { name: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}`, icon: <WhatsAppIcon /> },
    { name: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, icon: <LinkedInIcon /> },
    { name: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, icon: <XIcon /> },
    { name: "Share by email", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`, icon: <MailIcon /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-aa mr-2">Share this article</span>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
          data-analytics-click={link.name}
          className={BUTTON}
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        data-analytics-click="Copy article link"
        className={`${BUTTON} ${copy === "Link copied" ? "border-teal-aa text-teal-aa bg-teal-50" : ""}`}
      >
        {copy === "Link copied" ? <CheckIcon /> : <LinkIcon />}
      </button>
      <span aria-live="polite" className="text-sm font-semibold text-teal-aa min-w-0">{copy === "Copy link" ? "" : copy}</span>
    </div>
  );
}
