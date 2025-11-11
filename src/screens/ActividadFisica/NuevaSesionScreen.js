// src/screens/ActividadFisica/NuevaSesionScreen.js - CÓDIGO FINAL CORREGIDO Y ROBUSTO

import React, { useState, useCallback, useContext } from 'react'; 
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 

import { AuthContext } from '../../context/AuthContext'; 


const BASE_URL = 'http://10.0.2.2:5000/api'; 
const API_URL_SESION = `${BASE_URL}/actividad/sesion`; 

// --- Paleta de Colores ---
const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
};

export default function NuevaSesionScreen({ navigation, route }) {

    // 🚨 1. OBTENCIÓN DEL ID DE USUARIO DEL CONTEXT
    const { user } = useContext(AuthContext); 
    const idUsuario = user?.uid; // Asume que el UID es el idUsuario

    // 2. ESTADO CLAVE: Persistencia local de la sesión
    const [sesion, setSesion] = useState({ 
        id: 'sesion-temp-1', // ID temporal local
        fecha: new Date().toISOString(), 
        actividades: [], // ARRAY QUE GUARDA TEMPORALMENTE TUS ACTIVIDADES
    });
    const [isLoading, setIsLoading] = useState(false);

    // 3. CÁLCULO DE RESUMEN
    const calcularResumen = (actividades) => {
        const totalCalorias = actividades.reduce((sum, act) => sum + (act.calorias || 0), 0).toFixed(1);
        const totalKm = actividades.reduce((sum, act) => sum + (act.distancia || 0), 0).toFixed(1);
        return {
            numEjercicios: actividades.length,
            totalCalorias: parseFloat(totalCalorias),
            totalKm: parseFloat(totalKm),
        };
    };

    const resumen = calcularResumen(sesion.actividades);

    // 4. LÓGICA DE PERSISTENCIA LOCAL (Se activa al volver de AgregarActividad)
    const handleActividadChange = useCallback(() => {
        if (route.params?.nuevaActividad) {
            const actividad = route.params.nuevaActividad;

            setSesion(prevSesion => {
                const updatedActividades = [...prevSesion.actividades, actividad];
                return {
                    ...prevSesion,
                    actividades: updatedActividades,
                };
            });

            // Limpia el parámetro para evitar duplicados al re-enfocar
            navigation.setParams({ nuevaActividad: undefined });
        }
    }, [route.params?.nuevaActividad, navigation]);

    // 5. useFocusEffect llama a la función cada vez que la pantalla está enfocada
    useFocusEffect(handleActividadChange);

    // 6. MANEJO DE ELIMINACIÓN DE ACTIVIDAD (Temporal)
    const handleEliminarActividad = (index) => {
        Alert.alert(
            "Eliminar Actividad",
            "¿Estás seguro de que quieres eliminar esta actividad de la sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: () => {
                        setSesion(prevSesion => ({
                            ...prevSesion,
                            actividades: prevSesion.actividades.filter((_, i) => i !== index),
                        }));
                    }
                },
            ]
        );
    };

    // 7. FUNCIÓN CLAVE: GUARDAR EN MONGODB
    const handleGuardarSesion = async () => {
        if (sesion.actividades.length === 0) {
            Alert.alert("Error", "Debes añadir al menos una actividad para guardar la sesión.");
            return;
        }

        setIsLoading(true);

        // 💡 7.1. Los datos que se envían al backend
        const dataToSend = {
            idUsuario: idUsuario, // El backend lo mapea a pacienteId
            fecha: sesion.fecha,
            // Las actividades ya están en el formato del modelo de Mongoose
            actividades: sesion.actividades.map(({ id, ...rest }) => rest), 
        };

        try {
            const response = await axios.post(API_URL_SESION, dataToSend);
            
            Alert.alert("Éxito", "Sesión de actividad guardada correctamente.", [
                {
                    text: "Aceptar",
                    onPress: () => {
                        // Limpia el estado y navega al historial
                        setSesion({ id: 'sesion-temp-1', fecha: new Date().toISOString(), actividades: [] });
                        navigation.goBack(); // O navega al historial de sesiones
                    }
                }
            ]);
        } catch (error) {
            console.error("Error al guardar la sesión:", error);
            // Muestra un error más útil al usuario (ej: problemas de conexión)
            Alert.alert("Error de Guardado", `No se pudo guardar la sesión. Revisa la conexión o la URL: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // 8. RENDERIZADO DE ITEM DE LA FLATLIST
    const renderActividadItem = ({ item, index }) => {
        const detalles = [];
        if (item.tiempo) detalles.push(`${item.tiempo} min`);
        if (item.distancia) detalles.push(`${item.distancia} km`);
        if (item.series && item.repeticiones) detalles.push(`${item.series}x${item.repeticiones}`);
        if (item.peso) detalles.push(`${item.peso} kg`);

        return (
            <View style={styles.actividadCard}>
                <View style={styles.actividadHeader}>
                    <Text style={styles.actividadNombre}>{item.nombre} ({item.tipo})</Text>
                    <View style={styles.actionButtons}>
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
                    <Text style={styles.calorias}>{item.calorias.toFixed(1)} kcal</Text>
                </View>
            </View>
        );
    };


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Guardando sesión...</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <FlatList
                data={sesion.actividades}
                renderItem={renderActividadItem}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Nueva Sesión</Text>
                        <Text style={styles.headerSubtitle}>
                            Añade actividades antes de guardar
                        </Text>

                        {/* --- RESUMEN DE LA SESIÓN (ERROR DE TEXTO CORREGIDO) --- */}
                        <View style={styles.resumenCard}>
                            <Text style={styles.resumenTitle}>Resumen de la Sesión</Text>
                            <View style={styles.resumenDetailContainer}>
                                <Text style={styles.resumenText}>
                                    <Text style={{fontWeight: 'bold'}}>Actividades Añadidas: </Text>
                                    <Text style={styles.resumenValue}>{resumen.numEjercicios}</Text>
                                </Text>
                                <Text style={styles.resumenText}>
                                    <Text style={{fontWeight: 'bold'}}>Km Totales: </Text>
                                    <Text style={styles.resumenValue}>{resumen.totalKm} km</Text>
                                </Text>
                                <Text style={styles.resumenText}>
                                    <Text style={{fontWeight: 'bold'}}>Calorías Totales: </Text>
                                    <Text style={styles.resumenCalorieValue}>{resumen.totalCalorias} kcal</Text>
                                </Text>
                            </View>
                        </View>
                        {/* --- FIN RESUMEN --- */}


                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AgregarActividad')}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
                            <Text style={styles.addButtonText}>Añadir Nueva Actividad</Text>
                        </TouchableOpacity>

                        {sesion.actividades.length === 0 && (
                            <Text style={styles.emptyText}>Presiona "Añadir Nueva Actividad" para empezar.</Text>
                        )}

                        {sesion.actividades.length > 0 && (
                            <Text style={styles.listTitle}>Actividades en Sesión:</Text>
                        )}
                    </View>
                )}
                contentContainerStyle={styles.flatListContainer}
            />

            {/* --- BOTÓN FINAL: GUARDAR SESIÓN --- */}
            {sesion.actividades.length > 0 && (
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleGuardarSesion}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>Finalizar y Guardar Sesión</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

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
    // --- Estilos para el Resumen (Ajustado) ---
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
        // Para que los detalles se muestren bien en filas.
    },
    resumenText: { 
        fontSize: 15, 
        color: COLORS.text, 
        paddingVertical: 2,
    },
    resumenValue: {
        fontWeight: 'normal', // Los valores numéricos no necesitan doble bold
        color: COLORS.text,
    },
    resumenCalorieValue: {
        fontWeight: 'normal',
        color: COLORS.error, // Color diferente para calorías
    },
    // --- Fin Estilos Resumen ---
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
        backgroundColor: COLORS.error, // Rojo o un color distinto para enfatizar la acción final
        padding: 20,
        // Eliminamos el margin horizontal para que ocupe todo el ancho
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