import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useAuth } from '../../contex/AuthContext';
import { useLanguage } from '../../i18n';
import { changePasswordRequest } from '../../services/api';
import { isPasswordValid } from '../../utils/passwordPolicy';

type PasswordFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

const PasswordField = ({
  label,
  placeholder,
  value,
  onChangeText,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={settingsScaffoldStyles.inputLabel}>{label}</Text>
      <View style={styles.passwordWrap}>
        <LockKeyhole size={18} color="#7D90AE" />
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A9B7CD"
          secureTextEntry={!visible}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setVisible(current => !current)}
        >
          {visible ? (
            <EyeOff size={18} color="#7D90AE" />
          ) : (
            <Eye size={18} color="#7D90AE" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(copy.profile.changePasswordTitle, copy.settings.changePassword.errorMissing);
      return;
    }

    if (!isPasswordValid(newPassword)) {
      Alert.alert(copy.profile.changePasswordTitle, copy.settings.changePassword.errorLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(copy.profile.changePasswordTitle, copy.settings.changePassword.errorMismatch);
      return;
    }

    if (!token || token === 'demo-token') {
      Alert.alert(copy.profile.changePasswordTitle, copy.settings.changePassword.errorSession);
      return;
    }

    try {
      setSubmitting(true);
      await changePasswordRequest(token, currentPassword, newPassword);
      Alert.alert(
        copy.settings.changePassword.successTitle,
        copy.settings.changePassword.successBody,
        [{ text: copy.common.ok, onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert(
        copy.profile.changePasswordTitle,
        error.message || copy.settings.changePassword.errorSave,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.changePassword.eyebrow}
      title={copy.settings.changePassword.title}
      description={copy.settings.changePassword.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <PasswordField
          label={copy.settings.changePassword.currentLabel}
          placeholder={copy.settings.changePassword.currentPlaceholder}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <PasswordField
          label={copy.settings.changePassword.newLabel}
          placeholder={copy.settings.changePassword.newPlaceholder}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordField
          label={copy.settings.changePassword.confirmLabel}
          placeholder={copy.settings.changePassword.confirmPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={settingsScaffoldStyles.helperText}>
          {copy.settings.changePassword.tip}
        </Text>

        <TouchableOpacity
          style={settingsScaffoldStyles.primaryButton}
          activeOpacity={0.88}
          onPress={handleSave}
          disabled={submitting}
        >
          <Text style={settingsScaffoldStyles.primaryButtonText}>
            {submitting ? copy.auth.loading : copy.common.save}
          </Text>
        </TouchableOpacity>
      </View>
    </SettingsScaffold>
  );
};

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: {
    flex: 1,
    color: '#1A2A44',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
});
