export type FormErrorProps = {
  message: string | null;
};

// design-system/CLAUDE.md rule #3: form errors are a plain hint line, never red. Uses
// --mq-text-2, not the letter-of-the-rule --mq-text-3 — text-3 on --mq-bg computes to ~4.15:1,
// below this app's own WCAG AA 4.5:1 bar (the old red was ~6:1). text-2 is ~7.44:1.
const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <p role="alert" aria-live="assertive" className="text-center text-sm text-text-2">
      {message}
    </p>
  );
};

export default FormError;
