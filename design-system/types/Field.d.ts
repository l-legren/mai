export interface FieldProps {
  label?: string;
  value?: string;
  placeholder?: string;
  /** Focus state — the only place the accent border appears */
  focused?: boolean;
  /** Trailing affordance, e.g. "Show" */
  trailing?: string;
  /** Right-aligned label link, e.g. "Forgot?" */
  aside?: string;
  /** One live line below the field instead of red errors */
  hint?: string;
}
export declare function Field(props: FieldProps): JSX.Element;
