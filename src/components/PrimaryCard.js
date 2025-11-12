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
  // Configuración de colores según la variante
  const getColors = () => {
    const variants = {
      primary: {
        background: 'linear-gradient(135deg, #2a8c4a 0%, #64c27b 100%)',
        solidBackground: '#2a8c4a',
        text: '#FFFFFF',
        secondaryText: '#e8f5e8',
        iconBackground: 'rgba(255,255,255,0.2)',
        badgeBackground: '#ffffff',
        badgeText: '#2a8c4a',
        shadow: '#1e6e3a'
      },
      secondary: {
        background: 'linear-gradient(135deg, #64c27b 0%, #9bfab0 100%)',
        solidBackground: '#64c27b',
        text: '#FFFFFF',
        secondaryText: '#f0f9f0',
        iconBackground: 'rgba(255,255,255,0.25)',
        badgeBackground: '#ffffff',
        badgeText: '#64c27b',
        shadow: '#4a9e63'
      },
      accent: {
        background: 'linear-gradient(135deg, #9bfab0 0%, #d0fdd7 100%)',
        solidBackground: '#9bfab0',
        text: '#1e6e3a',
        secondaryText: '#2a8c4a',
        iconBackground: 'rgba(42, 140, 74, 0.1)',
        badgeBackground: '#2a8c4a',
        badgeText: '#ffffff',
        shadow: '#7ed492'
      }
    };
    return variants[variant] || variants.primary;
  };

  // Configuración de tamaños
  const getSizes = () => {
    const sizes = {
      small: {
        padding: 18,
        iconSize: 20,
        titleSize: 16,
        descriptionSize: 13,
        iconContainer: 42,
        borderRadius: 16
      },
      medium: {
        padding: 22,
        iconSize: 24,
        titleSize: 18,
        descriptionSize: 14,
        iconContainer: 48,
        borderRadius: 18
      },
      large: {
        padding: 26,
        iconSize: 28,
        titleSize: 20,
        descriptionSize: 15,
        iconContainer: 54,
        borderRadius: 20
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
          backgroundColor: colors.solidBackground,
          padding: sizes.padding,
          borderRadius: sizes.borderRadius,
          opacity: disabled ? 0.6 : 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      {/* Fondo con gradiente */}
      <View style={[
        styles.gradientOverlay,
        {
          backgroundColor: colors.solidBackground,
          borderRadius: sizes.borderRadius,
        }
      ]} />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Lado izquierdo: Icono y texto */}
        <View style={styles.leftSection}>
          <View style={[
            styles.iconContainer,
            { 
              width: sizes.iconContainer,
              height: sizes.iconContainer,
              borderRadius: sizes.iconContainer / 2,
              backgroundColor: colors.iconBackground,
            }
          ]}>
            <Ionicons name={icon} size={sizes.iconSize} color={colors.text} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.title,
                { 
                  color: colors.text,
                  fontSize: sizes.titleSize
                }
              ]}>
                {title}
              </Text>
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
            
            <Text style={[
              styles.description,
              { 
                color: colors.secondaryText,
                fontSize: sizes.descriptionSize
              }
            ]}>
              {description}
            </Text>
          </View>
        </View>

        {/* Flecha */}
        <View style={styles.arrowContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.text} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: '700',
    includeFontPadding: false,
    marginRight: 8,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
    includeFontPadding: false,
  },
  description: {
    lineHeight: 18,
    includeFontPadding: false,
    opacity: 0.9,
  },
  arrowContainer: {
    marginLeft: 8,
    opacity: 0.8,
  },
});

export default PrimaryCard;