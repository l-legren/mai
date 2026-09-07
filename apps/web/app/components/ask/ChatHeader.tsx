'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui';

export type ChatHeaderProps = {
  hasConversation: boolean;
  onEndChat: () => void;
};

const ChatHeader = ({ hasConversation, onEndChat }: ChatHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-none items-center justify-between px-11 pt-[30px] pb-[18px]">
      <h1 className="text-[30px] font-bold tracking-[-0.8px] text-text">{t('ask.title')}</h1>
      {hasConversation ? (
        <Button variant="outline" size="sm" onClick={onEndChat} aria-label={t('ask.endChatA11y')}>
          {t('ask.endChat')}
        </Button>
      ) : (
        <span className="text-[13px] font-medium text-text-4">{t('ask.nothingYet')}</span>
      )}
    </div>
  );
};

export default ChatHeader;
