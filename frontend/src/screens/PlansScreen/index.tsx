import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  SettingsScaffold,
  settingsScaffoldStyles,
} from '../../components/SettingsScaffold';
import { useLanguage } from '../../i18n';

type PlanCardProps = {
  title: string;
  body: string;
  badge: string;
  accent: string;
};

const PlanCard = ({ title, body, badge, accent }: PlanCardProps) => {
  return (
    <View style={styles.planCard}>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planBody}>{body}</Text>
    </View>
  );
};

export const PlansScreen = ({ navigation }: any) => {
  const { copy } = useLanguage();

  return (
    <SettingsScaffold
      navigation={navigation}
      eyebrow={copy.settings.plans.eyebrow}
      title={copy.settings.plans.title}
      description={copy.settings.plans.description}
    >
      <PlanCard
        title={copy.settings.plans.freeTitle}
        body={copy.settings.plans.freeBody}
        badge={copy.settings.plans.currentBadge}
        accent="#DDEBFF"
      />
      <PlanCard
        title={copy.settings.plans.proTitle}
        body={copy.settings.plans.proBody}
        badge={copy.settings.plans.soonBadge}
        accent="#E8F3E8"
      />
      <PlanCard
        title={copy.settings.plans.teamTitle}
        body={copy.settings.plans.teamBody}
        badge={copy.settings.plans.soonBadge}
        accent="#FFF1D9"
      />

      <View style={settingsScaffoldStyles.sectionCard}>
        <Text style={settingsScaffoldStyles.sectionTitle}>
          {copy.settings.plans.footerTitle}
        </Text>
        <Text style={settingsScaffoldStyles.bodyText}>
          {copy.settings.plans.footerBody}
        </Text>
      </View>
    </SettingsScaffold>
  );
};

const styles = StyleSheet.create({
  planCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D7E4F6',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    color: '#1A2A44',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
  },
  planBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#60708D',
  },
});
