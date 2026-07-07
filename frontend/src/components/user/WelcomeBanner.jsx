import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WelcomeBanner({ name }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start justify-between gap-5 mb-8 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl font-display text-[var(--color-headings)]">
          Welcome back, {name}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-body)]">
          Ready for your next adventure?
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/trip-prep")}
        className="flex items-center gap-2 shrink-0 btn-primary"
      >
        <Plus size={16} />
        Create New Trip
      </button>
    </div>
  );
}
