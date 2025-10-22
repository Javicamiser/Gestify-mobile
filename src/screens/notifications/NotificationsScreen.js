import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Bell, Calendar, Users, AlertCircle, Trash2, CheckCheck, Inbox } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

const NotificationsScreen = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener notificaciones del servidor
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user?.id) {
      console.log('No hay usuario autenticado');
      return;
    }

    if (!silent) setLoading(true);

    try {
      console.log(`Obteniendo notificaciones para el usuario ${user.id}`);
      const response = await api.get(`/notifications/${user.id}`);
      
      const notificationsData = response.data || [];
      console.log('Notificaciones recibidas:', notificationsData.length);

      // Procesar notificaciones para añadir fechas relativas
      const processedNotifications = notificationsData.map(notification => ({
        ...notification,
        relativeDate: formatRelativeDate(notification.created_at),
      }));

      setNotifications(processedNotifications);

      // Calcular notificaciones no leídas
      const unread = processedNotifications.filter(n => !n.read_status).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      
      // Si el error es 404, significa que no hay notificaciones
      if (error.response?.status === 404) {
        console.log('No hay notificaciones para este usuario');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las notificaciones');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Formatear fecha relativa
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();

    // Actualizar cada 60 segundos
    const interval = setInterval(() => {
      fetchNotifications(true); // Silent refresh
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh manual
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      console.log(`Marcando notificación ${notificationId} como leída`);
      await api.put(`/notifications/${notificationId}`);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id_notification === notificationId
            ? { ...notification, read_status: true }
            : notification
        )
      );

      // Actualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      console.log(`Marcando todas las notificaciones del usuario ${user.id} como leídas`);
      await api.put(`/notifications/user/${user.id}/read-all`);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read_status: true }))
      );

      // Actualizar contador
      setUnreadCount(0);

      Alert.alert('Éxito', 'Todas las notificaciones fueron marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      Alert.alert('Error', 'No se pudieron marcar todas las notificaciones como leídas');
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Eliminando notificación ${notificationId}`);
              await api.delete(`/notifications/${notificationId}`);

              // Actualizar estado local
              const updatedNotifications = notifications.filter(
                notification => notification.id_notification !== notificationId
              );

              setNotifications(updatedNotifications);

              // Recalcular contador de no leídas
              const unread = updatedNotifications.filter(n => !n.read_status).length;
              setUnreadCount(unread);
            } catch (error) {
              console.error('Error al eliminar notificación:', error);
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          },
        },
      ]
    );
  };

  // Obtener icono según tipo de notificación (inferido del mensaje)
  const getNotificationIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('evento') || lowerMessage.includes('cancelado') || lowerMessage.includes('programado')) {
      return { icon: Calendar, color: '#365486' };
    } else if (lowerMessage.includes('participante') || lowerMessage.includes('inscrito') || lowerMessage.includes('asistente')) {
      return { icon: Users, color: '#10b981' };
    } else if (lowerMessage.includes('recordatorio') || lowerMessage.includes('próximo')) {
      return { icon: Bell, color: '#f59e0b' };
    } else {
      return { icon: AlertCircle, color: '#64748b' };
    }
  };

  // Renderizar cada notificación
  const renderNotification = ({ item }) => {
    const { icon: IconComponent, color } = getNotificationIcon(item.message);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read_status && styles.unreadNotification]}
        activeOpacity={0.7}
        onPress={() => !item.read_status && markAsRead(item.id_notification)}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <IconComponent size={24} color={color} />
          </View>

          <View style={styles.textContent}>
            <Text style={styles.notificationMessage} numberOfLines={3}>
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>{item.relativeDate}</Text>
          </View>

          {!item.read_status && <View style={styles.unreadDot} />}
        </View>

        {/* Botón de eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id_notification)}
        >
          <Trash2 size={18} color="#dc2626" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Renderizar encabezado con botón de marcar todas como leídas
  const renderHeader = () => {
    if (notifications.length === 0) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notificaciones {unreadCount > 0 && `(${unreadCount} sin leer)`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCheck size={18} color="#365486" />
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#365486" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Inbox size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>No hay notificaciones</Text>
          <Text style={styles.emptySubtext}>
            Te notificaremos cuando haya novedades
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id_notification.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#365486']}
              tintColor="#365486"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f5fb' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f5fb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  listContent: { padding: 16 },
  header: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f5fb',
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#365486',
    marginLeft: 6,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#365486',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: { flex: 1 },
  notificationMessage: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: { fontSize: 12, color: '#94a3b8' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#365486',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NotificationsScreen;