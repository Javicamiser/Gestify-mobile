import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { User, Mail, Phone, Calendar, MapPin, LogOut, Edit2, Save, X } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  const handleSave = () => {
    // Aquí conectarás con tu API para actualizar el perfil
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      phone: user?.phone || '',
      city: user?.city || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con foto de perfil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#fff" />
        </View>
        <Text style={styles.profileName}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      {/* Botón de edición */}
      <View style={styles.editButtonContainer}>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Edit2 size={20} color="#365486" />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <X size={20} color="#dc2626" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Información del perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        {/* Nombre completo */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <User size={20} color="#365486" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Nombre completo</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Tu nombre"
              />
            ) : (
              <Text style={styles.value}>{formData.name || 'No especificado'}</Text>
            )}
          </View>
        </View>

        {/* Usuario */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <User size={20} color="#365486" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Nombre de usuario</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="Tu usuario"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{formData.username || 'No especificado'}</Text>
            )}
          </View>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <Mail size={20} color="#365486" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Correo electrónico</Text>
            <Text style={styles.value}>{formData.email}</Text>
          </View>
        </View>

        {/* Teléfono */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <Phone size={20} color="#365486" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Teléfono</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Tu teléfono"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{formData.phone || 'No especificado'}</Text>
            )}
          </View>
        </View>

        {/* Ciudad */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <MapPin size={20} color="#365486" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Ciudad</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Tu ciudad"
              />
            ) : (
              <Text style={styles.value}>{formData.city || 'No especificado'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f5fb' },
  profileHeader: {
    backgroundColor: '#365486',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a6fa5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#cbd5e1' },
  editButtonContainer: { padding: 20 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#365486',
  },
  editButtonText: { fontSize: 16, fontWeight: '600', color: '#365486', marginLeft: 8 },
  editActions: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#dc2626', marginLeft: 8 },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#365486',
    padding: 12,
    borderRadius: 12,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  section: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  value: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  input: {
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 8 },
});

export default ProfileScreen;