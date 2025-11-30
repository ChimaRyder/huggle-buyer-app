/**
 * PriceCountdown Component
 * Displays a countdown timer to a specific timestamp for dynamic pricing
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii, theme } from '@/constants/theme';

interface PriceCountdownProps {
  targetTimestamp: string;
  compact?: boolean;
  showIcon?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const PriceCountdown: React.FC<PriceCountdownProps> = ({
  targetTimestamp,
  compact = false,
  showIcon = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const calculateTimeRemaining = (target: string): TimeRemaining => {
    const now = new Date().getTime();
    const targetTime = new Date(target).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  };

  useEffect(() => {
    // Initial calculation
    const initial = calculateTimeRemaining(targetTimestamp);
    console.log('⏱️ PriceCountdown: Initial time calculation', {
      targetTimestamp,
      timeRemaining: initial,
      now: new Date().toISOString(),
      target: new Date(targetTimestamp).toISOString(),
    });
    setTimeRemaining(initial);

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  // Always render something for debugging - show if expired
  /* if (timeRemaining.isExpired) {
    console.log('⏱️ PriceCountdown: Timer expired, not rendering');
    return null; // Don't render if expired
  } */

  const getUrgencyLevel = (): 'low' | 'medium' | 'high' => {
    if (timeRemaining.days > 1) return 'low';
    if (timeRemaining.days === 1 || timeRemaining.hours > 12) return 'medium';
    return 'high';
  };

  const urgencyLevel = getUrgencyLevel();

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'high':
        return colors.error;
      case 'medium':
        return "#fd9e06ff";
      case 'low':
        return colors.info;
      default:
        return colors.text.secondary;
    }
  };

  const formatTimeUnit = (value: number, unit: string): string => {
    if (value === 0) return '';
    return `${value}${unit}`;
  };

  const getCompactTimeString = (): string => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  if (compact) {
    const urgencyColor = getUrgencyColor();
    /* console.log('⏱️ PriceCountdown: Rendering compact mode', {
      timeString: getCompactTimeString(),
      urgencyColor,
      showIcon,
    }); */
    
    return (
      <View style={[styles.compactContainer, { backgroundColor: urgencyColor, borderColor: urgencyColor }]}>
        {showIcon && (
          <Ionicons 
            name="time-outline" 
            size={14} 
            color={colors.text.inverse} 
            style={styles.icon}
          />
        )}
        <Text style={[styles.compactText]}>
          {getCompactTimeString()}
        </Text>
      </View>
    );
  }

  // Full mode - display in a more detailed card format
  return (
    <View style={[styles.container, { borderLeftColor: getUrgencyColor() }]}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={16} color={getUrgencyColor()} />
        <Text style={[styles.headerText, { color: getUrgencyColor() }]}>
          {urgencyLevel === 'high' ? 'Price changing soon!' : 'Price changes in'}
        </Text>
      </View>
      
      <View style={styles.timeContainer}>
        {timeRemaining.days > 0 && (
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeRemaining.days}</Text>
            <Text style={styles.timeLabel}>days</Text>
          </View>
        )}
        
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{String(timeRemaining.hours).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>hours</Text>
        </View>
        
        <View style={styles.timeSeparator}>
          <Text style={styles.timeSeparatorText}>:</Text>
        </View>
        
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{String(timeRemaining.minutes).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>mins</Text>
        </View>
        
        <View style={styles.timeSeparator}>
          <Text style={styles.timeSeparatorText}>:</Text>
        </View>
        
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{String(timeRemaining.seconds).padStart(2, '0')}</Text>
          <Text style={styles.timeLabel}>secs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    minHeight: 20,
  },
  icon: {
    marginRight: 4,
  },
  compactText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: typography.fontSizes.sm * 1.2,
    color: colors.text.inverse
  },
  
  // Full mode styles
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  timeValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  timeLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  timeSeparator: {
    marginHorizontal: 2,
  },
  timeSeparatorText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.secondary,
  },
});

export default PriceCountdown;
