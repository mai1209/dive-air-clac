import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Languages } from 'lucide-react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { Language, useLanguage } from '../../i18n';

const LANGUAGE_OPTIONS: Array<{
  key: Language;
  flag: string;
  copyKey: 'esName' | 'enName' | 'ptName';
}> = [
  { key: 'es', flag: '🇪🇸', copyKey: 'esName' },
  { key: 'en', flag: '🇺🇸', copyKey: 'enName' },
  { key: 'pt', flag: '🇧🇷', copyKey: 'ptName' },
];

export const LanguageSettingsScreen = ({ navigation }: any) => {
  const { copy, language, setLanguage } = useLanguage();

  const handleSelectLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);

    Alert.alert(
      copy.settings.language.savedTitle,
      copy.settings.language.savedBody,
    );
  };

  const currentLabel =
    language === 'es'
      ? copy.settings.language.esName
      : language === 'en'
      ? copy.settings.language.enName
      : copy.settings.language.ptName;

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.language.eyebrow}
      title={copy.settings.language.title}
      description={copy.settings.language.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <View style={styles.currentRow}>
          <View style={styles.currentIconWrap}>
            <Languages color="#1A56DB" size={18} />
          </View>

          <View style={styles.currentBody}>
            <Text style={settingsScaffoldStyles.sectionTitle}>
              {copy.settings.language.currentTitle}
            </Text>

            <Text style={settingsScaffoldStyles.bodyText}>
              {copy.settings.language.currentDescription}
            </Text>
          </View>
        </View>

        <View style={settingsScaffoldStyles.pill}>
          <Text style={settingsScaffoldStyles.pillText}>{currentLabel}</Text>
        </View>
      </View>

      <View style={styles.optionsWrap}>
        {LANGUAGE_OPTIONS.map(option => {
          const isActive = language === option.key;
          const label = copy.settings.language[option.copyKey];

          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionCard, isActive && styles.optionCardActive]}
              activeOpacity={0.88}
              onPress={() => handleSelectLanguage(option.key)}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.flag}>{option.flag}</Text>

                <Text
                  style={[
                    styles.optionLabel,
                    isActive && styles.optionLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>

              {isActive ? <Check color="#1A56DB" size={18} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </SettingsScaffold>
  );
};

const styles = StyleSheet.create({
  currentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  currentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF4FD',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  currentBody: {
    flex: 1,
  },
  optionsWrap: {
    marginTop: 16,
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardActive: {
    borderColor: '#A9C6F4',
    backgroundColor: '#F7FAFF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2A44',
  },
  optionLabelActive: {
    color: '#1A56DB',
  },
});3
