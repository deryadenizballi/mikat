import React from 'react';
import * as RN from 'react-native';
import { Colors } from '../styles/theme';

interface TextInputFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: RN.ViewStyle;
    inputStyle?: RN.TextStyle;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    secureTextEntry?: boolean;
}

const TextInputField: React.FC<TextInputFieldProps & { placeholderTextColor?: string }> = ({
    value,
    onChangeText,
    placeholder = '',
    style,
    inputStyle,
    autoCapitalize = 'sentences',
    keyboardType = 'default',
    secureTextEntry = false,
    placeholderTextColor,
}) => {
    return (
        <RN.View style={[styles.container, style]}>
            <RN.TextInput
                style={[styles.input, inputStyle]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor || Colors.textSecondary}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
        </RN.View>
    );
};


const styles = RN.StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: Colors.textPrimary,
        borderRadius: 14,
    },
});

export default TextInputField;

