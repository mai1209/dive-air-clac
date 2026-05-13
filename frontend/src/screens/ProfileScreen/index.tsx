import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  KeyRound,
  LifeBuoy,
  Languages,
  LogOut,
  PencilLine,
  ShieldCheck,
  Trash2,
  WalletCards,
} from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { useAuth } from '../../contex/AuthContext';
import { useLanguage } from '../../i18n';

type MenuItemProps = {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
};

const MenuItem = ({
  icon: Icon,
  label,
  description,
  onPress,
  danger = false,
}: MenuItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        <Icon
          size={18}
          color={danger ? '#D92D20' : '#1A56DB'}
        />
      </View>
      <View style={styles.itemBody}>
        <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>
          {label}
        </Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <ChevronRight size={18} color="#8EA2C2" />
    </Pressable>
  );
};

export const ProfileScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();
  const { user, logout } = useAuth();
  const initials = (user?.name || 'D')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    Alert.alert(copy.profile.logoutConfirmTitle, copy.profile.logoutConfirmBody, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.profile.logoutTitle,
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>{copy.profile.eyebrow}</Text>

          <View style={styles.userCard}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.userBody}>
              <Text style={styles.userName}>{user?.name || copy.auth.title}</Text>
              <Text style={styles.userEmail}>{user?.email || 'demo@divemetric.app'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editProfileChip}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <PencilLine color="#1A56DB" size={14} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{copy.profile.preferencesSection}</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={Languages}
            label={copy.profile.languageTitle}
            description={copy.profile.languageDescription}
            onPress={() => navigation.navigate('LanguageSettings')}
          />
        </View>

        <Text style={styles.sectionLabel}>{copy.profile.securitySection}</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={KeyRound}
            label={copy.profile.changePasswordTitle}
            description={copy.profile.changePasswordDescription}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon={KeyRound}
            label={copy.profile.recoverPasswordTitle}
            description={copy.profile.recoverPasswordDescription}
            onPress={() => navigation.navigate('RecoverPassword')}
          />
        </View>

        <Text style={styles.sectionLabel}>{copy.profile.supportSection}</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={ShieldCheck}
            label={copy.profile.privacyTitle}
            description={copy.profile.privacyDescription}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon={Trash2}
            label={copy.profile.deleteAccountTitle}
            description={copy.profile.deleteAccountDescription}
            onPress={() => navigation.navigate('DeleteAccount')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon={LifeBuoy}
            label={copy.profile.supportTitle}
            description={copy.profile.supportDescription}
            onPress={() => navigation.navigate('Support')}
          />
        </View>

        <Text style={styles.sectionLabel}>{copy.profile.plansSection}</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={WalletCards}
            label={copy.profile.plansTitle}
            description={copy.profile.plansDescription}
            onPress={() => navigation.navigate('Plans')}
          />
        </View>

        <Text style={styles.sectionLabel}>{copy.profile.sessionSection}</Text>
        <View style={styles.groupCard}>
          <MenuItem
            icon={LogOut}
            label={copy.profile.logoutTitle}
            description={copy.profile.logoutDescription}
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#5076B0',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 6,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E83CC',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  userCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    padding: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1659D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  userBody: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#173052',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6780A3',
  },
  editProfileChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228,239,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(176,198,231,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    color: '#6B80A3',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#577CB7',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    opacity: 0.86,
    backgroundColor: 'rgba(236,245,255,0.88)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(228,239,255,0.84)',
    marginRight: 12,
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(217, 45, 32, 0.10)',
  },
  itemBody: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    color: '#173052',
    fontSize: 16,
    fontWeight: '700',
  },
  itemLabelDanger: {
    color: '#C91C13',
  },
  itemDescription: {
    color: '#5D738F',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(136, 163, 204, 0.2)',
    marginLeft: 66,
  },
});
