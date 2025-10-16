// components/Layout.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const Layout = ({ 
  children, 
  title, 
  showHeader = true,
  headerStyle,
  headerTitleStyle,
  backgroundColor = '#ffffff'
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundColor} 
      />
      
      {showHeader && (
        <View style={[styles.header, headerStyle]}>
          <Text style={[styles.headerTitle, headerTitleStyle]}>
            {title}
          </Text>
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a8c4a',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});

export default Layout;