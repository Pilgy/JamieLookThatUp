/**
 * Developer Plaque — "Minimal Pill" variant
 * Subtle attribution badge for Tower Integrations.
 * Designed to sit at the bottom of legal/info pages.
 */
export function DevPlaque() {
  return (
    <div className="flex flex-col items-center gap-3 pt-10 pb-2">
      {/* Separator */}
      <div className="w-16 h-px bg-slate-200 dark:bg-surface-800" />

      {/* Pill Badge */}
      <div className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-full transition-all duration-300 ease-in-out hover:border-brand-blue/40 dark:hover:border-brand-blue/40 hover:shadow-[0_4px_12px_-2px_rgba(59,130,246,0.08)]">
        {/* Icon — Layered diamond / tower motif */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-navy dark:text-surface-300 shrink-0 transition-colors duration-300 group-hover:text-brand-blue dark:group-hover:text-brand-blue"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>

        {/* Attribution Text */}
        <span className="flex items-baseline gap-1.5 text-sm leading-none">
          <span className="text-slate-400 dark:text-surface-400 font-normal">Engineered by</span>
          <a
            href="https://tower-integrations.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-navy dark:text-surface-100 font-semibold tracking-tight transition-colors duration-200 hover:text-brand-blue dark:hover:text-brand-blue"
          >
            Tower
          </a>
        </span>
      </div>

      {/* Contact micro-links */}
      <div className="flex items-center gap-2 text-[11px] text-slate-300 dark:text-surface-500 font-normal">
        <a
          href="https://tower-integrations.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:text-slate-500 dark:hover:text-surface-400"
        >
          tower-integrations.com
        </a>
        <span className="select-none" aria-hidden="true">
          ·
        </span>
        <a
          href="mailto:dev.group@tower-integrations.com"
          className="transition-colors duration-200 hover:text-slate-500 dark:hover:text-surface-400"
        >
          dev.group@tower-integrations.com
        </a>
      </div>
    </div>
  );
}
