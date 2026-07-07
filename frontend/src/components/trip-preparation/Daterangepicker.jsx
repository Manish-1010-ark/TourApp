// components/trip-preparation/DateRangePicker.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function addMonths(date, amount) {
  const d = new Date(date);
  d.setDate(1); // avoid month-length rollover
  d.setMonth(d.getMonth() + amount);
  return d;
}

function isSameDay(a, b) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isBefore(a, b) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isAfter(a, b) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

function diffInDays(a, b) {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS,
  );
}

function formatShort(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 3v3.2M16 3v3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ className, direction = "left" }) {
  const d = direction === "left" ? "M14.5 5l-7 7 7 7" : "M9.5 5l7 7-7 7";
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
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * DateRangePicker
 *
 * Modern From / To calendar range picker replacing the old integer
 * DaysSelector. Emits a single derived date range; the caller (parent)
 * is responsible for deriving tripDays from { startDate, endDate }.
 *
 * Props:
 *  - startDate, endDate: Date | null
 *  - onChange({ startDate, endDate }): fired whenever either date changes.
 *      Handles the "clear return date if new departure is later" rule
 *      internally so the caller never has to special-case it.
 *  - minDate: earliest selectable date (default: today)
 *  - minDays / maxDays: trip length bounds used to disable invalid end dates
 *  - error: optional external validation message shown under the fields
 */
export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  minDays = 1,
  maxDays = 30,
  error,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const earliestSelectable = useMemo(
    () => startOfDay(minDate || today),
    [minDate, today],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState("start"); // 'start' | 'end'
  const [viewDate, setViewDate] = useState(() =>
    startOfDay(startDate || earliestSelectable),
  );
  const [focusedDate, setFocusedDate] = useState(() =>
    startOfDay(startDate || earliestSelectable),
  );
  const [hoverDate, setHoverDate] = useState(null);

  const wrapperRef = useRef(null);
  const dayButtonRefs = useRef(new Map());

  const tripDays =
    startDate && endDate ? diffInDays(startDate, endDate) + 1 : null;
  const tripNights = tripDays !== null ? tripDays - 1 : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const key = dateKey(focusedDate);
    const btn = dayButtonRefs.current.get(key);
    if (btn) btn.focus();
  }, [focusedDate, isOpen, viewDate]);

  const openField = (field) => {
    setActiveField(field);
    const base =
      field === "start"
        ? startDate || earliestSelectable
        : endDate || startDate || earliestSelectable;
    setViewDate(startOfDay(base));
    setFocusedDate(startOfDay(base));
    setIsOpen(true);
  };

  const isDisabled = (date) => {
    if (isBefore(date, earliestSelectable)) return true;
    if (activeField === "end" && startDate) {
      if (isBefore(date, startDate)) return true;
      if (diffInDays(startDate, date) + 1 > maxDays) return true;
    }
    return false;
  };

  const commitDate = (date) => {
    if (isDisabled(date)) return;

    if (activeField === "start") {
      let nextEnd = endDate;
      // Rule: moving departure later than the current return clears the return date.
      if (
        nextEnd &&
        (isAfter(date, nextEnd) || diffInDays(date, nextEnd) + 1 > maxDays)
      ) {
        nextEnd = null;
      }
      onChange({ startDate: date, endDate: nextEnd });
      if (!nextEnd) {
        setActiveField("end");
        setViewDate(startOfDay(date));
        setFocusedDate(startOfDay(date));
      } else {
        setIsOpen(false);
      }
    } else {
      onChange({ startDate, endDate: date });
      setIsOpen(false);
    }
  };

  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const rangeStart = startDate;
  const rangeEnd = endDate || (activeField === "end" ? hoverDate : null);

  const isInRange = (date) => {
    if (!rangeStart || !rangeEnd) return false;
    return isAfter(date, rangeStart) && isBefore(date, rangeEnd);
  };

  const moveFocus = (deltaDays) => {
    const next = addDays(focusedDate, deltaDays);
    if (!isSameMonth(next, viewDate)) {
      setViewDate(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
    }
    setFocusedDate(next);
  };

  const handleGridKeyDown = (e) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-7);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commitDate(focusedDate);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const fieldButtonClass = (field, hasValue) =>
    `flex-1 relative flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-colors ${
      isOpen && activeField === field
        ? "border-[var(--color-primary)]"
        : hasValue
          ? "border-[var(--color-success)]"
          : "border-slate-200 hover:border-slate-300"
    }`;

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-bold font-body uppercase tracking-wide text-slate-500 mb-2">
        Travel Dates
      </label>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <button
          type="button"
          className={fieldButtonClass("start", !!startDate)}
          onClick={() => openField("start")}
          aria-haspopup="dialog"
          aria-expanded={isOpen && activeField === "start"}
        >
          <CalendarIcon
            className={
              startDate
                ? "text-[var(--color-success)] shrink-0"
                : "text-slate-400 shrink-0"
            }
          />
          <div className="min-w-0">
            <div className="text-[11px] font-body font-semibold uppercase tracking-wide text-slate-400">
              From
            </div>
            <div
              className={`text-sm font-body truncate ${startDate ? "text-[var(--color-headings)] font-semibold" : "text-slate-400"}`}
            >
              {startDate ? formatShort(startDate) : "Select date"}
            </div>
          </div>
        </button>

        <ChevronIcon
          direction="right"
          className="hidden md:block text-slate-300 shrink-0 rotate-0 md:rotate-0"
        />
        <div className="md:hidden flex justify-center">
          <ChevronIcon direction="right" className="text-slate-300 rotate-90" />
        </div>

        <button
          type="button"
          className={fieldButtonClass("end", !!endDate)}
          onClick={() => openField("end")}
          aria-haspopup="dialog"
          aria-expanded={isOpen && activeField === "end"}
        >
          <CalendarIcon
            className={
              endDate
                ? "text-[var(--color-success)] shrink-0"
                : "text-slate-400 shrink-0"
            }
          />
          <div className="min-w-0">
            <div className="text-[11px] font-body font-semibold uppercase tracking-wide text-slate-400">
              To
            </div>
            <div
              className={`text-sm font-body truncate ${endDate ? "text-[var(--color-headings)] font-semibold" : "text-slate-400"}`}
            >
              {endDate ? formatShort(endDate) : "Select date"}
            </div>
          </div>
        </button>
      </div>

      {/* Fixed-height helper row, mirrors DestinationSearchField's pattern so layout never jumps */}
      <div className="mt-2 min-h-5 flex items-center text-xs font-body">
        {error ? (
          <span className="text-[var(--color-warning)] animate-fade-in-up">
            {error}
          </span>
        ) : tripDays !== null ? (
          <span className="flex items-center gap-1.5 text-[var(--color-success)] animate-fade-in-up font-semibold">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {tripDays} {tripDays === 1 ? "Day" : "Days"} • {tripNights}{" "}
            {tripNights === 1 ? "Night" : "Nights"}
          </span>
        ) : null}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-label={
            activeField === "start"
              ? "Choose departure date"
              : "Choose return date"
          }
          className="absolute z-30 mt-2 w-full max-w-sm bg-white border border-slate-100 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.10)] p-4 animate-pop-in"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate((v) => addMonths(v, -1))}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronIcon direction="left" />
            </button>
            <div className="font-display text-sm font-bold text-[var(--color-headings)]">
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewDate((v) => addMonths(v, 1))}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="mb-1 text-[11px] font-body font-semibold uppercase tracking-wide text-slate-400">
            {activeField === "start"
              ? "Selecting departure date"
              : "Selecting return date"}
          </div>

          <div className="grid grid-cols-7 gap-y-1 mb-1 mt-2">
            {WEEKDAY_LABELS.map((w) => (
              <div
                key={w}
                className="text-center text-[11px] font-body font-semibold text-slate-400"
              >
                {w}
              </div>
            ))}
          </div>

          <div
            role="grid"
            className="grid grid-cols-7 gap-y-1"
            onKeyDown={handleGridKeyDown}
          >
            {cells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;

              const disabled = isDisabled(date);
              const selected =
                (activeField === "start" && isSameDay(date, startDate)) ||
                (activeField === "end" && isSameDay(date, endDate)) ||
                isSameDay(date, startDate) ||
                isSameDay(date, endDate);
              const inRange = isInRange(date);
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={dateKey(date)}
                  role="gridcell"
                  className="flex justify-center"
                >
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) dayButtonRefs.current.set(dateKey(date), el);
                      else dayButtonRefs.current.delete(dateKey(date));
                    }}
                    tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                    disabled={disabled}
                    aria-selected={selected}
                    aria-disabled={disabled}
                    onFocus={() => setFocusedDate(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    onClick={() => commitDate(date)}
                    className={`w-9 h-9 text-sm font-body rounded-full flex items-center justify-center transition-colors outline-none
                      ${disabled ? "text-slate-300 cursor-not-allowed" : "text-[var(--color-headings)] cursor-pointer"}
                      ${!disabled && !selected && inRange ? "bg-[var(--color-bg-secondary)]" : ""}
                      ${selected ? "bg-[var(--color-primary)] text-white font-semibold" : ""}
                      ${!disabled && !selected ? "hover:bg-slate-100" : ""}
                      ${isToday && !selected ? "ring-1 ring-inset ring-slate-300" : ""}
                      focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1
                    `}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-body text-slate-400">
              Trips can be between {minDays} and {maxDays} days
            </span>
            {startDate && endDate && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-body font-semibold text-[var(--color-primary)] hover:underline"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
