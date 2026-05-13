import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useLanguage } from '../../i18n';
import {
  requestPasswordReset,
  resetPasswordRequest,
} from '../../services/api';
import { isPasswordValid } from '../../utils/passwordPolicy';

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: React.ComponentType<any>;
  secure?: boolean;
};

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  secure = false,
}: FieldProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={settingsScaffoldStyles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Icon size={18} color="#7D90AE" />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A9B7CD"
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          keyboardType={label.includes('Codigo') || label.includes('code') ? 'number-pad' : 'default'}
        />
        {secure ? (
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
        ) : null}
      </View>
    </View>
  );
};

export const RecoverPasswordScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert(copy.profile.recoverPasswordTitle, copy.settings.recoverPassword.errorEmail);
      return;
    }

    try {
      setSendingCode(true);
      await requestPasswordReset(email.trim());
      setCodeSent(true);
      Alert.alert(
        copy.settings.recoverPassword.sentTitle,
        copy.settings.recoverPassword.sentBody,
        [{ text: copy.common.ok }],
      );
    } catch (error: any) {
      Alert.alert(
        copy.profile.recoverPasswordTitle,
        error.message || copy.settings.recoverPassword.errorSend,
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleConfirm = async () => {
    if (!code.trim() || !newPassword || !confirmPassword) {
      Alert.alert(copy.profile.recoverPasswordTitle, copy.settings.recoverPassword.errorMissing);
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      Alert.alert(copy.profile.recoverPasswordTitle, copy.settings.recoverPassword.errorCode);
      return;
    }

    if (!isPasswordValid(newPassword)) {
      Alert.alert(copy.profile.recoverPasswordTitle, copy.settings.recoverPassword.errorLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(copy.profile.recoverPasswordTitle, copy.settings.recoverPassword.errorMismatch);
      return;
    }

    try {
      setSubmitting(true);
      await resetPasswordRequest(email.trim(), code.trim(), newPassword);
      Alert.alert(
        copy.settings.recoverPassword.successTitle,
        copy.settings.recoverPassword.successBody,
        [{ text: copy.common.ok, onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert(
        copy.profile.recoverPasswordTitle,
        error.message || copy.settings.recoverPassword.errorReset,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.recoverPassword.eyebrow}
      title={copy.settings.recoverPassword.title}
      description={copy.settings.recoverPassword.description}
    >
      <View style={settingsScaffoldStyles.sectionCard}>
        <Field
          label={copy.settings.recoverPassword.emailLabel}
          placeholder={copy.settings.recoverPassword.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          icon={Mail}
        />

        <TouchableOpacity
          style={settingsScaffoldStyles.secondaryButton}
          activeOpacity={0.88}
          onPress={handleSendCode}
          disabled={sendingCode}
        >
          <Text style={settingsScaffoldStyles.secondaryButtonText}>
            {sendingCode
              ? copy.auth.loading
              : codeSent
              ? copy.settings.recoverPassword.resendCode
              : copy.settings.recoverPassword.sendCode}
          </Text>
        </TouchableOpacity>

        <View style={settingsScaffoldStyles.divider} />

        <Field
          label={copy.settings.recoverPassword.codeLabel}
          placeholder={copy.settings.recoverPassword.codePlaceholder}
          value={code}
          onChangeText={setCode}
          icon={KeyRound}
        />
        <Field
          label={copy.settings.recoverPassword.newLabel}
          placeholder={copy.settings.recoverPassword.passwordPlaceholder}
          value={newPassword}
          onChangeText={setNewPassword}
          icon={LockKeyhole}
          secure
        />
        <Field
          label={copy.settings.recoverPassword.confirmLabel}
          placeholder={copy.settings.recoverPassword.passwordPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          icon={LockKeyhole}
          secure
        />

        <TouchableOpacity
          style={settingsScaffoldStyles.primaryButton}
          activeOpacity={0.88}
          onPress={handleConfirm}
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
  inputWrap: {
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
  input: {
    flex: 1,
    color: '#1A2A44',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
});
