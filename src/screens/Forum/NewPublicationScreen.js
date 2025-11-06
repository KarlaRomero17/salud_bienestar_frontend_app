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

export default function NewPublicationScreen() {
    const [titulo, setTitulo] = useState('');
    const [content, setContent] = useState('')
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior='height'
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>

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
                                numberOfLines={20}      // define una altura inicial
                                textAlignVertical="top" // alinea el texto al inicio
                            />
                        </View>

                        <TouchableOpacity style={styles.postButton}>
                            <Text style={styles.postButtonText}>
                                Publicar
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