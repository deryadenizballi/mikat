import React from 'react';
import * as RN from 'react-native';
import { Colors } from '../styles/theme';

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
        backgroundColor: Colors.primary,
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: Colors.disabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    buttonTextDisabled: {
        color: Colors.disabledText,
    },
});

export default PrimaryButton;

