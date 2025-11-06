// src/screens/Dashboard/DashboardScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export default function MenuActividadFisica({ navigation }) {
    return (
        <View style={styles.container}>
            
           
            <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => navigation.navigate('NuevaSesion')}
            >
                <Ionicons name="add-circle-outline" size={30} color={COLORS.white} style={styles.icon}/>
                <Text style={styles.buttonText}>Agregar Actividad / Entrenamiento</Text>
            </TouchableOpacity>
            
          
            <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => navigation.navigate('Estadisticas')}
            >
                <Ionicons name="stats-chart-outline" size={30} color={COLORS.white} style={styles.icon}/>
                <Text style={styles.buttonText}>Ver Estadísticas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.white, 
        justifyContent: 'center', 
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary, 
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    icon: {
        marginRight: 15,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'left',
    },
});