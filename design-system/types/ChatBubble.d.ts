export interface ChatBubbleProps {
  from?: 'agent' | 'user';
  children?: React.ReactNode;
  /** One status line, e.g. "Looked at this week's transactions" */
  status?: string;
}
export declare function ChatBubble(props: ChatBubbleProps): JSX.Element;
