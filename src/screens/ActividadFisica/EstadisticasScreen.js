import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, 
    TouchableOpacity, FlatList, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { LineChart } from 'react-native-chart-kit'; 
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext'; 

const screenWidth = Dimensions.get('window').width;


   
const BASE_URL = "http://10.0.2.2:5000/api"; 
const API_URL_ESTADISTICAS = `${BASE_URL}/actividad/estadisticas`; 

const COLORS = {
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
    chart1: '#3498db', chart2: '#e74c3c', chart3: '#2ecc71', chart4: '#f39c12',
};

const INITIAL_STATS = {
    totalSesiones: 0,
    totalKm: 0,
    totalCalorias: 0,
    actividadMasComun: 'N/A',
    sesionesRecientes: [],
    caloriasPorDia: [],
};

const formatDateToDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const parts = date.toISOString().split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateToQuery = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
};

const processLineChartData = (data) => {
    const defaultData = {
        labels: ["N/A"],
        datasets: [{ data: [0] }],
    };
    
    // Protección aquí para caloriasPorDia
    if (!data || !data.caloriasPorDia || data.caloriasPorDia.length === 0) {
        return defaultData;
    }

    const sortedData = [...data.caloriasPorDia].sort((a, b) => new Date(a._id) - new Date(b._id));

    const labels = sortedData.map(item => formatDateToDisplay(item._id).slice(0, 5));
    const calorias = sortedData.map(item => item.totalCalorias);

    return {
        labels: labels.length > 0 ? labels : ["Hoy"], 
        datasets: [{
            data: calorias.length > 0 ? calorias : [0],
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        }],
    };
};

