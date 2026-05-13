import 'react-native-gesture-handler';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreenGradient } from '../../components/AppScreenGradient';

export const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppScreenGradient />
      <View style={styles.container}>
        <Text style={styles.title}>Diving App</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MainApp')}
        >
          <Text style={styles.buttonText}>Ir a Calculadora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    color: '#173052',
    fontWeight: '800',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1659D5',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 18,
  },
  buttonText: { color: 'white', fontWeight: '700' },
});
 
