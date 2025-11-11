// src/screens/Dashboard/DashboardScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// --- Paleta de Colores ---
const COLORS = {
    primary: '#2a8c4a',      // Verde oscuro principal
    secondary: '#64c27b',    // Verde medio
    light: '#9bfab0',        // Verde muy claro
    lighter: '#d0fdd7',      // Fondo de sección (usado para las tarjetas)
    white: '#ffffff',        
    text: '#333333',         // Texto principal
};

export default function DashboardScreen({ navigation }) {
    
    // Función de utilidad para renderizar las tarjetas de acción
    const renderActionCard = (title, iconName, iconColor, screenName) => (
        <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate(screenName)}
        >
            <View style={[styles.iconWrapper, { backgroundColor: iconColor }]}>
                <Ionicons name={iconName} size={35} color={COLORS.white}/>
            </View>
            
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Ionicons 
                    name="arrow-forward-outline" 
                    size={24} 
                    color={COLORS.secondary} 
                    style={styles.cardArrow}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <Text style={styles.greeting}>Tu Módulo de Actividad</Text>
            <Text style={styles.subtitle}>Gestione su progreso y registre nuevas actividades fácilmente.</Text>

            {/* --- CUERPO DE TARJETAS --- */}
            <View style={styles.cardGrid}>
                
                {/* 1. Agregar Actividad */}
                {renderActionCard(
                    "Agregar Actividad / Entrenamiento",
                    "add-circle-outline",
                    COLORS.primary,
                    "NuevaSesion"
                )}

                {/* 2. Ver Estadísticas */}
                {renderActionCard(
                    "Ver Estadísticas y Progreso",
                    "stats-chart-outline",
                    COLORS.secondary,
                    "Estadisticas"
                )}
                
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white, 
    },
    contentContainer: {
        padding: 20,
        paddingTop: 50, // Espacio superior para una mejor sensación de la pantalla
    },
    
    // --- ESTILOS DE CABECERA ---
    greeting: {
        fontSize: 24,
        fontWeight: '900', // Más fuerte que 'bold'
        color: COLORS.primary,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.text,
        marginBottom: 30,
        lineHeight: 22,
    },

    // --- ESTILOS DE TARJETAS MODERNAS ---
    cardGrid: {
        flexDirection: 'column',
        gap: 15,
    },
    actionCard: {
        // Contenedor principal
        flexDirection: 'row',
        alignItems: 'center',
        
        backgroundColor: COLORS.lighter, // Usando lighter para el fondo de la tarjeta
        padding: 15,
        paddingRight: 10,
        borderRadius: 12,
        
        // Sombra suave para un efecto 3D
        elevation: 4,
        shadowColor: COLORS.primary, // Usamos el color primario para una sombra temática
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    iconWrapper: {
        padding: 10,
        borderRadius: 8,
        marginRight: 15,
        // El color de fondo se define dinámicamente
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        flexShrink: 1, // Permite que el texto se comprima
    },
    cardArrow: {
        marginLeft: 10,
    }
});