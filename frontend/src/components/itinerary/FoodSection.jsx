// components/itinerary/FoodSection.jsx
import { getField, isEmptyValue } from "./utils";

export default function FoodSection({ source }) {
  const food = getField(source, "local_food", "food_recommendations");
  if (isEmptyValue(food)) return null;

  return (
    <div className="card-elevation p-5">
      <div className="font-display font-bold text-[var(--color-headings)] mb-3">Local Food to Try</div>
      <div className="flex flex-wrap gap-2">
        {food.map((item, idx) => (
          <span key={idx} className="text-sm font-semibold font-body bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full">
            🍴 {typeof item === "string" ? item : getField(item, "name", "title")}
          </span>
        ))}
      </div>
    </div>
  );
}