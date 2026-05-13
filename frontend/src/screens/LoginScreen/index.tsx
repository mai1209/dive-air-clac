import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AuthHero } from '../../components/AuthHero';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useAuth } from '../../contex/AuthContext';
import { useLanguage } from '../../i18n';

export const LoginScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(copy.auth.validationTitle, copy.auth.loginValidationBody);
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert(copy.auth.loginErrorTitle, error.message || copy.auth.loginErrorBody);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHero />

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{copy.auth.loginTitle}</Text>
              <LanguageToggle variant="dropdown" />
            </View>

            <Text style={styles.label}>{copy.auth.email}</Text>
            <TextInput
              style={styles.input}
              placeholder={copy.auth.emailPlaceholder}
              placeholderTextColor="#9FB0C8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{copy.auth.password}</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder={copy.auth.passwordPlaceholder}
                placeholderTextColor="#9FB0C8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(current => !current)}
                activeOpacity={0.8}
              >
                {showPassword ? (
                  <EyeOff color="#7F91B0" size={18} />
                ) : (
                  <Eye color="#7F91B0" size={18} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.disabledButton]}
              onPress={handleLogin}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? copy.auth.loading : copy.auth.loginButton}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RecoverPassword')}
            >
              <Text style={styles.forgotText}>{copy.auth.forgotPassword}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{copy.auth.noAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>{copy.auth.goRegister}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   safeArea: {
    flex: 1,
    backgroundColor: 'rgba(28, 84, 198, 0.96)',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    backgroundColor: 'rgba(28, 84, 198, 0.96)',
  },
  card: {
    backgroundColor: 'rgba(252, 253, 255, 0.96)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    shadowColor: '#7EA5D8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2A44',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60708D',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FDFEFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DEE8F4',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1A2A44',
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#1A56DB',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.72,
  },
  forgotButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1A56DB',
    fontWeight: '700',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(215, 228, 246, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerText: {
    color: '#60708D',
    fontSize: 14,
  },
  footerLink: {
    color: '#1A56DB',
    fontSize: 14,
    fontWeight: '700',
  },
});
