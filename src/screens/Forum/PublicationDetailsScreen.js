import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import {
    FlatList,
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

//IP del emulador de android studio
const BASE_URL = Platform.OS == 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'

export default function PublicationDetailsScreen() {
    const { user } = useContext(AuthContext);
    const route = useRoute();
    const navigation = useNavigation();
    const { publicacion } = route.params;
    const { id } = route.params;
    const [data, setData] = useState(publicacion || null);
    const [comentarios, setComentarios] = useState([]);
    const [comment, setComment] = useState(''); //nuevo comentario
    const [loading, setLoading] = useState(!publicacion);

    useEffect(() => {
        if (!publicacion && id) {
            // Si solo viene el id, cargamos los datos desde el backend
            const obtenerPublicacion = async () => {
                try {
                    const res = await axios.get(`${BASE_URL}/api/publicaciones/${id}`);
                    setData(res.data);
                } catch (error) {
                    console.log("Error al cargar detalle", error);
                } finally {
                    setLoading(false);
                }
            };
            obtenerPublicacion();
        }
    }, []);

    //Comentarios
    useEffect(() => {
        const obtenerComentarios = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/comentarios/publicacion/${publicacion._id}`);
                setComentarios(res.data);
            } catch (error) {
                console.log('Error al cargar comentarios:', error);
            } finally {
                setLoading(false);
            }
        };
        obtenerComentarios();
    }, [publicacion]);

    // Agregar comentario
    const agregarComentario = async () => {
        if (!comment.trim()) return; // no enviar si está vacío

        try {
            const nueva = {
                contenido: comment,
                autor: user?.nombre || '',
                publicacionId: data._id,
            };
            // Enviar al backend
            const res = await axios.post(`${BASE_URL}/api/comentarios`, nueva);
            // Agregar a la lista local sin recargar
            setComentarios(prev => [res.data.comentario, ...prev]);

            // Limpiar input
            setComment('');
        } catch (error) {
            console.log('Error al agregar comentario:', error);
        }
    };

    // Eliminar comentario
    const eliminarComentario = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/api/comentarios/${id}`);
            setComentarios(comentarios.filter(c => c._id !== id));
        } catch (error) {
            console.log('Error al eliminar comentario:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior='height'
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={{ flex: 1 }}>
                        {/* Título y autor */}
                        <View style={styles.postHeader}>
                            <Text style={styles.title}>{data?.titulo}</Text>
                            <Text style={styles.author}>Por {data?.autor} • {new Date(data?.createdAt).toLocaleDateString()}</Text>
                        </View>

                        {/* Contenido */}
                        <Text style={styles.contenido}>{data?.contenido}</Text>

                        {/* Separador */}
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                        </View>


                        <Text style={styles.subtitle}>Comentarios</Text>

                        {comentarios.length === 0 ? (
                            <Text style={styles.noComments}>Aún no hay comentarios</Text>
                        ) : (
                            <FlatList
                                data={comentarios}
                                keyExtractor={(item) => item._id}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <View style={styles.commentBox}>
                                        <Text style={styles.commentName}>{item.autor}</Text>
                                        <Text style={styles.commentDate}>{new Date(data?.createdAt).toLocaleDateString()}</Text>
                                        <Text style={styles.commentText}>{item.contenido}</Text>

                                        {/* Botones de editar y eliminar solo si es el mismo usuario */}
                                        {user.nombre === item.autor && (
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity onPress={() => eliminarComentario(item._id)}>
                                                    <Ionicons name="trash-outline" size={20} color='red' />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>


                                )}
                            />
                        )}
                    </View>
                </ScrollView>

                {/* Añadir comentario */}
                <View style={styles.addComment}>
                    <TextInput
                        style={styles.input}
                        placeholder="Añadir un comentario..."
                        value={comment}
                        onChangeText={setComment}
                    />
                    <TouchableOpacity onPress={agregarComentario} style={styles.sendButton}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    container: {
        flex: 1,
        paddingTop: 15,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },

    //Encabezado
    postHeader: {
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 5,
    },
    author: {
        fontSize: 14,
        color: "#666",
    },

    //Contenido
    contenido: {
        fontSize: 20,
        textAlign: "justify",
        padding: 10,
        lineHeight: 25,
        marginBottom: 20,
    },

    //Separador
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },

    //Caja de Comentarios
    commentHeader: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        padding: 5
    },
    commentBox: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    commentHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    commentName: {
        fontWeight: "600",
        fontSize: 15,
    },
    commentDate: {
        fontSize: 12,
        color: "#777",
    },
    commentText: {
        fontSize: 14,
        color: "#333",
        margin: 10,
    },

    //Añadir Comentarios
    addComment: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
        padding: 10
    },
    input: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        height: 60
    },
    sendButton: {
        backgroundColor: "#2a8c4a",
        marginLeft: 8,
        padding: 10,
        borderRadius: 20,
    },

    deleteButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },

    subtitle: {
        fontSize: 19,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 15,
        color: '#334155'
    },
    noComments: {
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 10
    }
})