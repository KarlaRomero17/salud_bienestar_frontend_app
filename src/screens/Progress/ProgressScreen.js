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
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';

const ProgressScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    primerPeso: null,
    ultimoPeso: null,
    cambioPeso: 0,
    objetivosCompletados: 0,
    progresoPromedio: 0,
    totalObjetivos: 0,
    datosPeso: [],
    fechasPeso: [],
    totalRegistros: 0,
    tendencia: 'estable',
    objetivos: []
  });
  const screenWidth = Dimensions.get('window').width;

  const USER_UUID = user?.uid;

  // Generar opciones de meses y años
  const getPeriodOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Últimos 5 años
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString());
    }
    
    // Meses del año actual
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return { years, months };
  };

  const periodOptions = getPeriodOptions();

  // Cargar datos con filtros
  const fetchData = async (anio = null, mes = null) => {
    try {
      setLoading(true);
      console.log('Cargando datos con filtros:', { anio, mes });
      
      const filtros = {};
      if (anio && anio !== 'todos') filtros.anio = anio;
      if (mes) filtros.mes = mes;

      const statsResult = await statsService.obtenerEstadisticas(USER_UUID, filtros);
      console.log('Resultado del backend:', statsResult);
      
      if (statsResult.exito) {
        const datos = statsResult.datos;
        
        // Actualizar el estado con los datos del backend
        const nuevosStats = {
          primerPeso: datos.peso?.inicial || null,
          ultimoPeso: datos.peso?.actual || null,
          cambioPeso: datos.peso?.cambio || 0,
          objetivosCompletados: datos.objetivos?.completados || 0,
          progresoPromedio: datos.objetivos?.progresoPromedio || 0,
          totalObjetivos: datos.objetivos?.total || 0,
          datosPeso: datos.peso?.evolucion?.datos || [],
          fechasPeso: datos.peso?.evolucion?.fechas || [],
          totalRegistros: datos.peso?.totalRegistros || 0,
          tendencia: datos.peso?.tendencia || 'estable',
          objetivos: datos.objetivos?.lista || [],
          filtros: datos.filtros
        };

        console.log('Nuevos stats:', nuevosStats);
        setStats(nuevosStats);

        // Actualizar goals desde los objetivos
        setGoals(datos.objetivos?.lista || []);
      } else {
        console.log('Error en la respuesta del backend');
        // Resetear datos si hay error
        setStats({
          primerPeso: null,
          ultimoPeso: null,
          cambioPeso: 0,
          objetivosCompletados: 0,
          progresoPromedio: 0,
          totalObjetivos: 0,
          datosPeso: [],
          fechasPeso: [],
          totalRegistros: 0,
          tendencia: 'estable',
          objetivos: []
        });
        setGoals([]);
      }

    } catch (error) {
      console.error('Error cargando estadísticas:', error);

      setStats({
        primerPeso: null,
        ultimoPeso: null,
        cambioPeso: 0,
        objetivosCompletados: 0,
        progresoPromedio: 0,
        totalObjetivos: 0,
        datosPeso: [],
        fechasPeso: [],
        totalRegistros: 0,
        tendencia: 'estable',
        objetivos: []
      });
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de año
  const handleYearChange = (year) => {
    console.log('🎯 Cambiando año a:', year);
    setSelectedYear(year);
    setSelectedMonth(null); // Resetear mes cuando cambia el año
    if (year === 'todos') {
      fetchData(null, null);
    } else {
      fetchData(year, null);
    }
  };

  // Manejar cambio de mes
  const handleMonthChange = (month) => {
    console.log('🎯 Cambiando mes a:', month);
    setSelectedMonth(month);
    fetchData(selectedYear, month);
  };

  // Cargar todos los datos (sin filtros)
  const loadAllData = () => {
    console.log('🎯 Cargando todos los datos');
    setSelectedYear('todos');
    setSelectedMonth(null);
    fetchData(null, null);
  };

  useEffect(() => {
    if (USER_UUID) {
      // Cargar datos del año actual por defecto
      console.log('🚀 Inicializando con usuario:', USER_UUID);
      fetchData(new Date().getFullYear().toString(), null);
    }
  }, [USER_UUID]);

  // Datos para gráficos - Estos se actualizan automáticamente cuando stats cambia
  const weightChartData = {
    labels: stats.fechasPeso || [],
    datasets: [
      {
        data: stats.datosPeso && stats.datosPeso.length > 0 ? stats.datosPeso : [0],
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
      subtitle: stats.cambioPeso !== 0 ? `${stats.cambioPeso > 0 ? '+' : ''}${stats.cambioPeso.toFixed(1)}kg` : 'Sin cambio',
      subtitleColor: stats.cambioPeso > 0 ? '#e74c3c' : stats.cambioPeso < 0 ? '#2a8c4a' : '#666'
    },
    // { 
    //   title: 'Objetivos', 
    //   value: `${stats.objetivosCompletados || 0}/${stats.totalObjetivos || 0}`,
    //   subtitle: 'Completados',
    //   progress: stats.totalObjetivos ? (stats.objetivosCompletados / stats.totalObjetivos) * 100 : 0
    // },
    // { 
    //   title: 'Progreso Promedio', 
    //   value: stats.progresoPromedio ? `${stats.progresoPromedio.toFixed(0)}%` : '--',
    //   subtitle: 'Todos los objetivos'
    // },
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
        
        {/* Selector de período - Años */}
        <View style={styles.periodSection}>
          <Text style={styles.periodSectionTitle}>Año</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScrollView}>
            <View style={styles.periodSelector}>
              {/* Opción "Todos" */}
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedYear === 'todos' && styles.periodButtonActive,
                ]}
                onPress={loadAllData}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedYear === 'todos' && styles.periodButtonTextActive,
                  ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              {periodOptions.years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.periodButton,
                    selectedYear === year && styles.periodButtonActive,
                  ]}
                  onPress={() => handleYearChange(year)}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedYear === year && styles.periodButtonTextActive,
                    ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Selector de período - Meses (solo se muestra si hay un año seleccionado) */}
        {selectedYear && selectedYear !== 'todos' && (
          <View style={styles.periodSection}>
            <Text style={styles.periodSectionTitle}>Mes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScrollView}>
              <View style={styles.periodSelector}>
                {/* Opción "Todos los meses" */}
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    selectedMonth === null && styles.periodButtonActive,
                  ]}
                  onPress={() => handleMonthChange(null)}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedMonth === null && styles.periodButtonTextActive,
                    ]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                
                {periodOptions.months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.periodButton,
                      selectedMonth === month && styles.periodButtonActive,
                    ]}
                    onPress={() => handleMonthChange(month)}>
                    <Text
                      style={[
                        styles.periodButtonText,
                        selectedMonth === month && styles.periodButtonTextActive,
                      ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Indicador de filtros activos */}
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            Mostrando datos: {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
            {selectedMonth && ` • ${selectedMonth}`}
            {stats.totalRegistros > 0 && ` • ${stats.totalRegistros} registros`}
          </Text>
        </View>

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
        {stats.datosPeso && stats.datosPeso.length > 1 ? (
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
        ) : stats.totalRegistros > 0 ? (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Evolución de Peso</Text>
            <Text style={styles.chartSubtitle}>
              No hay suficientes registros para mostrar el gráfico (mínimo 2 registros)
            </Text>
          </View>
        ) : null}

        {/* Gráfico de Progreso de Objetivos */}
        {/* {goals.length > 0 && (
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
        )} */}

        {/* Resumen de Objetivos */}
        {/* {goals.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tus Objetivos</Text>
            {goals.slice(0, 3).map((goal, index) => (
              <View key={goal._id || index} style={styles.goalItem}>
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
        )} */}

        {/* Mensaje si no hay datos */}
        {stats.totalRegistros === 0 && goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>📊 No hay datos</Text>
            <Text style={styles.emptyStateText}>
              {selectedYear === 'todos' 
                ? 'No hay registros en tu historial' 
                : `No hay registros para ${selectedYear}${selectedMonth ? ` - ${selectedMonth}` : ''}`
              }
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
  periodSection: {
    marginBottom: 15,
  },
  periodSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a8c4a',
    marginBottom: 8,
    marginLeft: 5,
  },
  periodScrollView: {
    marginHorizontal: -5,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 70,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#64c27b',
  },
  periodButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  filterIndicator: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  filterIndicatorText: {
    color: '#2a8c4a',
    fontSize: 14,
    fontWeight: '500',
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