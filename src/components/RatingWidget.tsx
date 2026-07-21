"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function RatingWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Don't render the rating widget on the launch game page itself
  if (pathname === "/launch") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setComment("");
        // Close widget after 2 seconds on success
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus("idle");
          setRating(0);
        }, 2000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 3000);
      }
    } catch (err) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-start select-none font-sans">
      {/* Floating Tab Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange/95 text-white py-3.5 px-3 rounded-l-2xl shadow-lg border border-r-0 border-white/20 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 translate-x-0 hover:-translate-x-1"
          aria-label="Rate website"
        >
          {/* Star Icon */}
          <svg className="w-5 h-5 animate-pulse text-yellow-300 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[11px] font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
            Rate Us
          </span>
        </button>
      )}

      {/* Main Drawer Card */}
      <div
        className={`bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-l-3xl w-[320px] transition-all duration-300 overflow-hidden ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Card Header */}
        <div className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h4 className="font-heading font-black text-sm uppercase tracking-wider">
              Launch Event Feedback
            </h4>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white transition-colors cursor-pointer text-lg font-black"
          >
            ✕
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {submitStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 text-xl border border-teal-200">
                ✓
              </div>
              <h5 className="font-bold text-brand-navy text-base">Feedback Submitted!</h5>
              <p className="text-gray-400 text-xs mt-1">Thank you for helping us launch!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Section */}
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-450 uppercase tracking-widest mb-3">
                  Rate the Website
                </span>
                
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-gray-200 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 transition-colors duration-150 ${
                            isFilled ? "text-yellow-400 fill-current drop-shadow-md" : "text-gray-200 stroke-current"
                          }`}
                          fill={isFilled ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499c.172-.401.761-.401.932 0l1.834 4.288 4.67.625c.441.059.619.608.288.919l-3.39 3.22.9 4.614c.085.437-.375.77-.768.54l-4.148-2.274-4.148 2.274c-.393.23-.853-.103-.768-.54l.9-4.614-3.39-3.22c-.33-.311-.153-.86.288-.919l4.67-.625 1.834-4.288z"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-450 uppercase tracking-widest mb-2">
                  Launch Comments / Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think! (optional)"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              {submitStatus === "error" && (
                <p className="text-red-500 text-xs text-center font-medium">
                  Error submitting feedback. Please try again.
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className={`w-full py-3.5 rounded-full font-bold text-sm shadow transition-all duration-300 text-center cursor-pointer ${
                  rating === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                    : "bg-brand-orange hover:bg-brand-orange/95 text-white"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
