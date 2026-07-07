// components/trip-preparation/DestinationSearchField.jsx
import { useRef, useState, useEffect } from "react";

function LocationPinIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21s7-6.5 7-11.5a7 7 0 10-14 0C5 14.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="9.5"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="#CBD5E1" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * DestinationSearchField
 *
 * Purely presentational + interaction logic (debounce/fetching lives in
 * useCitySearch, kept out of this component so the search provider can be
 * swapped without touching this UI).
 *
 * Props:
 *  - label, placeholder
 *  - query, onQueryChange(value)
 *  - selected (city object | null), onSelect(city), onClear()
 *  - suggestions, isSearching, searchError
 */
export default function DestinationSearchField({
  label,
  placeholder = "Type a city...",
  query,
  onQueryChange,
  selected,
  onSelect,
  onClear,
  suggestions,
  isSearching,
  searchError,
  inputId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (suggestions.length > 0 && document.activeElement === inputRef.current) {
      setIsOpen(true);
    } else if (suggestions.length === 0) {
      setIsOpen(false);
    }
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitSelection = (city) => {
    onSelect(city);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        commitSelection(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showEmptyState =
    isOpen &&
    !isSearching &&
    !searchError &&
    query.trim().length >= 2 &&
    suggestions.length === 0 &&
    !selected;

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <label
        htmlFor={inputId}
        className="block text-xs font-bold font-body uppercase tracking-wide text-slate-500 mb-2"
      >
        {label}
      </label>

      <div
        className={`relative flex items-center rounded-2xl border-2 transition-colors bg-white ${
          selected
            ? "border-[var(--color-success)]"
            : "border-slate-200 focus-within:border-[var(--color-primary)]"
        }`}
      >
        <LocationPinIcon
          className={`ml-4 shrink-0 ${selected ? "text-[var(--color-success)]" : "text-slate-400"}`}
        />

        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${inputId}-listbox`}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="destination-search-input w-full py-4 px-3 bg-transparent text-base font-body text-[var(--color-headings)] placeholder-slate-400"
          style={{ outline: "none" }}
          autoComplete="off"
        />

        <div className="flex items-center gap-2 pr-4 shrink-0">
          {isSearching && <SpinnerIcon />}
          {!isSearching && (query || selected) && (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Fixed-height helper row — always reserves the same space so
          selecting a city, clearing it, or showing an error never moves
          the input (or anything below it) up/down. */}
      <div className="mt-2 h-5 flex items-center text-xs font-body">
        {searchError ? (
          <span className="text-[var(--color-warning)] animate-fade-in-up">
            {searchError}
          </span>
        ) : selected ? (
          <span className="flex items-center gap-1.5 text-[var(--color-success)] animate-fade-in-up">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {selected.name}, {selected.state}
          </span>
        ) : null}
      </div>

      {isOpen && (suggestions.length > 0 || showEmptyState) && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] max-h-64 overflow-y-auto custom-scrollbar animate-pop-in"
        >
          {suggestions.map((city, index) => (
            <li
              key={`${city.name}-${city.state}-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <button
                type="button"
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => commitSelection(city)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 last:border-b-0 ${
                  index === highlightedIndex
                    ? "bg-[var(--color-bg-secondary)]"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                  <LocationPinIcon className="text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold font-body text-sm text-[var(--color-headings)] truncate">
                    {city.name}
                  </div>
                  <div className="text-xs font-body text-slate-500 truncate">
                    {city.state}
                    {city.country ? `, ${city.country}` : ""}
                  </div>
                </div>
              </button>
            </li>
          ))}

          {showEmptyState && (
            <li className="px-4 py-6 text-center">
              <div className="text-sm font-body text-slate-500">
                No cities found for "{query}"
              </div>
              <div className="text-xs font-body text-slate-400 mt-1">
                Try a different spelling or a nearby city
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
