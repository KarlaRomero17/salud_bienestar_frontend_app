// components/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useMongoNotifications } from '../hooks/useMongoNotifications';

const NotificationCenter = ({ userId }) => {
  const { 
    notifications, 
    unreadCount, 
    getNotificationHistory,
    markAsRead,
    checkForNewNotifications 
  } = useMongoNotifications(userId);

  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const result = await getNotificationHistory(1, 50);
    if (result.exito) {
      setHistory(result.datos);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkForNewNotifications();
    await loadHistory();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    await markAsRead(notification._id);
    // Navegar a la pantalla relevante basada en notification.data
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationTime}>
        {new Date(item.scheduledFor).toLocaleString()}
      </Text>
      <View style={[
        styles.statusBadge,
        { backgroundColor: getStatusColor(item.status) }
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA000',
      delivered: '#2196F3',
      read: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#757575';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centro de Notificaciones</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount} no leídas</Text>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={renderNotificationItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay notificaciones</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default NotificationCenter;