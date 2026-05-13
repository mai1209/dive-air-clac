import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  NotebookPen,
  Waves,
  Gauge,
  Cylinder,
  PencilLine,
} from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { useDiveLogs } from '../../contex/DiveLogsContext';
import { useLanguage } from '../../i18n';

const formatDiveDate = (value: string | null, locale: string) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDiveTime = (value: string | null, locale: string, hour12: boolean) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  });
};

export const DiveDetailScreen = ({ navigation, route }: any) => {
  const { copy, language } = useLanguage();
  const { diveLogs, updateDive } = useDiveLogs();
  const diveId = route.params?.diveId;
  const dive = diveLogs.find(item => item.id === diveId);
  const locale =
    language === 'es' ? 'es-AR' : language === 'pt' ? 'pt-BR' : 'en-US';

  const [name, setName] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [avgDepth, setAvgDepth] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [cylinderVolume, setCylinderVolume] = useState('');
  const [pressureInitial, setPressureInitial] = useState('');
  const [pressureFinal, setPressureFinal] = useState('');
  const [notes, setNotes] = useState('');
  const [isConditionsEditing, setIsConditionsEditing] = useState(false);
  const [isEquipmentEditing, setIsEquipmentEditing] = useState(false);
  const [isPressuresEditing, setIsPressuresEditing] = useState(false);

  useEffect(() => {
    if (!dive) {
      return;
    }

    setName(dive.name);
    setMaxDepth(dive.maxDepth);
    setAvgDepth(dive.avgDepth);
    setWaterTemp(dive.waterTemp);
    setCylinderVolume(dive.cylinderVolume);
    setPressureInitial(dive.pressureInitial);
    setPressureFinal(dive.pressureFinal);
    setNotes(dive.notes);
  }, [dive]);

  const currentLabel = dive
    ? copy.calculator.options[
        dive.current as keyof typeof copy.calculator.options
      ] ?? dive.current
    : '';

  const cylinderLabel = dive
    ? copy.calculator.options[
        dive.cylinderType as keyof typeof copy.calculator.options
      ] ?? dive.cylinderType
    : '';

  if (!dive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppScreenGradient />
        <View style={styles.missingContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#1A2A44" size={20} />
          </TouchableOpacity>
          <Text style={styles.missingTitle}>{copy.history.title}</Text>
          <Text style={styles.missingDescription}>{copy.history.description}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    await updateDive(dive.id, {
      name: name.trim() || copy.history.untitled,
      maxDepth,
      avgDepth,
      waterTemp,
      cylinderVolume,
      pressureInitial,
      pressureFinal,
      notes,
    });

    Alert.alert(copy.history.updateSuccessTitle, copy.history.updateSuccessBody);
    setIsConditionsEditing(false);
    setIsEquipmentEditing(false);
    setIsPressuresEditing(false);
  };

  const renderFieldValue = (
    value: string,
    onChangeText: (text: string) => void,
    editable: boolean,
  ) => {
    if (!editable) {
      return <Text style={styles.readOnlyValue}>{value || '—'}</Text>;
    }

    return (
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#1A2A44" size={20} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{copy.history.detailEyebrow}</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={copy.history.namePlaceholder}
            placeholderTextColor="#9FB0C8"
          />
          <Text style={styles.heroDate}>
            {formatDiveDate(dive.dateIso, locale)} · {formatDiveTime(dive.startTimeIso, locale, language === 'en')} - {formatDiveTime(dive.endTimeIso, locale, language === 'en')}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{copy.result.title}</Text>
              <Text style={styles.metricValue}>{dive.sac} {copy.common.lmin}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{copy.result.diveTime}</Text>
              <Text style={styles.metricValue}>{dive.durationMinutes} {copy.common.min}</Text>
            </View>
          </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{currentLabel}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{cylinderLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Camera color="#5B7BB0" size={18} />
            <Text style={styles.sectionTitle}>{copy.history.galleryShortTitle}</Text>
          </View>
        </View>
      
        <TouchableOpacity
          style={styles.galleryButton}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('DiveGallery', { diveId: dive.id })}
        >
          <Text style={styles.galleryButtonText}>{copy.history.galleryCta}</Text>
        </TouchableOpacity>
      </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Waves color="#5B7BB0" size={18} />
              <Text style={styles.sectionTitle}>{copy.calculator.sections.conditions}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.editChip,
                isConditionsEditing && styles.editChipActive,
              ]}
              activeOpacity={0.88}
              onPress={() => setIsConditionsEditing(current => !current)}
            >
              <PencilLine
                color={isConditionsEditing ? '#FFFFFF' : '#1A56DB'}
                size={14}
              />
              <Text
                style={[
                  styles.editChipText,
                  isConditionsEditing && styles.editChipTextActive,
                ]}
              >
                {copy.common.edit}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{copy.calculator.labels.maxDepth}</Text>
              {renderFieldValue(maxDepth, setMaxDepth, isConditionsEditing)}
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{copy.calculator.labels.avgDepth}</Text>
              {renderFieldValue(avgDepth, setAvgDepth, isConditionsEditing)}
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{copy.calculator.labels.waterTemp}</Text>
              {renderFieldValue(waterTemp, setWaterTemp, isConditionsEditing)}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Cylinder color="#5B7BB0" size={18} />
              <Text style={styles.sectionTitle}>{copy.calculator.sections.equipment}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.editChip,
                isEquipmentEditing && styles.editChipActive,
              ]}
              activeOpacity={0.88}
              onPress={() => setIsEquipmentEditing(current => !current)}
            >
              <PencilLine
                color={isEquipmentEditing ? '#FFFFFF' : '#1A56DB'}
                size={14}
              />
              <Text
                style={[
                  styles.editChipText,
                  isEquipmentEditing && styles.editChipTextActive,
                ]}
              >
                {copy.common.edit}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{copy.calculator.labels.cylinderVolume}</Text>
              {renderFieldValue(
                cylinderVolume,
                setCylinderVolume,
                isEquipmentEditing,
              )}
            </View>
            <View style={styles.fieldReadOnly}>
              <Text style={styles.fieldLabel}>{copy.calculator.labels.cylinderType}</Text>
              <Text style={styles.readOnlyValue}>{cylinderLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Gauge color="#5B7BB0" size={18} />
              <Text style={styles.sectionTitle}>{copy.calculator.sections.pressures}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.editChip,
                isPressuresEditing && styles.editChipActive,
              ]}
              activeOpacity={0.88}
              onPress={() => setIsPressuresEditing(current => !current)}
            >
              <PencilLine
                color={isPressuresEditing ? '#FFFFFF' : '#1A56DB'}
                size={14}
              />
              <Text
                style={[
                  styles.editChipText,
                  isPressuresEditing && styles.editChipTextActive,
                ]}
              >
                {copy.common.edit}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                {copy.calculator.labels.pressureInitial} ({dive.pressureInitialUnit})
              </Text>
              {renderFieldValue(
                pressureInitial,
                setPressureInitial,
                isPressuresEditing,
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                {copy.calculator.labels.pressureFinal} ({dive.pressureFinalUnit})
              </Text>
              {renderFieldValue(
                pressureFinal,
                setPressureFinal,
                isPressuresEditing,
              )}
            </View>
            <View style={styles.fieldReadOnly}>
              <Text style={styles.fieldLabel}>{copy.result.atmAverage}</Text>
              <Text style={styles.readOnlyValue}>{dive.atm} {copy.common.atm}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <NotebookPen color="#5B7BB0" size={18} />
            <Text style={styles.sectionTitle}>{copy.history.notesTitle}</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={copy.history.notesPlaceholder}
            placeholderTextColor="#9FB0C8"
            multiline
            textAlignVertical="top"
          />
          {!notes.trim() ? (
            <Text style={styles.emptyNotesText}>{copy.history.emptyNotes}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{copy.common.save}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    shadowColor: '#7EA5D8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 5,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  nameInput: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#1A2A44',
    paddingVertical: 0,
  },
  heroDate: {
    marginTop: 10,
    fontSize: 14,
    color: '#60708D',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8495B3',
    fontWeight: '700',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    color: '#1A56DB',
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#ECF4FF',
    borderWidth: 1,
    borderColor: '#D9E7FB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#496A97',
  },

  galleryButton: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#EEF4FD',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  galleryButtonText: {
    color: '#1A56DB',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2A44',
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EEF4FD',
    borderWidth: 1,
    borderColor: '#D7E4F6',
  },
  editChipActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },
  editChipText: {
    color: '#1A56DB',
    fontSize: 12,
    fontWeight: '700',
  },
  editChipTextActive: {
    color: '#FFFFFF',
  },
  fieldGrid: {
    gap: 12,
  },
  field: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 14,
  },
  fieldReadOnly: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D90AE',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  fieldInput: {
    fontSize: 18,
    color: '#1A2A44',
    fontWeight: '700',
    paddingVertical: 0,
  },
  readOnlyValue: {
    fontSize: 18,
    color: '#1A2A44',
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 140,
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0EBF8',
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#1A2A44',
  },
  emptyNotesText: {
    marginTop: 10,
    fontSize: 13,
    color: '#8B9AB2',
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
  missingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  missingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2A44',
    marginBottom: 10,
  },
  missingDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#60708D',
  },
});
