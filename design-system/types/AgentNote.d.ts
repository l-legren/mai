export interface AgentNoteProps {
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Hide the confirm gate for read-only remarks */
  showActions?: boolean;
  showByline?: boolean;
}
export declare function AgentNote(props: AgentNoteProps): JSX.Element;
