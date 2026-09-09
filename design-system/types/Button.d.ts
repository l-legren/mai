export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'quiet';
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to the container width (mobile and auth forms) */
  full?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}
export declare function Button(props: ButtonProps): JSX.Element;
