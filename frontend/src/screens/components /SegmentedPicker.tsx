import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

type SegmentOption = {
  label: string;
  value: string;
  iconSource?: ImageSourcePropType;
};

interface Props {
  options: Array<string | SegmentOption>;
  selected: string;
  onSelect: (option: string) => void;
  icon?: LucideIcon;
}

export const SegmentedPicker = ({
  icon: Icon,
  options,
  selected,
  onSelect,
}: Props) => {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const normalizedOption =
          typeof option === 'string' ? { label: option, value: option } : option;

        return (
        <TouchableOpacity
          key={normalizedOption.value}
          style={[
            styles.button,
            selected === normalizedOption.value && styles.activeButton,
          ]}
          onPress={() => onSelect(normalizedOption.value)}
        >
          {normalizedOption.iconSource ? (
            <Image
              source={normalizedOption.iconSource}
              style={styles.optionImage}
              resizeMode="contain"
            />
          ) : null}

          {Icon ? (
            <Icon
              size={16}
              color="#60708D"
              strokeWidth={2.1}
              style={styles.icon}
            />
          ) : null}

          <Text
            style={[
              styles.buttonText,
              selected === normalizedOption.value && styles.activeText,
            ]}
          >
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
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DCE7F5',
  },
  button: {
    flex: 1,
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',

  },
  activeButton: {
    backgroundColor: '#1D67E7',
    elevation: 2,
    shadowColor: '#1D67E7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  buttonText: { color: '#536685', fontSize: 10, fontWeight: '600' },
  activeText: { color: '#FFFFFF', fontWeight: '700' },
  icon: {
    marginRight: 2,
  },
  optionImage: {
    width: 30,
    height: 30,
  },
});
