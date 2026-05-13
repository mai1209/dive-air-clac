import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useLanguage } from '../../i18n';

const Section = ({ title, body }: { title: string; body: string }) => {
  return (
    <>
      <Text style={settingsScaffoldStyles.sectionTitle}>{title}</Text>
      <Text style={settingsScaffoldStyles.bodyText}>{body}</Text>
    </>
  );
};

const LinkRow = ({ label, url }: { label: string; url: string }) => {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={() => Linking.openURL(url)}>
      <Text style={settingsScaffoldStyles.linkText}>{label}</Text>
    </TouchableOpacity>
  );
};

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.privacy.eyebrow}
      title={copy.settings.privacy.title}
      description={copy.settings.privacy.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <Section
          title={copy.settings.privacy.sectionOneTitle}
          body={copy.settings.privacy.sectionOneBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Section
          title={copy.settings.privacy.sectionTwoTitle}
          body={copy.settings.privacy.sectionTwoBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Section
          title={copy.settings.privacy.sectionThreeTitle}
          body={copy.settings.privacy.sectionThreeBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Section
          title={copy.settings.privacy.sectionFourTitle}
          body={copy.settings.privacy.sectionFourBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Section
          title={copy.settings.privacy.sectionFiveTitle}
          body={copy.settings.privacy.sectionFiveBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Section
          title={copy.settings.privacy.sectionSixTitle}
          body={copy.settings.privacy.sectionSixBody}
        />
        <View style={settingsScaffoldStyles.divider} />
        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.privacy.legalLinksTitle}
        </Text>
        <LinkRow
          label={copy.settings.privacy.privacyLinkLabel}
          url={copy.settings.privacy.privacyUrl}
        />
        <LinkRow
          label={copy.settings.privacy.eulaLinkLabel}
          url={copy.settings.privacy.eulaUrl}
        />
        <LinkRow
          label={copy.settings.privacy.appleEulaLinkLabel}
          url="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
        />
      </View>
    </SettingsScaffold>
  );
};
