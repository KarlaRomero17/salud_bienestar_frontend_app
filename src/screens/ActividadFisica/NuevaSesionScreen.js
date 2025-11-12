// src/screens/ActividadFisica/NuevaSesionScreen.js - CÓDIGO CORREGIDO Y SIMPLIFICADO
import React, { useState, useCallback, useContext } from 'react'; 
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 
import { AuthContext } from '../../context/AuthContext'; 


const BASE_URL = 'http://10.0.2.2:5000/api'; 
const API_URL_SESION = `${BASE_URL}/actividad/sesion`;
const API_URL_SESION_HOY = `${BASE_URL}/actividad/sesion/hoy`;


const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
    chart1: '#3498db', chart2: '#e74c3c', chart3: '#2ecc71', chart4: '#f39c12',
};


const calcularResumen = (actividades) => { 
    let numEjercicios = 0;
    let totalCalorias = 0;
    let totalKm = 0;
    actividades.forEach(act => {
        numEjercicios++;
        totalCalorias += act.calorias || 0;
        totalKm += act.distancia || 0;
    });
    return { numEjercicios, totalCalorias, totalKm };
};


export default function NuevaSesionScreen({ navigation, route }) {
    

    const { user } = useContext(AuthContext); 
    const idUsuario = user?.uid; 

    const [sesionId, setSesionId] = useState(null);
    const [actividades, setActividades] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false); 

    const resumen = calcularResumen(actividades);

    // FUNCIÓN CARGAR SESIÓN (La única fuente de verdad)
    const cargarSesion = useCallback(() => {
        async function fetchSesion() {
            setIsLoading(true);
            if (idUsuario) { 
                try {
                    // Llama al endpoint para obtener la sesión del día
                    const response = await axios.get(`${API_URL_SESION_HOY}/${idUsuario}`);
                    
                    if (response.data && response.data._id) {
                        setActividades(response.data.actividades || []);
                        setSesionId(response.data._id); 
                    } else {
                        // Si el servidor indica que NO hay sesión hoy.
                        setSesionId(null); 
                        setActividades([]);
                    }
                } catch (error) {
                    // Si hay un error de conexión, asumimos que no hay sesión.
                    setSesionId(null); 
                    setActividades([]);
                }
            }
            setIsLoading(false);
        }
        fetchSesion();
    }, [idUsuario]);

    useFocusEffect(
        useCallback(() => {
            cargarSesion();
            // Limpiamos los parámetros de navegación obsoletos.
            navigation.setParams({ nuevaActividad: undefined, index: undefined }); 
            return () => {};
        }, [navigation, cargarSesion]) 
    );
    
    

    const handleEliminarActividad = async (index) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que deseas eliminar esta actividad de la sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        setIsSaving(true);
                        const actividadesActualizadas = actividades.filter((_, i) => i !== index);
                        
                        if (sesionId) {
                            try {
                              
                                await axios.put(`${API_URL_SESION}/${sesionId}`, {
                                    actividades: actividadesActualizadas
                                });
                                
                                setActividades(actividadesActualizadas); 
                            } catch (error) {
                                Alert.alert("Error", "No se pudo eliminar la actividad del servidor.");
                          
                                cargarSesion(); 
                            }
                        } else {
                            setActividades(actividadesActualizadas);
                        }
                        setIsSaving(false);
                    },
                },
            ]
        );
    };

    const handleEditarActividad = (actividad, index) => {
       
        navigation.navigate('AgregarActividad', { 
            actividadParaEditar: actividad, 
            index: index,
            sesionId: sesionId
        });
    };

 
    const renderActividadItem = ({ item, index }) => {
        const detalles = [];
        if (item.tiempo) detalles.push(`${item.tiempo} min`);
        if (item.distancia) detalles.push(`${item.distancia} km`);
        if (item.series && item.repeticiones) detalles.push(`${item.series}x${item.repeticiones}`);
        if (item.peso) detalles.push(`${item.peso} kg`);

        return (
            <View style={styles.actividadCard}>
                <View style={styles.actividadHeader}>
                    <Text style={styles.actividadNombre}>
                        {item.nombre} 
                        <Text style={{ fontWeight: 'normal', fontSize: 14 }}> ({item.tipo})</Text>
                    </Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            onPress={() => handleEditarActividad(item, index)} 
                            style={styles.actionButton}
                        >
                            <Ionicons name="create-outline" size={20} color={COLORS.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => handleEliminarActividad(index)} 
                            style={styles.actionButton}
                        >
                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.actividadDetails}>
                    <Text style={styles.detailText}>Detalles: {detalles.join(' | ')}</Text>
                    <Text style={styles.calorias}>{item.calorias ? item.calorias.toFixed(1) : 0} kcal</Text>
                </View>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            {isLoading || isSaving ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{isSaving ? "Guardando cambios..." : "Cargando sesión..."}</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={actividades}
                        // Usamos _id si existe, si no un índice (para el caso de no tener sesionId aún)
                        keyExtractor={item => item._id || Math.random().toString()} 
                        renderItem={renderActividadItem}
                        ListHeaderComponent={
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Nueva Sesión de Hoy</Text>
                                <Text style={styles.headerSubtitle}>
                                    {sesionId ? "Modificando sesión existente." : "Añadiendo actividades a una nueva sesión. (Se creará al guardar)"}
                                </Text>

                                {/* Resumen */}
                                <View style={styles.resumenCard}>
                                    <Text style={styles.resumenTitle}>Resumen de la Sesión</Text>
                                    <View style={styles.resumenDetailContainer}>
                                        <Text style={styles.resumenText}>Ejercicios: <Text style={styles.resumenValue}>{resumen.numEjercicios}</Text></Text>
                                        <Text style={styles.resumenText}>Distancia: <Text style={styles.resumenValue}>{resumen.totalKm.toFixed(1)} km</Text></Text>
                                        <Text style={styles.resumenText}>Calorías Estimadas: <Text style={styles.resumenCalorieValue}>{resumen.totalCalorias.toFixed(1)} kcal</Text></Text>
                                    </View>
                                </View>
                                
                                {/* 🔑 CORRECCIÓN CLAVE 2: Pasar el sesionId existente (o null) */}
                                <TouchableOpacity 
                                    style={styles.addButton} 
                                    onPress={() => navigation.navigate('AgregarActividad', { sesionId: sesionId })}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
                                    <Text style={styles.addButtonText}>Añadir Actividad o Entrenamiento</Text>
                                </TouchableOpacity>

                                <Text style={[styles.listTitle, { paddingHorizontal: 20 }]}>Actividades Registradas</Text>
                                
                                {actividades.length === 0 && (
                                    <Text style={styles.emptyText}>Presiona "Añadir Actividad" para comenzar.</Text>
                                )}
                            </View>
                        }
                        contentContainerStyle={styles.flatListContainer}
                    />

                    {/* Botón de Volver (Simulando Guardado/Finalización) */}
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.saveButtonText}>Volver a Menú</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}


// ... (styles se mantienen igual)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 15,
    },
    resumenCard: {
        backgroundColor: COLORS.lighter,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.secondary,
    },
    resumenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    resumenDetailContainer: {
    },
    resumenText: { 
        fontSize: 15, 
        color: COLORS.text, 
        paddingVertical: 2,
    },
    resumenValue: {
        fontWeight: 'normal',
        color: COLORS.text,
    },
    resumenCalorieValue: {
        fontWeight: 'normal',
        color: COLORS.error, 
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
        gap: 8,
        elevation: 2,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 0,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.secondary,
        fontStyle: 'italic',
        marginTop: 10,
        marginBottom: 20,
    },
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
    actionButton: {
        padding: 5,
    },
    saveButton: {
        backgroundColor: COLORS.secondary, 
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        elevation: 5,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});