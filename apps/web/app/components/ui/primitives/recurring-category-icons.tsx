// Icons for recurring income/fixed-cost categories — the SVG paths for the five income icons
// come straight from the imported design doc; the five recurring-expense icons are new, drawn in
// the same style (24 viewBox, stroke 1.9) since the design doc only showed the income picker.
import type { CategoryIconProps } from './category-icons';
import { OtherIcon, TransportIcon } from './category-icons';

const SalaryIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
    <circle cx="12" cy="12.5" r="3" />
  </svg>
);

const FreelanceIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="7.5" width="18" height="12" rx="2" />
    <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
  </svg>
);

const SideBusinessIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5c2.5 2.6 4 5.6 4 9 0 2-1 3.6-1 3.6l-3-1-3 1s-1-1.6-1-3.6c0-3.4 1.5-6.4 4-9z" />
    <path d="M9.5 15.5 7 20l2.2-.8" />
    <path d="M14.5 15.5 17 20l-2.2-.8" />
  </svg>
);

const HouseIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 10 12 3.5 20.5 10" />
    <path d="M5.5 9v9.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9" />
  </svg>
);

const InvestmentsIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 17 10 9l4 4 6-8" />
    <path d="M16 5h4v4" />
  </svg>
);

const SubscriptionsIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.66 5.66L4 16" />
    <path d="M4 20v-4h4" />
  </svg>
);

const FitnessIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 8v8" />
    <path d="M18 8v8" />
    <path d="M2 11v2" />
    <path d="M22 11v2" />
    <path d="M6 12h12" />
  </svg>
);

const InstallmentsIcon = ({ className }: CategoryIconProps) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="9" width="16" height="11" rx="2" />
    <rect x="6" y="4" width="16" height="11" rx="2" />
  </svg>
);

export const INCOME_CATEGORY_ICONS = {
  salary: SalaryIcon,
  freelance: FreelanceIcon,
  sideBusiness: SideBusinessIcon,
  rental: HouseIcon,
  investments: InvestmentsIcon,
  other: OtherIcon,
} as const;

export const RECURRING_EXPENSE_CATEGORY_ICONS = {
  subscriptions: SubscriptionsIcon,
  fitness: FitnessIcon,
  rent: HouseIcon,
  car: TransportIcon,
  installments: InstallmentsIcon,
  other: OtherIcon,
} as const;
