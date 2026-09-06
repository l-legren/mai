'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 text-left">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4FA3]" aria-hidden="true" />
          <span className="text-xs font-medium text-[#A9A3A8] sm:text-[12.5px]">
            {t('landing.badge')}
          </span>
        </div>

        <h1 className="text-[2.375rem] leading-[1.08] font-extrabold tracking-tight text-[#F1EFF0] text-pretty sm:text-5xl md:text-6xl lg:text-[4.75rem] lg:leading-[1.02] lg:tracking-[-0.06em]">
          {t('landing.headline')}{' '}
          <span className="block text-[#FF4FA3]">{t('landing.headlineAccent')}</span>
        </h1>

        <p className="max-w-lg text-[17px] leading-relaxed text-[#A9A3A8] text-pretty lg:text-[19px]">
          {t('landing.subline')}
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3 pt-2 sm:w-auto sm:max-w-none sm:flex-row">
          <Button asChild size="lg">
            <Link href="/sign-up">{t('landing.getStarted')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
