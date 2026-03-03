import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      icon,
      rightIcon,
      onRightIconPress,
      containerClassName = '',
      style,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const isPassword = props.secureTextEntry;

    const handleTogglePassword = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-gray-700 font-medium mb-2">{label}</Text>
        )}

        <View
          className={`flex-row items-center border rounded-xl px-4 py-3 bg-gray-50 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {icon && <View className="mr-3">{icon}</View>}

          <TextInput
            ref={ref}
            className="flex-1 text-gray-800"
            placeholderTextColor="#9ca3af"
            style={style}
            {...props}
            secureTextEntry={isPassword && !isPasswordVisible}
          />

          {isPassword && (
            <TouchableOpacity onPress={handleTogglePassword} className="ml-2">
              {isPasswordVisible ? (
                <EyeOff color="#6b7280" size={20} />
              ) : (
                <Eye color="#6b7280" size={20} />
              )}
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <TouchableOpacity onPress={onRightIconPress} className="ml-2">
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';