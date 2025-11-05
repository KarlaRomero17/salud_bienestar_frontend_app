// src/screens/ActividadFisica/NuevaSesionScreen.js

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de Colores ---
const COLORS = {
    primary: '#2a8c4a',      
    secondary: '#64c27b',    
    light: '#9bfab0',        
    lighter: '#d0fdd7',      
    white: '#ffffff',        
    text: '#333333',         
    error: '#e74c3c', 
};

export default function NuevaSesionScreen({ navigation }) {
    // Simulando el estado de la sesión y las actividades añadidas
    const [sesion, setSesion] = useState({
        id: 'sesion-temp-1',
        fecha: new Date().toLocaleDateString(),
        actividades: [],
    });

    // 1. LÓGICA PARA AÑADIR/EDITAR ACTIVIDAD (Central)
    const handleActividadChange = useCallback((nuevaActividad, index) => {
        setSesion(prevSesion => {
            const nuevasActividades = [...prevSesion.actividades];
            
            if (index !== undefined && index !== null) {
                // EDITAR: Reemplaza la actividad existente
                nuevasActividades[index] = nuevaActividad;
            } else {
                // AÑADIR: Agrega una nueva actividad
                nuevasActividades.push({ ...nuevaActividad, id: Date.now() + nuevasActividades.length }); // Añade un ID simulado
            }
            
            return {
                ...prevSesion,
                actividades: nuevasActividades
            };
        });
    }, []);
    
    // 2. LÓGICA DE ELIMINACIÓN
    const eliminarActividad = (index) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar esta actividad de la sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive",
                    onPress: () => {
                        setSesion(prevSesion => ({
                            ...prevSesion,
                            actividades: prevSesion.actividades.filter((_, i) => i !== index)
                        }));
                    }
                }
            ]
        );
    };

    // 3. LÓGICA DE EDICIÓN
    const editarActividad = (actividad, index) => {
        navigation.navigate('AgregarActividad', {
            // Pasamos los datos de la actividad y el índice para que la pantalla sepa que debe editar
            actividadParaEditar: actividad,
            indexActividad: index,
            // Sobreescribimos el callback para asegurarnos de que se llame con el índice
            onGoBack: (act) => handleActividadChange(act, index)
        });
    };

    // Al enfocarse la pantalla, pasamos la función de callback para añadir
    useFocusEffect(
        useCallback(() => {
            return () => {};
        }, [])
    );


    // Cálculo de resumen (Se mantiene igual)
    const calcularResumen = () => {
        let totalKm = 0;
        let numEjercicios = 0;
        let totalCalorias = 0;

        sesion.actividades.forEach(act => {
            if (act.tipo === 'Actividad Física' && act.distancia) {
                totalKm += parseFloat(act.distancia);
            }
            if (act.tipo === 'Entrenamiento' || act.tipo === 'Actividad Física') {
                numEjercicios += 1;
            }
             if (act.calorias) {
                totalCalorias += act.calorias;
            }
        });

        return { totalKm: totalKm.toFixed(2), numEjercicios, totalCalorias: totalCalorias.toFixed(0) };
    };

    const resumen = calcularResumen();

    // Renderizado de cada item en la sesión (MODIFICADO para incluir botones)
    const renderActividad = ({ item, index }) => (
        <View style={styles.actividadItem}>
            <View style={styles.headerRow}>
                <Text style={styles.actividadTipo}>
                    <Ionicons name={item.tipo === 'Actividad Física' ? "walk-outline" : "barbell-outline"} size={14} color={COLORS.primary} />
                    {item.tipo}
                </Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => editarActividad(item, index)} style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => eliminarActividad(index)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <Text style={styles.actividadNombre}>**{item.nombre}**</Text>
            {item.tipo === 'Actividad Física' && (
                <Text style={styles.detailText}>{item.distancia} km en {item.tiempo} min</Text>
            )}
            {item.tipo === 'Entrenamiento' && item.conPesas && (
                <Text style={styles.detailText}>Series: {item.series}, Reps: {item.repeticiones}, Peso: {item.peso} kg</Text>
            )}
             {item.tipo === 'Entrenamiento' && !item.conPesas && (
                <Text style={styles.detailText}>Duración: {item.tiempo} min</Text>
            )}
            <Text style={styles.calorias}>🔥 Calorías: {item.calorias || 'N/A'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sesionTitle}>Sesión del {sesion.fecha}</Text>

            {/* Resumen de la Sesión (Se mantiene igual) */}
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
                onPress={() => navigation.navigate('AgregarActividad', { onGoBack: handleActividadChange })}
            >
                <Text style={styles.addButtonText}>➕ Añadir Actividad / Ejercicio</Text>
            </TouchableOpacity>
            
            {/* Botón para Finalizar (Simulado) */}
             <TouchableOpacity 
                style={[styles.addButton, styles.finalizarButton]} 
                onPress={() => Alert.alert("Sesión Finalizada", "La sesión se guardaría permanentemente con Mongoose.")}
                disabled={sesion.actividades.length === 0}
            >
                <Text style={styles.addButtonText}>💾 Finalizar y Guardar Sesión</Text>
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