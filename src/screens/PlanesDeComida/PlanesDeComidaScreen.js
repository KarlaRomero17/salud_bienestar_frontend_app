import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { firebaseApi, backendApi } from '../../api/authenticatedClient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- UTILIDADES ---
const getToday = () => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[new Date().getDay()];
};

const groupMealsByCategory = (meals) => {
  const grouped = { Desayuno: [], Almuerzo: [], Cena: [], Snacks: [] };
  meals.forEach(meal => {
    const hour = parseInt(meal.hora.split(':')[0], 10);
    if (hour < 11) grouped.Desayuno.push(meal);
    else if (hour >= 13 && hour < 17) grouped.Almuerzo.push(meal);
    else if (hour >= 20) grouped.Cena.push(meal);
    else grouped.Snacks.push(meal);
  });
  // Ordenamos los snacks por si hay más de uno
  grouped.Snacks.sort((a,b) => a.hora.localeCompare(b.hora));
  return grouped;
};


// --- COMPONENTES DE UI ---

const PlanListItem = ({ item, onSelect }) => (
  <TouchableOpacity style={styles.planCard} onPress={() => onSelect(item._id)}>
    <View style={styles.planIconContainer}><MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS.primary} /></View>
    <View style={styles.planCardTextContainer}><Text style={styles.planCardTitle}>{item.nombre}</Text><Text style={styles.planCardDescription}>{item.descripcion}</Text></View>
    <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
  </TouchableOpacity>
);

const PlanDetailView = ({ plan, onCancel }) => {
  const today = getToday();
  const mealOrder = ['Desayuno', 'Snacks', 'Almuerzo', 'Cena'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.detailContentContainer}>
      {plan.semana.map((dia) => {
        const isToday = dia.nombre === today;
        const groupedMeals = groupMealsByCategory(dia.comidas);
        return (
          <View key={dia._id} style={[styles.dayCard, isToday && styles.todayCard]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, isToday && { color: COLORS.primary }]}>{dia.nombre}</Text>
              {isToday && (<View style={styles.todayTag}><Text style={styles.todayTagText}>HOY</Text></View>)}
            </View>
            
            {mealOrder.map((category, index) => {
              const mealsInCategory = groupedMeals[category];
              if (mealsInCategory.length === 0) return null;

              return (
                <View key={category}>
                  {/* El separador se aplica si no es la primera categoría */}
                  {index > 0 && <View style={styles.separator} />}
                  
                  {mealsInCategory.map(meal => (
                    <View key={meal._id} style={styles.mealItem}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        <Text style={styles.mealTime}>{meal.hora}</Text>
                      </View>
                      <Text style={styles.mealDescription}>{meal.descripcion}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )
      })}
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Ionicons name="close-circle-outline" size={24} color="white" style={styles.cancelButtonIcon} />
        <Text style={styles.cancelButtonText}>Cambiar de Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- COMPONENTE PRINCIPAL DE LA PANTALLA  ---
const PlanesDeComidaScreen = ({ navigation }) => {
    const [myPlan, setMyPlan] = useState(null);
    const [allPlanes, setAllPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRtdbKey, setUserRtdbKey] = useState(null);
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: myPlan ? myPlan.nombre : 'Planes de Comida',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
        });
    }, [navigation, myPlan]);
    useFocusEffect(useCallback(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) { throw new Error("Debes iniciar sesión."); }
                const [availablePlans, userProfile] = await Promise.all([ backendApi.getPlanesComida(), firebaseApi.getUserProfile(user.uid) ]);
                setAllPlanes(availablePlans);
                if (userProfile) {
                    setUserRtdbKey(userProfile.rtdbKey);
                    if (userProfile.planComidaId) {
                        setMyPlan(availablePlans.find(p => p._id === userProfile.planComidaId));
                    }
                }
            } catch (error) { Alert.alert("Error", error.message || "No se pudieron cargar los datos."); } 
            finally { setLoading(false); }
        };
        loadData();
    }, []));
    const handleSelectPlan = async (planId) => {
        if (!userRtdbKey) return;
        try {
            await firebaseApi.updateUserPlan(userRtdbKey, { planComidaId: planId });
            setMyPlan(allPlanes.find(p => p._id === planId));
        } catch (error) { Alert.alert("Error", "No se pudo seleccionar el plan."); }
    };
    const handleCancelPlan = () => {
        Alert.alert("Cambiar de Plan", "¿Seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sí", onPress: async () => {
                try {
                    await firebaseApi.updateUserPlan(userRtdbKey, { planComidaId: null });
                    setMyPlan(null);
                } catch (error) { Alert.alert("Error", "No se pudo cambiar el plan."); }
            }},
        ]);
    };
    if (loading) { return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>; }
    if (myPlan) { return <PlanDetailView plan={myPlan} onCancel={handleCancelPlan} />; }
    return (
        <View style={styles.container}>
            <FlatList
                data={allPlanes}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <PlanListItem item={item} onSelect={handleSelectPlan} />}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}><Text style={styles.listTitle}>Elige tu Plan</Text><Text style={styles.subtitle}>Selecciona el que mejor se adapte a tus objetivos.</Text></View>
                )}
                contentContainerStyle={styles.listContentContainer}
            />
        </View>
    );
};
// --- PALETA DE COLORES Y ESTILOS ---
const COLORS = {
  primary: '#27ae60', text: '#212529', textLight: '#868e96', background: '#F8F9FA', white: '#FFFFFF', red: '#e74c3c', border: '#dee2e6', // Un gris más visible para el borde
};
const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    container: { flex: 1, backgroundColor: COLORS.background },
    listContentContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
    listHeader: { marginBottom: 10 },
    listTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginTop: 10 },
    subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginTop: 8, marginBottom: 20 },
    planCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    planIconContainer: { backgroundColor: `${COLORS.primary}1A`, borderRadius: 12, padding: 12, marginRight: 16 },
    planCardTextContainer: { flex: 1 },
    planCardTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
    planCardDescription: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
    
    // --- ESTILOS DE DETALLE (CORREGIDOS) ---
    detailContentContainer: { paddingVertical: 20, paddingBottom: 100 },
    dayCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 20,
        borderWidth: 3, // <-- Borde para TODAS las tarjetas
        borderColor: COLORS.textLight, // <-- Borde GRIS OSCURO 
    },
    todayCard: {
        borderColor: COLORS.primary, 
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
    },
    dayTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textLight, 
    },
    todayTag: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    todayTagText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
    separator: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border, // Línea separadora
        marginTop: 15,
        paddingTop: 15,
    },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
    categoryTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    mealItem: {
        // No necesita estilo propio, el separador maneja el espacio
    },
    mealTime: { fontSize: 16, fontWeight: '500', color: COLORS.textLight },
    mealDescription: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
    
    cancelButton: { backgroundColor: COLORS.red, borderRadius: 30, marginHorizontal: 40, marginTop: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
    cancelButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
    cancelButtonIcon: { marginRight: 8 },
});

export default PlanesDeComidaScreen;