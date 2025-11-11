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
  onUpdateProgress 
}) => {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 75) return '#8bc34a';
    if (progress >= 50) return '#ffc107';
    if (progress >= 25) return '#ff9800';
    return '#f44336';
  };

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
            {goal.type === 'gain' ? 'Aumentar' : 'Reducir'} {goal.targetWeight} {goal.unit}
          </Text>
          <Text style={[
            styles.goalTarget,
            goal.completed && styles.completedGoalTarget
          ]}>
            Fecha objetivo: {formatDisplayDate(goal.targetDate)}
          </Text>
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
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${goal.progress}%`,
                backgroundColor: getProgressColor(goal.progress)
              }
            ]}
          />
        </View>
        <Text style={[
          styles.progressText,
          { color: getProgressColor(goal.progress) }
        ]}>
          {goal.progress}%
        </Text>
      </View>

      {/* {!goal.completed && (
        <TouchableOpacity
          style={styles.updateProgressButton}
          onPress={() => onUpdateProgress(goal)}>
          <Icon name="update" size={16} color="#2a8c4a" />
          <Text style={styles.updateProgressText}>Actualizar Progreso</Text>
        </TouchableOpacity>
      )} */}
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
    alignItems: 'center',
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
  },
  completedGoalTarget: {
    color: '#888',
    textDecorationLine: 'line-through',
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
  updateProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a8c4a',
  },
  updateProgressText: {
    marginLeft: 8,
    color: '#2a8c4a',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default GoalCard;