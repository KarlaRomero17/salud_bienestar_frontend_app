// src/screens/ActividadFisica/AgregarActividadScreen.js (FINAL Y CORREGIDO)

import React, { useState, useEffect } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, // <--- SCROLLVIEW PADRE
    TouchableOpacity, 
    TextInput, 
    Switch, 
    Alert,
    // Eliminamos la importación de FlatList ya que la estamos reemplazando
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
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

// Factores de estimación calórica (Kcal por unidad base - simplificado)
const CALORIE_FACTORS = {
    ACTIVITY_TIME: 6.0, 
    RUNNING_DISTANCE: 65.0, 
    WEIGHT_TRAINING_TIME: 8.0,
    BODYWEIGHT_TIME: 7.0,
};

import { 
    TIPOS_ACTIVIDAD_FISICA, 
    ENTRENAMIENTOS_PREDEFINIDOS 
} from '../../constants/ActividadData'; 

// Lógica para combinar categorías sin pesas
const getEjerciciosSinPesas = () => [
    ...ENTRENAMIENTOS_PREDEFINIDOS['Fuerza - Peso Corporal (Calistenia)'],
    ...ENTRENAMIENTOS_PREDEFINIDOS['Cardiovascular y HIIT'],
    ...ENTRENAMIENTOS_PREDEFINIDOS['Movilidad, Core y Estiramientos'],
    ...ENTRENAMIENTOS_PREDEFINIDOS['Rendimiento Específico'],
    ...ENTRENAMIENTOS_PREDEFINIDOS['Rehabilitación / Terapia Física'],
].sort();

// Lógica para combinar categorías con pesas
const getEjerciciosConPesas = () => [
    ...ENTRENAMIENTOS_PREDEFINIDOS['Fuerza - Tren Superior (Pesas)'],
    ...ENTRENAMIENTOS_PREDEFINIDOS['Fuerza - Tren Inferior (Pesas)'],
].sort();


