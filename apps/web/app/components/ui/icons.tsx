export type NavIconProps = {
  className?: string;
};

export const HomeIcon = ({ className }: NavIconProps) => (
  <svg
    className={className}
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M9.5 20v-5.5h5V20" />
  </svg>
);

export const RecurringIcon = ({ className }: NavIconProps) => (
  <svg
    className={className}
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </svg>
);

export const InsightsIcon = ({ className }: NavIconProps) => (
  <svg
    className={className}
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 20v-6" />
    <path d="M12 20V8" />
    <path d="M19 20V4" />
  </svg>
);

export const AskMoniqIcon = ({ className }: NavIconProps) => (
  <svg
    className={className}
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M11.1 3.4a.6.6 0 0 1 1.13 0l1.1 2.94a3 3 0 0 0 1.77 1.77l2.94 1.1a.6.6 0 0 1 0 1.13l-2.94 1.1a3 3 0 0 0-1.77 1.77l-1.1 2.94a.6.6 0 0 1-1.13 0l-1.1-2.94a3 3 0 0 0-1.77-1.77l-2.94-1.1a.6.6 0 0 1 0-1.13l2.94-1.1a3 3 0 0 0 1.77-1.77z" />
    <path d="M18.4 15.2a.4.4 0 0 1 .75 0l.5 1.32a1.6 1.6 0 0 0 .94.94l1.31.49a.4.4 0 0 1 0 .75l-1.31.49a1.6 1.6 0 0 0-.94.94l-.5 1.32a.4.4 0 0 1-.75 0l-.49-1.32a1.6 1.6 0 0 0-.94-.94l-1.32-.49a.4.4 0 0 1 0-.75l1.32-.49a1.6 1.6 0 0 0 .94-.94z" />
  </svg>
);

export const SidebarToggleIcon = ({ className }: NavIconProps) => (
  <svg
    className={className}
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M10 4v16" />
  </svg>
);
