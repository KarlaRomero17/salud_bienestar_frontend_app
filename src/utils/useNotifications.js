import { useState, useEffect } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { recordatoriosService } from '../services/recordatoriosService';


const isExpoGo = () => {
    return Constants.appOwnership === 'expo';
};

export const useNotifications = (userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

    const requestPermissions = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Solicitando permisos de notificación...');

            // Verificar si está en Expo Go
            if (isExpoGo()) {
                Alert.alert(
                    'Modo Expo Go',
                    'Las notificaciones push no están disponibles en Expo Go. ' +
                    'Para testing completo, crea un development build.\n\n' +
                    'Pero puedes probar notificaciones locales.',
                    [{ text: 'Entendido' }]
                );

                // Aún así solicitar permisos para notificaciones locales
                const { status } = await Notifications.requestPermissionsAsync();
                setPermissionStatus(status);

                if (status === 'granted') {
                    setNotificationsEnabled(true);
                    await configurarCanalesAndroid();
                }
                return status === 'granted';
            }

            // Código original para development/production builds...
            let { status } = await Notifications.getPermissionsAsync();

            if (status !== 'granted') {
                console.log('📢 Mostrando diálogo de permisos...');
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                status = newStatus;
                console.log('🎯 Usuario respondió:', status);
            }

            setPermissionStatus(status);

            if (status === 'granted') {
                setNotificationsEnabled(true);
                await configurarCanalesAndroid();
                await getPushToken(userId);

                Alert.alert(
                    'Notificaciones Activadas ✅',
                    'Ahora recibirás recordatorios de tus medicamentos.',
                    [{ text: 'Entendido' }]
                );
                return true;
            } else {
                // Mostrar instrucciones para activar manualmente
                mostrarInstruccionesPermisos();
                return false;
            }

        } catch (error) {
            console.error('❌ Error solicitando permisos:', error);
            Alert.alert('Error', 'No se pudieron solicitar los permisos de notificación');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const configurarCanalesAndroid = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('recordatorios', {
                name: 'Recordatorios de Medicamentos',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2a8c4a',
                sound: 'default',
            });
            console.log('✅ Canal Android configurado');
        }
    };

    const mostrarInstruccionesPermisos = () => {
        if (Platform.OS === 'android') {
            Alert.alert(
                'Permisos Requeridos',
                'Para recibir recordatorios:\n\n' +
                '1. Ve a Configuración → Apps\n' +
                '2. Busca esta app\n' +
                '3. Toca "Permisos"\n' +
                '4. Activa "Notificaciones"\n\n' +
                'O reinstala la app para que solicite permisos nuevamente.',
                [
                    { text: 'Cancelar' },
                    {
                        text: 'Reintentar',
                        onPress: () => setTimeout(requestPermissions, 1000)
                    }
                ]
            );
        }
    };

    const getPushToken = async (userId) => {
    try {
        if (!Constants.isDevice) {
            console.log('📱 No es un dispositivo físico');
            return;
        }

        console.log('🔐 Obteniendo token push...');
        
        let token;
        
        // Manejar diferentes entornos
        if (Constants.appOwnership === 'expo') {
            // EXPO GO - Usar token simulado
            token = `expo-go-simulated-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('🧪 Expo Go - Token simulado:', token);
        } else {
            // DEVELOPMENT/PRODUCTION BUILD
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId
            });
            token = tokenData.data;
            console.log('✅ Token push real obtenido:', token);
        }

        // Registrar token en backend
        if (userId && token) {
            try {
                await recordatoriosService.registrarToken(userId, token);
                console.log('✅ Token registrado en backend para usuario:', userId);
                
                // Verificar registro
                await verifyTokenRegistration(userId);
            } catch (error) {
                console.log('⚠️ Error registrando token en backend:', error.message);
            }
        }
        
        return token;
    } catch (error) {
        console.error('❌ Error obteniendo token push:', error);
    }
};

// Función para verificar el registro
const verifyTokenRegistration = async (userId) => {
    try {
        // Llamar a un endpoint que muestre los tokens registrados
        const stats = await recordatoriosService.getNotificationStats();
        console.log('📊 Estadísticas de notificaciones:', stats);
        
        if (stats.users && stats.users[userId]) {
            console.log(`✅ Usuario ${userId} tiene ${stats.users[userId].count} tokens registrados`);
        } else {
            console.log(`❌ Usuario ${userId} no aparece en los registros`);
        }
    } catch (error) {
        console.log('⚠️ No se pudieron verificar estadísticas:', error.message);
    }
};

    const enviarNotificacionPrueba = async () => {
        setIsLoading(true);
        try {
            console.log('🧪 Enviando notificación de prueba...');

            if (permissionStatus !== 'granted') {
                Alert.alert(
                    'Permisos Requeridos',
                    'Primero necesitas activar los permisos de notificación.',
                    [
                        { text: 'Cancelar' },
                        { text: 'Activar', onPress: requestPermissions }
                    ]
                );
                return false;
            }

            // Enviar notificación local de prueba
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💊 Prueba de Notificación',
                    body: '¡Esta es una notificación de prueba de tu app de recordatorios!',
                    sound: true,
                    data: {
                        type: 'test',
                        timestamp: new Date().toISOString()
                    },
                },
                trigger: {
                    seconds: 3,
                },
            });

            // También enviar al backend si está disponible
            if (userId) {
                try {
                    await recordatoriosService.enviarNotificacionPrueba(userId);
                    console.log('✅ Solicitud enviada al backend');
                } catch (backendError) {
                    console.log('⚠️ Backend no disponible, pero notificación local enviada');
                }
            }

            Alert.alert(
                'Notificación de Prueba ✅',
                'Recibirás una notificación en 3 segundos.\n\n' +
                'Esto confirma que el sistema de notificaciones está funcionando correctamente.',
                [{ text: 'Entendido' }]
            );

            return true;

        } catch (error) {
            console.error('❌ Error enviando notificación de prueba:', error);
            Alert.alert(
                'Error',
                'No se pudo enviar la notificación de prueba: ' + error.message,
                [{ text: 'OK' }]
            );
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        notificationsEnabled: permissionStatus === 'granted',
        isLoading,
        permissionStatus,
        requestPermissions,
        enviarNotificacionPrueba
    };
};