// components/Header.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ 
  title, 
  showBackButton = false,
  onBackPress,
  rightComponent,
  style,
  titleStyle 
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBackPress}
          >
            <Icon name="arrow-back" size={24} color="#2a8c4a" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleSection}>
        <Text style={[styles.headerTitle, titleStyle]}>
          {title}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  leftSection: {
    width: 40,
  },
  backButton: {
    padding: 4,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default Header;