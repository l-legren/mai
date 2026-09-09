import type { CategoryId } from '@/lib/categories';

export type CategoryIconProps = {
  className?: string;
};

const GroceriesIcon = ({ className }: CategoryIconProps) => (
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
    <path d="M4 7h2l1.5 9.5a2 2 0 0 0 2 1.7h6.6a2 2 0 0 0 2-1.7L20 9H7" />
    <circle cx="10" cy="20.5" r="1" />
    <circle cx="17" cy="20.5" r="1" />
  </svg>
);

const DrinksIcon = ({ className }: CategoryIconProps) => (
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
    <path d="M7 3h10l-1.2 12a3.8 3.8 0 0 1-7.6 0z" />
    <path d="M12 15v6" />
    <path d="M9 21h6" />
  </svg>
);

const RestaurantsIcon = ({ className }: CategoryIconProps) => (
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
    <path d="M7 3v7a2 2 0 0 0 4 0V3" />
    <path d="M9 10v11" />
    <path d="M16 3c-1.4 0-2.5 1.8-2.5 5s1.1 5 2.5 5v8" />
  </svg>
);

const ClothingIcon = ({ className }: CategoryIconProps) => (
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
    <path d="M9 4 12 6l3-2 4 3-2.5 3L15 9v11H9V9l-1.5 1L5 7z" />
  </svg>
);

export const TransportIcon = ({ className }: CategoryIconProps) => (
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
    <path d="M4 16V9.5a2 2 0 0 1 1.4-1.9L8 6.7a2 2 0 0 1 .6-.1h6.8a2 2 0 0 1 .6.1l2.6.9A2 2 0 0 1 20 9.5V16" />
    <path d="M4 16h16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <circle cx="8" cy="16" r="1.3" />
    <circle cx="16" cy="16" r="1.3" />
  </svg>
);

export const OtherIcon = ({ className }: CategoryIconProps) => (
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
    <circle cx="12" cy="12" r="9" />
    <circle cx="8" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

// Fallback for a category id that isn't one of CategoryId's six (e.g. stale/unrecognised data)
// — see getCategoryIcon.ts. Distinct from OtherIcon, which is the real "other" category's own mark.
export const QuestionMarkIcon = ({ className }: CategoryIconProps) => (
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
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.6a2.6 2.6 0 0 1 5 1c0 1.7-2.5 1.9-2.5 3.6" />
    <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const CATEGORY_ICONS: Record<CategoryId, (props: CategoryIconProps) => React.JSX.Element> = {
  groceries: GroceriesIcon,
  drinks: DrinksIcon,
  restaurants: RestaurantsIcon,
  clothing: ClothingIcon,
  transport: TransportIcon,
  other: OtherIcon,
};
