"use client";

import { isFiltered, toggled, type InsightFilters } from "@/lib/insight-filters";

// The Insights page's filter panel: search, and tick lists for content type and topic, each
// option with the number of posts it would show. On a screen wide enough (1728px, 108rem) it's a column in the margin
// left of the grid. Narrower, it's a bar above the grid, and the tick lists fold away behind a "Filters" button.

export interface FilterOption {
  slug: string;
  name: string;
  /** Posts this option shows, given the search and the other list's ticks. */
  count: number;
}

function OptionList({ legend, options, selected, onToggle, listClassName = "" }: {
  legend: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (slug: string) => void;
  /** Columns for the list in the bar above the grid. */
  listClassName?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-bold uppercase tracking-wider text-brand-navy pb-2 mb-2 border-b border-gray-200 w-full">{legend}</legend>
      <ul className={`gap-x-8 ${listClassName} min-[108rem]:columns-1`}>
        {options.map((option) => {
          const checked = selected.includes(option.slug);
          // An option that would show nothing can't be ticked, but one already ticked can always be unticked.
          const disabled = option.count === 0 && !checked;
          return (
            <li key={option.slug} className="break-inside-avoid">
              <label className={`flex items-center gap-2.5 py-2 md:py-1.5 text-sm ${disabled ? "text-gray-400" : "text-slate-700 hover:text-teal-aa cursor-pointer"}`}>
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
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 min-[108rem]:flex-col min-[108rem]:items-stretch min-[108rem]:gap-4">
      <div className="w-full md:max-w-md min-[108rem]:max-w-none">
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
      </div>

      <div className="flex items-center min-[108rem]:hidden">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="insights-filter-lists"
          className="min-[108rem]:hidden inline-flex items-center gap-2 min-h-11 px-5 rounded-full border border-gray-250 bg-white text-sm font-bold text-brand-navy cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          Filters
          {chosen > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-teal-aa text-white text-[11px]">{chosen}</span>}
        </button>

      </div>
      </div>

      {/* Above the grid, the open lists sit side by side in a box: content type, then topics in columns. In the
          margin they're always open, one under the other. */}
      <div
        id="insights-filter-lists"
        className={`${open ? "block" : "hidden"} min-[108rem]:block mt-5 md:rounded-2xl md:border md:border-gray-200 md:bg-gray-55 md:p-6 md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 max-md:space-y-6 min-[108rem]:mt-6 min-[108rem]:block min-[108rem]:space-y-6 min-[108rem]:border-0 min-[108rem]:bg-transparent min-[108rem]:p-0 min-[108rem]:rounded-none`}
      >
        <OptionList legend="Content type" options={typeOptions} selected={filters.types} onToggle={(slug) => onChange({ types: toggled(filters.types, slug) })} />
        {topicOptions.length > 0 && (
          <OptionList legend="Topics" options={topicOptions} selected={filters.topics} onToggle={(slug) => onChange({ topics: toggled(filters.topics, slug) })} listClassName="md:columns-2 lg:columns-3" />
        )}
        {isFiltered(filters) && (
          <button
            type="button"
            onClick={() => onChange({ query: "", types: [], topics: [] })}
            // Above the grid on a tablet or computer, the chosen filters' row has its own "Clear all".
            className="md:hidden min-[108rem]:inline-block tap-target text-sm font-bold text-teal-aa hover:text-teal-700 underline underline-offset-4 cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
