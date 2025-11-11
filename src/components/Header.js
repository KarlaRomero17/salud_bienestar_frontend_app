// components/Header.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ 
  title, 
  showBackButton = false,
  onBackPress,
  rightComponent,
  style,
  titleStyle,
  userName = "Amigo",
  currentWeight = 75.5,
  targetWeight = 70.0,
  weightUnit = "kg",
  weeklyProgress = -0.8
}) => {
  // Calcular progreso hacia el objetivo
  const progressPercentage = Math.max(0, Math.min(100, 
    ((currentWeight - targetWeight) / (currentWeight - targetWeight + 10)) * 100
  ));

  // Determinar si está perdiendo o ganando peso
  const isLosingWeight = weeklyProgress < 0;
  const progressColor = isLosingWeight ? '#2a8c4a' : '#64c27b';

  // Mensajes motivacionales basados en el progreso
  const getMotivationalMessage = () => {
    if (Math.abs(weeklyProgress) < 0.1) return "¡Mantén la consistencia! 💪";
    if (isLosingWeight) {
      if (weeklyProgress < -1) return "¡Bajada impresionante! 🎉";
      return "¡Vas por buen camino! 👏";
    }
    return "¡Ganando músculo! 💪";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `¡Buenos días, ${userName}! 🌅`;
    if (hour < 18) return `¡Buenas tardes, ${userName}! ☀️`;
    return `¡Buenas noches, ${userName}! 🌙`;
  };

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
      
      <View style={styles.mainContent}>
        {/* Saludo personalizado */}
        <Text style={styles.greeting}>
          {getGreeting()}
        </Text>
        
        {/* Información de peso */}
        {/* <View style={styles.weightContainer}>
          <View style={styles.weightCard}>
            <View style={styles.weightInfo}>
              <Text style={styles.weightLabel}>Peso Actual</Text>
              <Text style={styles.currentWeight}>
                {currentWeight} {weightUnit}
              </Text>
              <View style={styles.progressIndicator}>
                <Icon 
                  name={isLosingWeight ? "trending-down" : "trending-up"} 
                  size={16} 
                  color={progressColor} 
                />
                <Text style={[styles.weeklyProgress, { color: progressColor }]}>
                  {weeklyProgress > 0 ? '+' : ''}{weeklyProgress} {weightUnit}
                </Text>
                <Text style={styles.weeklyLabel}>esta semana</Text>
              </View>
            </View>
            
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Objetivo</Text>
              <Text style={styles.targetWeight}>
                {targetWeight} {weightUnit}
              </Text>
              <Text style={styles.remainingText}>
                {Math.abs(currentWeight - targetWeight).toFixed(1)} {weightUnit} {isLosingWeight ? 'por perder' : 'por ganar'}
              </Text>
            </View>
          </View>
        </View> */}

        {/* Barra de progreso visual */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Inicio: {currentWeight} {weightUnit}</Text>
            <Text style={styles.progressText}>Meta: {targetWeight} {weightUnit}</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor
                }
              ]} 
            />
          </View>
          <Text style={styles.motivationalText}>
            {getMotivationalMessage()}
          </Text>
        </View> */}
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
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 25,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#2a8c4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  leftSection: {
    width: 40,
    marginTop: 4,
  },
  backButton: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 15,
    textAlign: 'center',
  },
  weightContainer: {
    width: '100%',
    marginBottom: 15,
  },
  weightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fff9',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0fdd7',
  },
  weightInfo: {
    alignItems: 'flex-start',
    flex: 1,
  },
  targetInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  weightLabel: {
    fontSize: 12,
    color: '#64c27b',
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 12,
    color: '#64c27b',
    marginBottom: 4,
  },
  currentWeight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 8,
  },
  targetWeight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 8,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyProgress: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    marginRight: 4,
  },
  weeklyLabel: {
    fontSize: 10,
    color: '#64c27b',
  },
  remainingText: {
    fontSize: 10,
    color: '#64c27b',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 10,
    color: '#64c27b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#d0fdd7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  motivationalText: {
    fontSize: 12,
    color: '#2a8c4a',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
    marginTop: 4,
  },
});

export default Header;