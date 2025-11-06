import { Ionicons } from "@expo/vector-icons";
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


export default function PublicationDetailsScreen() {
    const [comment, setComment] = useState("");
    const comments = [
        {
            id: 1,
            name: "Carlos López",
            date: "10 de mayo",
            text: "Excelentes consejos, Sofía. La planificación de comidas es algo que realmente me ha ayudado a mantener una dieta más saludable.",
        },
        {
            id: 2,
            name: "Ana Martínez",
            date: "12 de mayo",
            text: "Gracias por compartir estos consejos. Siempre es bueno tener recordatorios sobre cómo mejorar nuestra alimentación.",
        },
    ];
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
                            <Text style={styles.title}>Consejos para mantener una dieta equilibrada</Text>
                            <Text style={styles.author}>Por Sofía García • 12 de mayo</Text>
                        </View>

                        {/* Contenido */}
                        <Text style={styles.contenido}>
                            Donec sapien odio, suscipit vitae consequat nec, pretium vitae est.
                            Pellentesque varius, enim ut accumsan scelerisque, mi velit fringilla nisl, in consectetur magna nulla at risus.
                            Nulla non eleifend ipsum. Integer accumsan finibus bibendum. {"\n"}{"\n"}
                            Sed dictum justo quis ornare vehicula. Praesent sit amet gravida lacus.
                            Proin eros nisl, euismod eget enim eu, hendrerit pulvinar dui.
                            Aenean tincidunt efficitur tincidunt. Sed molestie ligula ligula, vel accumsan tortor ullamcorper sit amet. {"\n"}
                            Sed hendrerit, tortor sit amet placerat egestas, sapien augue maximus magna, ac lacinia lacus dolor eget justo.

                        </Text>

                        {/* Separador */}
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                        </View>

                        {/* Comentarios */}
                        <Text style={styles.commentHeader}>Comentarios</Text>
                        {comments.map((c) => (
                            <View key={c.id} style={styles.commentBox}>
                                <View style={styles.commentHeaderRow}>
                                    <Ionicons name="person-circle-outline" size={36} color="#666" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.commentName}>{c.name}</Text>
                                        <Text style={styles.commentDate}>{c.date}</Text>
                                    </View>
                                </View>
                                <Text style={styles.commentText}>{c.text}</Text>
                            </View>
                        ))}

                        {/* Añadir comentario */}
                        <View style={styles.addComment}>
                            <TextInput
                                style={styles.input}
                                placeholder="Añadir un comentario..."
                                value={comment}
                                onChangeText={setComment}
                            />
                            <TouchableOpacity style={styles.sendButton}>
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
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

})