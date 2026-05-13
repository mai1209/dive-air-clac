import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type SegmentOption = {
  label: string;
  value: string;
};

interface SegmentedControlProps {
  options: Array<string | SegmentOption>;
  selectedOption: string;
  onSelect: (option: string) => void;
}

export const SegmentedControl = ({ options, selectedOption, onSelect }: SegmentedControlProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const normalizedOption =
          typeof option === 'string' ? { label: option, value: option } : option;

        return (
        <TouchableOpacity
          key={normalizedOption.value}
          style={[
            styles.button,
            selectedOption === normalizedOption.value && styles.activeButton
          ]}
          onPress={() => onSelect(normalizedOption.value)}
        >
          <Text style={[
            styles.buttonText,
            selectedOption === normalizedOption.value && styles.activeButtonText
          ]}>
            {normalizedOption.label}
          </Text>
        </TouchableOpacity>
      )})}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EEF3FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE7F5',
    marginBottom:10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeButton: {
    backgroundColor: '#1D67E7',
    shadowColor: '#1D67E7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 2,
  },
  buttonText: { fontSize: 13, color: '#536685', fontWeight: '600' },
  activeButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
