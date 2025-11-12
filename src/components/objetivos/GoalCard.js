// components/GoalCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GoalCard = ({ 
  goal, 
  goalTypes, 
  onEdit, 
  onDelete, 
  onComplete,
  currentWeight, // ← NUEVO: Recibe el peso actual
  calculateProgress // ← NUEVO: Recibe la función de cálculo
}) => {
  // Calcular el progreso automáticamente
  const calculatedProgress = calculateProgress ? calculateProgress(goal, currentWeight) : goal.progress;
  const progress = goal.completed ? 100 : calculatedProgress;

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!goal.targetDate) return null;
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const days = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining();

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 75) return '#8bc34a';
    if (progress >= 50) return '#ffc107';
    if (progress >= 25) return '#ff9800';
    return '#f44336';
  };

  // Calcular información de progreso detallada
  const getProgressDetails = () => {
    if (!currentWeight || !goal.initialWeight || !goal.targetWeight) return null;
    
    const initial = goal.initialWeight;
    const current = currentWeight;
    const target = goal.targetWeight;
    
    if (goal.type === 'loss') {
      const lost = initial - current;
      const totalToLose = initial - target;
      const remaining = Math.max(0, current - target);
      
      return {
        achieved: Math.max(0, lost),
        remaining: remaining,
        unit: goal.unit
      };
    } else {
      const gained = current - initial;
      const totalToGain = target - initial;
      const remaining = Math.max(0, target - current);
      
      return {
        achieved: Math.max(0, gained),
        remaining: remaining,
        unit: goal.unit
      };
    }
  };

  const progressDetails = getProgressDetails();

  return (
    <View style={[
      styles.goalCard,
      goal.completed && styles.completedGoalCard
    ]}>
      <View style={styles.goalHeader}>
        <View style={[
          styles.goalIcon,
          goal.completed && styles.completedGoalIcon
        ]}>
          <Icon
            name={goal.completed ? 'check-circle' : (goalTypes.find(type => type.id === goal.type)?.icon || 'flag')}
            size={24}
            color={goal.completed ? '#ffffff' : '#2a8c4a'}
          />
        </View>
        <View style={styles.goalInfo}>
          <Text style={[
            styles.goalTitle,
            goal.completed && styles.completedGoalTitle
          ]}>
            {goal.title}
            {goal.completed && (
              <Text style={styles.completedBadge}> ✓ Completado</Text>
            )}
          </Text>
          <Text style={[
            styles.goalTarget,
            goal.completed && styles.completedGoalTarget
          ]}>
            {goal.type === 'gain' ? 'Aumentar' : 'Reducir'} a {goal.targetWeight} {goal.unit}
          </Text>
          <Text style={styles.goalDate}>
            Para: {formatDisplayDate(goal.targetDate)}
            {daysRemaining !== null && !goal.completed && (
              <Text style={[
                styles.daysRemaining,
                daysRemaining <= 7 && styles.daysWarning,
                daysRemaining < 0 && styles.daysOverdue
              ]}>
                {daysRemaining > 0 ? ` (${daysRemaining} días)` : ' ¡Vencido!'}
              </Text>
            )}
          </Text>
          
          {/* Información de progreso detallada */}
          {progressDetails && !goal.completed && (
            <View style={styles.progressDetails}>
              <Text style={styles.progressDetailText}>
                {goal.type === 'loss' ? 'Perdido' : 'Ganado'}: {progressDetails.achieved.toFixed(1)} {goal.unit}
              </Text>
              <Text style={styles.progressDetailText}>
                Restante: {progressDetails.remaining.toFixed(1)} {goal.unit}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          {!goal.completed && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onComplete(goal._id)}>
              <Icon name="check-circle" size={24} color="#2a8c4a" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(goal)}>
            <Icon name="edit" size={20} color="#756bff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(goal._id)}>
            <Icon name="delete" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${progress}%`,
                backgroundColor: getProgressColor(progress)
              }
            ]}
          />
        </View>
        <Text style={[
          styles.progressText,
          { color: getProgressColor(progress) }
        ]}>
          {progress.toFixed(1)}%
        </Text>
      </View>

      {/* Información de pesos */}
      <View style={styles.weightInfo}>
        <Text style={styles.weightText}>
          Inicial: {goal.initialWeight || currentWeight || 'N/A'} {goal.unit}
        </Text>
        <Text style={styles.weightText}>
          Actual: {currentWeight || 'No registrado'} {goal.unit}
        </Text>
        <Text style={styles.weightText}>
          Objetivo: {goal.targetWeight} {goal.unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: '#d0fdd7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  completedGoalCard: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9bfab0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  completedGoalIcon: {
    backgroundColor: '#4caf50',
  },
  goalInfo: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 5,
  },
  completedGoalTitle: {
    color: '#4caf50',
  },
  completedBadge: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
  goalTarget: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  completedGoalTarget: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  goalDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  daysRemaining: {
    fontWeight: '600',
    color: '#2a8c4a',
  },
  daysWarning: {
    color: '#ff9800',
  },
  daysOverdue: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressDetailText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  weightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  weightText: {
    fontSize: 11,
    color: '#666',
  },
  completeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  editButton: {
    padding: 8,
    marginLeft: 5,
  },
});

export default GoalCard;