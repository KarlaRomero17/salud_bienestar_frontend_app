import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const data = [
  {
    id: "1",
    title: "Consejos para mantener una dieta equilibrada",
    comments: 12,
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    title: "Rutinas de ejercicio para principiantes",
    comments: 8,
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    title: "Meditación guiada para reducir el estrés",
    comments: 15,
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    title: "Recetas saludables para el desayuno",
    comments: 5,
    avatar: "https://i.pravatar.cc/150?img=4",
  },
];

export default function FurumScreen({navigation}) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.comments}>{item.comments} comentarios</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior='height'
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              scrollEnabled={false}
            />
            {/* Agregar nueva Publicación */}
            <TouchableOpacity style={styles.fab}
              onPress={() => navigation.navigate('Nueva Publicación')}
            >
              <Ionicons name="add" size={28} color="#fff" />
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
    paddingTop: 30,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  formContainer: {
    paddingHorizontal: 32,
    paddingBottom: 30,
  },
  
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontWeight: "700",
    fontSize: 17,
    color: "#000",
    marginBottom: 4,
  },

  comments: {
    color: "#2a8c4a",
    fontSize: 13,
  },

  //Agregar publicación
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#2a8c4a",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});