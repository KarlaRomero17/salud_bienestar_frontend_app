import React, { useState, useCallback, useContext } from 'react'; 
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 
import { AuthContext } from '../../context/AuthContext'; 


const BASE_URL = 'http://10.0.2.2:5000/api'; 
const API_URL_SESION = `${BASE_URL}/actividad/sesion`;
const API_URL_SESION_HOY = `${BASE_URL}/actividad/sesion/hoy`;

// 🎨 PALETA DE COLORES
const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
};

// Función de utilidad para calcular el resumen de la actividad
const calcularResumen = (actividades) => {
    const resumen = {
        calorias: 0,
        km: 0,
    };

    (actividades || []).forEach(act => {
        resumen.calorias += act.calorias || 0;
        if (act.tipo === 'Actividad Física') {
            resumen.km += act.distancia || 0;
        }
    });

    return resumen;
};


export default function NuevaSesionScreen({ navigation, route }) {
    
    const { user } = useContext(AuthContext); 
    const idUsuario = user?.uid; 

    const [sesionId, setSesionId] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [resumenSesion, setResumenSesion] = useState(calcularResumen([]));
    const [isLoading, setIsLoading] = useState(true);

    // --- Funciones de Fetch y Lógica de Sesión ---

    const fetchSesionHoy = useCallback(async () => {
        if (!idUsuario) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // Llama a GET /api/actividad/sesion/hoy/:pacienteId
            const response = await axios.get(`${API_URL_SESION_HOY}/${idUsuario}`);
            const data = response.data;
            
            if (data.sesionId) {
                // Si existe, carga los datos
                setSesionId(data.sesionId);
                setActividades(data.actividades || []);
                setResumenSesion(calcularResumen(data.actividades));
            } else {
                // Si no existe, inicializa la pantalla para CREAR la sesión
                setSesionId(null);
                setActividades([]);
                setResumenSesion(calcularResumen([]));
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar la sesión del día. Intente de nuevo.");
            setSesionId(null);
            setActividades([]);
        } finally {
            setIsLoading(false);
        }
    }, [idUsuario]);

    // Lógica para crear una sesión nueva vacía (al presionar el botón)
    const handleCrearSesion = async () => {
        if (!idUsuario) {
            Alert.alert("Error", "Usuario no identificado.");
            return;
        }

        setIsLoading(true);
        try {
            const nuevaSesion = {
                idUsuario: idUsuario,
                fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            };
            
            // Llama a POST /api/actividad/sesion
            const response = await axios.post(API_URL_SESION, nuevaSesion);
            
            if (response.data && response.data.sesionId) {
                setSesionId(response.data.sesionId);
                setActividades(response.data.actividades || []);
                Alert.alert("Éxito", "Sesión creada. ¡Ahora añade tus actividades!");
            } else {
                Alert.alert("Error", "Respuesta inválida al crear sesión.");
            }
            
        } catch (error) {
            Alert.alert("Error", "No se pudo crear la sesión.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Lógica para manejar la eliminación de una actividad
    const handleEliminarActividad = async (actividadId) => {
        if (!sesionId || !actividadId) return;

        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar esta actividad de la sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        const nuevasActividades = actividades.filter(act => act._id !== actividadId);
                        setIsLoading(true);
                        try {
                            // Llama a PUT /api/actividad/sesion/replace/:idSesion con el array filtrado
                            await axios.put(`${API_URL_SESION}/replace/${sesionId}?action=replace`, { actividades: nuevasActividades });
                            
                            // Si la llamada fue exitosa, actualiza el estado localmente
                            setActividades(nuevasActividades);
                            setResumenSesion(calcularResumen(nuevasActividades));
                            
                            Alert.alert("Éxito", "Actividad eliminada.");
                            
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar la actividad. Asegúrate de que tu backend soporta la eliminación.");
                            console.error("Error al eliminar actividad:", error.response?.data || error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // CORRECCIÓN para Limpiar el estado al guardar la sesión
    const handleGuardarSesion = () => {
        Alert.alert(
            "Sesión Finalizada",
            "La sesión se ha guardado. Puedes consultarla en Estadísticas. ¿Volver al menú principal?",
            [
                {
                    text: "Aceptar",
                    onPress: () => {
                        // Limpiar el estado y forzar la vista de "Crear Nueva Sesión"
                        setSesionId(null);
                        setActividades([]);
                        setResumenSesion(calcularResumen([]));
                        
                        // Navegar al menú principal
                        navigation.navigate('MenuActividad'); 
                    }
                },
            ]
        );
    };

    // --- Efectos y Navegación ---
    
    useFocusEffect(
        useCallback(() => {
            // 🚨 CORRECCIÓN CLAVE: Simplemente recarga la sesión de la DB al enfocarse la pantalla
            // Esto asegura que si una actividad fue añadida/eliminada en otra pantalla, se vea reflejado.
            fetchSesionHoy();
            
            // Se elimina la lógica que usaba route.params?.nuevaActividad
            // Ya no es necesaria, ya que fetchSesionHoy es la fuente de verdad.
            
            return () => {};
        }, [fetchSesionHoy]) 
    );
    
    // Función para renderizar una tarjeta de actividad (sin cambios)
    const renderActividadItem = ({ item }) => {
        
        let details = '';
        if (item.tipo === 'Actividad Física') {
            const tiempoText = item.tiempo ? `${item.tiempo} min.` : '';
            const distanciaText = item.distancia ? `${item.distancia} km` : '';
            details = [tiempoText, distanciaText].filter(Boolean).join(' / ');
        } else if (item.tipo === 'Entrenamiento') {
            const seriesReps = (item.series && item.repeticiones) ? `${item.series} series x ${item.repeticiones} reps` : '';
            const pesoText = item.peso ? ` - ${item.peso} kg` : '';
            const tiempoText = item.tiempo ? `${item.tiempo} min.` : '';
            details = [seriesReps, pesoText, tiempoText].filter(Boolean).join(' | ');
        }

        return (
            <View style={styles.actividadCard}>
                <View style={styles.actividadHeader}>
                    <Text style={styles.actividadNombre}>{item.nombre}</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => handleEliminarActividad(item._id)}>
                            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.actividadDetails}>
                    <Text style={styles.detailText}>{details || 'Sin detalles'}</Text>
                    <Text style={styles.calorias}>{item.calorias?.toFixed(1) || 0} kcal</Text>
                </View>
            </View>
        );
    };

    // --- Renderizado de la Pantalla (sin cambios estructurales) ---
    
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Cargando sesión...</Text>
            </View>
        );
    }
    
    // VISTA DE CREACIÓN DE SESIÓN (cuando no hay sesionId)
    if (!sesionId) {
        return (
            <View style={styles.centered}>
                <Text style={styles.centeredTitle}>Registrar Sesión de Hoy</Text>
                <Text style={styles.centeredSubtitle}>Comienza haciendo clic en 'Crear Sesión' para registrar tus actividades.</Text>
                <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={handleCrearSesion}
                >
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Crear Nueva Sesión</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // VISTA DE EDICIÓN Y DETALLES DE SESIÓN (cuando sí hay sesionId)
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} style={{flex: 1}}>
                <Text style={styles.headerTitle}>Sesión de Hoy: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</Text>
                <Text style={styles.headerSubtitle}>Añade, edita o elimina las actividades registradas.</Text>

                {/* Resumen */}
                <View style={styles.summaryCard}>
                    <Ionicons name="flame-outline" size={24} color={COLORS.error} />
                    <Text style={styles.summaryText}>Total de Calorías Quemadas: </Text>
                    <Text style={styles.summaryValue}>{resumenSesion.calorias.toFixed(1)} kcal</Text>
                    
                    <Ionicons name="walk-outline" size={24} color={COLORS.primary} style={{ marginTop: 10 }} />
                    <Text style={styles.summaryText}>Total de Distancia Recorrida: </Text>
                    <Text style={styles.summaryValue}>{resumenSesion.km.toFixed(1)} km</Text>
                </View>

                <Text style={styles.listHeader}>Actividades Añadidas ({actividades.length})</Text>

                {actividades.length === 0 ? (
                    <Text style={styles.emptyListText}>Aún no has añadido actividades a esta sesión.</Text>
                ) : (
                    <FlatList
                        data={actividades}
                        renderItem={renderActividadItem}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>
            
            {/* Botones de acción flotantes */}
            <View style={styles.footerButtons}>
                <TouchableOpacity 
                    style={styles.secondaryButton}
                    // Navega a AgregarActividad y pasa el ID de la sesión actual
                    onPress={() => navigation.navigate('AgregarActividad', { sesionId })}
                >
                    <Ionicons name="add-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.secondaryButtonText}>Agregar Actividad</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.primaryButton, { flex: 0.6 }]}
                    onPress={handleGuardarSesion}
                >
                    <Ionicons name="checkmark-done-circle-outline" size={24} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Guardar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Estilos (omitted for brevity) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    contentContainer: { paddingBottom: 100 },
    
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.white },
    centeredTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
    centeredSubtitle: { fontSize: 16, color: COLORS.text, textAlign: 'center', marginBottom: 30 },
    
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.primary, paddingHorizontal: 20, paddingTop: 20, },
    headerSubtitle: { fontSize: 14, color: COLORS.text, marginBottom: 20, paddingHorizontal: 20, },

    listHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginHorizontal: 20, marginTop: 15, marginBottom: 10 },
    emptyListText: {
        textAlign: 'center',
        color: COLORS.text,
        fontStyle: 'italic',
        marginTop: 10,
        marginBottom: 20,
    },
    
    summaryCard: {
        backgroundColor: COLORS.lighter,
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.secondary,
    },
    summaryText: { fontSize: 16, color: COLORS.text, fontWeight: '600', marginTop: 5 },
    summaryValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },

    actividadCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.light,
        elevation: 1,
    },
    actividadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    actividadNombre: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: COLORS.text,
        flexShrink: 1,
    },
    actividadDetails: {
        borderTopWidth: 1,
        borderTopColor: COLORS.lighter,
        paddingTop: 5,
        marginTop: 5,
    },
    detailText: {
        fontSize: 14,
        color: COLORS.text,
        marginTop: 3,
    },
    calorias: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.error, 
        marginTop: 5,
        textAlign: 'right',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    
    // Botones Flotantes / Fijos
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: COLORS.white, 
        borderTopWidth: 1,
        borderTopColor: COLORS.light,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        gap: 15,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        elevation: 3,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    
});