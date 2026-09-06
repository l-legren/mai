'use client';

import { useTranslation } from 'react-i18next';
import type { NavTitleKey } from '@/app/components/layout';

export type PageHeadingProps = {
  titleKey: NavTitleKey;
};

const PageHeading = ({ titleKey }: PageHeadingProps) => {
  const { t } = useTranslation();

  return <h1 className="text-2xl font-semibold text-[#F1EFF0]">{t(titleKey)}</h1>;
};

export default PageHeading;
