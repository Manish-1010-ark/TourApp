// Shared card shell for the User Dashboard sections. Uses the same
// card-elevation + CSS variable theme as useGlobalStyles.js so new sections
// stay visually consistent without redeclaring the chrome each time.

export default function SectionCard({ eyebrow, title, action, className = "", children }) {
  return (
    <div className={`card-elevation p-6 ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          {eyebrow && (
            <span className="block mb-1 text-xs font-semibold tracking-[0.15em] text-[var(--color-cta)] uppercase font-mono-tag">
              {eyebrow}
            </span>
          )}
          <h3 className="text-lg font-bold text-[var(--color-headings)] font-display">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}