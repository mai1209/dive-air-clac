import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Gauge, Medal, Timer } from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { useDiveLogs } from '../../contex/DiveLogsContext';
import { useLanguage } from '../../i18n';

const screenWidth = Dimensions.get('window').width;
const baseChartWidth = screenWidth - 72;
const lineChartHeight = 170;
const barChartHeight = 150;

type StatsFilterMode = 'all' | 'year' | 'month';

const getDiveDateParts = (
  dive: ReturnType<typeof useDiveLogs>['diveLogs'][number],
) => {
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

const formatHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes} min`;
};

const toSacNumber = (value: string) => {
  const normalized = Number(String(value).replace(',', '.'));
  return Number.isFinite(normalized) ? normalized : 0;
};

const getDiveSortTimestamp = (
  dive: ReturnType<typeof useDiveLogs>['diveLogs'][number],
) => {
  if (dive.startTimeIso) {
    return new Date(dive.startTimeIso).getTime();
  }

  if (dive.dateIso) {
    return new Date(dive.dateIso).getTime();
  }

  if (dive.dateKey) {
    return new Date(`${dive.dateKey}T12:00:00`).getTime();
  }

  return new Date(dive.savedAt).getTime();
};

const getSeriesChartWidth = (count: number) => {
  return Math.max(baseChartWidth, count * 54);
};

const buildSeriesPoint = (
  key: string,
  label: string,
  logs: ReturnType<typeof useDiveLogs>['diveLogs'],
) => {
  const totalSac = logs.reduce((sum, dive) => sum + toSacNumber(dive.sac), 0);

  return {
    key,
    label,
    sacAverage: logs.length ? totalSac / logs.length : 0,
    dives: logs.length,
  };
};

const buildAllTimeSeries = (
  diveLogs: ReturnType<typeof useDiveLogs>['diveLogs'],
  locale: string,
) => {
  const grouped = new Map<string, ReturnType<typeof useDiveLogs>['diveLogs']>();

  diveLogs.forEach(dive => {
    const { year, month } = getDiveDateParts(dive);
    const key = `${year}-${month}`;
    const current = grouped.get(key) ?? [];
    current.push(dive);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      return new Date(yearA, monthA, 1).getTime() - new Date(yearB, monthB, 1).getTime();
    })
    .map(([key, logs]) => {
      const [year, month] = key.split('-').map(Number);
      return buildSeriesPoint(
        key,
        new Date(year, month, 1).toLocaleDateString(locale, {
          month: 'short',
          year: '2-digit',
        }),
        logs,
      );
    });
};

const buildYearSeries = (
  diveLogs: ReturnType<typeof useDiveLogs>['diveLogs'],
  year: number,
  locale: string,
) => {
  return Array.from({ length: 12 }, (_, month) => {
    const monthLogs = diveLogs.filter(dive => {
      const parts = getDiveDateParts(dive);
      return parts.year === year && parts.month === month;
    });

    return buildSeriesPoint(
      `${year}-${month}`,
      new Date(year, month, 1).toLocaleDateString(locale, { month: 'short' }),
      monthLogs,
    );
  });
};

const buildMonthSeries = (
  diveLogs: ReturnType<typeof useDiveLogs>['diveLogs'],
  year: number,
  month: number,
) => {
  const lastDay = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDay }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const dayLogs = diveLogs.filter(dive => {
      const parts = getDiveDateParts(dive);
      return parts.year === year && parts.month === month && parts.day === day;
    });

    return buildSeriesPoint(`${year}-${month}-${day}`, String(day), dayLogs);
  });
};

const BarChart = ({
  data,
  color,
  width,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
  width: number;
}) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const barWidth = Math.max((width - data.length * 10) / data.length, 24);

  return (
    <View>
      <Svg width={width} height={barChartHeight}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const x =
            data.length === 1
              ? (width - Math.min(barWidth, 72)) / 2
              : index * (barWidth + 10);
          const y = 18 + (100 - barHeight);
          const nextBarWidth =
            data.length === 1 ? Math.min(barWidth, 72) : barWidth;

          return (
            <Rect
              key={item.label}
              x={x}
              y={y}
              width={nextBarWidth}
              height={barHeight}
              rx={10}
              fill={color}
            />
          );
        })}
      </Svg>
      <View style={[styles.chartLabelsRow, { width }]}>
        {data.map(item => (
          <Text key={item.label} style={styles.chartLabelText}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const LineChart = ({
  data,
  color,
  width,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
  width: number;
}) => {
  const values = data.map(item => item.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((item, index) => {
    const x = data.length > 1 ? index * stepX : width / 2;
    const y =
      lineChartHeight - 34 - ((item.value - minValue) / range) * (lineChartHeight - 70);

    return { x, y, label: item.label };
  });

  const path = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(' ');

  return (
    <View>
      <Svg width={width} height={lineChartHeight}>
        <Path
          d={`M 0 ${lineChartHeight - 34} L ${width} ${lineChartHeight - 34}`}
          stroke="#D7E4F6"
          strokeWidth={1}
        />
        <Path d={path} stroke={color} strokeWidth={4} fill="none" />
        {points.map(point => (
          <Circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r={5}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth={3}
          />
        ))}
      </Svg>
      <View style={[styles.chartLabelsRow, { width }]}>
        {data.map(item => (
          <Text key={item.label} style={styles.chartLabelText}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const TrendMetric = ({
  icon: Icon,
  label,
  value,
  variant = 'bottom',
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  variant?: 'top' | 'bottom';
}) => {
  return (
    <View
      style={[
        variant === 'top' ? styles.triangleTopMetric : styles.triangleBottomMetric,
      ]}
    >
      <View style={styles.triangleIconWrap}>
        <Icon size={16} color="#1A56DB" strokeWidth={2.4} />
      </View>
      <Text style={styles.triangleMetricLabel}>{label}</Text>
      <Text style={styles.triangleMetricValue}>{value}</Text>
    </View>
  );
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );
};

export const StatsScreen = () => {
  const { copy, language } = useLanguage();
  const { diveLogs } = useDiveLogs();
  const sacScrollRef = useRef<ScrollView | null>(null);
  const divesScrollRef = useRef<ScrollView | null>(null);
  const locale =
    language === 'es' ? 'es-AR' : language === 'pt' ? 'pt-BR' : 'en-US';
  const [filterMode, setFilterMode] = useState<StatsFilterMode>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        diveLogs
          .map(dive => getDiveDateParts(dive).year)
          .filter(year => Number.isFinite(year)),
      ),
    ).sort((a, b) => b - a);
  }, [diveLogs]);

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

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) =>
        new Date(2026, monthIndex, 1).toLocaleDateString(locale, {
          month: 'short',
        }),
      ),
    [locale],
  );

  const filteredDiveLogs = useMemo(() => {
    if (filterMode === 'all' || !selectedYear) {
      return diveLogs;
    }

    return diveLogs.filter(dive => {
      const parts = getDiveDateParts(dive);

      if (filterMode === 'year') {
        return parts.year === selectedYear;
      }

      return parts.year === selectedYear && parts.month === selectedMonth;
    });
  }, [diveLogs, filterMode, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const totalDives = filteredDiveLogs.length;
    const totalMinutes = filteredDiveLogs.reduce(
      (sum, dive) =>
        sum + (Number.isFinite(dive.durationMinutes) ? dive.durationMinutes : 0),
      0,
    );
    const sacValues = filteredDiveLogs
      .map(dive => toSacNumber(dive.sac))
      .filter(value => Number.isFinite(value));
    const avgSac = sacValues.length
      ? sacValues.reduce((sum, value) => sum + value, 0) / sacValues.length
      : 0;
    const maxDepthValues = filteredDiveLogs
      .map(dive => Number(String(dive.maxDepth).replace(',', '.')))
      .filter(value => Number.isFinite(value));
    const deepest = maxDepthValues.length ? Math.max(...maxDepthValues) : 0;
    const latestDive = [...filteredDiveLogs].sort(
      (a, b) => getDiveSortTimestamp(b) - getDiveSortTimestamp(a),
    )[0];
    const latestSac = latestDive ? toSacNumber(latestDive.sac) : 0;
    const bestSac = sacValues.length ? Math.min(...sacValues) : 0;

    const series =
      filterMode === 'all'
        ? buildAllTimeSeries(diveLogs, locale)
        : filterMode === 'year' && selectedYear
          ? buildYearSeries(diveLogs, selectedYear, locale)
          : selectedYear
            ? buildMonthSeries(diveLogs, selectedYear, selectedMonth)
            : [];

    const nonEmptySeries = series.filter(point => point.dives > 0);
    const halfIndex = Math.max(Math.floor(nonEmptySeries.length / 2), 1);
    const currentSlice = nonEmptySeries.slice(-halfIndex);
    const previousSlice = nonEmptySeries.slice(0, nonEmptySeries.length - currentSlice.length);
    const currentSacAverage = currentSlice.length
      ? currentSlice.reduce((sum, item) => sum + item.sacAverage, 0) / currentSlice.length
      : 0;
    const previousSacAverage = previousSlice.length
      ? previousSlice.reduce((sum, item) => sum + item.sacAverage, 0) / previousSlice.length
      : 0;
    const bestMonth = [...nonEmptySeries].sort((a, b) => b.dives - a.dives)[0];

    return {
      totalDives,
      totalMinutes,
      avgSac,
      deepest,
      series,
      currentSacAverage,
      previousSacAverage,
      bestMonth,
      bestSac,
      latestSac,
    };
  }, [
    diveLogs,
    filteredDiveLogs,
    filterMode,
    locale,
    selectedMonth,
    selectedYear,
  ]);

  const sacData = stats.series.map(item => ({
    label: item.label,
    value: Number(item.sacAverage.toFixed(1)),
  }));
  const divesData = stats.series.map(item => ({
    label: item.label,
    value: item.dives,
  }));
  const chartWidth = getSeriesChartWidth(stats.series.length);
  const focusSeriesIndex = useMemo(() => {
    return stats.series.reduce((foundIndex, item, index) => {
      return item.dives > 0 ? index : foundIndex;
    }, -1);
  }, [stats.series]);

  useEffect(() => {
    if (focusSeriesIndex < 0 || stats.series.length <= 1) {
      return;
    }

    const targetX = Math.max(focusSeriesIndex * 54 - baseChartWidth * 0.45, 0);

    const timeoutId = setTimeout(() => {
      sacScrollRef.current?.scrollTo({ x: targetX, animated: true });
      divesScrollRef.current?.scrollTo({ x: targetX, animated: true });
    }, 120);

    return () => clearTimeout(timeoutId);
  }, [chartWidth, focusSeriesIndex, stats.series.length]);

  if (!diveLogs.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppScreenGradient />
        <View style={styles.emptyContainer}>
          <Text style={styles.eyebrow}>{copy.stats.eyebrow}</Text>
          <Text style={styles.title}>{copy.stats.emptyTitle}</Text>
          <Text style={styles.description}>{copy.stats.emptyDescription}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const trendCopy =
    stats.currentSacAverage && stats.previousSacAverage
      ? stats.currentSacAverage < stats.previousSacAverage
        ? copy.stats.trendImproved
        : stats.currentSacAverage > stats.previousSacAverage
          ? copy.stats.trendWorse
          : copy.stats.trendNeutral
      : copy.stats.trendNeutral;

  const bestMonthLabel =
    stats.bestMonth && stats.bestMonth.dives > 0
      ? `${stats.bestMonth.label} · ${stats.bestMonth.dives}`
      : copy.stats.bestMonthFallback;

  const sacChartTitle =
    filterMode === 'month'
      ? copy.stats.dailySacTitle
      : copy.stats.monthlySacTitle;
  const sacChartDescription =
    filterMode === 'month'
      ? copy.stats.dailySacDescription
      : copy.stats.monthlySacDescription;
  const divesChartTitle =
    filterMode === 'month'
      ? copy.stats.dailyDivesTitle
      : copy.stats.monthlyDivesTitle;
  const divesChartDescription =
    filterMode === 'month'
      ? copy.stats.dailyDivesDescription
      : copy.stats.monthlyDivesDescription;

  const currentFilterLabel =
    filterMode === 'all'
      ? copy.stats.allTime
      : filterMode === 'year'
        ? `${copy.stats.byYear} · ${selectedYear ?? '—'}`
        : `${copy.stats.byMonth} · ${monthLabels[selectedMonth]} ${selectedYear ?? ''}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{copy.stats.eyebrow}</Text>
        <Text style={styles.title}>{copy.stats.title}</Text>

        <View style={styles.filterPanel}>
          <Text style={styles.filterPanelTitle}>{copy.stats.currentFilterTitle}</Text>
          <View style={styles.filterModeRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterMode === 'all' && styles.filterChipActive,
              ]}
              onPress={() => setFilterMode('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterMode === 'all' && styles.filterChipTextActive,
                ]}
              >
                {copy.stats.allTime}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterMode === 'year' && styles.filterChipActive,
              ]}
              onPress={() => setFilterMode('year')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterMode === 'year' && styles.filterChipTextActive,
                ]}
              >
                {copy.stats.byYear}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterMode === 'month' && styles.filterChipActive,
              ]}
              onPress={() => setFilterMode('month')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterMode === 'month' && styles.filterChipTextActive,
                ]}
              >
                {copy.stats.byMonth}
              </Text>
            </TouchableOpacity>
          </View>

          {filterMode !== 'all' ? (
            <>
              <Text style={styles.filterLabel}>{copy.stats.activeYear}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {availableYears.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.selectorChip,
                      selectedYear === year && styles.selectorChipActive,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        selectedYear === year && styles.selectorChipTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}

          {filterMode === 'month' ? (
            <>
              <Text style={styles.filterLabel}>{copy.stats.activeMonth}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {monthLabels.map((monthLabel, monthIndex) => (
                  <TouchableOpacity
                    key={`${monthLabel}-${monthIndex}`}
                    style={[
                      styles.selectorChip,
                      selectedMonth === monthIndex && styles.selectorChipActive,
                    ]}
                    onPress={() => setSelectedMonth(monthIndex)}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        selectedMonth === monthIndex && styles.selectorChipTextActive,
                      ]}
                    >
                      {monthLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}

          <View style={styles.filterSummaryRow}>
            <View style={styles.filterSummaryChip}>
              <Text style={styles.filterSummaryText}>{currentFilterLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setFilterMode('all');
                if (availableYears.length) {
                  setSelectedYear(availableYears[0]);
                }
                setSelectedMonth(new Date().getMonth());
              }}
            >
              <Text style={styles.clearFiltersText}>{copy.stats.clearFilters}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label={copy.stats.totalDives}
            value={String(stats.totalDives)}
          />
          <StatCard
            label={copy.stats.totalTime}
            value={formatHours(stats.totalMinutes)}
          />
          <StatCard
            label={copy.stats.avgSac}
            value={`${stats.avgSac.toFixed(1)} ${copy.common.lmin}`}
          />
          <StatCard
            label={copy.stats.maxDepth}
            value={`${stats.deepest.toFixed(1)} m`}
          />
        </View>

        <ChartCard
          title={sacChartTitle}
          description={sacChartDescription}
        >
          <ScrollView
            ref={sacScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <LineChart data={sacData} color="#1A56DB" width={chartWidth} />
          </ScrollView>
        </ChartCard>

        <ChartCard
          title={divesChartTitle}
          description={divesChartDescription}
        >
          <ScrollView
            ref={divesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <BarChart data={divesData} color="#5BB7A2" width={chartWidth} />
          </ScrollView>
        </ChartCard>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>{copy.stats.trendTitle}</Text>
          <Text style={styles.insightText}>{trendCopy}</Text>

          <View style={styles.trendTriangleWrap}>
            <TrendMetric
              icon={Medal}
              label={copy.stats.bestLabel}
              value={`${stats.bestSac.toFixed(1)} ${copy.common.lmin}`}
              variant="top"
            />

            <View style={styles.triangleLines}>
              <View style={styles.triangleBaseLine} />
              <View style={styles.triangleLeftLine} />
              <View style={styles.triangleRightLine} />
            </View>

          <View style={styles.triangleBottomRow}>
              <TrendMetric
                icon={Timer}
                label={copy.stats.latestLabel}
                value={`${stats.latestSac.toFixed(1)} ${copy.common.lmin}`}
              />

              <TrendMetric
                icon={Gauge}
                label={copy.stats.averageLabel}
                value={`${stats.avgSac.toFixed(1)} ${copy.common.lmin}`}
              />
            </View>
          </View>
        </View>

        <View style={styles.bestMonthCard}>
          <Text style={styles.bestMonthTitle}>{copy.stats.bestMonthTitle}</Text>
          <Text style={styles.bestMonthValue}>{bestMonthLabel}</Text>
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
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#1A2A44',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#60708D',
  },
  filterPanel: {
    marginTop: 22,
    backgroundColor: '#FCFDFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 16,
  },
  filterPanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7D90AE',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  filterModeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EEF4FD',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  filterChipActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },
  filterChipText: {
    color: '#60708D',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C8FAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  selectorRow: {
    gap: 10,
    paddingRight: 12,
  },
  selectorChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F7FAFF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  selectorChipActive: {
    backgroundColor: '#DDEBFF',
    borderColor: '#A9C6F4',
  },
  selectorChipText: {
    color: '#60708D',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  selectorChipTextActive: {
    color: '#1A56DB',
  },
  filterSummaryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterSummaryChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  filterSummaryText: {
    color: '#1A56DB',
    fontSize: 12,
    fontWeight: '800',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFiltersText: {
    color: '#60708D',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#FCFDFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 16,
  },
  statLabel: {
    color: '#7D90AE',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  statValue: {
    color: '#1A2A44',
    fontSize: 22,
    fontWeight: '800',
  },
  chartCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 6,
  },

  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  chartLabelText: {
    flex: 1,
    textAlign: 'center',
    color: '#7D90AE',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  insightCard: {
    marginTop: 16,
    backgroundColor: '#F8FBFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 20,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#60708D',
  },
  trendTriangleWrap: {
    marginTop: 18,
    marginBottom: 2,
    alignItems: 'center',
  },
  triangleTopMetric: {
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0EBF8',
    alignItems: 'center',
    zIndex: 2,
  },
  triangleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF4FD',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  triangleLines: {
    width: 236,
    height: 70,
    marginTop: -2,
    marginBottom: -4,
    position: 'relative',
  },
  triangleBaseLine: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 10,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#C9D9F3',
  },
  triangleLeftLine: {
    position: 'absolute',
    left: 60,
    top: 8,
    width: 2,
    height: 70,
    backgroundColor: '#C9D9F3',
    transform: [{ rotate: '58deg' }],
  },
  triangleRightLine: {
    position: 'absolute',
    right: 60,
    top: 8,
    width: 2,
    height: 70,
    backgroundColor: '#C9D9F3',
    transform: [{ rotate: '-58deg' }],
  },
  triangleBottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  triangleBottomMetric: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  triangleMetricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7D90AE',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  triangleMetricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A56DB',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  insightMetric: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 14,
  },
  insightMetricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D90AE',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  insightMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A56DB',
  },
  bestMonthCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 20,
  },
  bestMonthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7D90AE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bestMonthValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2A44',
    textTransform: 'capitalize',
  },
});
