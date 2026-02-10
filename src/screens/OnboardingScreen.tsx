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
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
import { Colors } from '../styles/theme';

import { saveUserName } from '../services/storageService';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
    OnboardingStackParamList,
    'Onboarding'
>;

interface OnboardingScreenProps {
    navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const [name, setName] = useState<string>('');

    const handleNext = async () => {
        if (name.trim()) {
            await saveUserName(name);
            navigation.navigate('CitySelection', { userName: name });
        }
    };

    const isButtonDisabled = name.trim().length === 0;

    return (
        <View style={styles.flex1}>
            {/* Background Image */}
            <Image
                source={require('../../assets/onboard-bg.jpg')}
                style={styles.absoluteBackground}
                resizeMode="cover"
            />

            {/* Green Overlay Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(6, 78, 59, 0.8)', 'rgba(6, 78, 59, 1)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
            />


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
                                        source={require('../../assets/mikat-logo.png')}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                </View>

                                <Text style={styles.subtitle}>
                                    "Her vakit bir hatırlayış, her an bir huzur"
                                </Text>
                            </View>


                            {/* Input & Button Row */}
                            <View style={styles.inputRow}>
                                <View style={styles.inputWrapper}>
                                    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                                    <TextInputField
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Adınızı girin"
                                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                        autoCapitalize="words"
                                        style={styles.input}
                                        inputStyle={styles.inputText}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.nextButton, isButtonDisabled && styles.disabledButton]}
                                    onPress={handleNext}
                                    disabled={isButtonDisabled}
                                >
                                    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                                    <Text style={styles.nextButtonText}>›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    absoluteBackground: {
        position: 'absolute',
        width: width,
        height: height,
        top: 0,
        left: 0,
    },

    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 40,
        zIndex: 10,
    },
    logoSection: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    logoContainer: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 30,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.36)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    inputWrapper: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        height: 60,
        marginRight: 16,
        justifyContent: 'center',
    },
    input: {
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
        height: '100%',
    },
    inputText: {
        color: '#FFFFFF',
        height: '100%',
        textAlignVertical: 'center',
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 14,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    disabledButton: {
        opacity: 0.5,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '300',
        marginTop: -6,
    },


    silhouetteContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.35,
        justifyContent: 'flex-end',
        alignItems: 'center',
        opacity: 0.6,
    },
    silhouette: {
        width: width,
        height: '100%',
    },

});

export default OnboardingScreen;


