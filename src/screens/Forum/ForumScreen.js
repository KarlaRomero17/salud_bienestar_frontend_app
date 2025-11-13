import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SERVER_URI } from '@env';


const BASE_URL = Platform.OS == 'android' ? `${SERVER_URI}` : 'http://localhost:5000'

const ForumScreen = () => {
  const { user } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();


  const obtenerPublicaciones = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/publicaciones`);
      setPublicaciones(res.data);
    } catch (error) {
      console.log("Error al obtener publicaciones", error);
    } finally {
      setLoading(false);
    }
  };

  //Llamando función
  useFocusEffect(
    useCallback(() => {
      obtenerPublicaciones();
    }, [])
  );;

  //Eliminando
  const eliminarPublicacion = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/publicaciones/${id}`);
      setPublicaciones(publicaciones.filter(pub => pub._id !== id));
      Alert.alert("Exito", "Publicación eliminada");
    } catch (error) {
      console.log("Error", "Error al eliminar publicación:", error);
      Alert.alert("Error al eliminar la publicación");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2a8c4a" />
        <Text style={styles.loadingText}>Cargando foro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foro</Text>
        <Text style={styles.headerSubtitle}>Comparte tus opiniones con la comunidad</Text>
      </View>

      <FlatList
        data={publicaciones}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Contenedor superior con título y botones */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>

              {/* Mostrar botones solo si el usuario logueado es el autor */}
              {user && user.nombre === item.autor && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('NewPublication', { publicacion: item })}
                    style={styles.editButton}
                  >
                    <Ionicons name="create-outline" size={20} color='green' />

                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => eliminarPublicacion(item._id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color='red' />

                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Contenido y autor */}
            <TouchableOpacity
              onPress={() => navigation.navigate('PublicationDetails', { publicacion: item })}
            >
              <Text numberOfLines={2} style={styles.cardContent}>{item.contenido}</Text>
              <Text style={styles.cardAuthor}>Por {item.autor}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Agregar nueva publicación */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewPublication')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  //cargando....
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  //header
  header: {
    backgroundColor: '#2a8c4a',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d0fdd7',
    marginTop: 5,
  },

  //card publicación
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    margin: 15,
    borderRadius: 10,
    elevation: 2, // para Android
    shadowColor: '#000', // para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContent: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  cardAuthor: {
    color: 'gray',
    marginTop: 6,
    fontStyle: 'italic',
  },

  //agregar nuevo
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2a8c4a',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
});

export default ForumScreen;
