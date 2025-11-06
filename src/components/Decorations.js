import React from 'react';
import { View, StyleSheet } from 'react-native';

const Decorations = () => {
  return (
    <>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
    </>
  );
};

const styles = StyleSheet.create({
  circle1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(42, 140, 74, 0.1)',
    zIndex: -1,
  },
  circle2: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(100, 194, 123, 0.1)',
    zIndex: -1,
  },
  circle3: {
    position: 'absolute',
    bottom: '45%',
    left: '5%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(155, 250, 176, 0.05)',
    zIndex: -1,
  },
});

export default Decorations;