const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(42, 140, 74, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
        borderRadius: 16
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: COLORS.primary
    },
    propsForLabels: {
        fontSize: 10,
    },
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
    const [lineChartData, setLineChartData] = useState(processLineChartData(null));

    const handleDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            if (pickerFor === 'inicio') {
                setFechaInicio(selectedDate);
            } else if (pickerFor === 'fin') {
                setFechaFin(selectedDate);
            }
        }
    };

    const showDatepicker = (forDate) => {
        setPickerFor(forDate);
        setShowPicker(true);
    };

    const clearDateFilter = () => {
        setFechaInicio(null);
        setFechaFin(null);
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
            Alert.alert("Error", "No se pudieron cargar las estadísticas.");
            setEstadisticas(INITIAL_STATS); // Restablecer a estado seguro
            setLineChartData(processLineChartData(null));
        } finally {
            setIsLoading(false);
        }
    }, [idUsuario, fechaInicio, fechaFin]);

    useFocusEffect(
        useCallback(() => {
            fetchEstadisticas();
            return () => { };
        }, [fetchEstadisticas]) 
    );

    const toggleSesionExpansion = (id) => {
        setExpandedSesionId(expandedSesionId === id ? null : id);
    };

    const renderMetricaCard = (title, value, unit, icon) => (
        <View style={styles.metricCard}>
            <Ionicons name={icon} size={24} color={COLORS.primary} />
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricTitle}>{title} (<Text style={{ fontWeight: 'normal' }}>{unit}</Text>)</Text>
        </View>
    );

    const renderActividadDetail = (actividad) => {
        let details = '';
        if (actividad.tipo === 'Actividad Física') {
            const tiempoText = actividad.tiempo ? `${actividad.tiempo} min.` : '';
            const distanciaText = actividad.distancia ? `${actividad.distancia} km` : '';
            details = [tiempoText, distanciaText].filter(Boolean).join(' / ');
        } else if (actividad.tipo === 'Entrenamiento') {
            const seriesReps = (actividad.series && actividad.repeticiones) ? `${actividad.series} series x ${actividad.repeticiones} reps` : '';
            const pesoText = actividad.peso ? ` - ${actividad.peso} kg` : '';
            const tiempoText = actividad.tiempo ? `${actividad.tiempo} min.` : '';
            details = [seriesReps, pesoText, tiempoText].filter(Boolean).join(' | ');
        }
        
        const key = actividad._id || actividad.id || Math.random().toString();

        return (
            <View key={key} style={styles.actividadDetailCard}>
                <Text style={styles.actividadName}>{actividad.nombre}</Text>
                <Text style={styles.actividadStats}>{details}</Text>
                <Text style={styles.actividadCalorias}>{actividad.calorias?.toFixed(1) || 0} kcal</Text>
            </View>
        );
    };

    const renderSesionItem = ({ item }) => {
        const isExpanded = item._id === expandedSesionId;
        // La corrección anterior ya estaba aquí: usa [] si actividades es undefined o null
        const actividadesArray = item.actividades || [];
        const totalSesionCalorias = actividadesArray.reduce((sum, act) => sum + (act.calorias || 0), 0).toFixed(1);

        return (
            <View style={styles.sesionCard}>
                <TouchableOpacity style={styles.sesionHeader} onPress={() => toggleSesionExpansion(item._id)}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sesionDate}>Fecha: {formatDateToDisplay(item.fecha)}</Text>
                        <View style={styles.sesionSummary}>
                            <Ionicons name="flash-outline" size={14} color={COLORS.error} />
                            <Text style={styles.sesionCalorias}>{totalSesionCalorias} kcal</Text>
                            <Ionicons name="list-outline" size={14} color={COLORS.text} style={{ marginLeft: 15 }} />
                            <Text style={styles.sesionText}>{actividadesArray.length} Actividades</Text>
                        </View>
                    </View>
                    <Ionicons 
                        name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
                        size={24} 
                        color={COLORS.primary} 
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {actividadesArray.map(act => renderActividadDetail(act))}
                    </View>
                )}
            </View>
        );
    };

    // CORRECCIÓN ADICIONAL AQUÍ (Refuerzo)
    const sesionesRecientesSeguras = estadisticas.sesionesRecientes || [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            <Text style={styles.headerTitle}>Tu Progreso en Actividad Física</Text>
            <Text style={styles.headerSubtitle}>Métricas calculadas en base a las sesiones registradas.</Text>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando estadísticas...</Text>
                </View>
            )}
            
            <View style={styles.metricsGrid}>
                {renderMetricaCard("Sesiones Totales", estadisticas.totalSesiones.toString(), "Unidades", "calendar-outline")}
                {renderMetricaCard("Km Recorridos", estadisticas.totalKm.toFixed(1), "km", "walk-outline")}
                {renderMetricaCard("Kcal Quemadas", estadisticas.totalCalorias.toFixed(0), "kcal", "flame-outline")}
                {renderMetricaCard("Más Común", estadisticas.actividadMasComun, "", "fitness-outline")}
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Calorías Quemadas Diarias</Text>
                <LineChart
                    data={lineChartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
            </View>
            
            <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Filtro de Historial</Text>
                <View style={styles.datePickerRow}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => showDatepicker('inicio')}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.dateText}>Inicio: {fechaInicio ? formatDateToDisplay(fechaInicio) : 'Seleccionar'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.dateButton} onPress={() => showDatepicker('fin')}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.dateText}>Fin: {fechaFin ? formatDateToDisplay(fechaFin) : 'Seleccionar'}</Text>
                    </TouchableOpacity>
                </View>
                
                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={pickerFor === 'inicio' ? (fechaInicio || new Date()) : (fechaFin || new Date())}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}
                
                {(fechaInicio || fechaFin) && (
                    <TouchableOpacity onPress={clearDateFilter} style={styles.clearFilterButton}>
                        <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                        <Text style={styles.clearFilterText}>Limpiar Filtros de Fecha</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Historial de Sesiones ({estadisticas.totalSesiones} en total)</Text>
                
                {/* APLICACIÓN DEL REFUERZO DE SEGURIDAD EN LA LONGITUD */}
                {sesionesRecientesSeguras.length > 0 ? (
                    <FlatList
                        data={sesionesRecientesSeguras}
                        renderItem={renderSesionItem}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                    />
                ) : (
                    <Text style={styles.emptyText}>No hay sesiones registradas en este período.</Text>
                )}
            </View>
            
            <View style={{ height: 50 }} />

        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    contentContainer: { padding: 20 },
    
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginBottom: 5 },
    headerSubtitle: { fontSize: 14, color: COLORS.text, marginBottom: 20 },
    
    loadingOverlay: { paddingVertical: 30, alignItems: 'center' },
    loadingText: { marginTop: 10, color: COLORS.text },

    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    metricCard: { 
        width: '48%', 
        backgroundColor: COLORS.lighter, 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 10, 
        borderLeftWidth: 4, 
        borderLeftColor: COLORS.secondary 
    },
    metricValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
    metricTitle: { fontSize: 13, color: COLORS.text, marginTop: 5 },
    
    chartContainer: { 
        backgroundColor: COLORS.lighter, 
        borderRadius: 12, 
        padding: 10, 
        marginBottom: 20, 
        elevation: 2 
    },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, margin: 10, textAlign: 'center' },
    chart: { 
        marginVertical: 8,
        borderRadius: 8,
    },

    filterContainer: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: COLORS.light, paddingBottom: 15 },
    filterTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    datePickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    dateButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.white, 
        padding: 10, 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: COLORS.light,
        width: '48%',
    },
    dateText: { marginLeft: 5, color: COLORS.text, fontSize: 13 },
    clearFilterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 5, marginTop: 5 },
    clearFilterText: { marginLeft: 5, color: COLORS.error, fontWeight: '600' },

    historyContainer: { marginBottom: 20 },
    historyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    emptyText: { textAlign: 'center', color: COLORS.text, fontStyle: 'italic', padding: 20 },
    
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
    actividadCalorias: { fontSize: 13, fontWeight: 'bold', color: COLORS.error, textAlign: 'right', marginTop: -20 },
});

export default EstadisticasScreen;