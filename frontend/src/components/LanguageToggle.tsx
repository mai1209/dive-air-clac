import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, Globe } from 'lucide-react-native';
import { useLanguage, type Language } from '../i18n';

type LanguageToggleProps = {
  variant?: 'pill' | 'dropdown';
};

const languageMeta: Record<Language, { flag: string; label: string }> = {
  es: { flag: '🇪🇸', label: 'Español' },
  en: { flag: '🇺🇸', label: 'English' },
  pt: { flag: '🇧🇷', label: 'Português' },
};

export const LanguageToggle = ({
  variant = 'pill',
}: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLanguage = useMemo(() => languageMeta[language], [language]);

  if (variant === 'dropdown') {
    return (
      <View style={styles.dropdownWrap}>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          activeOpacity={0.86}
          onPress={() => setOpen(current => !current)}
        >
          <Globe color="#60708D" size={16} strokeWidth={2.2} />
          <Text style={styles.dropdownFlag}>{currentLanguage.flag}</Text>
          <ChevronDown color="#60708D" size={15} strokeWidth={2.4} />
        </TouchableOpacity>

        {open ? (
          <View style={styles.dropdownMenu}>
            {(Object.keys(languageMeta) as Language[]).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  language === option && styles.dropdownOptionActive,
                ]}
                activeOpacity={0.86}
                onPress={() => {
                  setLanguage(option);
                  setOpen(false);
                }}
              >
                <Text style={styles.dropdownOptionFlag}>
                  {languageMeta[option].flag}
                </Text>
                <Text
                  style={[
                    styles.dropdownOptionText,
                    language === option && styles.dropdownOptionTextActive,
                  ]}
                >
                  {languageMeta[option].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.toggle}>
      <TouchableOpacity
        style={[styles.option, language === 'es' && styles.optionActive]}
        onPress={() => setLanguage('es')}
      >
        <Text style={styles.flag}>🇪🇸</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, language === 'en' && styles.optionActive]}
        onPress={() => setLanguage('en')}
      >
        <Text style={styles.flag}>🇺🇸</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, language === 'pt' && styles.optionActive]}
        onPress={() => setLanguage('pt')}
      >
        <Text style={styles.flag}>🇧🇷</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  option: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: '#1A56DB',
  },
  flag: {
    fontSize: 20,
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdownTrigger: {
    minWidth: 82,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7E4F5',
    backgroundColor: '#F8FBFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dropdownFlag: {
    fontSize: 18,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 156,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E4F5',
    backgroundColor: '#FCFDFF',
    padding: 6,
    shadowColor: '#7EA5D8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
    zIndex: 20,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
  },
  dropdownOptionActive: {
    backgroundColor: '#EAF2FF',
  },
  dropdownOptionFlag: {
    fontSize: 18,
  },
  dropdownOptionText: {
    color: '#536685',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownOptionTextActive: {
    color: '#1A56DB',
    fontWeight: '700',
  },
});