export default function AgregarActividadScreen({ navigation, route }) {
    const { onGoBack } = route.params;

    const [tipoRegistro, setTipoRegistro] = useState('Actividad Física'); 
    const [tipoActividad, setTipoActividad] = useState(TIPOS_ACTIVIDAD_FISICA[0].value);
    const [distancia, setDistancia] = useState('');
    const [tiempo, setTiempo] = useState(''); 
    const [esConPesas, setEsConPesas] = useState(false);
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('');
    const [series, setSeries] = useState('');
    const [repeticiones, setRepeticiones] = useState('');
    const [peso, setPeso] = useState(''); 
    const [busquedaEjercicio, setBusquedaEjercicio] = useState(''); 
    const [caloriasManual, setCaloriasManual] = useState('');
    const [caloriasCalculadas, setCaloriasCalculadas] = useState(0);

    // --- LÓGICA DE CÁLCULO Y FILTRADO (Se mantiene igual) ---
    const calculateApproxCalories = (currentTipoActividad, currentDistancia, currentTime, currentEsConPesas) => {
        let baseCalories = 0;
        const distanceVal = parseFloat(currentDistancia) || 0;
        const timeVal = parseFloat(currentTime) || 0;
        
        if (tipoRegistro === 'Actividad Física') {
            if (timeVal > 0) {
                if (['correr', 'trotar'].includes(currentTipoActividad) && distanceVal > 0) {
                     baseCalories = distanceVal * CALORIE_FACTORS.RUNNING_DISTANCE;
                } else {
                    baseCalories = timeVal * CALORIE_FACTORS.ACTIVITY_TIME;
                }
            }
        } else { 
            if (timeVal > 0) {
                if (currentEsConPesas) {
                    baseCalories = timeVal * CALORIE_FACTORS.WEIGHT_TRAINING_TIME;
                } else {
                    baseCalories = timeVal * CALORIE_FACTORS.BODYWEIGHT_TIME;
                }
            }
        }
        return Math.round(baseCalories);
    };

    useEffect(() => {
        const calculated = calculateApproxCalories(tipoActividad, distancia, tiempo, esConPesas);
        setCaloriasCalculadas(calculated);
    }, [tipoRegistro, tipoActividad, distancia, tiempo, esConPesas]);

    const getCaloriasValue = () => caloriasManual ? caloriasManual : (caloriasCalculadas > 0 ? caloriasCalculadas.toString() : '');
    
    const getEjerciciosBase = () => esConPesas ? getEjerciciosConPesas() : getEjerciciosSinPesas();
    
    const ejerciciosFiltrados = getEjerciciosBase().filter(ej => 
        ej.toLowerCase().includes(busquedaEjercicio.toLowerCase())
    );
    
    const handleGuardar = () => {
        // ... (Lógica de handleGuardar se mantiene igual)
        const caloriasFinal = getCaloriasValue();
        let nuevoRegistro = {
            tipo: tipoRegistro,
            calorias: caloriasFinal ? parseFloat(caloriasFinal) : null,
            fecha: new Date().toISOString(),
        };

         if (tipoRegistro === 'Actividad Física') {
             if (!tipoActividad || !distancia || !tiempo) {
                Alert.alert('Error', 'Por favor, complete todos los campos de Actividad Física.');
                return;
            }
            nuevoRegistro = {
                ...nuevoRegistro,
                nombre: TIPOS_ACTIVIDAD_FISICA.find(t => t.value === tipoActividad).label,
                tipoActividad: tipoActividad,
                distancia: parseFloat(distancia),
                tiempo: parseFloat(tiempo), 
            };
        } else { 
            if (!ejercicioSeleccionado) {
                Alert.alert('Error', 'Por favor, seleccione un ejercicio de entrenamiento.');
                return;
            }
            
            nuevoRegistro = {
                ...nuevoRegistro,
                nombre: ejercicioSeleccionado,
                conPesas: esConPesas,
            };
            
            if (esConPesas) {
                if (!series || !repeticiones || !peso) {
                    Alert.alert('Error', 'Por favor, complete series, repeticiones y peso (kg).');
                    return;
                }
                nuevoRegistro = {
                    ...nuevoRegistro,
                    series: parseInt(series),
                    repeticiones: parseInt(repeticiones),
                    peso: parseFloat(peso),
                };
            } else { 
                if (!tiempo) {
                     Alert.alert('Error', 'Por favor, ingrese el tiempo de duración.');
                    return;
                }
                nuevoRegistro = {
                    ...nuevoRegistro,
                    tiempo: parseFloat(tiempo), 
                };
            }
        }
        
        onGoBack(nuevoRegistro); 
        navigation.goBack(); 
    };

    return (
        // SCROLLVIEW PADRE: Permite desplazar todo el formulario
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Seleccionar Tipo de Registro</Text>
            
            {/* Toggle Actividad Física / Entrenamiento (Se mantiene igual) */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, tipoRegistro === 'Actividad Física' && styles.toggleActive]}
                    onPress={() => { setTipoRegistro('Actividad Física'); setEjercicioSeleccionado(''); setBusquedaEjercicio(''); }}
                >
                    <Text style={[styles.toggleText, tipoRegistro === 'Actividad Física' && styles.toggleTextActive]}>🏃‍♀️ Actividad Física</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, tipoRegistro === 'Entrenamiento' && styles.toggleActive]}
                    onPress={() => { setTipoRegistro('Entrenamiento'); setTipoActividad(TIPOS_ACTIVIDAD_FISICA[0].value); }}
                >
                    <Text style={[styles.toggleText, tipoRegistro === 'Entrenamiento' && styles.toggleTextActive]}>💪 Entrenamiento</Text>
                </TouchableOpacity>
            </View>

            {/* --- Formulario de Actividad Física (Se mantiene igual) --- */}
            {tipoRegistro === 'Actividad Física' && (
                <View style={styles.formSection}>
                    <Text style={styles.label}>Tipo de Actividad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipoActividad}
                            onValueChange={(itemValue) => setTipoActividad(itemValue)}
                            style={styles.picker}
                            itemStyle={{ color: COLORS.text }}
                        >
                            {TIPOS_ACTIVIDAD_FISICA.map(t => (
                                <Picker.Item key={t.value} label={t.label} value={t.value} />
                            ))}
                        </Picker>
                    </View>
                    
                    <Text style={styles.label}>Distancia (km)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={distancia} onChangeText={setDistancia} placeholder="Ej: 5.5" placeholderTextColor="#999"/>
                    <Text style={styles.label}>Tiempo (minutos)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={tiempo} onChangeText={setTiempo} placeholder="Ej: 30" placeholderTextColor="#999"/>
                </View>
            )}

            {/* --- Formulario de Entrenamiento --- */}
            {tipoRegistro === 'Entrenamiento' && (
                <View style={styles.formSection}>
                    {/* Filtro de Pesas (Se mantiene igual) */}
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Con Pesas/Resistencia</Text>
                        <Switch onValueChange={(value) => { setEsConPesas(value); setEjercicioSeleccionado(''); setBusquedaEjercicio(''); }} value={esConPesas} trackColor={{ false: COLORS.light, true: COLORS.secondary }} thumbColor={esConPesas ? COLORS.primary : COLORS.white} />
                    </View>
                    
                    {/* Buscador de Ejercicio (Se mantiene igual) */}
                    <Text style={styles.label}>Buscar Ejercicio</Text>
                    <TextInput style={styles.input} value={busquedaEjercicio} onChangeText={setBusquedaEjercicio} placeholder="Escribe el nombre del ejercicio..." placeholderTextColor="#999"/>

                    {/* Lista de Resultados de Búsqueda con Scroll Interno (CORREGIDO) */}
                    <View style={styles.chipsContainer}>
                        {/* 🟢 USAMOS SCROLLVIEW SIMPLE CON PROPIEDADES DE SCROLL ANIDADO */}
                        <ScrollView
                            nestedScrollEnabled={true} 
                            contentContainerStyle={styles.rowWrapper} // Aplica el flex-wrap a los elementos
                            showsVerticalScrollIndicator={true}
                        >
                            {ejerciciosFiltrados.length > 0 ? (
                                ejerciciosFiltrados.map(item => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.chip,
                                            ejercicioSeleccionado === item && styles.chipSelected,
                                        ]}
                                        onPress={() => setEjercicioSeleccionado(item)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            ejercicioSeleccionado === item && styles.chipTextSelected,
                                        ]}>{item}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.emptySearchText}>No se encontraron ejercicios con ese nombre.</Text>
                            )}
                        </ScrollView>
                    </View>
                    
                    {/* Mostrar Ejercicio Seleccionado y Campos Específicos (Se mantiene igual) */}
                    {ejercicioSeleccionado ? (
                        <View style={styles.selectedView}>
                            <Text style={styles.selectedLabel}>**Ejercicio Seleccionado:**</Text>
                            <Text style={styles.selectedValueText}>{ejercicioSeleccionado}</Text>
                        </View>
                    ) : (
                        <View style={styles.placeholderSelectedView}>
                            <Text style={styles.placeholderText}>Selecciona un ejercicio de la lista superior.</Text>
                        </View>
                    )}


                    <View style={styles.detailInputs}>
                        {esConPesas ? (
                            <>
                                <Text style={styles.label}>Series</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={series} onChangeText={setSeries} placeholder="Ej: 4" placeholderTextColor="#999"/>
                                <Text style={styles.label}>Repeticiones</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={repeticiones} onChangeText={setRepeticiones} placeholder="Ej: 12" placeholderTextColor="#999"/>
                                <Text style={styles.label}>Peso (kg)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={peso} onChangeText={setPeso} placeholder="Ej: 20" placeholderTextColor="#999"/>
                            </>
                        ) : (
                            <View>
                                <Text style={styles.label}>Tiempo (minutos)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={tiempo} onChangeText={setTiempo} placeholder="Ej: 30" placeholderTextColor="#999"/>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Campo común para Calorías (Se mantiene igual) */}
            <Text style={styles.label}>Calorías Aprox. Gastadas {caloriasCalculadas > 0 && `(Est: ${caloriasCalculadas})`}</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={getCaloriasValue()} 
                onChangeText={text => setCaloriasManual(text)} 
                placeholder="Ej: 300"
                placeholderTextColor="#999"
            />
            {caloriasCalculadas > 0 && !caloriasManual && (
                <Text style={styles.suggestionText}>El valor se auto-calculó. Puedes modificarlo si lo deseas.</Text>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>Guardar en Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.white },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: COLORS.text },
    toggleContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: COLORS.lighter, borderRadius: 8, padding: 4 },
    toggleButton: { flex: 1, padding: 10, borderRadius: 8 },
    toggleActive: { backgroundColor: COLORS.primary },
    toggleText: { textAlign: 'center', fontWeight: '500', color: COLORS.text },
    toggleTextActive: { color: COLORS.white, fontWeight: 'bold' },
    formSection: { marginBottom: 20, padding: 15, backgroundColor: COLORS.lighter, borderRadius: 8, borderWidth: 1, borderColor: COLORS.light },
    label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5, color: COLORS.text },
    input: { borderWidth: 1, borderColor: COLORS.light, padding: 10, borderRadius: 5, fontSize: 16, backgroundColor: COLORS.white, color: COLORS.text },
    pickerContainer: { borderWidth: 1, borderColor: COLORS.light, borderRadius: 5, marginBottom: 10, backgroundColor: COLORS.white, overflow: 'hidden' },
    picker: { height: 50, width: '100%', color: COLORS.text },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingVertical: 5 },
    saveButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, marginTop: 20, marginBottom: 50, elevation: 3 },
    saveButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    
    // --- ESTILOS MODIFICADOS PARA EL SCROLL INTERNO ---
    chipsContainer: {
        marginTop: 10,
        marginBottom: 15,
        maxHeight: 220, // Limita la altura (4 filas)
        borderWidth: 1,
        borderColor: COLORS.light,
        borderRadius: 8,
        padding: 5,
        backgroundColor: COLORS.white,
    },
    // Contenedor que maneja el flex-wrap de los chips
    rowWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
    },
    // Ajustamos el chip para que ocupe el 48% y se ajuste en dos columnas con el flex-wrap
    chip: {
        width: '48%', 
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: COLORS.lighter, 
        borderWidth: 1,
        borderColor: COLORS.secondary,
        alignItems: 'center',
        marginBottom: 8, // Espacio entre filas
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        color: COLORS.text,
        textAlign: 'center',
    },
    chipTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    emptySearchText: {
        textAlign: 'center',
        padding: 20,
        color: COLORS.text,
        fontStyle: 'italic',
        width: '100%',
    },
    selectedView: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: COLORS.secondary,
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    placeholderSelectedView: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.light,
    },
    selectedLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.white,
        marginBottom: 5,
    },
    selectedValueText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
    },
    detailInputs: {
        marginTop: 10,
    },
    suggestionText: {
        fontSize: 12,
        color: COLORS.secondary,
        marginTop: 5,
        fontStyle: 'italic',
    },
});