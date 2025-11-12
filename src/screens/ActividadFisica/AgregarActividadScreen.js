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
import { Ionicons } from '@expo/vector-icons'; 



const BASE_URL = 'http://10.0.2.2:5000/api/actividad';
const API_URL_SESION = `${BASE_URL}/sesion`; 

const COLORS = { 
    primary: '#2a8c4a', secondary: '#64c27b', light: '#9bfab0', 
    lighter: '#d0fdd7', white: '#ffffff', text: '#333333', error: '#e74c3c', 
}; 

// Factores de estimación calórica (Kcal por unidad base - simplificado)
const CALORIE_FACTORS = { 
    ACTIVITY_TIME: 6.0, 
    RUNNING_DISTANCE: 65.0, 
    WEIGHT_TRAINING_TIME: 8.0, 
    BODYWEIGHT_TIME: 7.0, 
};



export default function AgregarActividadScreen({ navigation, route }) {
    
    const { sesionId } = route.params || {}; 
    
    const [selectedTipo, setSelectedTipo] = useState('Actividad Física'); 
    
    // --- Estado para Actividad Física ---
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [distancia, setDistancia] = useState('');
    const [tiempo, setTiempo] = useState('');
    
    // --- Estado para Entrenamiento ---
    const [entrenamientoSeleccionado, setEntrenamientoSeleccionado] = useState(null);
    const [series, setSeries] = useState('');
    const [repeticiones, setRepeticiones] = useState('');
    const [peso, setPeso] = useState('');
    const [conPesas, setConPesas] = useState(false);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [catalogo, setCatalogo] = useState({
        tiposActividad: [], 
        entrenamientosPredefinidos: [], 
    });


 
    const fetchCatalogo = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const response = await axios.get(`${BASE_URL}/catalogo`);
            setCatalogo(response.data);
            
            if (response.data.tiposActividad.length > 0) {
                setActividadSeleccionada(response.data.tiposActividad[0].value);
            }
            if (response.data.entrenamientosPredefinidos.length > 0) {
                setEntrenamientoSeleccionado(response.data.entrenamientosPredefinidos[0]);
            }
        } catch (error) {
            console.error("Error fetching activity catalog:", error);
            Alert.alert("Error de Conexión", "No se pudo cargar el catálogo de actividades.");
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalogo();
    }, [fetchCatalogo]);


    
    const estimarCalorias = (tipo) => {
        let calorias = 0;
        
        if (tipo === 'Actividad Física') {
            const t = parseFloat(tiempo) || 0;
            const d = parseFloat(distancia) || 0;
            
            if (d > 0) {
                calorias += d * CALORIE_FACTORS.RUNNING_DISTANCE; 
            } else if (t > 0) {
                calorias += t * CALORIE_FACTORS.ACTIVITY_TIME;
            }

        } else if (tipo === 'Entrenamiento') {
            const t = parseFloat(tiempo) || 0; 
            
            if (t > 0) {
                if (conPesas) {
                    calorias += t * CALORIE_FACTORS.WEIGHT_TRAINING_TIME;
                } else {
                    calorias += t * CALORIE_FACTORS.BODYWEIGHT_TIME;
                }
            } else {
                const s = parseFloat(series) || 0;
                const r = parseFloat(repeticiones) || 0;
                calorias += s * r * 0.5;
            }
        }
        
        return Math.max(0, calorias); 
    };


  
    const handleGuardarActividad = async () => {
        let nombreActividad;
        let actividadValida = false;
        let dataToSave = { tipo: selectedTipo };

        if (!sesionId) {
            Alert.alert("Error", "No se encontró el ID de la sesión. Vuelve a la pantalla anterior y crea una sesión primero.");
            return;
        }

        // 1. CONSTRUIR OBJETO DE DATOS
        if (selectedTipo === 'Actividad Física') {
            nombreActividad = catalogo.tiposActividad.find(t => t.value === actividadSeleccionada)?.label;
            
            if ((parseFloat(tiempo) || 0) > 0 || (parseFloat(distancia) || 0) > 0) {
                actividadValida = true;
                dataToSave = {
                    ...dataToSave,
                    nombre: nombreActividad || 'Actividad Desconocida',
                    tiempo: parseFloat(tiempo) || 0,
                    distancia: parseFloat(distancia) || 0,
                    tipoActividad: actividadSeleccionada, 
                };
            }

        } else if (selectedTipo === 'Entrenamiento') {
            nombreActividad = entrenamientoSeleccionado;

            if ((parseFloat(series) || 0) > 0 || (parseFloat(repeticiones) || 0) > 0 || (parseFloat(tiempo) || 0) > 0) {
                actividadValida = true;
                dataToSave = {
                    ...dataToSave,
                    nombre: nombreActividad || 'Entrenamiento Desconocido',
                    conPesas: conPesas,
                    series: parseInt(series) || 0,
                    repeticiones: parseInt(repeticiones) || 0,
                    peso: parseFloat(peso) || 0,
                    tiempo: parseFloat(tiempo) || 0, 
                };
            }
        }
        
       
        if (!actividadValida) {
            Alert.alert("Error de Datos", "Debes ingresar datos para la actividad.");
            return;
        }
        
        dataToSave.calorias = estimarCalorias(selectedTipo);

       
        setIsSaving(true); 
        try {
           
            await axios.put(`${API_URL_SESION}/${sesionId}`, {
                actividades: [dataToSave] 
            });

            
            Alert.alert("Éxito", "Actividad guardada. Recargando sesión.");
            navigation.navigate('NuevaSesion');

        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la actividad en la base de datos. Asegúrate de que el backend esté corriendo.");
            console.error("Error al guardar actividad:", error.response?.data || error);
        } finally {
            setIsSaving(false);
        }
    };

  
    const renderFormulario = () => {
        if (selectedTipo === 'Actividad Física') {
            return (
                <View style={styles.formSection}>
                    <Text style={styles.label}>Tipo de Actividad</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={actividadSeleccionada}
                            onValueChange={(itemValue) => setActividadSeleccionada(itemValue)}
                            style={styles.picker}
                        >
                            {catalogo.tiposActividad.map((tipo) => (
                                <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
                            ))}
                        </Picker>
                    </View>
                    
                    <Text style={styles.label}>Distancia (km)</Text>
                    <TextInput
                        style={styles.input}
                        value={distancia}
                        onChangeText={setDistancia}
                        keyboardType="numeric"
                        placeholder="Ej: 5.5"
                    />

                    <Text style={styles.label}>Tiempo (minutos)</Text>
                    <TextInput
                        style={styles.input}
                        value={tiempo}
                        onChangeText={setTiempo}
                        keyboardType="numeric"
                        placeholder="Ej: 30"
                    />
                    <Text style={styles.suggestionText}>Introduce al menos uno de los dos.</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.formSection}>
                    <Text style={styles.label}>Ejercicio/Entrenamiento</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={entrenamientoSeleccionado}
                            onValueChange={(itemValue) => setEntrenamientoSeleccionado(itemValue)}
                            style={styles.picker}
                        >
                            {catalogo.entrenamientosPredefinidos.map((entrenamiento, index) => (
                                <Picker.Item key={index} label={entrenamiento} value={entrenamiento} />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Con Pesas/Resistencia</Text>
                        <Switch
                            trackColor={{ false: COLORS.light, true: COLORS.secondary }}
                            thumbColor={conPesas ? COLORS.primary : COLORS.white}
                            onValueChange={setConPesas}
                            value={conPesas}
                        />
                    </View>

                    <View style={styles.detailInputs}>
                        <Text style={styles.label}>Series</Text>
                        <TextInput
                            style={styles.input}
                            value={series}
                            onChangeText={setSeries}
                            keyboardType="numeric"
                            placeholder="Ej: 3"
                        />
                        <Text style={styles.label}>Repeticiones por Serie</Text>
                        <TextInput
                            style={styles.input}
                            value={repeticiones}
                            onChangeText={setRepeticiones}
                            keyboardType="numeric"
                            placeholder="Ej: 10"
                        />
                        {conPesas && (
                            <>
                                <Text style={styles.label}>Peso (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={peso}
                                    onChangeText={setPeso}
                                    keyboardType="numeric"
                                    placeholder="Ej: 40.5"
                                />
                            </>
                        )}
                        <Text style={styles.label}>Tiempo Total (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            value={tiempo}
                            onChangeText={setTiempo}
                            keyboardType="numeric"
                            placeholder="Opcional. Ej: 20"
                        />
                        <Text style={styles.suggestionText}>Opcional: Si no especificas series/reps, usa el tiempo total.</Text>
                    </View>
                </View>
            );
        }
    };


 
    if (isLoadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando catálogo...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Añadir Actividad</Text>
                <Text style={styles.headerSubtitle}>Selecciona el tipo de actividad y sus detalles.</Text>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    style={[styles.toggleButton, selectedTipo === 'Actividad Física' && styles.toggleButtonActive]}
                    onPress={() => setSelectedTipo('Actividad Física')}
                    disabled={isSaving}
                >
                    <Text style={[styles.toggleText, selectedTipo === 'Actividad Física' && styles.toggleTextActive]}>
                        <Ionicons name="walk" size={16} color={selectedTipo === 'Actividad Física' ? COLORS.white : COLORS.text} /> Actividad Física
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.toggleButton, selectedTipo === 'Entrenamiento' && styles.toggleButtonActive]}
                    onPress={() => setSelectedTipo('Entrenamiento')}
                    disabled={isSaving}
                >
                    <Text style={[styles.toggleText, selectedTipo === 'Entrenamiento' && styles.toggleTextActive]}>
                        <Ionicons name="barbell" size={16} color={selectedTipo === 'Entrenamiento' ? COLORS.white : COLORS.text} /> Entrenamiento
                    </Text>
                </TouchableOpacity>
            </View>

            {renderFormulario()}

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                    Calorías Estimadas: 
                    <Text style={styles.summaryValue}> {estimarCalorias(selectedTipo).toFixed(1)} kcal</Text>
                </Text>
            </View>

            <TouchableOpacity 
                style={[styles.saveButton, isSaving && {opacity: 0.6}]}
                onPress={handleGuardarActividad}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.saveButtonText}>Guardar en Sesión</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    header: {
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.text,
        marginTop: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.light,
    },
    toggleButton: {
        flex: 1,
        padding: 15,
        backgroundColor: COLORS.lighter,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toggleText: {
        textAlign: 'center', 
        fontWeight: '500', 
        color: COLORS.text,
    },
    toggleTextActive: { 
        color: COLORS.white, 
        fontWeight: 'bold',
    },
    formSection: { 
        marginBottom: 20, 
        padding: 15, 
        backgroundColor: COLORS.lighter, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: COLORS.light 
    },
    label: { 
        fontSize: 16, 
        fontWeight: '600', 
        marginTop: 10, 
        marginBottom: 5, 
        color: COLORS.text 
    },
    input: { 
        borderWidth: 1, 
        borderColor: COLORS.light, 
        padding: 10, 
        borderRadius: 5, 
        fontSize: 16, 
        backgroundColor: COLORS.white, 
        color: COLORS.text,
        marginBottom: 10, 
    },
    pickerContainer: { 
        borderWidth: 1, 
        borderColor: COLORS.light, 
        borderRadius: 5, 
        marginBottom: 10, 
        backgroundColor: COLORS.white, 
        overflow: 'hidden' 
    },
    picker: { 
        height: 50, 
        width: '100%', 
        color: COLORS.text 
    },
    switchRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10, 
        paddingVertical: 5 
    },
    detailInputs: { 
        marginTop: 10 
    },
    suggestionText: { 
        fontSize: 12, 
        color: COLORS.secondary,
        marginBottom: 10,
    },
    summaryContainer: {
        backgroundColor: COLORS.lighter,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.primary,
    },
    summaryText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    summaryValue: {
        fontWeight: 'bold',
        color: COLORS.error,
    },
    saveButton: { 
        backgroundColor: COLORS.primary, 
        padding: 15, 
        borderRadius: 8, 
        marginTop: 20, 
        marginBottom: 50, 
        elevation: 3 
    },
    saveButtonText: { 
        color: COLORS.white, 
        fontSize: 18, 
        fontWeight: 'bold', 
        textAlign: 'center' 
    },
});