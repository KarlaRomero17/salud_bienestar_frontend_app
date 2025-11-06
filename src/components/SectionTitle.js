import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SectionTitle = ({ title, actionText, onActionPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  actionText: {
    color: '#64c27b',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SectionTitle;