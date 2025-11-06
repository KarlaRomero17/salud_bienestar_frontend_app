// src/constants/ActividadData.js (ACTUALIZADO CON MÁS EJERCICIOS)

/**
 * Constantes de Tipos de Actividad Física
 * Usadas en la selección con desplegable.
 */
export const TIPOS_ACTIVIDAD_FISICA = [
    { label: 'Trotar', value: 'trotar' },
    { label: 'Caminar', value: 'caminar' },
    { label: 'Correr', value: 'correr' },
    { label: 'Ciclismo (Exteriores)', value: 'ciclismo_exterior' },
    { label: 'Ciclismo (Estática)', value: 'ciclismo_estatica' },
    { label: 'Natación', value: 'natacion' },
    { label: 'Remo (Máquina)', value: 'remo' },
    { label: 'Elíptica', value: 'eliptica' },
    { label: 'Senderismo / Hiking', value: 'senderismo' },
    { label: 'Deporte de Equipo (Fútbol, Básquet, etc.)', value: 'deporte_equipo' },
];

/**
 * Constantes de Ejercicios de Entrenamiento Predefinidos
 * Estructurado por categorías para facilitar la selección y filtrado.
 */
export const ENTRENAMIENTOS_PREDEFINIDOS = {
    // 🏋️‍♂️ 1. FUERZA - Con Pesas / Máquinas / Resistencia (CON PESAS)
    'Fuerza - Tren Superior (Pesas)': [
        'Press de banca (Barra)', 
        'Press inclinado con mancuernas', 
        'Dominadas con peso (Weighted Pull-ups)', 
        'Remo con barra (Bent-over Row)', 
        'Press Militar (Shoulder Press)', 
        'Elevaciones laterales', 
        'Curl de bíceps con barra', 
        'Extensiones de tríceps (Skull crushers)',
        'Face Pulls',
        'Máquina Peck Deck',
    ],
    'Fuerza - Tren Inferior (Pesas)': [
        'Sentadilla con barra (Squat)', 
        'Peso Muerto (Deadlift)', 
        'Prensa de piernas', 
        'Extensiones de cuádriceps', 
        'Curl femoral tumbado', 
        'Zancadas con mancuernas (Dumbbell Lunges)', 
        'Hip Thrust (empuje de cadera)', 
        'Elevación de talones con peso (Gemelos)',
    ],
    
    // 🤸‍♂️ 2. FUERZA - Peso Corporal (Calistenia/Sin Pesas)
    'Fuerza - Peso Corporal (Calistenia)': [
        'Flexiones (Push-ups) - Estándar', 
        'Flexiones (Push-ups) - Picas (Pike)', 
        'Dominadas (Pull-ups) - Agarre ancho/prono', 
        'Fondos en paralelas (Dips)', 
        'Sentadillas (Bodyweight Squats)', 
        'Pistol Squats (Sentadilla a una pierna)',
        'Plancha (Plank) - Alta/Baja', 
        'Zancadas (Lunges) - Sin peso', 
        'Remo invertido (Inverted Row)',
        'Handstand Push-ups (flexiones de pino)',
    ],

    // 🔥 3. Entrenamiento Cardiovascular y Metabólico (SIN PESAS)
    'Cardiovascular y HIIT': [
        'Saltos de tijera (Jumping Jacks)', 
        'Cuerda (Jump Rope)', 
        'Burpees', 
        'Mountain Climbers', 
        'High Knees (Rodillas al pecho)', 
        'Sprint en el sitio', 
        'Entrenamiento Tabata (20/10)', 
        'Entrenamiento de 30 min en Elíptica',
    ],
    
    // 🧘‍♀️ 4. Movilidad, Flexibilidad y Core (SIN PESAS)
    'Movilidad, Core y Estiramientos': [
        'Abdominales (Crunches)', 
        'Elevación de piernas', 
        'Bicicleta (Crunches)', 
        'Estiramientos estáticos (Post-entreno)', 
        'Yoga (Vinyasa/Hatha)', 
        'Pilates - Matwork', 
        'Movilidad de cadera (90/90)', 
        'Foam Rolling (Auto-masaje)',
        'Rotaciones torácicas',
    ],
    
    // 🏆 5. Específicos de Rendimiento (SIN PESAS)
    'Rendimiento Específico': [
        'Entrenamiento de umbral (Running)', 
        'Series de velocidad (Ciclismo)', 
        'Técnica de nado (Drills)', 
        'Pliometría (Saltos al cajón)', 
        'Ejercicios de agilidad (Escalera de agilidad)',
    ],
    
    // ⚕️ 6. Rehabilitación y Recuperación (SIN PESAS)
    'Rehabilitación / Terapia Física': [
        'Ejercicios de manguito rotador (bandas)', 
        'Rehabilitación de rodilla (isométricos)', 
        'Ejercicios de espalda baja (Bird-Dog)', 
        'Estiramientos miofasciales', 
        'Descanso Activo',
    ],
};