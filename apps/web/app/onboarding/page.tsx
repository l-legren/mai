import { deriveCurrencyFromCountryCode } from '@mai/api';
import { getDetectedLocation } from '@/lib/geo';
import OnboardingFlow from './OnboardingFlow';

const OnboardingPage = async () => {
  const { city, countryCode } = await getDetectedLocation();

  return (
    <OnboardingFlow
      initialCity={city ?? ''}
      previewCurrency={deriveCurrencyFromCountryCode(countryCode)}
    />
  );
};

export default OnboardingPage;
