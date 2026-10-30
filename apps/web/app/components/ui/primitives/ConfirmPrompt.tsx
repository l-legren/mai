import { Button } from '../Button';

export type ConfirmPromptProps = {
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

const ConfirmPrompt = ({
  message,
  primaryLabel,
  secondaryLabel,
  onPrimaryAction,
  onSecondaryAction,
}: ConfirmPromptProps) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-pretty text-mq-body leading-normal text-text">{message}</p>
      <div className="flex gap-2">
        <Button variant="solid" size="sm" onClick={onPrimaryAction}>
          {primaryLabel}
        </Button>
        <Button variant="quiet" size="sm" onClick={onSecondaryAction}>
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPrompt;
