// src/screens/ActividadFisica/EstadisticasScreen.js - CÓDIGO FINAL Y ROBUSTO

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, 
    TouchableOpacity, FlatList, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { LineChart } from 'react-native-chart-kit'; 
import { AuthContext } from '../../context/AuthContext'; 

const screenWidth = Dimensions.get('window').width;


const BASE_URL = 'http://10.0.2.2:5000/api'; 
const API_URL_ESTADISTICAS = `${BASE_URL}/actividad/estadisticas`; 

const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
    chart1: '#3498db', chart2: '#e74c3c', chart3: '#2ecc71', chart4: '#f39c12',
};

const INITIAL_STATS = {
    totalSesiones: 0,
    totalCalorias: 0,
    totalKm: 0,
    ejercicioMasHecho: { nombre: 'N/A', count: 0 },
    sesiones: [],
};

const formatDateToDisplay = (date) => {
    if (!date) return 'Seleccionar';
    return new Date(date).toLocaleDateString();
};

const formatDateToQuery = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
};

const EstadisticasScreen = () => {
    
    const { user } = useContext(AuthContext); 
    const idUsuario = user?.uid; 
    
    const [estadisticas, setEstadisticas] = useState(INITIAL_STATS);
    const [isLoading, setIsLoading] = useState(false);
    
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    const [showPicker, setShowPicker] = useState(false);
    const [pickerFor, setPickerFor] = useState(null);
    
    const [expandedSesionId, setExpandedSesionId] = useState(null);

    const [lineChartData, setLineChartData] = useState({
        labels: [],
        datasets: [{ data: [] }],
    });

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowPicker(Platform.OS === 'ios');

        if (event.type === 'set') {
            if (pickerFor === 'inicio') {
                setFechaInicio(currentDate);
            } else if (pickerFor === 'fin') {
                setFechaFin(currentDate);
            }
        }
        setPickerFor(null);
    };

    const showDatepicker = (forDate) => {
        setPickerFor(forDate);
        setShowPicker(true);
    };

    const processLineChartData = (data) => {
        if (!data || data.sesiones.length === 0) {
            return {
                labels: ['Sin Datos'], 
                datasets: [{ data: [0] }],
            };
        }

        const sessionsToChart = data.sesiones.slice(-7); 

        const lineData = {
            labels: sessionsToChart.map(s => new Date(s.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })),
            datasets: [{ 
                data: sessionsToChart.map(s => parseFloat(s.totalCalorias)),
                color: (opacity = 1) => `rgba(100, 194, 123, ${opacity})`, 
                strokeWidth: 2 
            }],
        };

        return lineData;
    };


    const fetchEstadisticas = useCallback(async () => {
        if (!idUsuario) {
            setEstadisticas(INITIAL_STATS);
            setLineChartData(processLineChartData(null));
            return;
        }

        setIsLoading(true);
        const params = {};
        if (fechaInicio) params.fechaInicio = formatDateToQuery(fechaInicio);
        if (fechaFin) params.fechaFin = formatDateToQuery(fechaFin);

        try {
            const response = await axios.get(`${API_URL_ESTADISTICAS}/${idUsuario}`, { params });
            const data = response.data;
            setEstadisticas(data);
            setLineChartData(processLineChartData(data)); 
            setExpandedSesionId(null);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            Alert.alert("Error", "No se pudieron cargar las estadísticas. Revise la URL o su backend.");
            setEstadisticas(INITIAL_STATS);
            setLineChartData(processLineChartData(null));
        } finally {
            setIsLoading(false);
        }
    }, [idUsuario, fechaInicio, fechaFin]);


    useEffect(() => {
        fetchEstadisticas();
    }, [fetchEstadisticas]);


    const renderMetricaCard = (icon, title, value, unit, color = COLORS.primary) => (
        <View style={styles.metricaCard}>
            <Ionicons name={icon} size={30} color={color} style={styles.metricaIcon} />
            <View style={styles.metricaContent}>
                <Text style={styles.metricaValue}>{value}</Text>
                <Text style={styles.metricaTitle}>{title}</Text>
            </View>
            <Text style={styles.metricaUnit}>{unit}</Text>
        </View>
    );

    // 🛑 LÓGICA DE DESGLOSE DE ACTIVIDAD REFORZADA
    const renderActividadDetail = (actividad, index) => {
        // Aseguramos que la actividad es válida
        if (!actividad || !actividad.nombre) return null; 

        let detalles = [];
        
        // --- 1. Actividad Física ---
        if (actividad.tipo === 'Actividad Física') {
            // Usamos OR (|| 0) para asegurar que el valor sea numérico en la concatenación
            if (actividad.distancia) detalles.push(`${actividad.distancia || 0} km`);
            if (actividad.tiempo) detalles.push(`${actividad.tiempo || 0} min`);
        } 
        // --- 2. Entrenamiento ---
        else if (actividad.tipo === 'Entrenamiento') { 
            if (actividad.series && actividad.repeticiones) detalles.push(`${actividad.series} x ${actividad.repeticiones}`);
            if (actividad.peso) detalles.push(`${actividad.peso || 0} kg`);
            if (actividad.tiempo) detalles.push(`${actividad.tiempo || 0} min`);
        }

        return (
            <View key={index} style={styles.actividadDetailCard}>
                <Text style={styles.actividadName}>
                    {actividad.nombre} ({actividad.tipo})
                </Text>
                <Text style={styles.actividadStats}>
                    {detalles.length > 0 ? detalles.join(' | ') : 'Sin detalles específicos'}
                </Text>
                <Text style={styles.actividadCalorias}>
                    <Ionicons name="flame" size={14} color={COLORS.error} /> {actividad.calorias ? actividad.calorias.toFixed(1) : '0.0'} kcal
                </Text>
            </View>
        );
    };
    
    // 🛑 LÓGICA DE DETALLE DE SESIÓN REFORZADA
    const renderSesionItem = ({ item }) => {
        const isExpanded = item.id === expandedSesionId;
        // 🔑 Verificación de array explícita
        const actividades = Array.isArray(item.actividades) ? item.actividades : [];

        return (
            <View style={styles.sesionCard}>
                <TouchableOpacity 
                    style={styles.sesionHeader}
                    onPress={() => setExpandedSesionId(isExpanded ? null : item.id)}
                >
                    <View>
                        <Text style={styles.sesionDate}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} /> {new Date(item.fecha).toLocaleDateString()}
                        </Text>
                        <Text style={styles.sesionText}>
                            {item.numActividades} Actividades
                        </Text>
                    </View>
                    <View style={styles.sesionSummary}>
                        <Text style={styles.sesionCalorias}>
                             {item.totalCalorias} kcal
                        </Text>
                        <Ionicons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={COLORS.text} 
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* 🔑 La comprobación se basa en el array ya verificado */}
                        {actividades.length > 0 ? (
                            actividades.map((act, index) => renderActividadDetail(act, index))
                        ) : (
                            <Text style={styles.emptyActivityText}>No hay detalles de actividades para esta sesión.</Text>
                        )}
                    </View>
                )}
            </View>
        );
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerTitle}>Tu Progreso Físico</Text>
            
            {/* --- FILTRO DE FECHAS (Sin cambios) --- */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filtrar por Rango de Fechas:</Text>
                <View style={styles.datePickerRow}>
                    <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={() => showDatepicker('inicio')} 
                    >
                        <Text style={styles.datePickerText}>
                            {formatDateToDisplay(fechaInicio) || 'Fecha Inicio'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.dateSeparator}>a</Text>
                    
                    <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={() => showDatepicker('fin')} 
                    >
                        <Text style={styles.datePickerText}>
                            {formatDateToDisplay(fechaFin) || 'Fecha Fin'}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={fetchEstadisticas}
                    disabled={isLoading}
                >
                    <Text style={styles.filterButtonText}>
                        {isLoading ? 'Cargando...' : 'Aplicar Filtro'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={pickerFor === 'inicio' && fechaInicio ? fechaInicio : 
                           pickerFor === 'fin' && fechaFin ? fechaFin : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}


            {isLoading && estadisticas.totalSesiones === 0 ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <>
                    {/* --- RESUMEN DE MÉTRICAS (Sin cambios) --- */}
                    <View style={styles.metricsGrid}>
                        {renderMetricaCard("calendar-outline", "Total Sesiones", estadisticas.totalSesiones, "Sesiones", COLORS.secondary)}
                        {renderMetricaCard("flame-outline", "Calorías Quemadas", estadisticas.totalCalorias, "kcal", COLORS.error)}
                        {renderMetricaCard("map-outline", "Distancia Recorrida", estadisticas.totalKm, "km", COLORS.primary)}
                        {renderMetricaCard("barbell-outline", "Ejercicio Más Hecho", estadisticas.ejercicioMasHecho.nombre, `(${estadisticas.ejercicioMasHecho.count} veces)`, COLORS.text)}
                    </View>
                    
                    {/* --- GRÁFICO 1: LÍNEAS (Evolución de Calorías) --- */}
                    {lineChartData.datasets[0].data.length > 1 && (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Evolución de Calorías Quemadas (Últ. Sesiones)</Text>
                            <LineChart
                                data={lineChartData}
                                width={screenWidth - 40} 
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    )}


                    {/* --- LISTA DE SESIONES (Desglose corregido) --- */}
                    <Text style={styles.listTitle}>Historial de Sesiones</Text>
                    {estadisticas.sesiones && estadisticas.sesiones.length > 0 ? (
                        <FlatList
                            data={estadisticas.sesiones}
                            renderItem={renderSesionItem}
                            keyExtractor={item => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No hay sesiones en el rango seleccionado.</Text>
                    )}
                </>
            )}
        </ScrollView>
    );
};

