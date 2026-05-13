import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Trash2 } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { useAuth } from '../../contex/AuthContext';
import { useLanguage } from '../../i18n';

export const EditProfileScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatarUri ?? null,
  );

  const initials = useMemo(() => {
    return (name || user?.name || 'D')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [name, user?.name]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode || result.errorMessage) {
      Alert.alert(
        copy.profile.photoErrorTitle,
        result.errorMessage || copy.profile.photoErrorBody,
        [{ text: copy.common.ok }],
      );
      return;
    }

    const nextUri = result.assets?.[0]?.uri;
    if (nextUri) {
      setAvatarUri(nextUri);
    }
  };

  const handleSave = async () => {
    await updateProfile({
      name: name.trim() || user?.name || copy.auth.title,
      avatarUri,
    });

    Alert.alert(copy.profile.profileSavedTitle, copy.profile.profileSavedBody, [
      {
        text: copy.common.ok,
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#1A2A44" size={20} />
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>{copy.profile.editProfileTitle}</Text>
            <Text style={styles.title}>{copy.profile.profilePhotoTitle}</Text>

            <View style={styles.previewCard}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                <Camera color="#1A56DB" size={18} />
                <Text style={styles.photoButtonText}>
                  {copy.profile.choosePhoto}
                </Text>
              </TouchableOpacity>

              {avatarUri ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setAvatarUri(null)}
                >
                  <Trash2 color="#C91C13" size={18} />
                  <Text style={styles.removeButtonText}>
                    {copy.profile.removePhoto}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>{copy.profile.profileNameTitle}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={copy.profile.profileNamePlaceholder}
              placeholderTextColor="#A9B7CD"
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{copy.common.save}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
  },

  previewCard: {
    marginTop: 20,
    alignItems: 'center',
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#1A56DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF4FD',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7E4F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  photoButtonText: {
    color: '#1A56DB',
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F0',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F6D4D2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  removeButtonText: {
    color: '#C91C13',
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D7E4F6',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D90AE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1A2A44',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1A56DB',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
