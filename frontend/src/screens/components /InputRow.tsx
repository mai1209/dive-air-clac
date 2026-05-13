import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

// DEFINICIÓN DE LA INTERFACE
export interface InputRowProps {
  icon?: LucideIcon;
  label: string;
  value: string;
  onChangeText?: (text: string) => void; 
  placeholder?: string;
  unit?: string;
  isEditable?: boolean;                
  onPress?: () => void;                
}

export const InputRow = ({ 
  icon: Icon,
  label, 
  value, 
  onChangeText, 
  placeholder, 
  unit, 
  isEditable = true, 
  onPress 
}: InputRowProps) => {
  const inputRef = useRef<TextInput | null>(null);
  const focusInput = () => inputRef.current?.focus();

  if (!isEditable) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.82}>

        <View style={styles.headerRow}>
          {Icon ? <Icon size={16} color="#60708D" strokeWidth={2.1} style={styles.icon} /> : null}
          <Text style={styles.label}>{label}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, !value && styles.placeholderValue]}>
            {value || placeholder}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={focusInput}
    >
      <View style={styles.headerRow}>
        {Icon ? <Icon size={16} color="#60708D" strokeWidth={2.1} style={styles.icon} /> : null}
        <Text style={styles.label}>{label}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      <View style={styles.valueRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numeric"
          placeholderTextColor="#C7C7CC"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2EBF7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    
  },
  headerRow: {
    flexDirection: 'row',
    gap:5,
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 2,
  },
  label: { fontSize: 13, color: '#60708D', fontWeight: '500' },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  valueText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  placeholderValue: {
    color: '#B7C3D8',
    fontWeight: '600',
  },
  unit: {
    fontSize: 15,
    color: '#8EA0BE',
   
   
  },
});