const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(42, 140, 74, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`, 
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false 
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginVertical: 20 },
    
    filterContainer: { padding: 15, backgroundColor: COLORS.lighter, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: COLORS.light },
    filterLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    datePickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    datePickerButton: { flex: 1, padding: 10, backgroundColor: COLORS.white, borderRadius: 5, borderWidth: 1, borderColor: COLORS.light, marginHorizontal: 5, alignItems: 'center' },
    datePickerText: { fontSize: 14, color: COLORS.text },
    dateSeparator: { marginHorizontal: 5, color: COLORS.text },
    filterButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginTop: 10 },
    filterButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

    chartContainer: { marginVertical: 10, borderRadius: 10, backgroundColor: COLORS.white, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.light, elevation: 1, },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10, paddingHorizontal: 15, },
    chart: { borderRadius: 16, },

    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    metricaCard: { width: '48%', backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: COLORS.light, elevation: 2 },
    metricaIcon: { alignSelf: 'center', marginBottom: 8 },
    metricaContent: { flexDirection: 'column', alignItems: 'center' },
    metricaTitle: { fontSize: 14, color: COLORS.text, textAlign: 'center', marginTop: 5 },
    metricaValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
    metricaUnit: { fontSize: 12, color: COLORS.secondary, textAlign: 'center', marginTop: 5 },
    
    listTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 10, marginBottom: 10, borderBottomWidth: 2, borderBottomColor: COLORS.light, paddingBottom: 5 },
    
    sesionCard: { backgroundColor: COLORS.white, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.light, elevation: 1, overflow: 'hidden' },
    sesionHeader: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
    sesionDate: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
    sesionText: { fontSize: 14, color: COLORS.text, marginLeft: 5 },
    sesionSummary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sesionCalorias: { fontSize: 16, fontWeight: 'bold', color: COLORS.error },
    expandedContent: { padding: 15, backgroundColor: COLORS.lighter, borderTopWidth: 1, borderTopColor: COLORS.light },
    
    actividadDetailCard: { backgroundColor: COLORS.white, padding: 10, borderRadius: 5, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
    actividadName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
    actividadStats: { fontSize: 13, color: COLORS.text, marginTop: 3 },
    actividadCalorias: { fontSize: 13, fontWeight: 'bold', color: COLORS.error, marginTop: 5 },
    
    emptyActivityText: { textAlign: 'center', color: COLORS.text, fontStyle: 'italic' },
    emptyText: { textAlign: 'center', color: COLORS.secondary, fontStyle: 'italic', marginTop: 20 },
});

export default EstadisticasScreen;