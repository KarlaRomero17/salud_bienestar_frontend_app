// ProgressScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import objetivosService from '../../services/objetivosService';
import userService from '../../services/userService';

import { statsService } from '../../services/statsService';

const ProgressScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState('mensual');
  const [goals, setGoals] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const screenWidth = Dimensions.get('window').width;

  const USER_UUID = user?.uid;

  // Cargar datos
  const fetchData = async () => {
  try {
    setLoading(true);
    
    const statsResult = await statsService.obtenerEstadisticas(USER_UUID);
    if (statsResult.exito) {
      const datos = statsResult.datos;
      
      // Actualizar el estado con los datos del backend
      setStats({
        primerPeso: datos.peso.inicial,
        ultimoPeso: datos.peso.actual,
        cambioPeso: datos.peso.cambio,
        objetivosCompletados: datos.objetivos.completados,
        progresoPromedio: datos.objetivos.progresoPromedio,
        totalObjetivos: datos.objetivos.total,
        datosPeso: datos.peso.evolucion?.datos || [],
        fechasPeso: datos.peso.evolucion?.fechas || [],
        totalRegistros: datos.peso.totalRegistros,
        tendencia: datos.peso.tendencia,
        objetivos: datos.objetivos.lista || []
      });
    }

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  } finally {
    setLoading(false);
  }
};

  // Calcular estadísticas
  const calcularEstadisticas = (historial, objetivos) => {
    if (historial.length === 0) return;

    const primerPeso = historial[historial.length - 1]?.peso;
    const ultimoPeso = historial[0]?.peso;
    const cambioPeso = ultimoPeso - primerPeso;
    
    const objetivosCompletados = objetivos.filter(g => g.completed).length;
    const progresoPromedio = objetivos.length > 0 
      ? objetivos.reduce((sum, goal) => sum + (goal.progress || 0), 0) / objetivos.length 
      : 0;

    // Datos para gráfico de peso (últimos 7 registros o todos si hay menos)
    const datosPeso = historial.slice(0, 7).reverse().map(item => item.peso);
    const fechasPeso = historial.slice(0, 7).reverse().map(item => 
      new Date(item.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    );

    setStats({
      primerPeso,
      ultimoPeso,
      cambioPeso,
      objetivosCompletados,
      progresoPromedio,
      totalObjetivos: objetivos.length,
      datosPeso,
      fechasPeso,
      totalRegistros: historial.length,
      tendencia: cambioPeso > 0 ? 'subiendo' : cambioPeso < 0 ? 'bajando' : 'estable'
    });
  };

  useEffect(() => {
    if (USER_UUID) {
      fetchData();
    }
  }, [USER_UUID]);

  // Datos para gráficos
  const weightChartData = {
    labels: stats.fechasPeso || [],
    datasets: [
      {
        data: stats.datosPeso || [0],
        color: () => '#64c27b',
        strokeWidth: 3,
      },
    ],
  };

  const progressChartData = {
    labels: ["Progreso"],
    data: [stats.progresoPromedio ? stats.progresoPromedio / 100 : 0]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(100, 194, 123, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2a8c4a',
    },
  };

  // Métricas principales
  const metrics = [
    { 
      title: 'Peso Actual', 
      value: stats.ultimoPeso ? `${stats.ultimoPeso.toFixed(1)}` : '--', 
      unit: 'kg',
      subtitle: stats.cambioPeso ? `${stats.cambioPeso > 0 ? '+' : ''}${stats.cambioPeso.toFixed(1)}kg` : 'Sin datos',
      subtitleColor: stats.cambioPeso > 0 ? '#e74c3c' : stats.cambioPeso < 0 ? '#2a8c4a' : '#666'
    },
    { 
      title: 'Objetivos', 
      value: `${stats.objetivosCompletados || 0}/${stats.totalObjetivos || 0}`,
      subtitle: 'Completados',
      progress: stats.totalObjetivos ? (stats.objetivosCompletados / stats.totalObjetivos) * 100 : 0
    },
    { 
      title: 'Progreso Promedio', 
      value: stats.progresoPromedio ? `${stats.progresoPromedio.toFixed(0)}%` : '--',
      subtitle: 'Todos los objetivos'
    },
    { 
      title: 'Registros', 
      value: `${stats.totalRegistros || 0}`,
      subtitle: 'En historial',
      unit: 'total'
    },
  ];

  if (loading) {
    return (
      <Layout title="Mi Progreso">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a8c4a" />
          <Text style={styles.loadingText}>Cargando tu progreso...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Mi Progreso">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Selector de período */}
        {/* <View style={styles.periodSelector}>
          {['semanal', 'mensual', 'anual'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Métricas principales */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricTitle}>{metric.title}</Text>
              <Text style={styles.metricValue}>
                {metric.value}
                {metric.unit && <Text style={styles.metricUnit}> {metric.unit}</Text>}
              </Text>
              <Text style={[styles.metricSubtitle, { color: metric.subtitleColor || '#666' }]}>
                {metric.subtitle}
              </Text>
              {metric.progress !== undefined && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${metric.progress}%` },
                    ]}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Gráfico de Evolución de Peso */}
        {stats.datosPeso && stats.datosPeso.length > 1 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Evolución de Peso</Text>
            <Text style={styles.chartSubtitle}>
              {stats.tendencia === 'bajando' ? '📉 Tendencia a la baja' : 
               stats.tendencia === 'subiendo' ? '📈 Tendencia al alza' : '➡️ Peso estable'}
            </Text>
            <LineChart
              data={weightChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Gráfico de Progreso de Objetivos */}
        {goals.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Progreso de Objetivos</Text>
            <View style={styles.progressChartContainer}>
              <ProgressChart
                data={progressChartData}
                width={screenWidth - 80}
                height={160}
                strokeWidth={16}
                radius={60}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(42, 140, 74, ${opacity})`,
                }}
                hideLegend={false}
              />
              <Text style={styles.progressChartText}>
                {stats.progresoPromedio ? `${stats.progresoPromedio.toFixed(0)}%` : '0%'}
              </Text>
            </View>
          </View>
        )}

        {/* Resumen de Objetivos */}
        {goals.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tus Objetivos</Text>
            {goals.slice(0, 3).map((goal, index) => (
              <View key={goal._id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={[
                    styles.goalProgress,
                    { color: goal.progress >= 100 ? '#2a8c4a' : goal.progress >= 50 ? '#f39c12' : '#e74c3c' }
                  ]}>
                    {goal.progress || 0}%
                  </Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View 
                    style={[
                      styles.goalProgressFill,
                      { 
                        width: `${goal.progress || 0}%`,
                        backgroundColor: goal.progress >= 100 ? '#2a8c4a' : goal.progress >= 50 ? '#f39c12' : '#e74c3c'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.goalDetail}>
                  {goal.type === 'loss' ? 'Reducir' : 'Aumentar'} a {goal.targetWeight}{goal.unit} • 
                  {goal.completed ? ' ✅ Completado' : ' 🎯 En progreso'}
                </Text>
              </View>
            ))}
            {goals.length > 3 && (
              <Text style={styles.moreGoalsText}>
                +{goals.length - 3} objetivos más...
              </Text>
            )}
          </View>
        )}

        {/* Mensaje si no hay datos */}
        {weightHistory.length === 0 && goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>📊 Comienza tu seguimiento</Text>
            <Text style={styles.emptyStateText}>
              Registra tu primer peso y crea objetivos para ver tu progreso aquí.
            </Text>
          </View>
        )}

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  periodButtonActive: {
    backgroundColor: '#64c27b',
  },
  periodButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#d0fdd7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  metricUnit: {
    fontSize: 12,
    color: '#666',
  },
  metricSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2a8c4a',
    borderRadius: 3,
  },
  chartCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressChartText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a8c4a',
  },
  goalItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#64c27b',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalDetail: {
    fontSize: 12,
    color: '#666',
  },
  moreGoalsText: {
    textAlign: 'center',
    color: '#2a8c4a',
    fontWeight: '500',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a8c4a',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProgressScreen;