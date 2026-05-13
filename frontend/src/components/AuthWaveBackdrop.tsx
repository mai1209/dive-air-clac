import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export const AuthWaveBackdrop = () => {
  const waveOneX = useRef(new Animated.Value(0)).current;
  const waveTwoX = useRef(new Animated.Value(0)).current;
  const waveThreeY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveOneX, {
            toValue: 16,
            duration: 5200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(waveOneX, {
            toValue: -12,
            duration: 5200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveTwoX, {
            toValue: -18,
            duration: 6100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(waveTwoX, {
            toValue: 14,
            duration: 6100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveThreeY, {
            toValue: 12,
            duration: 6800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(waveThreeY, {
            toValue: -10,
            duration: 6800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [waveOneX, waveTwoX, waveThreeY]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <Animated.View
        style={[
          styles.wave,
          styles.waveOne,
          { transform: [{ translateX: waveOneX }, { rotate: '-6deg' }] },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.waveTwo,
          { transform: [{ translateX: waveTwoX }, { rotate: '7deg' }] },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.waveThree,
          { transform: [{ translateY: waveThreeY }, { rotate: '-4deg' }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: -40,
    width: width * 0.9,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(112, 160, 224, 0.12)',
  },
  bottomGlow: {
    position: 'absolute',
    right: -60,
    bottom: -90,
    width: width * 0.8,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(170, 205, 255, 0.10)',
  },
  wave: {
    position: 'absolute',
    left: -80,
    width: width + 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(150, 188, 236, 0.18)',
  },
  waveOne: {
    top: 90,
    height: 120,
  },
  waveTwo: {
    top: 168,
    height: 90,
    opacity: 0.72,
  },
  waveThree: {
    top: 248,
    left: -40,
    width: width + 80,
    height: 70,
    opacity: 0.58,
  },
});
