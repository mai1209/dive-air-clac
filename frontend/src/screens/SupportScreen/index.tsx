import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useLanguage } from '../../i18n';

const SUPPORT_EMAIL = 'support@divemetric.app';

export const SupportScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();

  const openEmail = async () => {
    const subject = encodeURIComponent(copy.settings.support.emailSubject);
    const body = encodeURIComponent(copy.settings.support.emailBody);
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);

      if (!canOpen) {
        Alert.alert(copy.settings.support.fallbackTitle, SUPPORT_EMAIL);
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(copy.settings.support.fallbackTitle, SUPPORT_EMAIL);
    }
  };

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.support.eyebrow}
      title={copy.settings.support.title}
      description={copy.settings.support.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.support.primaryChannelTitle}
        </Text>
        <Text style={settingsScaffoldStyles.bodyText}>
          {copy.settings.support.primaryChannelBody}
        </Text>
        <View style={settingsScaffoldStyles.pill}>
          <Text style={settingsScaffoldStyles.pillText}>{SUPPORT_EMAIL}</Text>
        </View>

        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.support.responseTitle}
        </Text>
        <Text style={settingsScaffoldStyles.bodyText}>
          {copy.settings.support.responseBody}
        </Text>

        <View style={settingsScaffoldStyles.divider} />

        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.support.faqTitle}
        </Text>
        <Text style={settingsScaffoldStyles.bodyText}>
          {copy.settings.support.faqBody}
        </Text>

        <TouchableOpacity
          style={settingsScaffoldStyles.primaryButton}
          activeOpacity={0.88}
          onPress={openEmail}
        >
          <Text style={settingsScaffoldStyles.primaryButtonText}>
            {copy.settings.support.contactButton}
          </Text>
        </TouchableOpacity>
      </View>
    </SettingsScaffold>
  );
};
