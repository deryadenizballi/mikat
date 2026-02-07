import React from 'react';
import * as RN from 'react-native';

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

const TextInputField: React.FC<TextInputFieldProps> = ({
    value,
    onChangeText,
    placeholder = '',
    style,
    inputStyle,
    autoCapitalize = 'sentences',
    keyboardType = 'default',
    secureTextEntry = false,
}) => {
    return (
        <RN.View style={[styles.container, style]}>
            <RN.TextInput
                style={[styles.input, inputStyle]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
        </RN.View>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    input: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2937',
        borderRadius: 14,
    },
});

export default TextInputField;
