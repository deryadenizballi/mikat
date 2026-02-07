import React, { useState } from 'react';
import {
    View as RNView,
    Text as RNText,
    StyleSheet,
    Image as RNImage,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback as RNTouchableWithoutFeedback,
    Keyboard,
} from 'react-native';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const TouchableWithoutFeedback = RNTouchableWithoutFeedback as any;
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';
import PrimaryButton from '../components/PrimaryButton';
import TextInputField from '../components/TextInputField';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
    OnboardingStackParamList,
    'Onboarding'
>;

interface OnboardingScreenProps {
    navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const [name, setName] = useState<string>('');

    const handleNext = () => {
        // Store name in local state (will be passed to next screen or context later)
        console.log('User name:', name);
        navigation.navigate('CitySelection', { userName: name });
    };

    const isButtonDisabled = name.trim().length === 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        {/* Logo Section */}
                        <View style={styles.logoSection}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/logo-placeholder.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.appName}>Mikat</Text>
                            <Text style={styles.subtitle}>
                                Günlük namaz ve oruç vakitleri kolayca
                            </Text>
                        </View>

                        {/* Input Section */}
                        <View style={styles.inputSection}>
                            <TextInputField
                                value={name}
                                onChangeText={setName}
                                placeholder="Adınızı girin"
                                autoCapitalize="words"
                                style={styles.input}
                            />
                        </View>

                        {/* Button Section */}
                        <View style={styles.buttonSection}>
                            <PrimaryButton
                                title="Devam"
                                onPress={handleNext}
                                disabled={isButtonDisabled}
                                style={styles.button}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 32,
    },
    logoSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E3A5F',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24,
    },
    logo: {
        width: 80,
        height: 80,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1E3A5F',
        letterSpacing: 1,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    inputSection: {
        paddingVertical: 32,
    },
    input: {
        alignSelf: 'stretch',
    },
    buttonSection: {
        paddingTop: 16,
    },
    button: {
        alignSelf: 'stretch',
    },
});

export default OnboardingScreen;

