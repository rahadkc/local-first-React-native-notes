import type React from 'react';
import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

interface MultilineTextInputProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const MultilineTextInput: React.FC<MultilineTextInputProps> = ({
  placeholder = 'Enter your note...',
  value,
  onChangeText,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#55555"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
