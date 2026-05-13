import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { AppScreenGradient } from './AppScreenGradient';

type SettingsScaffoldProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  navigation: any;
};

export const SettingsScaffold = ({
  eyebrow,
  title,
  description,
  children,
  navigation,
}: SettingsScaffoldProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.86}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#1A2A44" size={20} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export const settingsScaffoldStyles = StyleSheet.create({
  sectionCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#4E78B5',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#173052',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#556B8B',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(136, 163, 204, 0.24)',
    marginVertical: 16,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#1659D5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    shadowColor: '#1D62E0',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: 'rgba(240,247,255,0.82)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(175, 197, 229, 0.52)',
  },
  secondaryButtonText: {
    color: '#1659D5',
    fontSize: 15,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B80A3',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: 'rgba(248,251,255,0.76)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(171, 194, 228, 0.46)',
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#173052',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 10,
    color: '#7185A5',
    fontSize: 13,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(228,239,255,0.82)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(177,198,230,0.48)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pillText: {
    color: '#1659D5',
    fontSize: 12,
    fontWeight: '800',
  },
  linkText: {
    color: '#1659D5',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroCard: {
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
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4E83CC',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#14304F',
    marginBottom: 0,
  },
  description: {
    marginTop: 10,
    color: '#587092',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
});
