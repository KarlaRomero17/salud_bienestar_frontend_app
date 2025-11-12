import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const COLORS = {
    primary: '#2a8c4a',      
    secondary: '#64c27b',    
    light: '#9bfab0',        
    lighter: '#d0fdd7',      
    white: '#ffffff',        
    text: '#333333',         
};

export default function MenuActividadScreen({ navigation }) {
    
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

            <View style={styles.cardGrid}>
                
                {renderActionCard(
                    "Agregar Actividad / Entrenamiento",
                    "add-circle-outline",
                    COLORS.primary,
                    "NuevaSesion"
                )}

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
        paddingTop: 50,
    },
    
    greeting: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.text,
        marginBottom: 30,
        lineHeight: 22,
    },

    cardGrid: {
        flexDirection: 'column',
        gap: 15,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        
        backgroundColor: COLORS.lighter, 
        padding: 15,
        paddingRight: 10,
        borderRadius: 12,
        
        elevation: 4,
        shadowColor: COLORS.primary, 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    iconWrapper: {
        padding: 10,
        borderRadius: 8,
        marginRight: 15,
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
        flexShrink: 1, 
    },
    cardArrow: {
        marginLeft: 10,
    }
});