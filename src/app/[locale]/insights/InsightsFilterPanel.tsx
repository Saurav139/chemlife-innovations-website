"use client";

import { isFiltered, toggled, type InsightFilters, type InsightSort } from "@/lib/insight-filters";

// The Insights page's filter panel: search, newest or oldest first, and tick lists for content type and topic, each
// option with the number of posts it would show. Beside the grid on a desktop; on phones and tablets the tick lists
// fold away behind a "Filters" button.

export interface FilterOption {
  slug: string;
  name: string;
  /** Posts this option shows, given the search and the other list's ticks. */
  count: number;
}

const SORTS: { value: InsightSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

function OptionList({ legend, options, selected, onToggle }: {
  legend: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-wider text-brand-navy pb-2 mb-2 border-b border-gray-200 w-full">{legend}</legend>
      <ul>
        {options.map((option) => {
          const checked = selected.includes(option.slug);
          // An option that would show nothing can't be ticked, but one already ticked can always be unticked.
          const disabled = option.count === 0 && !checked;
          return (
            <li key={option.slug}>
              <label className={`flex items-center gap-2.5 py-2 lg:py-1.5 text-sm ${disabled ? "text-gray-400" : "text-slate-700 hover:text-teal-aa cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(option.slug)}
                  data-analytics-click={`Filter: ${option.name}`}
                  className="h-4 w-4 shrink-0 rounded accent-teal-aa cursor-pointer disabled:cursor-default"
                />
                <span className={`flex-1 ${checked ? "font-bold text-brand-navy" : "font-medium"}`}>{option.name}</span>
                <span className="text-xs tabular-nums text-gray-aa">({option.count})</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export default function InsightsFilterPanel({ filters, onChange, typeOptions, topicOptions, open, onOpenChange }: {
  filters: InsightFilters;
  onChange: (change: Partial<InsightFilters>) => void;
  typeOptions: FilterOption[];
  topicOptions: FilterOption[];
  /** Phones and tablets: whether the tick lists are showing. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const chosen = filters.types.length + filters.topics.length;
  return (
    <aside aria-label="Search and filter insights">
      <label htmlFor="insights-search" className="text-gray-aa text-xs font-semibold uppercase tracking-wider block mb-2">
        Search insights
      </label>
      <div className="relative">
        <input
          id="insights-search"
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search titles or topics..."
          className="w-full bg-gray-50 border border-gray-250 rounded-full pl-5 pr-11 py-3 text-base md:text-sm text-brand-navy placeholder-gray-aa focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300 shadow-sm [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-4 top-3.5 text-gray-aa pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="insights-filter-lists"
          className="lg:hidden inline-flex items-center gap-2 min-h-11 px-5 rounded-full border border-gray-250 bg-white text-sm font-bold text-brand-navy cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          Filters
          {chosen > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-teal-aa text-white text-[11px]">{chosen}</span>}
        </button>

        {/* Newest or oldest first */}
        <div role="group" aria-label="Sort by date" className="inline-flex rounded-full bg-gray-100 p-1 lg:w-full">
          {SORTS.map((sort) => {
            const active = filters.sort === sort.value;
            return (
              <button
                key={sort.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ sort: sort.value })}
                data-analytics-click={`Sort: ${sort.label}`}
                className={`tap-target lg:flex-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  active ? "bg-teal-aa text-white shadow-sm" : "text-gray-aa hover:text-brand-navy"
                }`}
              >
                {sort.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="insights-filter-lists" className={`${open ? "block" : "hidden"} lg:block mt-6 space-y-6`}>
        <OptionList legend="Content type" options={typeOptions} selected={filters.types} onToggle={(slug) => onChange({ types: toggled(filters.types, slug) })} />
        {topicOptions.length > 0 && (
          <OptionList legend="Topics" options={topicOptions} selected={filters.topics} onToggle={(slug) => onChange({ topics: toggled(filters.topics, slug) })} />
        )}
        {isFiltered(filters) && (
          <button
            type="button"
            onClick={() => onChange({ query: "", types: [], topics: [] })}
            className="tap-target text-sm font-bold text-teal-aa hover:text-teal-700 underline underline-offset-4 cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
