import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Gauge,
  MoveDown,
  NotebookPen,
  Trash2,
} from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { DiveLog, useDiveLogs } from '../../contex/DiveLogsContext';
import { useLanguage } from '../../i18n';

const COLORS = {
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFC',
  surfaceMuted: '#F1F4F8',

  text: '#1A56DB',
  textSoft: '#354258',
  muted: '#778397',
  mutedSoft: '#9AA5B5',

  line: '#E2E7EF',
  lineStrong: '#D7DEE8',

  primary: '#152033',
  primarySoft: '#EEF4FF',

  danger: '#C6281D',
  dangerSoft: '#FFF3F2',
  dangerBorder: '#F0C9C5',

  shadow: '#1E2A3A',
};

const formatDiveDate = (value: string | null, locale: string) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMinutesLabel = (minutes: number) => {
  if (minutes <= 0) {
    return '0 min';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
};

const getDiveDateParts = (dive: DiveLog) => {
  if (dive.dateKey) {
    const [year, month, day] = dive.dateKey.split('-').map(Number);

    return {
      year,
      month: month - 1,
      day,
    };
  }

  const parsed = new Date(dive.dateIso ?? dive.savedAt);

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
  };
};

export const HistoryScreen = ({ navigation }: any) => {
  const { copy, language } = useLanguage();
  const { diveLogs, deleteDive } = useDiveLogs();

  const locale =
    language === 'es' ? 'es-AR' : language === 'pt' ? 'pt-BR' : 'en-US';

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) =>
        new Date(2026, monthIndex, 1).toLocaleDateString(locale, {
          month: 'short',
        }),
      ),
    [locale],
  );

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        diveLogs
          .map(dive => getDiveDateParts(dive).year)
          .filter(year => Number.isFinite(year)),
      ),
    ).sort((a, b) => b - a);
  }, [diveLogs]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | 'annual'>(
    'annual',
  );
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPickerDate, setYearPickerDate] = useState(new Date(2026, 0, 1));

  useEffect(() => {
    if (!availableYears.length) {
      setSelectedYear(null);
      return;
    }

    setSelectedYear(currentYear =>
      currentYear && availableYears.includes(currentYear)
        ? currentYear
        : availableYears[0],
    );
  }, [availableYears]);

  useEffect(() => {
    if (!selectedYear) {
      return;
    }

    setYearPickerDate(new Date(selectedYear, 0, 1));
  }, [selectedYear]);

  const filteredSections = useMemo(() => {
    if (!selectedYear) {
      return [] as Array<{ monthIndex: number; items: DiveLog[] }>;
    }

    const logsForYear = diveLogs.filter(dive => {
      return getDiveDateParts(dive).year === selectedYear;
    });

    if (selectedMonth === 'annual') {
      return Array.from({ length: 12 }, (_, monthIndex) => {
        const items = logsForYear.filter(dive => {
          return getDiveDateParts(dive).month === monthIndex;
        });

        return { monthIndex, items };
      }).filter(section => section.items.length > 0);
    }

    return [
      {
        monthIndex: selectedMonth,
        items: logsForYear.filter(dive => {
          return getDiveDateParts(dive).month === selectedMonth;
        }),
      },
    ].filter(section => section.items.length > 0);
  }, [diveLogs, selectedMonth, selectedYear]);

  const filteredDiveCount = useMemo(() => {
    return filteredSections.reduce(
      (sum, section) => sum + section.items.length,
      0,
    );
  }, [filteredSections]);

  const filteredMinutes = useMemo(() => {
    return filteredSections.reduce((sum, section) => {
      return (
        sum +
        section.items.reduce((sectionMinutes, dive) => {
          return sectionMinutes + dive.durationMinutes;
        }, 0)
      );
    }, 0);
  }, [filteredSections]);

  const activeFilterLabel = useMemo(() => {
    if (!selectedYear) {
      return '';
    }

    if (selectedMonth === 'annual') {
      return String(selectedYear);
    }

    return `${monthLabels[selectedMonth]} ${selectedYear}`;
  }, [monthLabels, selectedMonth, selectedYear]);

  const handleDeleteDive = (dive: DiveLog) => {
    Alert.alert(copy.history.deleteTitle, copy.history.deleteBody, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.history.deleteAction,
        style: 'destructive',
        onPress: async () => {
          await deleteDive(dive.id);
          Alert.alert(
            copy.history.deleteSuccessTitle,
            copy.history.deleteSuccessBody,
          );
        },
      },
    ]);
  };

  const openYearPicker = () => {
    if (!selectedYear) {
      return;
    }

    setYearPickerDate(new Date(selectedYear, 0, 1));
    setShowYearPicker(true);
  };

  const confirmYearPicker = () => {
    const nextYear = yearPickerDate.getFullYear();

    if (availableYears.includes(nextYear)) {
      setSelectedYear(nextYear);
    } else if (availableYears.length) {
      const closestYear = availableYears.reduce((closest, year) => {
        return Math.abs(year - nextYear) < Math.abs(closest - nextYear)
          ? year
          : closest;
      }, availableYears[0]);

      setSelectedYear(closestYear);
    }

    setSelectedMonth('annual');
    setShowYearPicker(false);
  };

  if (!diveLogs.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppScreenGradient />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <NotebookPen color={COLORS.muted} size={34} />

            <Text style={styles.emptyEyebrow}>{copy.history.eyebrow}</Text>
            <Text style={styles.emptyTitle}>{copy.history.title}</Text>
            <Text style={styles.emptyDescription}>
              {copy.history.description}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>{copy.history.eyebrow}</Text>
          </View>

          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <View>
                <Text style={styles.dashboardLabel}>
                  {copy.history.selectedYear}
                </Text>
                <Text style={styles.dashboardValue}>{activeFilterLabel}</Text>
              </View>

              <TouchableOpacity
                style={styles.yearButton}
                activeOpacity={0.86}
                onPress={openYearPicker}
              >
                <CalendarDays color={COLORS.muted} size={17} />
                <Text style={styles.yearButtonText}>{selectedYear}</Text>
                <ChevronDown color={COLORS.muted} size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.dashboardStats}>
              <View style={styles.dashboardStatItem}>
                <Text style={styles.dashboardStatValue}>
                  {filteredDiveCount}
                </Text>
                <Text style={styles.dashboardStatLabel}>
                  {copy.stats.totalDives}
                </Text>
              </View>

              <View style={styles.dashboardVerticalLine} />

              <View style={styles.dashboardStatItem}>
                <Text style={styles.dashboardStatValue}>
                  {formatMinutesLabel(filteredMinutes)}
                </Text>
                <Text style={styles.dashboardStatLabel}>
                  {copy.stats.totalTime}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.monthFilterCard}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthRow}
            >
              <TouchableOpacity
                style={[
                  styles.monthChip,
                  selectedMonth === 'annual' && styles.monthChipActive,
                ]}
                activeOpacity={0.86}
                onPress={() => setSelectedMonth('annual')}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === 'annual' && styles.monthChipTextActive,
                  ]}
                >
                  {copy.history.annual}
                </Text>
              </TouchableOpacity>

              {monthLabels.map((monthLabel, monthIndex) => (
                <TouchableOpacity
                  key={`${monthLabel}-${monthIndex}`}
                  style={[
                    styles.monthChip,
                    selectedMonth === monthIndex && styles.monthChipActive,
                  ]}
                  activeOpacity={0.86}
                  onPress={() => setSelectedMonth(monthIndex)}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      selectedMonth === monthIndex &&
                        styles.monthChipTextActive,
                    ]}
                  >
                    {monthLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {!filteredSections.length ? (
            <View style={styles.emptyFilterCard}>
              <CalendarDays color={COLORS.muted} size={30} />

              <Text style={styles.emptyFilterTitle}>
                {copy.history.emptyFilterTitle}
              </Text>
              <Text style={styles.emptyFilterDescription}>
                {copy.history.emptyFilterDescription}
              </Text>
            </View>
          ) : (
            filteredSections.map(section => (
              <View
                key={`section-${section.monthIndex}`}
                style={styles.monthSection}
              >
                <View style={styles.monthSectionHeader}>
                  <View>
                    <Text style={styles.monthSectionTitle}>
                      {new Date(2026, section.monthIndex, 1).toLocaleDateString(
                        locale,
                        {
                          month: 'long',
                        },
                      )}
                    </Text>

                    <Text style={styles.monthSectionSubtitle}>
                      {section.items.length}{' '}
                      {copy.stats.totalDives.toLowerCase()}
                    </Text>
                  </View>

                  <View style={styles.monthLine} />
                </View>

                <View style={styles.timelineList}>
                  {section.items.map((dive, index) => (
                    <View key={dive.id} style={styles.timelineItem}>
                      <View style={styles.diveCard}>
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() =>
                            navigation.navigate('DiveDetail', {
                              diveId: dive.id,
                            })
                          }
                        >
                          <View style={styles.diveCardHeader}>
                            <View style={styles.diveCardMain}>
                              <Text style={styles.diveDate}>
                                {formatDiveDate(
                                  dive.dateIso ?? dive.savedAt,
                                  locale,
                                )}
                              </Text>

                              <Text style={styles.diveTitle} numberOfLines={1}>
                                {dive.name || copy.history.untitled}
                              </Text>

                              <Text
                                style={styles.diveSubtitle}
                                numberOfLines={1}
                              >
                                {dive.cylinderType || '-'} ·{' '}
                                {dive.cylinderVolume || '-'} L
                              </Text>
                            </View>

                            <View style={styles.cardActions}>
                              <TouchableOpacity
                                style={styles.deleteButton}
                                activeOpacity={0.84}
                                onPress={() => handleDeleteDive(dive)}
                              >
                                <Trash2 color={COLORS.danger} size={16} />
                              </TouchableOpacity>

                              <View style={styles.detailArrow}>
                                <ChevronRight
                                  color={COLORS.mutedSoft}
                                  size={19}
                                />
                              </View>
                            </View>
                          </View>

                          <View style={styles.metricsRow}>
                            <View style={styles.metricItem}>
                              <View>
                                <Text style={styles.metricLabel}>SAC</Text>
                                <Text style={styles.metricValue}>
                                  {dive.sac} {copy.common.lmin}
                                </Text>
                              </View>
                              <Gauge color={COLORS.muted} size={10} />
                            </View>

                            <View style={styles.metricItem}>
                              <View>
                                <Text style={styles.metricLabel}>
                                  {copy.stats.totalTime}
                                </Text>
                                <Text style={styles.metricValue}>
                                  {dive.durationMinutes} {copy.common.min}
                                </Text>
                              </View>
                              <Clock3 color={COLORS.muted} size={10} />
                            </View>

                            <View style={styles.metricItem}>
                              <View>
                                <Text style={styles.metricLabel}>
                                  {copy.stats.maxDepth}
                                </Text>
                                <Text style={styles.metricValue}>
                                  {dive.maxDepth} m
                                </Text>
                              </View>
                              <MoveDown color={COLORS.muted} size={10} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>{copy.history.chooseYear}</Text>

            <DateTimePicker
              value={yearPickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
              themeVariant="light"
              onChange={(_, nextValue) => {
                if (nextValue) {
                  setYearPickerDate(nextValue);
                }
              }}
              style={styles.yearSpinner}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                activeOpacity={0.88}
                onPress={() => setShowYearPicker(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>
                  {copy.common.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                activeOpacity={0.88}
                onPress={confirmYearPicker}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  {copy.common.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  headerBlock: {
    marginBottom: 18,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  dashboardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },

  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },

  dashboardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.mutedSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },

  dashboardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.6,
    textTransform: 'capitalize',
  },

  yearButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  yearButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textSoft,
  },

  dashboardStats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: 14,
  },

  dashboardStatItem: {
    flex: 1,
    paddingHorizontal: 14,
  },

  dashboardStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },

  dashboardStatLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.mutedSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  dashboardVerticalLine: {
    width: 1,
    backgroundColor: COLORS.line,
  },

  monthFilterCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 10,
    marginBottom: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },

  monthRow: {
    gap: 8,
    paddingRight: 6,
  },

  monthChip: {
    minHeight: 38,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },

  monthChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'capitalize',
  },

  monthChipTextActive: {
    color: COLORS.surface,
  },

  monthSection: {
    marginTop: 28,
  },

  monthSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },

  monthSectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'capitalize',
    letterSpacing: -0.55,
  },

  monthSectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'capitalize',
  },

  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.line,
  },

  timelineList: {
    gap: 14,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },

  timelineRail: {
    width: 42,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 26,
    zIndex: 5,
  },

  timelineDot: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.surface,
    position: 'absolute',

    top: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 5,

    borderWidth: 1,
    borderColor: COLORS.line,

    transform: [{ rotate: '-45deg' }],

    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.045,
    shadowRadius: 14,
    elevation: 2,
  },

  timelineConnector: {
    position: 'absolute',
    right: -5,
    top: 10,
    width: 24,
    height: 22,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.line,
    zIndex: 6,
  },

  diveCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 15,
    marginBottom: 0,
    marginLeft: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.045,
    shadowRadius: 18,
    elevation: 2,
  },

  diveCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  diveCardMain: {
    flex: 1,
  },

  diveDate: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  diveTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  diveSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
  },

  metricItem: {
    flex: 1,
    borderRightColor: COLORS.line,
    borderRightWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 5,
    paddingRight: 5,
  },

  metricLabel: {
    fontSize: 7,
    fontWeight: '600',
    color: COLORS.mutedSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
  },

  metricValue: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textSoft,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 70,
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 26,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },

  emptyEyebrow: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.7,
    marginBottom: 10,
  },

  emptyDescription: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
    color: COLORS.muted,
    maxWidth: 330,
  },

  emptyFilterCard: {
    marginTop: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },

  emptyFilterTitle: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  emptyFilterDescription: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.muted,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 30, 0.46)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: '#061326',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.2,
    shadowRadius: 34,
    elevation: 10,
  },

  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DCE3ED',
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.35,
  },

  yearSpinner: {
    alignSelf: 'center',
    height: 180,
  },

  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  modalSecondaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  modalSecondaryButtonText: {
    color: COLORS.textSoft,
    fontSize: 15,
    fontWeight: '900',
  },

  modalPrimaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },

  modalPrimaryButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '900',
  },
});
