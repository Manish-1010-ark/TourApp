import { Info } from "lucide-react";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed z-50 flex items-center gap-2.5 px-5 py-3 text-sm font-semibold card-elevation bottom-6 right-6 text-[var(--color-headings)]"
    >
      <Info size={16} className="text-[var(--color-primary)] shrink-0" />
      {message}
    </div>
  );
}
