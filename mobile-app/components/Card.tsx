import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const paddingStyles = {
  none: '',
  small: 'p-2',
  medium: 'p-4',
  large: 'p-6',
};

const variantStyles = {
  default: 'bg-white shadow-sm',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border-2 border-gray-200',
};

export function Card({
  variant = 'default',
  padding = 'medium',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      className={`${variantStyles[variant]} ${paddingStyles[padding]} rounded-xl`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}