import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ConfirmTextField } from '@/components/ui/confirm-text-field';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOnboardingDraft } from '@/hooks/use-onboarding-draft';

type GeocodeResult = { city: string | null; countryCode: string | null };

/** Shared final step for both geolocation paths below: coordinates → city + ISO country code. */
async function reverseGeocodeCoords(coords: {
  latitude: number;
  longitude: number;
}): Promise<GeocodeResult> {
  const [place] = await Location.reverseGeocodeAsync(coords);
  return { city: place?.city ?? null, countryCode: place?.isoCountryCode ?? null };
}

/** Forward-geocodes a typed city name to coordinates, then reuses the same reverse-geocode step. */
async function resolveCountryCodeForCityName(city: string): Promise<string | null> {
  const [coords] = await Location.geocodeAsync(city);
  if (!coords) return null;
  const { countryCode } = await reverseGeocodeCoords(coords);
  return countryCode;
}

export default function OnboardingCityScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const router = useRouter();
  const { draft, setCity, setCountryCode, previewCurrency } = useOnboardingDraft();
  const [isResolving, startResolving] = useTransition();
  const [locationError, setLocationError] = useState(false);
  const [cityUnresolved, setCityUnresolved] = useState(false);

  const cityFilled = draft.city.trim().length > 0;

  const handleUseLocation = () => {
    setLocationError(false);
    setCityUnresolved(false);
    startResolving(async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          setLocationError(true);
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        const { city, countryCode } = await reverseGeocodeCoords(position.coords);
        if (!city || !countryCode) {
          setLocationError(true);
          return;
        }
        setCity(city);
        setCountryCode(countryCode);
      } catch {
        setLocationError(true);
      }
    });
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    // Country (and so the currency preview) is now stale until the lookup below re-resolves it.
    setCountryCode(null);
    setCityUnresolved(false);
  };

  const handleCityBlur = () => {
    const city = draft.city.trim();
    if (!city) return;
    startResolving(async () => {
      const countryCode = await resolveCountryCodeForCityName(city);
      setCountryCode(countryCode);
      setCityUnresolved(!countryCode);
    });
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.content}>
        <ProgressDots step={2} total={5} />

        <AppText variant="title" accessibilityRole="header" style={styles.title}>
          {t('onboarding.city.title')}
        </AppText>
        <AppText variant="caption" color="text3" style={styles.subline}>
          {t('onboarding.city.subline')}
        </AppText>

        <ConfirmTextField
          label={t('onboarding.city.label')}
          placeholder={t('onboarding.city.placeholder')}
          value={draft.city}
          onChangeText={handleCityChange}
          onEndEditing={handleCityBlur}
          filled={cityFilled}
          autoCapitalize="words"
        />

        <Pressable
          onPress={handleUseLocation}
          disabled={isResolving}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.city.useLocation')}
          style={styles.locationRow}
        >
          {isResolving ? (
            <ActivityIndicator size="small" color={palette.accent} />
          ) : (
            <AppText variant="caption" color="accent">
              {t('onboarding.city.useLocation')}
            </AppText>
          )}
        </Pressable>

        {locationError ? (
          <AppText
            color="bad"
            variant="small"
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {t('onboarding.city.locationError')}
          </AppText>
        ) : null}

        {cityUnresolved ? (
          <AppText color="bad" variant="small" accessibilityLiveRegion="polite">
            {t('onboarding.city.cityUnresolved')}
          </AppText>
        ) : null}

        {previewCurrency ? (
          <View style={[styles.currencyBanner, { backgroundColor: palette.goodLight }]}>
            <AppText color="good" variant="caption">
              {t('onboarding.city.currencyPreview', { currency: previewCurrency })}
            </AppText>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <Button
          label={t('onboarding.city.continue')}
          disabled={!cityFilled}
          onPress={() => router.push('/onboarding/name')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
  },
  title: {
    marginBottom: Spacing.one,
  },
  subline: {
    marginBottom: Spacing.four,
  },
  locationRow: {
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  currencyBanner: {
    marginTop: Spacing.three,
    borderRadius: Radius.base,
    padding: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
});
