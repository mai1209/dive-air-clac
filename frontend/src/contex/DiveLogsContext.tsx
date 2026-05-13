import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dive-logs';

const normalizeDateKey = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export type DivePhoto = {
  id: string;
  uri: string;
  note: string;
  createdAt: string;
};

export type DiveLog = {
  id: string;
  name: string;
  notes: string;
  photos: DivePhoto[];
  galleryGridMode: boolean;
  savedAt: string;
  dateKey: string | null;
  dateIso: string | null;
  startTimeIso: string | null;
  endTimeIso: string | null;
  durationMinutes: number;
  maxDepth: string;
  avgDepth: string;
  waterTemp: string;
  cylinderType: string;
  cylinderVolume: string;
  current: string;
  pressureInitial: string;
  pressureInitialUnit: string;
  pressureFinal: string;
  pressureFinalUnit: string;
  sac: string;
  atm: string;
};

type DiveLogInput = Omit<
  DiveLog,
  'id' | 'savedAt' | 'photos' | 'galleryGridMode'
> & {
  photos?: DivePhoto[];
  galleryGridMode?: boolean;
};

type DiveLogsContextType = {
  diveLogs: DiveLog[];
  loading: boolean;
  saveDive: (input: DiveLogInput) => Promise<string>;
  updateDive: (id: string, updates: Partial<Omit<DiveLog, 'id' | 'savedAt'>>) => Promise<void>;
  deleteDive: (id: string) => Promise<void>;
};

const DiveLogsContext = createContext<DiveLogsContextType | null>(null);

export const DiveLogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [diveLogs, setDiveLogs] = useState<DiveLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiveLogs = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
          setLoading(false);
          return;
        }

        const parsedLogs = JSON.parse(storedValue) as Array<Partial<DiveLog>>;
        let hasMigratedLogs = false;
        const nextDiveLogs = parsedLogs.map(log => {
          const normalizedDateKey =
            normalizeDateKey(log.dateKey) ??
            normalizeDateKey(log.dateIso) ??
            normalizeDateKey(log.savedAt);

          const nextLog: DiveLog = {
            ...log,
            id:
              log.id ||
              `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: log.name || '',
            notes: log.notes || '',
            photos: Array.isArray(log.photos) ? log.photos : [],
            galleryGridMode: log.galleryGridMode ?? false,
            savedAt: log.savedAt || new Date().toISOString(),
            dateKey: normalizedDateKey,
            dateIso: log.dateIso ?? null,
            startTimeIso: log.startTimeIso ?? null,
            endTimeIso: log.endTimeIso ?? null,
            durationMinutes: log.durationMinutes ?? 0,
            maxDepth: log.maxDepth || '',
            avgDepth: log.avgDepth || '',
            waterTemp: log.waterTemp || '',
            cylinderType: log.cylinderType || '',
            cylinderVolume: log.cylinderVolume || '',
            current: log.current || '',
            pressureInitial: log.pressureInitial || '',
            pressureInitialUnit: log.pressureInitialUnit || '',
            pressureFinal: log.pressureFinal || '',
            pressureFinalUnit: log.pressureFinalUnit || '',
            sac: log.sac || '',
            atm: log.atm || '',
          };

          if (
            log.dateKey !== nextLog.dateKey ||
            log.galleryGridMode !== nextLog.galleryGridMode ||
            !Array.isArray(log.photos)
          ) {
            hasMigratedLogs = true;
          }

          return nextLog;
        });

        setDiveLogs(nextDiveLogs);

        if (hasMigratedLogs) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextDiveLogs));
        }
      } catch {
        setDiveLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadDiveLogs();
  }, []);

  const persistDiveLogs = async (nextDiveLogs: DiveLog[]) => {
    setDiveLogs(nextDiveLogs);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextDiveLogs));
  };

  const saveDive = async (input: DiveLogInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newDive: DiveLog = {
      ...input,
      photos: input.photos ?? [],
      galleryGridMode: input.galleryGridMode ?? false,
      id,
      savedAt: new Date().toISOString(),
      dateKey:
        normalizeDateKey(input.dateKey) ??
        normalizeDateKey(input.dateIso) ??
        normalizeDateKey(new Date().toISOString()),
    };

    const nextDiveLogs = [newDive, ...diveLogs].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );

    await persistDiveLogs(nextDiveLogs);

    return id;
  };

  const updateDive = async (
    id: string,
    updates: Partial<Omit<DiveLog, 'id' | 'savedAt'>>,
  ) => {
    const nextDiveLogs = diveLogs.map(dive =>
      dive.id === id
        ? {
            ...dive,
            ...updates,
            dateKey:
              normalizeDateKey(updates.dateKey) ??
              normalizeDateKey(updates.dateIso) ??
              dive.dateKey,
          }
        : dive,
    );

    await persistDiveLogs(nextDiveLogs);
  };

  const deleteDive = async (id: string) => {
    const nextDiveLogs = diveLogs.filter(dive => dive.id !== id);
    await persistDiveLogs(nextDiveLogs);
  };

  const value = {
    diveLogs,
    loading,
    saveDive,
    updateDive,
    deleteDive,
  };

  return (
    <DiveLogsContext.Provider value={value}>
      {children}
    </DiveLogsContext.Provider>
  );
};

export const useDiveLogs = () => {
  const context = useContext(DiveLogsContext);

  if (!context) {
    throw new Error('useDiveLogs must be used within DiveLogsProvider');
  }

  return context;
};
