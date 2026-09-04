'use client';

import { useTranslation } from 'react-i18next';

export type LogoProps = {
  withWordmark?: boolean;
};

const Logo = ({ withWordmark = true }: LogoProps) => {
  const { t } = useTranslation();

  return (
    <span className="flex items-center gap-2.5">
      {/* TODO: replace with the real logo mark once we have one */}
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF4FA3] text-sm font-extrabold text-[#2A0A19]">
        M
      </span>
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-[#F1EFF0]">
          {t('common.appName')}
        </span>
      )}
    </span>
  );
};

export default Logo;
