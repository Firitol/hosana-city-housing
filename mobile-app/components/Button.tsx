import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-200',
  danger: 'bg-red-600',
  outline: 'bg-transparent border-2 border-blue-600',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-gray-800',
  danger: 'text-white',
  outline: 'text-blue-600',
};

const sizeStyles = {
  small: 'px-4 py-2',
  medium: 'px-6 py-3',
  large: 'px-8 py-4',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  size = 'medium',
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } rounded-xl items-center justify-center flex-row ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#2563eb' : 'white'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center">{children}</View>
      )}
    </TouchableOpacity>
  );
}x