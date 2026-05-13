import React, { useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import {
  CalendarDays,
  Clock3,
  Clock4,
  MoveDown,
  Thermometer,
  Waves,
  Cylinder,
  CircleGauge,
} from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { useDiveLogs } from '../../contex/DiveLogsContext';
import { useLanguage } from '../../i18n';
import { InfoCard } from '../components /InfoCard';
import { InputRow } from '../components /InputRow';
import { SegmentedControl } from '../components /SegmentControl';
import { SegmentedPicker } from '../components /SegmentedPicker';
import { ResultCard } from '../components /ResultCard';

const noCurrentIcon = require('../../asset/iconbajo.png');
const moderateCurrentIcon = require('../../asset/iconmoderado.png');
const strongCurrentIcon = require('../../asset/iconfuerte.png');
const veryStrongCurrentIcon = require('../../asset/iconmuyfuerte.png');

const condiciones = require('../../asset/condiciones.png');
const general = require('../../asset/informacion.png');
const corrienteIcon = require('../../asset/corriente.png');
const tubo = require('../../asset/tubo.png');
const presion = require('../../asset/presion.png');

type CalculationResult = {
  sac: string;
  atm: string;
  tiempo: number;
};

const buildDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const CalculatorScreen = ({ navigation }: any) => {
  const { copy, language } = useLanguage();
  const { saveDive } = useDiveLogs();
  const [resultado, setResultado] = useState<CalculationResult | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [diveName, setDiveName] = useState('');
  const [saveDate, setSaveDate] = useState(new Date());
  const [showSaveDatePicker, setShowSaveDatePicker] = useState(false);

  const [maxDepth, setMaxDepth] = useState('');
  const [avgDepth, setAvgDepth] = useState('');
  const [temp, setTemp] = useState('');
  const [cilindro, setCilindro] = useState('aluminum');
  const [volumen, setVolumen] = useState('');
  const [corriente, setCorriente] = useState('moderate');
  const [presionInicial, setPresionInicial] = useState('');
  const [unidadInicial, setUnidadInicial] = useState('bar');
  const [presionFinal, setPresionFinal] = useState('');
  const [unidadFinal, setUnidadFinal] = useState('bar');
  const [fecha, setFecha] = useState<Date | null>(null);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFin, setHoraFin] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [currentEditing, setCurrentEditing] = useState<
    'fecha' | 'inicio' | 'fin'
  >('fecha');
  const [pickerValue, setPickerValue] = useState(new Date());
  const locale =
    language === 'es' ? 'es-AR' : language === 'pt' ? 'pt-BR' : 'en-US';
  const getDiveDurationMinutes = (start: Date | null, end: Date | null) => {
    if (!start || !end) {
      return 0;
    }

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const difference = endMinutes - startMinutes;

    return difference >= 0 ? difference : difference + 1440;
  };

  const formattedFecha = useMemo(
    () =>
      fecha
        ? fecha.toLocaleDateString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '',
    [fecha, locale],
  );

  const formatTime = (value: Date | null) =>
    value
      ? value.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: language === 'en',
        })
      : '';

  const horaInicioValue = formatTime(horaInicio);
  const horaFinValue = formatTime(horaFin);
  const duracionMinutos = useMemo(
    () => getDiveDurationMinutes(horaInicio, horaFin),
    [horaInicio, horaFin],
  );
  const duracion = duracionMinutos.toString();
  const saveDateLabel = saveDate.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const getPickerValue = (type: 'fecha' | 'inicio' | 'fin') => {
    if (type === 'fecha') {
      return fecha ?? new Date();
    }

    if (type === 'inicio') {
      return horaInicio ?? new Date();
    }

    return horaFin ?? new Date();
  };

  const openPicker = (
    type: 'fecha' | 'inicio' | 'fin',
    pickerMode: 'date' | 'time',
  ) => {
    setCurrentEditing(type);
    setMode(pickerMode);
    setPickerValue(getPickerValue(type));
    setShowPicker(true);
  };

  const applyPickerSelection = (selectedDate: Date) => {
    setPickerValue(selectedDate);

    if (currentEditing === 'fecha') {
      setFecha(selectedDate);
    } else if (currentEditing === 'inicio') {
      setHoraInicio(selectedDate);
    } else if (currentEditing === 'fin') {
      setHoraFin(selectedDate);
    }
  };

  const onValueChange = (_event: unknown, selectedDate: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    applyPickerSelection(selectedDate);
  };

  const closePicker = () => {
    if (Platform.OS === 'ios') {
      applyPickerSelection(pickerValue);
    }

    setShowPicker(false);
  };
  const handleDismiss = () => setShowPicker(false);

  const handleVolumeChange = (value: string) => {
    const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    const sanitized =
      parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;

    if (!sanitized) {
      setVolumen('');
      return;
    }

    const numericValue = Number(sanitized);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    setVolumen(numericValue > 18 ? '18' : sanitized);
  };

  const convertPressureToBar = (value: number, unit: string) => {
    return unit === 'psi' ? value / 14.5038 : value;
  };

  const calcularTodo = () => {
    const pIniRaw = parseFloat(presionInicial);
    const pFinRaw = parseFloat(presionFinal);
    const vol = parseFloat(volumen);
    const pProm = parseFloat(avgDepth);
    const tMin = parseInt(duracion, 10);
    const pIni = convertPressureToBar(pIniRaw, unidadInicial);
    const pFin = convertPressureToBar(pFinRaw, unidadFinal);

    if (
      !Number.isFinite(pIniRaw) ||
      !Number.isFinite(pFinRaw) ||
      !Number.isFinite(vol) ||
      !Number.isFinite(pProm) ||
      !Number.isFinite(tMin) ||
      tMin <= 0
    ) {
      Alert.alert(
        copy.calculator.alerts.incompleteTitle,
        copy.calculator.alerts.incompleteBody,
        [{ text: copy.common.ok }],
      );
      return;
    }

    if (vol < 8 || vol > 18) {
      Alert.alert(
        copy.calculator.alerts.invalidVolumeTitle,
        copy.calculator.alerts.invalidVolumeBody,
        [{ text: copy.common.ok }],
      );
      return;
    }

    if (pIni <= pFin) {
      Alert.alert(
        copy.calculator.alerts.invalidPressureTitle,
        copy.calculator.alerts.invalidPressureBody,
        [{ text: copy.common.ok }],
      );
      return;
    }

    const atmProm = pProm / 10 + 1;
    const consumoTotal = (pIni - pFin) * vol;
    const sac = consumoTotal / (atmProm * tMin);

    setResultado({
      sac: sac.toFixed(1).replace('.', ','),
      atm: atmProm.toFixed(2),
      tiempo: tMin,
    });

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  };

  const openSaveModal = () => {
    setDiveName('');
    setSaveDate(fecha ?? new Date());
    setShowSaveDatePicker(false);
    setShowSaveModal(true);
  };

  const handleSaveDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowSaveDatePicker(false);
    }

    if (selectedDate) {
      setSaveDate(selectedDate);
    }
  };

  const handleSaveDive = async () => {
    if (!resultado) {
      return;
    }

    await saveDive({
      name: diveName.trim() || copy.history.untitled,
      notes: '',
      dateKey: buildDateKey(saveDate),
      dateIso: saveDate.toISOString(),
      startTimeIso: horaInicio ? horaInicio.toISOString() : null,
      endTimeIso: horaFin ? horaFin.toISOString() : null,
      durationMinutes: duracionMinutos,
      maxDepth,
      avgDepth,
      waterTemp: temp,
      cylinderType: cilindro,
      cylinderVolume: volumen,
      current: corriente,
      pressureInitial: presionInicial,
      pressureInitialUnit: unidadInicial,
      pressureFinal: presionFinal,
      pressureFinalUnit: unidadFinal,
      sac: resultado.sac,
      atm: resultado.atm,
    });

    setShowSaveModal(false);
    navigation.navigate('HistorialTab');
    Alert.alert(copy.history.saveSuccessTitle, copy.history.saveSuccessBody);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.screen}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={[
              styles.contentContainer,
              showPicker &&
                Platform.OS === 'ios' &&
                styles.contentContainerWithPicker,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>
                {copy.calculator.headerEyebrow}
              </Text>
            </View>

            <InfoCard
              title={copy.calculator.sections.general}
              titleIcon={
                <Image
                  source={general}
                  style={styles.currentHeaderIcon}
                  resizeMode="contain"
                />
              }
            >
              <InputRow
                icon={CalendarDays}
                label={copy.calculator.labels.date}
                value={formattedFecha}
                placeholder={copy.calculator.placeholders.date}
                isEditable={false}
                onPress={() => openPicker('fecha', 'date')}
              />
              <InputRow
                icon={Clock3}
                label={copy.calculator.labels.startTime}
                value={horaInicioValue}
                placeholder={copy.calculator.placeholders.time}
                isEditable={false}
                onPress={() => openPicker('inicio', 'time')}
              />
              <InputRow
                icon={Clock4}
                label={copy.calculator.labels.endTime}
                value={horaFinValue}
                placeholder={copy.calculator.placeholders.time}
                isEditable={false}
                onPress={() => openPicker('fin', 'time')}
              />
              <InputRow
                icon={Clock4}
                label={copy.calculator.labels.duration}
                value={
                  parseInt(duracion, 10) >= 60
                    ? `${Math.floor(parseInt(duracion, 10) / 60)
                        .toString()
                        .padStart(2, '0')}:${(parseInt(duracion, 10) % 60)
                        .toString()
                        .padStart(2, '0')}`
                    : duracion !== '0'
                    ? `${duracion}`
                    : ''
                }
                placeholder={copy.calculator.placeholders.integer}
                unit={
                  parseInt(duracion, 10) < 60 && duracion !== '0'
                    ? copy.common.min
                    : ''
                }
                isEditable={false}
              />
            </InfoCard>

            <InfoCard
              title={copy.calculator.sections.conditions}
              titleIcon={
                <Image
                  source={condiciones}
                  style={styles.currentHeaderIcon}
                  resizeMode="contain"
                />
              }
            >
              <InputRow
                icon={MoveDown}
                label={copy.calculator.labels.maxDepth}
                value={maxDepth}
                onChangeText={text => setMaxDepth(text)}
                isEditable={true}
                unit="m"
                placeholder={copy.calculator.placeholders.decimal}
              />
              <InputRow
                icon={Waves}
                label={copy.calculator.labels.avgDepth}
                value={avgDepth}
                onChangeText={text => setAvgDepth(text)}
                isEditable={true}
                unit="m"
                placeholder={copy.calculator.placeholders.decimal}
              />
              <InputRow
                icon={Thermometer}
                label={copy.calculator.labels.waterTemp}
                value={temp}
                onChangeText={text => setTemp(text)}
                isEditable={true}
                unit="°C"
                placeholder={copy.calculator.placeholders.integer}
              />
            </InfoCard>

            <InfoCard
              title={copy.calculator.sections.current}
                titleIcon={
                <Image
                  source={corrienteIcon}
                  style={styles.currentHeaderIcon}
                  resizeMode="contain"
                />
              }
            >
              <SegmentedPicker
                options={[
                  {
                    label: copy.calculator.options.noCurrent,
                    value: 'noCurrent',
                    iconSource: noCurrentIcon,
                  },
                  {
                    label: copy.calculator.options.moderate,
                    value: 'moderate',
                    iconSource: moderateCurrentIcon,
                  },
                  {
                    label: copy.calculator.options.strong,
                    value: 'strong',
                    iconSource: strongCurrentIcon,
                  },
                  {
                    label: copy.calculator.options.veryStrong,
                    value: 'veryStrong',
                    iconSource: veryStrongCurrentIcon,
                  },
                ]}
                selected={corriente}
                onSelect={setCorriente}
              />
            </InfoCard>

            <InfoCard title={copy.calculator.sections.equipment}
              titleIcon={
                <Image
                  source={tubo}
                  style={styles.currentHeaderIcon}
                  resizeMode="contain"
                />
              } 
            >
              <Text style={styles.subLabel}>
                {copy.calculator.labels.cylinderType}
              </Text>
              <SegmentedControl
                options={[
                  {
                    label: copy.calculator.options.aluminum,
                    value: 'aluminum',
                  },
                  {
                    label: copy.calculator.options.steel,
                    value: 'steel',
                  },
                ]}
                selectedOption={cilindro}
                onSelect={setCilindro}
              />
              <InputRow
                icon={Cylinder}
                label={copy.calculator.labels.cylinderVolume}
                value={volumen}
                onChangeText={handleVolumeChange}
                unit="L"
                placeholder={copy.calculator.placeholders.integer}
              />
              <Text style={styles.helperText}>
                {copy.calculator.helpers.volumeRange}
              </Text>
            </InfoCard>

            <InfoCard title={copy.calculator.sections.pressures}
              titleIcon={
                <Image
                  source={presion}
                  style={styles.currentHeaderIcon}
                  resizeMode="contain"
                />
              } 
            
            >
              <View style={styles.pressureRow}>
                <View style={styles.pressureInputWrapper}>
                  <InputRow
                    icon={CircleGauge}
                    label={copy.calculator.labels.pressureInitial}
                    value={presionInicial}
                    onChangeText={setPresionInicial}
                    isEditable={true}
                    placeholder={copy.calculator.placeholders.integer}
                  />
                </View>
                <View style={styles.unitPickerContainer}>
                  <SegmentedPicker
                    options={[
                      copy.calculator.options.bar,
                      copy.calculator.options.psi,
                    ]}
                    selected={unidadInicial}
                    onSelect={setUnidadInicial}
                  />
                </View>
              </View>

              <View style={styles.pressureSpacer} />

              <View style={styles.pressureRow}>
                <View style={styles.pressureInputWrapper}>
                  <InputRow
                    icon={CircleGauge}
                    label={copy.calculator.labels.pressureFinal}
                    value={presionFinal}
                    onChangeText={setPresionFinal}
                    isEditable={true}
                    placeholder={copy.calculator.placeholders.integer}
                  />
                </View>
                <View style={styles.unitPickerContainer}>
                  <SegmentedPicker
                    options={[
                      copy.calculator.options.bar,
                      copy.calculator.options.psi,
                    ]}
                    selected={unidadFinal}
                    onSelect={setUnidadFinal}
                  />
                </View>
              </View>
            </InfoCard>

            <TouchableOpacity style={styles.btnCalcular} onPress={calcularTodo}>
              <Text style={styles.btnText}>{copy.common.calculate}</Text>
            </TouchableOpacity>

            {resultado && (
              <ResultCard
                sac={resultado.sac}
                atm={resultado.atm}
                tiempo={resultado.tiempo}
              />
            )}

            {resultado && (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.btnSecondary]}
                  onPress={() => setResultado(null)}
                >
                  <Text style={styles.btnTextSecondary}>
                    {copy.common.close}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.btnPrimary]}
                  onPress={openSaveModal}
                >
                  <Text style={styles.btnTextPrimary}>{copy.common.save}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {showPicker && (
            <View style={styles.pickerContainer}>
              {Platform.OS === 'ios' && (
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={closePicker}>
                    <Text style={styles.doneText}>{copy.common.save}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <DateTimePicker
                value={pickerValue}
                mode={mode}
                is24Hour={language !== 'en'}
                display={
                  Platform.OS === 'ios'
                    ? mode === 'date'
                      ? 'inline'
                      : 'spinner'
                    : 'default'
                }
                onValueChange={onValueChange}
                onDismiss={handleDismiss}
                textColor="black"
                themeVariant="light"
                style={mode === 'date' ? styles.datePicker : styles.timePicker}
              />
            </View>
          )}

          <Modal
            visible={showSaveModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSaveModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardWrap}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    {copy.history.savePromptTitle}
                  </Text>

                  <View style={styles.modalFormRow}>
                    <TextInput
                      style={styles.modalInput}
                      value={diveName}
                      onChangeText={setDiveName}
                      placeholder={copy.history.nameInputPlaceholder}
                      placeholderTextColor="#B7C3D8"
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.dateChip}
                      activeOpacity={0.85}
                      onPress={() => setShowSaveDatePicker(current => !current)}
                    >
                      <CalendarDays color="#1A56DB" size={18} />
                      <View style={styles.dateChipTextWrap}>
                        <Text style={styles.dateChipLabel}>
                          {copy.calculator.labels.date}
                        </Text>
                        <Text style={styles.dateChipValue}>
                          {saveDateLabel}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {showSaveDatePicker ? (
                    <View style={styles.saveDatePickerWrap}>
                      {Platform.OS === 'ios' ? (
                        <>
                          <View style={styles.saveDatePickerHeader}>
                            <TouchableOpacity
                              onPress={() => setShowSaveDatePicker(false)}
                            >
                              <Text style={styles.saveDatePickerDone}>
                                {copy.common.save}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={saveDate}
                            mode="date"
                            display="inline"
                            onChange={(_event, selectedDate) => {
                              if (selectedDate) {
                                setSaveDate(selectedDate);
                              }
                            }}
                            textColor="black"
                            themeVariant="light"
                            style={styles.saveDatePicker}
                          />
                        </>
                      ) : (
                        <DateTimePicker
                          value={saveDate}
                          mode="date"
                          display="default"
                          onChange={handleSaveDateChange}
                        />
                      )}
                    </View>
                  ) : null}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalSecondaryButton]}
                      onPress={() => setShowSaveModal(false)}
                    >
                      <Text style={styles.modalSecondaryText}>
                        {copy.common.cancel}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalPrimaryButton]}
                      onPress={handleSaveDive}
                    >
                      <Text style={styles.modalPrimaryText}>
                        {copy.common.save}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  keyboardContainer: { flex: 1 },
  screen: { flex: 1 },
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 118,
  },
  contentContainerWithPicker: {
    paddingBottom: 300,
  },
  header: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  subLabel: {
    fontSize: 14,
    color: '#60708D',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: '#8495B3',
    textAlign: 'left',
  },
  currentHeaderIcon: {
    width: 20,
    height: 20,
  },

  pressureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressureInputWrapper: {
    flex: 1,
  },
  pressureSpacer: {
    height: 15,
  },
  unitPickerContainer: {
    width: 120,
    marginLeft: 10,
    marginTop: -8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    width: '100%',
    bottom: 40,
    position: 'absolute',
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: '#E2EBF7',
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    width: '100%',
    minHeight: 340,
    backgroundColor: '#FFFFFF',
  },
  timePicker: {
    width: '100%',
    height: 216,
    backgroundColor: '#FFFFFF',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#F8FAFF',
  },
  doneText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnCalcular: {
    backgroundColor: '#1A56DB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 40,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 40,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#1A56DB',
  },
  btnSecondary: {
    backgroundColor: '#E2EBF7',
  },
  btnTextPrimary: {
    color: 'white',
    fontWeight: '700',
  },
  btnTextSecondary: {
    color: '#1A56DB',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 27, 48, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modalKeyboardWrap: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FCFDFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2A44',
    marginBottom: 10,
  },

  modalInput: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 12,
    color: '#1A2A44',
    fontWeight: '600',
  },
  modalFormRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  dateChip: {
    width: 126,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateChipTextWrap: {
    flex: 1,
  },
  dateChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7C8FAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  dateChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A2A44',
  },
  saveDatePickerWrap: {
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    backgroundColor: '#FFFFFF',
  },
  saveDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEF9',
  },
  saveDatePickerDone: {
    color: '#1A56DB',
    fontSize: 15,
    fontWeight: '700',
  },
  saveDatePicker: {
    width: '100%',
    minHeight: 320,
    backgroundColor: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: '#EEF4FD',
  },
  modalPrimaryButton: {
    backgroundColor: '#1A56DB',
  },
  modalSecondaryText: {
    color: '#60708D',
    fontSize: 15,
    fontWeight: '700',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
