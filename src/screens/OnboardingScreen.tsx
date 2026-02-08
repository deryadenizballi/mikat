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
} from 'react-native';
import { BlurView } from 'expo-blur';

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

    const handleNext = () => {
        console.log('User name:', name);
        navigation.navigate('CitySelection', { userName: name });
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
                                    "Her vakit bir hatırlayış, her an bir huzur"
                                </Text>
                            </View>


                            {/* Input Section */}
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Size nasıl hitap edelim?</Text>
                                <View style={styles.glassWrapper}>
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
                            </View>


                            {/* Button Section */}
                            <View style={styles.buttonSection}>
                                <PrimaryButton
                                    title="Başla"
                                    onPress={handleNext}
                                    disabled={isButtonDisabled}
                                    style={styles.button}
                                    textStyle={styles.buttonTitle}
                                />
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
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
        tintColor: '#FFFFFF',
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

    inputSection: {
        marginBottom: 30,
    },
    inputLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 12,
        fontWeight: '600',
        marginLeft: 4,
        opacity: 0.9,
    },
    input: {
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
    },
    inputText: {
        color: '#FFFFFF',
    },
    glassWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonSection: {
        paddingTop: 10,
    },
    button: {
        alignSelf: 'stretch',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOpacity: 0.3,
    },
    buttonTitle: {
        color: '#111',
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


