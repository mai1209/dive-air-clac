import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useLanguage } from '../../i18n';

export const DeleteAccountScreen = ({ navigation }: any) => {
  const { copy, language } = useLanguage();
  const [confirmation, setConfirmation] = useState('');
  const requiredWord = useMemo(
    () => (language === 'es' ? 'ELIMINAR' : 'DELETE'),
    [language],
  );

  const handleSubmit = () => {
    if (confirmation.trim().toUpperCase() !== requiredWord) {
      Alert.alert(copy.profile.deleteAccountTitle, copy.settings.deleteAccount.errorConfirm);
      return;
    }

    Alert.alert(
      copy.settings.deleteAccount.successTitle,
      copy.settings.deleteAccount.successBody,
      [{ text: copy.common.ok, onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.deleteAccount.eyebrow}
      title={copy.settings.deleteAccount.title}
      description={copy.settings.deleteAccount.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.deleteAccount.warningTitle}
        </Text>
        <Text style={settingsScaffoldStyles.bodyText}>
          {copy.settings.deleteAccount.warningBody}
        </Text>

        <View style={styles.confirmWrap}>
          <Text style={settingsScaffoldStyles.inputLabel}>
            {copy.settings.deleteAccount.confirmLabel}
          </Text>
          <TextInput
            style={settingsScaffoldStyles.input}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder={copy.settings.deleteAccount.confirmPlaceholder}
            placeholderTextColor="#A9B7CD"
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[settingsScaffoldStyles.primaryButton, styles.dangerButton]}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <Text style={settingsScaffoldStyles.primaryButtonText}>
            {copy.profile.deleteAccountTitle}
          </Text>
        </TouchableOpacity>
      </View>
    </SettingsScaffold>
  );
};

const styles = StyleSheet.create({
  confirmWrap: {
    marginTop: 18,
  },
  dangerButton: {
    backgroundColor: '#D92D20',
  },
});
