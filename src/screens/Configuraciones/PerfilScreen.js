import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function PerfilScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  // Función para calcular IMC
  const calcularIMC = () => {
    if (user?.peso && user?.altura) {
      const imc = user.peso / (user.altura * user.altura);
      return imc.toFixed(1);
    }
    return 'N/A';
  };

  // Categoría del IMC
  const getCategoriaIMC = (imc) => {
    if (imc === 'N/A') return 'No disponible';
    const valor = parseFloat(imc);
    if (valor < 18.5) return 'Bajo peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const imc = calcularIMC();
  const categoriaIMC = getCategoriaIMC(imc);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header con Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={60} color="#ffffff" />
            </View>
            {/* <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={16} color="#10b981" />
            </TouchableOpacity> */}
          </View>
          <Text style={styles.userName}>
            {user?.nombre} {user?.apellido}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Miembro desde {user?.fechaRegistro || 'Fecha no disponible'}
          </Text>
        </View>

        {/* Estadísticas de Salud */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de Salud</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="monitor-weight" size={24} color="#10b981" />
              <Text style={styles.statValue}>{user?.peso || '--'} kg</Text>
              <Text style={styles.statLabel}>Peso</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="height" size={24} color="#10b981" />
              <Text style={styles.statValue}>{user?.altura || '--'} m</Text>
              <Text style={styles.statLabel}>Altura</Text>
            </View>
            {/* <View style={styles.statCard}>
              <MaterialIcons name="calculate" size={24} color="#10b981" />
              <Text style={styles.statValue}>{imc}</Text>
              <Text style={styles.statLabel}>IMC</Text>
            </View> */}
          </View>
          {imc !== 'N/A' && (
            <View style={styles.imcCategory}>
              <Text style={styles.imcCategoryText}>
                Categoría: <Text style={styles.imcCategoryValue}>{categoriaIMC}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="person" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoValue}>
                {user?.nombre} {user?.apellido}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            {user?.edad > 0 && (
              <View style={styles.infoItem}>
                <MaterialIcons name="cake" size={20} color="#64748b" />
                <Text style={styles.infoLabel}>Edad</Text>
                <Text style={styles.infoValue}>{user?.edad} años</Text>
              </View>
            )}
            
            {user?.sexo && (
              <View style={styles.infoItem}>
                <MaterialIcons name="wc" size={20} color="#64748b" />
                <Text style={styles.infoLabel}>Sexo</Text>
                <Text style={styles.infoValue}>{user?.sexo}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          {/* <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#10b981" />
            <Text style={styles.actionText}>Editar Perfil</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity> */}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('HealthGoal')}
          >
            <MaterialIcons name="flag" size={24} color="#10b981" />
            <Text style={styles.actionText}>Mis Objetivos</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="history" size={24} color="#10b981" />
            <Text style={styles.actionText}>Historial de Salud</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="bar-chart" size={24} color="#10b981" />
            <Text style={styles.actionText}>Progreso</Text>
            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Última actualización: Hoy</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  memberSince: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  imcCategory: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imcCategoryText: {
    fontSize: 14,
    color: '#64748b',
  },
  imcCategoryValue: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});