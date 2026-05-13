import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
  Grid2x2,
  Images,
  Trash2,
} from 'lucide-react-native';
import { AppScreenGradient } from '../../components/AppScreenGradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { DivePhoto, useDiveLogs } from '../../contex/DiveLogsContext';
import { useLanguage } from '../../i18n';

const screenWidth = Dimensions.get('window').width;
const gridGap = 12;
const gridHorizontalPadding = 40;
const gridTileSize = (screenWidth - gridHorizontalPadding - gridGap) / 2;

const resolvePickedImageUri = (asset: Record<string, unknown> | undefined) => {
  if (!asset) {
    return null;
  }

  const rawUri =
    (typeof asset.uri === 'string' && asset.uri) ||
    (typeof asset.originalPath === 'string' && asset.originalPath) ||
    null;

  if (!rawUri) {
    return null;
  }

  if (
    rawUri.startsWith('file://') ||
    rawUri.startsWith('content://') ||
    rawUri.startsWith('ph://')
  ) {
    return rawUri;
  }

  return `file://${rawUri}`;
};

export const DiveGalleryScreen = ({ navigation, route }: any) => {
  const { copy } = useLanguage();
  const { diveLogs, updateDive } = useDiveLogs();
  const diveId = route.params?.diveId;
  const dive = diveLogs.find(item => item.id === diveId);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [photos, setPhotos] = useState<DivePhoto[]>([]);
  const [isGridMode, setIsGridMode] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (!dive) {
      return;
    }

    setPhotos(dive.photos ?? []);
    setIsGridMode(dive.galleryGridMode ?? false);
  }, [dive]);

  useEffect(() => {
    if (!selectedPhotoId) {
      return;
    }

    const exists = photos.some(photo => photo.id === selectedPhotoId);
    if (!exists) {
      setSelectedPhotoId(null);
    }
  }, [photos, selectedPhotoId]);

  const heroTitle = useMemo(() => {
    return dive?.name?.trim() || copy.history.untitled;
  }, [copy.history.untitled, dive?.name]);

  const selectedPhoto = useMemo(
    () => photos.find(photo => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

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

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.6,
      maxWidth: 1800,
      maxHeight: 1800,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode || result.errorMessage) {
      Alert.alert(
        copy.history.galleryPhotoErrorTitle,
        result.errorMessage || copy.history.galleryPhotoErrorBody,
        [{ text: copy.common.ok }],
      );
      return;
    }

    const nextUri = resolvePickedImageUri(result.assets?.[0] as Record<string, unknown> | undefined);
    if (!nextUri) {
      Alert.alert(copy.history.galleryPhotoErrorTitle, copy.history.galleryPhotoErrorBody, [
        { text: copy.common.ok },
      ]);
      return;
    }

    const newPhoto: DivePhoto = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      uri: nextUri,
      note: '',
      createdAt: new Date().toISOString(),
    };

    const nextPhotos = [newPhoto, ...photos];
    setPhotos(nextPhotos);
    await updateDive(dive.id, { photos: nextPhotos });
    setSelectedPhotoId(newPhoto.id);
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(copy.history.galleryDeleteTitle, copy.history.galleryDeleteBody, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.history.galleryDeleteAction,
        style: 'destructive',
        onPress: async () => {
          const nextPhotos = photos.filter(photo => photo.id !== photoId);
          setPhotos(nextPhotos);
          await updateDive(dive.id, { photos: nextPhotos });
        },
      },
    ]);
  };

  const handleChangePhotoNote = (photoId: string, note: string) => {
    setPhotos(currentPhotos =>
      currentPhotos.map(photo =>
        photo.id === photoId ? { ...photo, note } : photo,
      ),
    );
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoId(currentId => (currentId === photoId ? null : photoId));
  };

  const handleToggleGridMode = async () => {
    const nextValue = !isGridMode;
    setIsGridMode(nextValue);
    setSelectedPhotoId(null);
    await updateDive(dive.id, { galleryGridMode: nextValue });
  };

  const handleSaveGallery = async () => {
    await updateDive(dive.id, { photos });
    Alert.alert(copy.history.gallerySavedTitle, copy.history.gallerySavedBody, [
      { text: copy.common.ok, onPress: () => navigation.goBack() },
    ]);
  };

  const renderExpandedPhotoCard = (photo: DivePhoto) => {
    const shouldAutoScroll = isGridMode && selectedPhotoId === photo.id;

    return (
      <View
        key={photo.id}
        style={styles.photoCard}
        onLayout={event => {
          if (!shouldAutoScroll) {
            return;
          }

          scrollViewRef.current?.scrollTo({
            y: Math.max(event.nativeEvent.layout.y - 120, 0),
            animated: true,
          });
        }}
      >
        <View style={styles.photoHeaderRow}>
          <Text style={styles.photoLabel}>{copy.history.galleryPhotoLabel}</Text>
          <TouchableOpacity
            style={styles.removePhotoButton}
            activeOpacity={0.84}
            onPress={() => handleRemovePhoto(photo.id)}
          >
            <Trash2 color="#C91C13" size={15} />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: photo.uri }}
          style={styles.photoImage}
          resizeMode="cover"
        />

        <Text style={styles.noteLabel}>{copy.history.galleryNoteLabel}</Text>
        <TextInput
          style={styles.noteInput}
          value={photo.note}
          onChangeText={note => handleChangePhotoNote(photo.id, note)}
          placeholder={copy.history.galleryNotePlaceholder}
          placeholderTextColor="#9FB0C8"
          multiline
          textAlignVertical="top"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#1A2A44" size={20} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{copy.history.galleryEyebrow}</Text>
          <Text style={styles.title}>{copy.history.galleryTitle}</Text>
      
          <View style={styles.heroFooterRow}>
            <View style={styles.diveNameChip}>
              <Text style={styles.diveNameChipText}>{heroTitle}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.gridToggleButton,
                isGridMode && styles.gridToggleButtonActive,
              ]}
              activeOpacity={0.88}
              onPress={handleToggleGridMode}
            >
              <Grid2x2
                color={isGridMode ? '#FFFFFF' : '#1A56DB'}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addPhotoButton}
          activeOpacity={0.88}
          onPress={handlePickImage}
        >
          <Camera color="#FFFFFF" size={18} />
          <Text style={styles.addPhotoButtonText}>
            {copy.history.galleryAddPhoto}
          </Text>
        </TouchableOpacity>

        {!photos.length ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Images color="#1A56DB" size={24} />
            </View>
            <Text style={styles.emptyTitle}>{copy.history.galleryEmptyTitle}</Text>
            <Text style={styles.emptyDescription}>
              {copy.history.galleryEmptyDescription}
            </Text>
          </View>
        ) : isGridMode ? (
          <>
            <View style={styles.gridWrap}>
              {photos.map(photo => (
                <TouchableOpacity
                  key={photo.id}
                  style={[
                    styles.gridItem,
                    selectedPhotoId === photo.id && styles.gridItemActive,
                  ]}
                  activeOpacity={0.9}
                  onPress={() => togglePhotoSelection(photo.id)}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {selectedPhoto ? renderExpandedPhotoCard(selectedPhoto) : null}
          </>
        ) : (
          photos.map(photo => renderExpandedPhotoCard(photo))
        )}

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.88}
          onPress={handleSaveGallery}
        >
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
  missingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  missingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
  },
  missingDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#60708D',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6690D3',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
  },

  heroFooterRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  diveNameChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    flexShrink: 1,
  },
  diveNameChipText: {
    color: '#1A56DB',
    fontSize: 13,
    fontWeight: '800',
  },
  gridToggleButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridToggleButtonActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A56DB',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 16,
  },
  addPhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    width: gridTileSize,
    height: gridTileSize,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7E4F6',
    backgroundColor: '#FFFFFF',
  },
  gridItemActive: {
    borderColor: '#1A56DB',
    borderWidth: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E9EEF6',
  },
  emptyCard: {
    backgroundColor: '#FCFDFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 24,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2A44',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#60708D',
    textAlign: 'center',
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    padding: 18,
    marginBottom: 14,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6C88B3',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  removePhotoButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#F6D4D2',
  },
  photoImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#E9EEF6',
    marginBottom: 14,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7D90AE',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  noteInput: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E4F6',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#1A2A44',
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#1A56DB',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
