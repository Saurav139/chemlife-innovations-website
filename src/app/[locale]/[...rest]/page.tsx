import { notFound } from "next/navigation";

// Addresses that match no page show the "not found" page in the visitor's language.
export default function CatchAll() {
  notFound();
}
