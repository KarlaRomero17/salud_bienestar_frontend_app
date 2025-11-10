// src/screens/ActividadFisica/NuevaSesionScreen.js - CÓDIGO FINAL CON AUTENTICACIÓN REAL

// 🚨 Nueva Importación: useContext para acceder al contexto de autenticación
import React, { useState, useCallback, useContext } from 'react'; 
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 

// 🚨 CLAVE: Importamos el contexto de autenticación
import { AuthContext } from '../../context/AuthContext'; 

// ⚠️ AJUSTA LA URL BASE
const BASE_URL = 'http://192.168.1.148:5000/api'; 
const API_URL_SESION = `${BASE_URL}/actividad/sesion`; 

// --- Paleta de Colores ---
const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
};

export default function NuevaSesionScreen({ navigation, route }) {
    // 🚨 1. OBTENER EL USUARIO DEL CONTEXTO
    const { user } = useContext(AuthContext); 
    // Suponemos que el ID del usuario de Firebase/Backend está en user.id. 
    // Si estás usando Firebase Auth, podría ser user.uid. Ajusta esto según tu AuthContext.
    const pacienteId = user?.id; 

    const [sesion, setSesion] = useState({ /* ... */ });
    const [isSaving, setIsSaving] = useState(false); 

    // ... (handleActividadChange y useFocusEffect) ...
    const handleActividadChange = useCallback((nuevaActividad, index) => { /* ... */ }, []);
    useFocusEffect(useCallback(() => { /* ... */ }, [route.params, navigation, handleActividadChange]));
    const eliminarActividad = (index) => { /* ... */ };
    const editarActividad = (actividad, index) => { /* ... */ };
    const calcularResumen = () => { /* ... */ };

    const resumen = calcularResumen();

    // FUNCIÓN CLAVE: GUARDAR EN MONGODB (AXIOS)
    const handleGuardarSesion = async () => {
        if (!pacienteId) {
             Alert.alert("Error de Sesión", "No se pudo obtener el ID del usuario. Por favor, vuelve a iniciar sesión.");
             return;
        }

        if (sesion.actividades.length === 0) {
            Alert.alert("Error", "Debes añadir al menos una actividad para guardar la sesión.");
            return;
        }

        setIsSaving(true);
        
        // Estructura de datos requerida por ActividadController.js
        const dataToSend = {
            pacienteId: pacienteId, // 🚨 CLAVE: Usamos el ID real obtenido del contexto
            fecha: sesion.fecha,
            actividades: sesion.actividades.map(act => {
                const { id, ...rest } = act;
                return rest;
            }), 
        };

        try {
            const response = await axios.post(API_URL_SESION, dataToSend);
            
            Alert.alert("Éxito", "Sesión guardada correctamente en la base de datos.");
            
            setSesion({ id: 'sesion-temp-1', fecha: new Date(), actividades: [] });
            
        } catch (error) {
            console.error("Error al guardar la sesión:", error.response?.data || error.message);
            Alert.alert(
                "Error de Conexión", 
                `No se pudo guardar la sesión. Mensaje: ${error.response?.data?.msg || error.message}. Asegúrate de que el servidor esté activo.`
            );
        } finally {
            setIsSaving(false);
        }
    };


    // ... (renderActividad y JSX del componente) ...
    const renderActividad = ({ item, index }) => (
        <View style={styles.actividadItem}>
             {/* ... Renderizado ... */}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sesionTitle}>Sesión del {new Date(sesion.fecha).toLocaleDateString()}</Text>

            {/* Resumen de la Sesión */}
            <View style={styles.resumenCard}>
                <Text style={styles.resumenText}>**Actividades Añadidas:** <Text style={styles.resumenValue}>{resumen.numEjercicios}</Text></Text>
                <Text style={styles.resumenText}>**Km Totales:** <Text style={styles.resumenValue}>{resumen.totalKm} km</Text></Text>
                <Text style={styles.resumenText}>**Calorías Totales:** <Text style={styles.resumenCalorieValue}>{resumen.totalCalorias} kcal</Text></Text>
            </View>

            {/* Lista de Actividades */}
            <Text style={styles.listHeader}>Actividades Añadidas:</Text>
            <FlatList
                data={sesion.actividades}
                renderItem={renderActividad}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay actividades en esta sesión. ¡Empieza a entrenar!</Text>}
                style={styles.list}
            />

            {/* Botón para añadir */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => navigation.navigate('AgregarActividad', {})}
            >
                <Text style={styles.addButtonText}>➕ Añadir Actividad / Ejercicio</Text>
            </TouchableOpacity>
            
            {/* Botón para Finalizar */}
             <TouchableOpacity 
                style={[styles.addButton, styles.finalizarButton, (sesion.actividades.length === 0 || isSaving) && styles.disabledButton]} 
                onPress={handleGuardarSesion}
                disabled={sesion.actividades.length === 0 || isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.addButtonText}>💾 Finalizar y Guardar Sesión</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: COLORS.white,
    },
    sesionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: COLORS.text,
    },
    resumenCard: {
        backgroundColor: COLORS.lighter, 
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.primary, 
        elevation: 1,
    },
    resumenText: {
        fontSize: 16,
        marginBottom: 5,
        color: COLORS.text,
    },
    resumenValue: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    resumenCalorieValue: {
        fontWeight: 'bold',
        color: COLORS.error, 
    },
    listHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 5,
        color: COLORS.text,
    },
    list: {
        flex: 1,
    },
    actividadItem: {
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.light,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    actividadTipo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 5,
    },
    actividadNombre: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: COLORS.text,
    },
    detailText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 20,
    },
    calorias: {
        fontSize: 14,
        color: COLORS.error, 
        marginTop: 5,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: COLORS.primary, 
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        elevation: 3,
    },
    finalizarButton: {
        backgroundColor: COLORS.secondary, 
        marginBottom: 30,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: COLORS.text,
    }
});