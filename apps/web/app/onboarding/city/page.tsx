import { deriveCurrencyFromCountryCode } from '@mai/api';
import { getDetectedLocation } from '@/lib/geo';
import CityStep from './CityStep';

const OnboardingCityPage = async () => {
  const { countryCode } = await getDetectedLocation();
  const previewCurrency = deriveCurrencyFromCountryCode(countryCode);

  return <CityStep previewCurrency={previewCurrency} />;
};

export default OnboardingCityPage;
