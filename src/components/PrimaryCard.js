import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrimaryCard = ({ 
  title, 
  description, 
  icon, 
  onPress, 
  badge,
  variant = 'primary', // 'primary', 'secondary', 'accent'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false
}) => {
  // Configuración de colores según la variante usando tu paleta
  const getColors = () => {
    const variants = {
      primary: {
        background: '#2a8c4a',
        text: '#FFFFFF',
        secondaryText: '#d0fdd7',
        shadow: '#2a8c4a',
        badgeBackground: '#ffffff',
        badgeText: '#2a8c4a'
      },
      secondary: {
        background: '#64c27b',
        text: '#FFFFFF',
        secondaryText: '#d0fdd7',
        shadow: '#64c27b',
        badgeBackground: '#ffffff',
        badgeText: '#64c27b'
      },
      accent: {
        background: '#9bfab0',
        text: '#2a8c4a',
        secondaryText: '#2a8c4a',
        shadow: '#9bfab0',
        badgeBackground: '#2a8c4a',
        badgeText: '#ffffff'
      }
    };
    return variants[variant] || variants.primary;
  };

  // Configuración de tamaños
  const getSizes = () => {
    const sizes = {
      small: {
        padding: 20,
        iconSize: 22,
        titleSize: 18,
        descriptionSize: 14,
        iconContainer: 44
      },
      medium: {
        padding: 25,
        iconSize: 26,
        titleSize: 22,
        descriptionSize: 16,
        iconContainer: 50
      },
      large: {
        padding: 30,
        iconSize: 30,
        titleSize: 26,
        descriptionSize: 18,
        iconContainer: 56
      }
    };
    return sizes[size] || sizes.medium;
  };

  const colors = getColors();
  const sizes = getSizes();

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          padding: sizes.padding,
          opacity: disabled ? 0.6 : 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {/* Header con icono, título y badge */}
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer,
          { 
            width: sizes.iconContainer,
            height: sizes.iconContainer,
            borderRadius: sizes.iconContainer / 2,
            backgroundColor: 'rgba(255,255,255,0.2)'
          }
        ]}>
          <Ionicons name={icon} size={sizes.iconSize} color={colors.text} />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { 
              color: colors.text,
              fontSize: sizes.titleSize
            }
          ]}>
            {title}
          </Text>
        </View>

        {/* Badge posicionado correctamente */}
        {badge && (
          <View style={[
            styles.badge,
            {
              backgroundColor: colors.badgeBackground,
            }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: colors.badgeText }
            ]}>
              {badge}
            </Text>
          </View>
        )}
      </View>

      {/* Descripción */}
      <Text style={[
        styles.description,
        { 
          color: colors.secondaryText,
          fontSize: sizes.descriptionSize
        }
      ]}>
        {description}
      </Text>

      {/* Flecha siempre en la esquina superior derecha */}
      <Ionicons 
        name="arrow-forward" 
        size={20} 
        color={colors.text} 
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Alineación superior para evitar conflictos
    marginBottom: 12,
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8, // Espacio para el badge
    paddingTop: 2, // Alineación vertical fina
  },
  title: {
    fontWeight: 'bold',
    includeFontPadding: false, // Elimina padding interno del texto
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1, // Asegura que esté por encima
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
    includeFontPadding: false,
  },
  description: {
    lineHeight: 20,
    paddingRight: 30, // Espacio para la flecha
    includeFontPadding: false,
  },
  arrow: {
    position: 'absolute',
    right: 20,
    bottom: 25, // Posicionada en la parte inferior en lugar de centrada
  },
});

export default PrimaryCard;