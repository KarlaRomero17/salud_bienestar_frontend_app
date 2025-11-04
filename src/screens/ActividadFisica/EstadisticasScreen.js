// src/screens/ActividadFisica/EstadisticasScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de Colores ---
const COLORS = {
    primary: '#2a8c4a',      
    secondary: '#64c27b',    
    light: '#9bfab0',        
    lighter: '#d0fdd7',      
    white: '#ffffff',        
    text: '#333333',         
};

const EstadisticasScreen = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="stats-chart-outline" size={80} color={COLORS.secondary} />
            <Text style={styles.title}>Estadísticas y Progreso</Text>
            <Text style={styles.text}>Esta es la base para el módulo de análisis. Aquí se visualizarán datos permanentes como:</Text>
            <Text style={styles.listText}>•  Total de Km recorridos</Text>
            <Text style={styles.listText}>•  Ejercicios más comunes</Text>
            <Text style={styles.listText}>•  Calorías quemadas por mes</Text>
            <Text style={styles.infoText}>¡Con Mongoose, estos datos se cargarán de forma permanente!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginVertical: 20,
        color: COLORS.primary,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: COLORS.text,
    },
    listText: {
        fontSize: 16,
        textAlign: 'left',
        width: '100%',
        paddingLeft: 20,
        color: COLORS.text,
        marginBottom: 5,
    },
    infoText: {
        marginTop: 30,
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
        backgroundColor: COLORS.lighter,
        padding: 10,
        borderRadius: 5,
    }
});

export default EstadisticasScreen;