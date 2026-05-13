import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const brandLogo = require('../asset/logo.png');

export const AuthHero = () => {
  return (
    <View style={styles.heroPanel}>
      <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.titlelogo}>Dive Air Calc</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heroPanel: {
    marginTop: 18,
    marginHorizontal: 'auto',
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    paddingBottom: 20,
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titlelogo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  logo: {
    width: 200,
    height: 100,
  },
});
