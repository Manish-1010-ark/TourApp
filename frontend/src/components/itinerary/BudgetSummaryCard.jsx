// components/itinerary/BudgetSummaryCard.jsx
import { getField, formatCurrency } from "./utils";

const CATEGORY_LABELS = {
  accommodation: "Accommodation",
  food: "Food",
  transportation: "Transportation",
  transport: "Transportation",
  entry_tickets: "Entry Tickets",
  entry_fees: "Entry Tickets",
  shopping: "Shopping",
  miscellaneous: "Miscellaneous",
  misc: "Miscellaneous",
};

/**
 * BudgetSummaryCard — the backend's current schema only returns a budget
 * *tier* (basic/premium/luxury), not a line-item breakdown. If a future
 * response includes `budget_breakdown` (or similarly-named) numbers, they
 * render automatically here; until then this shows the tier + pace so
 * the sidebar never has an empty box.
 */
export default function BudgetSummaryCard({ budgetTier, breakdown }) {
  const total = breakdown ? getField(breakdown, "total", "estimated_total") : undefined;
  const categoryEntries = breakdown
    ? Object.entries(breakdown).filter(([key]) => key !== "total" && key !== "estimated_total")
    : [];

  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">Quick Budget Summary</div>

      {breakdown ? (
        <>
          {total && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-sm font-body text-slate-500">Estimated Total</span>
              <span className="font-display font-bold text-lg text-[var(--color-headings)]">{formatCurrency(total)}</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {categoryEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm font-body">
                <span className="text-slate-500">{CATEGORY_LABELS[key] ?? key}</span>
                <span className="font-semibold text-[var(--color-headings)]">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="text-sm font-body text-slate-600 capitalize mb-1">{budgetTier ?? "—"} tier</div>
          <p className="text-xs font-body text-slate-400 leading-relaxed">
            A detailed cost breakdown will appear here once it's available.
          </p>
        </div>
      )}
    </div>
  );
}