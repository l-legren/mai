/** Money formatting. Single currency (EUR) for the MVP. Deterministic grouping (no Intl dependency). */

const CURRENCY = '€';

function groupThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  return (
    sign +
    Math.abs(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
}

/** Exact amount with 2 decimals, e.g. `€12.40`. */
export function fmt(n: number): string {
  return `${CURRENCY}${n.toFixed(2)}`;
}

/** Rounded amount with thousands separators, e.g. `€2,400`. */
export function fmtR(n: number): string {
  return `${CURRENCY}${groupThousands(Math.round(n))}`;
}
