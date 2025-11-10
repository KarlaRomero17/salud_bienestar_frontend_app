import React, { useState, useEffect, useCallback } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Switch, 
    Alert,
    ActivityIndicator, 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios'; 
import { Ionicons } from '@expo/vector-icons'; // Importamos Ionicons

// ⚠️ AJUSTA LA URL BASE DE TU BACKEND (usando la que definiste)
const BASE_URL = 'http://192.168.1.148:5000/api/actividad';

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
    RUNNING_DISTANCE: 65.0, // Kcal por KM estimado (depende del peso del usuario)
    WEIGHT_TRAINING_TIME: 8.0, // Kcal por minuto de entrenamiento con pesas
    BODYWEIGHT_TIME: 7.0, // Kcal por minuto de calistenia/cuerpo
};

// ➡️ FUNCIÓN DE CÁLCULO DE CALORÍAS (Fuera del componente para evitar recreación innecesaria)
const calculateApproxCalories = (tipoRegistro, currentTipoActividad, currentDistancia, currentTime, currentEsConPesas) => {
    let baseCalories = 0;
    const distanceVal = parseFloat(currentDistancia) || 0;
    const timeVal = parseFloat(currentTime) || 0;
    
    if (tipoRegistro === 'Actividad Física') {
        if (timeVal > 0) {
            if (['correr', 'trotar', 'ciclismo_exterior'].includes(currentTipoActividad) && distanceVal > 0) {
                 // Usa distancia para ejercicios de recorrido
                 baseCalories = distanceVal * CALORIE_FACTORS.RUNNING_DISTANCE; 
            } else {
                // Usa tiempo para otros ejercicios de AF
                baseCalories = timeVal * CALORIE_FACTORS.ACTIVITY_TIME;
            }
        }
    } else { // Entrenamiento
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

export default function AgregarActividadScreen({ navigation, route }) {
    // Parámetros de edición o adición
    // Se añade un valor por defecto seguro para route.params
    const { actividadParaEditar = {}, indexActividad } = route.params || {};
    const isEditing = indexActividad !== undefined;

    // --- ESTADOS PARA LA DATA DEL BACKEND ---
    const [tiposActividad, setTiposActividad] = useState([]);
    const [entrenamientosPredefinidos, setEntrenamientosPredefinidos] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- ESTADOS DEL FORMULARIO ---
    const [tipoRegistro, setTipoRegistro] = useState(actividadParaEditar.tipo || 'Actividad Física'); 
    const isActivity = tipoRegistro === 'Actividad Física';
    
    // Actividad Física
    const [tipoActividad, setTipoActividad] = useState(actividadParaEditar.tipoActividad || '');
    const [distancia, setDistancia] = useState(actividadParaEditar.distancia?.toString() || '');
    
    // Entrenamiento
    const [esConPesas, setEsConPesas] = useState(actividadParaEditar.conPesas ?? false);
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(actividadParaEditar.nombre || '');
    const [busquedaEjercicio, setBusquedaEjercicio] = useState(''); 
    const [series, setSeries] = useState(actividadParaEditar.series?.toString() || '');
    const [repeticiones, setRepeticiones] = useState(actividadParaEditar.repeticiones?.toString() || '');
    const [peso, setPeso] = useState(actividadParaEditar.peso?.toString() || ''); 
    
    // Comunes
    const [tiempo, setTiempo] = useState(actividadParaEditar.tiempo?.toString() || ''); // Usado en AF y Entrenamiento sin pesas
    const [caloriasManual, setCaloriasManual] = useState(actividadParaEditar.calorias?.toString() || '');
    const [caloriasCalculadas, setCaloriasCalculadas] = useState(0);

    // --- LÓGICA DE CARGA DE DATOS DESDE EL BACKEND ---
    useEffect(() => {
        const fetchActividadData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/catalogo`); // LLAMADA AL BACKEND
                const { TIPOS_ACTIVIDAD_FISICA, ENTRENAMIENTOS_PREDEFINIDOS } = response.data;
                
                setTiposActividad(TIPOS_ACTIVIDAD_FISICA);
                setEntrenamientosPredefinidos(ENTRENAMIENTOS_PREDEFINIDOS);

                // Inicializar tipoActividad si es nuevo registro o edición sin valor
                if (!tipoActividad && TIPOS_ACTIVIDAD_FISICA.length > 0) {
                   setTipoActividad(actividadParaEditar.tipoActividad || TIPOS_ACTIVIDAD_FISICA[0].value);
                }

            } catch (error) {
                console.error("Error al cargar el catálogo de actividades:", error);
                // Si falla, usa un valor vacío para que la app no se rompa (aunque no tendrá datos)
                setTiposActividad([]); 
                setEntrenamientosPredefinidos({});
                Alert.alert("Error", "No se pudo cargar el catálogo de actividades. Inténtalo más tarde.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchActividadData();
    }, []); // Se ejecuta solo al montar

    // --- LÓGICA DE CÁLCULO DE CALORÍAS AUTOMÁTICO ---
    useEffect(() => {
        // Recalcular calorías cuando cambian los valores que afectan el cálculo
        const calculated = calculateApproxCalories(
            tipoRegistro, 
            tipoActividad, 
            distancia, 
            tiempo, 
            esConPesas
        );
        setCaloriasCalculadas(calculated);
    }, [tipoRegistro, tipoActividad, distancia, tiempo, esConPesas]);
    
    // Filtro de ejercicios por búsqueda (usa la data cargada del backend)
    const ejerciciosFiltrados = Object.values(entrenamientosPredefinidos)
        .flat()
        .filter(ej => 
            ej.toLowerCase().includes(busquedaEjercicio.toLowerCase())
        );

    // Obtener valor de calorías
    const getCaloriasValue = () => caloriasManual ? caloriasManual : (caloriasCalculadas > 0 ? caloriasCalculadas.toString() : '');
    
    // ➡️ LÓGICA DE GUARDAR: Envía la actividad de vuelta a NuevaSesionScreen
    const handleGuardar = () => {
        const caloriasFinal = getCaloriasValue();
        
        // 1. Validaciones mínimas
        if (!caloriasFinal || parseFloat(caloriasFinal) <= 0) {
            Alert.alert('Error', 'Las calorías son un campo obligatorio.');
            return;
        }

        let nuevoRegistro = {
            tipo: tipoRegistro,
            calorias: parseFloat(caloriasFinal),
            nombre: '', // Se establece más abajo
        };

        if (tipoRegistro === 'Actividad Física') {
             if (!tipoActividad || !distancia || !tiempo) {
                 Alert.alert('Error', 'Por favor, complete todos los campos de Actividad Física (Tipo, Distancia y Tiempo).');
                 return;
             }
             nuevoRegistro = {
                 ...nuevoRegistro,
                 nombre: tiposActividad.find(t => t.value === tipoActividad)?.label || tipoActividad, 
                 tipoActividad: tipoActividad,
                 distancia: parseFloat(distancia),
                 tiempo: parseFloat(tiempo), 
             };
         } else { // Entrenamiento
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
                     tiempo: null, // Si es con pesas, el tiempo es opcional
                 };
             } else { // Sin Pesas (Calistenia, HIIT, Core)
                 if (!tiempo) {
                      Alert.alert('Error', 'Por favor, ingrese el tiempo de duración.');
                      return;
                 }
                 nuevoRegistro = {
                     ...nuevoRegistro,
                     tiempo: parseFloat(tiempo), 
                     series: null, repeticiones: null, peso: null,
                 };
             }
         }
        
        // Pasamos la nueva actividad y el índice de vuelta por navigation params
        navigation.navigate('NuevaSesion', { 
            nuevaActividad: nuevoRegistro, 
            indexActividad: isEditing ? indexActividad : undefined 
        });
    };

    // --- RENDERIZADO CONDICIONAL DE CARGA ---
    if (isLoadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.text }}>Cargando catálogo de ejercicios...</Text>
            </View>
        );
    }
    
    // --- RENDERIZADO DEL FORMULARIO PRINCIPAL ---
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>{isEditing ? 'Editar Actividad' : 'Agregar Nueva Actividad'}</Text>
            
            {/* --- Controles de Toggle Tipo de Registro --- */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    style={[styles.toggleButton, isActivity && styles.toggleActive]} 
                    onPress={() => setTipoRegistro('Actividad Física')}
                >
                    <Text style={[styles.toggleText, isActivity && styles.toggleTextActive]}>Actividad Física</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.toggleButton, !isActivity && styles.toggleActive]} 
                    onPress={() => setTipoRegistro('Entrenamiento')}
                >
                    <Text style={[styles.toggleText, !isActivity && styles.toggleTextActive]}>Entrenamiento</Text>
                </TouchableOpacity>
            </View>

            {/* --- Formulario de Actividad Física (AF) --- */}
            {isActivity && (
                <View style={styles.formSection}>
                    <Text style={styles.label}>Tipo de Actividad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={tipoActividad}
                            onValueChange={(itemValue) => setTipoActividad(itemValue)}
                            style={styles.picker}
                            itemStyle={{ color: COLORS.text }}
                        >
                            {tiposActividad.map(t => (
                                <Picker.Item key={t.value} label={t.label} value={t.value} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Distancia (km)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Ej: 5.0"
                        value={distancia}
                        onChangeText={setDistancia}
                    />
                    
                    <Text style={styles.label}>Tiempo (minutos)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Ej: 30"
                        value={tiempo}
                        onChangeText={setTiempo}
                    />
                </View>
            )}

            {/* --- Formulario de Entrenamiento --- */}
            {!isActivity && (
                <View style={styles.formSection}>
                    
                    {/* Filtro de Pesas */}
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Entrenamiento con Pesas/Máquinas</Text>
                        <Switch
                            trackColor={{ false: COLORS.light, true: COLORS.secondary }}
                            thumbColor={esConPesas ? COLORS.primary : COLORS.white}
                            onValueChange={setEsConPesas}
                            value={esConPesas}
                        />
                    </View>
                    
                    {/* Buscador de Ejercicio */}
                    <Text style={styles.label}>Buscar Ejercicio</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Sentadillas, Press de banca, Yoga..."
                        value={busquedaEjercicio}
                        onChangeText={setBusquedaEjercicio}
                    />
                    
                    {/* Lista de Resultados de Búsqueda con Scroll Interno */}
                    <View style={styles.chipsContainer}>
                        <ScrollView
                            nestedScrollEnabled={true} 
                            contentContainerStyle={styles.rowWrapper} 
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
                    
                    {/* Mostrar Ejercicio Seleccionado */}
                    {ejercicioSeleccionado ? (
                        <View style={styles.selectedView}>
                            <Text style={styles.selectedLabel}>Seleccionado:</Text>
                            <Text style={styles.selectedValueText}>{ejercicioSeleccionado}</Text>
                        </View>
                    ) : (
                        <View style={styles.placeholderSelectedView}>
                            <Text style={styles.placeholderText}>Seleccione un ejercicio de la lista superior.</Text>
                        </View>
                    )}

                    {/* Campos Específicos para Entrenamiento */}
                    <View style={styles.detailInputs}>
                        {esConPesas ? (
                            // Campos para Entrenamiento CON PESAS
                            <>
                                <Text style={styles.label}>Series</Text>
                                <TextInput style={styles.input} keyboardType="numeric" placeholder="Ej: 3" value={series} onChangeText={setSeries} />
                                
                                <Text style={styles.label}>Repeticiones por Serie</Text>
                                <TextInput style={styles.input} keyboardType="numeric" placeholder="Ej: 10" value={repeticiones} onChangeText={setRepeticiones} />
                                
                                <Text style={styles.label}>Peso (kg)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" placeholder="Ej: 20.5" value={peso} onChangeText={setPeso} />
                            </>
                        ) : (
                            // Campos para Entrenamiento SIN PESAS (Usa solo tiempo)
                            <>
                                <Text style={styles.label}>Tiempo (minutos)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" placeholder="Ej: 45" value={tiempo} onChangeText={setTiempo} />
                                <Text style={styles.suggestionText}>Usado para Calistenia, HIIT, Yoga, Core, etc.</Text>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* --- Sección Común de Calorías --- */}
            <View style={styles.formSection}>
                <Text style={styles.label}>Calorías Estimadas</Text>
                {caloriasCalculadas > 0 && (
                    <Text style={[styles.selectedValueText, { color: COLORS.secondary, marginBottom: 10 }]}>
                       Aprox. **{caloriasCalculadas} Kcal**
                    </Text>
                )}
                
                <Text style={styles.label}>Calorías (Manual / Final)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder={`Ingrese manualmente o use ${caloriasCalculadas} Kcal`}
                    value={caloriasManual}
                    onChangeText={setCaloriasManual}
                />
            </View>

            {/* --- Botón Guardar --- */}
            <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>{isEditing ? 'Actualizar Actividad' : 'Guardar en Sesión'}</Text>
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
    
    // --- ESTILOS PARA EL SCROLL INTERNO ---
    chipsContainer: {
        marginTop: 10,
        marginBottom: 15,
        maxHeight: 220, // Limita la altura 
        borderWidth: 1,
        borderColor: COLORS.light,
        borderRadius: 8,
        padding: 5,
        backgroundColor: COLORS.white,
    },
    rowWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
    },
    chip: {
        width: '48%', 
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: COLORS.lighter, 
        borderWidth: 1,
        borderColor: COLORS.secondary,
        alignItems: 'center',
        marginBottom: 8, 
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
    // Estilo para el contenedor de carga
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    }
});