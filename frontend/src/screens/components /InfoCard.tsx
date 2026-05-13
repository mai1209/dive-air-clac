import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  titleIcon?: React.ReactNode;
}

export const InfoCard = ({ title, children, titleIcon }: InfoCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>
        {titleIcon ? <View style={styles.titleIconWrap}>{titleIcon}</View> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCFDFF',
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    shadowColor: '#7EA5D8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  titleIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667A9F',
    letterSpacing: 1.1,
    flex: 1,
  },
  content: {
    gap: 12,
  },
});
