// Shared card shell for every dashboard section. Keeping the chrome here
// means new sections (once real analytics land) only need to bring their
// own body content, not re-declare the border/padding/heading styles.

export default function SectionCard({
  eyebrow,
  title,
  action,
  className = "",
  children,
}) {
  return (
    <div className={`card-elevation rounded-3xl bg-white p-6 ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          {eyebrow && (
            <span className="block mb-1 text-xs font-semibold tracking-[0.15em] text-[var(--color-cta)] uppercase font-mono-tag">
              {eyebrow}
            </span>
          )}
          <h3 className="text-lg font-bold text-[var(--color-headings)]">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
