// design-system/reference/BudgetBar.jsx — spent vs limit, switches to --mq-over when over.
export type BudgetBarProps = {
  category: string;
  spent: number;
  limit: number;
  currency?: string;
};

const BudgetBar = ({ category, spent, limit, currency = '€' }: BudgetBarProps) => {
  const pct = Math.min(100, Math.round((spent / limit) * 100));
  const over = spent > limit;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <span className="text-mq-sm font-medium text-text-2">{category}</span>
        <span className="text-mq-sm font-medium text-text">
          {currency}
          {spent} / {limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={category}
        aria-valuenow={spent}
        aria-valuemin={0}
        aria-valuemax={limit}
        className="h-[5px] overflow-hidden rounded-[3px] bg-track"
      >
        <div
          className={over ? 'h-full bg-over' : 'h-full bg-accent'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default BudgetBar;
