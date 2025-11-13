import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SERVER_URI } from '@env';

const BASE_URL = Platform.OS == 'android' ? `${SERVER_URI}`  : 'http://localhost:5000'

export default function NewPublicationScreen() {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();
    const route = useRoute();
    const publicacion = route.params?.publicacion;  //obtiene la publi si viene de editar

    const [titulo, setTitulo] = useState(publicacion ? publicacion.titulo : "");
    const [content, setContent] = useState(publicacion ? publicacion.contenido : "")
    const [loading, setLoading] = useState(false);


    useLayoutEffect(() => {
        navigation.setOptions({
            title: publicacion ? "Editar publicación" : "Nueva publicación",
        });
    }, [navigation, publicacion]);

    useEffect(() => {
        if (publicacion) {
            setTitulo(publicacion.titulo);
            setContent(publicacion.contenido);
        }
    }, [publicacion]);


    const guardarPublicacion = async () => {
        if (!titulo || !content) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        try {
            setLoading(true);
            if (publicacion) {
                // Si existe, EDITAR
                await axios.put(`${BASE_URL}/api/publicaciones/${publicacion._id}`, {
                    titulo,
                    contenido: content,
                    autor: user?.nombre || ''
                });
                Alert.alert('Éxito', 'Publicación actualizada correctamente ✏️');
            } else {
                // Si no existe, CREAR
                const nuevaPublicacion = {
                    titulo,
                    contenido: content,
                    autor: user?.nombre || '',
                };
                await axios.post(`${BASE_URL}/api/publicaciones`, nuevaPublicacion);
                Alert.alert('Éxito', 'Publicación creada correctamente 🎉');
            }
            navigation.goBack();
        } catch (error) {
            console.log('Error al guardar publicación:', error);
            Alert.alert('Error', 'No se pudo guardar la publicación');
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior='height'
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        {/* Autor (solo mostrar) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Autor</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#e5e7eb' }]}
                                value={user?.nombre || ''}
                                editable={false}
                            />
                        </View>

                        {/* Titulo de la Publicación */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Titulo</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Titulo de tu publicación"
                                placeholderTextColor="#999"
                                value={titulo}
                                onChangeText={setTitulo}
                            />
                        </View>

                        {/* Contenido de la Publicación */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Contenido de la publicación</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Escribe aquí tu publicación..."
                                placeholderTextColor="#999"
                                value={content}
                                onChangeText={setContent}
                                multiline={true}       // permite varias líneas
                                numberOfLines={10}      // define una altura inicial
                                textAlignVertical="top" // alinea el texto al inicio
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.postButton, loading && { opacity: 0.6 }]}
                            onPress={guardarPublicacion}
                            disabled={loading}
                        >
                            <Text style={styles.postButtonText}>
                                {loading ? 'Guardando...' : publicacion ? 'Actualizar' : 'Publicar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

}



const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    container: {
        flex: 1,
        paddingTop: 25,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },

    formContainer: {
        paddingHorizontal: 32,
        paddingBottom: 30,
    },

    inputContainer: {
        marginBottom: 50,
    },
    //Titulo publicación
    label: {
        fontSize: 17,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },

    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    //Contenido publicación
    textArea: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
        minHeight: 150, // para hacerlo más grande
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    //Publicar
    postButton: {
        backgroundColor: '#2a8c4a',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#10b981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    postButtonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
})