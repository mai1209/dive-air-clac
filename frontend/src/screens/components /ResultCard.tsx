import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useLanguage } from '../../i18n';

type ResultCardProps = {
  sac: string;
  atm: string;
  tiempo: number;
};

export const ResultCard = ({ sac, atm, tiempo }: ResultCardProps) => {
  const { copy } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.heroRow}>
        <View style={styles.iconCircle}>
          <Image
            source={require('../../asset/tanqueBuceo.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>{copy.result.eyebrow}</Text>
          <Text style={styles.title}>{copy.result.title}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.sacValue}>{sac}</Text>
            <Text style={styles.unit}>{copy.common.lmin}</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{copy.result.atmAverage}</Text>
          <Text style={styles.metricValue}>
            {atm} {copy.common.atm}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{copy.result.diveTime}</Text>
          <Text style={styles.metricValue}>
            {tiempo} {copy.common.min}
          </Text>
        </View>
      </View>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaTitle}>{copy.result.formulaTitle}</Text>
        <Text style={styles.formulaText}>{copy.result.formulaText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FBFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.2,
    borderColor: '#D8E7FA',
    marginTop: 20,
    marginHorizontal: 1,
    shadowColor: '#7EA5D8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#1A56DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  iconImage: {
    width: 44,
    height: 44,
  },
  heroText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2A44',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  sacValue: {
    fontSize: 40,
    lineHeight: 58,
    fontWeight: '800',
    color: '#1A56DB',
  },
  unit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A56DB',
    marginLeft: 8,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8495B3',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    color: '#1A2A44',
    fontWeight: '700',
  },
  formulaCard: {
    marginTop: 14,
    backgroundColor: '#EEF5FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9E8FB',
  },
  formulaTitle: {
    fontSize: 12,
    color: '#8495B3',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  formulaText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A56DB',
    fontWeight: '700',
  },
});
