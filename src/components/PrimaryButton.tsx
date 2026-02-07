import React from 'react';
import * as RN from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: RN.ViewStyle;
    textStyle?: RN.TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style,
    textStyle,
}) => {
    return (
        <RN.TouchableOpacity
            style={[
                styles.button,
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <RN.Text style={[styles.buttonText, disabled && styles.buttonTextDisabled, textStyle]}>
                {title}
            </RN.Text>
        </RN.TouchableOpacity>
    );
};

const styles = RN.StyleSheet.create({
    button: {
        backgroundColor: '#1E3A5F',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E3A5F',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: '#B8C5D4',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    buttonTextDisabled: {
        color: '#8A9AAD',
    },
});

export default PrimaryButton;
