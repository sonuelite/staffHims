
import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import {Search} from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchBarProps) => {
  return (
    <View style={styles.searchBox}>
      <Search size={18} color="#8DA1BE" />

      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#91A3BF"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchBox: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DEE6F0',
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    color: '#172B49',
    fontSize: 13,
    paddingVertical: 0,
    includeFontPadding: false,
  },
});
