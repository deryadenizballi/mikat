import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = SCREEN_WIDTH * 0.95;

// Alt menü yüksekliği azaltıldı
const TAB_BAR_HEIGHT = 75;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const tabWidth = BAR_WIDTH / state.routes.length;
    const animationValue = useRef(new Animated.Value(state.index)).current;

    useEffect(() => {
        Animated.spring(animationValue, {
            toValue: state.index,
            useNativeDriver: true,
            bounciness: 4,
            speed: 10,
        }).start();
    }, [state.index]);

    const translateX = animationValue.interpolate({
        inputRange: state.routes.map((_: any, i: number) => i),
        outputRange: state.routes.map((_: any, i: number) => i * tabWidth),
    });

    return (
        <View style={styles.container}>
            {/* Arka plan Cam Efekti */}
            <BlurView intensity={60} tint="dark" style={styles.blurBackground} />

            {/* Hareketli Mavi Daire - İçerik katmanının altına alındı */}
            <Animated.View
                style={[
                    styles.animatedCircleContainer,
                    {
                        width: tabWidth,
                        transform: [{ translateX }]
                    }
                ]}
            >
                <View style={styles.circleWrapper}>
                    <View style={styles.shadowBlue} />
                    <LinearGradient
                        colors={['#00E5FF', '#2979FF']}
                        style={styles.activeCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>
            </Animated.View>

            <View style={styles.content}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <View key={route.key} style={styles.tabItemContainer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <View style={[
                                    styles.iconWrapper,
                                    isFocused && styles.activeIconWrapper
                                ]}>
                                    {options.tabBarIcon ? (
                                        options.tabBarIcon({
                                            color: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                                            size: isFocused ? 28 : 24,
                                            focused: isFocused
                                        })
                                    ) : null}
                                </View>
                                {!isFocused && (
                                    <Text style={[
                                        styles.label,
                                        { color: 'rgba(255, 255, 255, 0.4)' }
                                    ]}>
                                        {route.name === 'PrayerTimes' ? 'Vakitler' : route.name === 'Settings' ? 'Ayarlar' : 'Ana Sayfa'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// --- Custom Icons ---

export const VakitIcon = ({ color, size }: { color: string; size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 640 640">
        <Path
            fill={color}
            d="M544 320C544 443.7 443.7 544 320 544C196.3 544 96 443.7 96 320C96 196.3 196.3 96 320 96C443.7 96 544 196.3 544 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM304 176L304 320C304 325.4 306.7 330.3 311.1 333.3L407.1 397.3C414.5 402.2 424.4 400.2 429.3 392.9C434.2 385.6 432.2 375.6 424.9 370.7L336 311.4L336 176C336 167.2 328.8 160 320 160C311.2 160 304 167.2 304 176z"
        />
    </Svg>
);

export const HouseIcon = ({ color, size }: { color: string; size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 640 640">
        <Path
            fill={color}
            d="M309.6 68.3C315.7 62.6 325.3 62.6 331.4 68.3L571.4 292.3C577.9 298.3 578.2 308.5 572.2 314.9C566.2 321.3 556 321.7 549.6 315.7L528.5 296L528.5 512C528.5 547.3 499.8 576 464.5 576L176.5 576C141.2 576 112.5 547.3 112.5 512L112.5 296L91.4 315.7C84.9 321.7 74.8 321.4 68.8 314.9C62.8 308.4 63.1 298.3 69.6 292.3L309.6 68.3zM320.5 101.9L144.5 266.2L144.5 512C144.5 529.7 158.8 544 176.5 544L240.5 544L240.5 432C240.5 396.7 269.2 368 304.5 368L336.5 368C371.8 368 400.5 396.7 400.5 432L400.5 544L464.5 544C482.2 544 496.5 529.7 496.5 512L496.5 266.2L320.5 101.9zM272.5 544L368.5 544L368.5 432C368.5 414.3 354.2 400 336.5 400L304.5 400C286.8 400 272.5 414.3 272.5 432L272.5 544z"
        />
    </Svg>
);

export const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
    <Svg width={size} height={size} viewBox="0 0 640 640">
        <Path
            fill={color}
            d="M224 192C224 139 267 96 320 96C373 96 416 139 416 192C416 245 373 288 320 288C267 288 224 245 224 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM128 544C128 464.5 192.5 400 272 400L368 400C447.5 400 512 464.5 512 544L512 560C512 568.8 519.2 576 528 576C536.8 576 544 568.8 544 560L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 560C96 568.8 103.2 576 112 576C120.8 576 128 568.8 128 560L128 544z"
        />
    </Svg>
);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 25,
        width: BAR_WIDTH,
        height: TAB_BAR_HEIGHT,
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    animatedCircleContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Arka plana çekildi
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.75)', // Beyaz ikonlar için koyu arka plan
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 0,
        zIndex: 10, // İkonlar ve butonlar en öne alındı
    },
    tabItemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    activeTabItem: {
        // Aktifken özel bir stil gerekiyorsa buraya eklenebilir
    },
    iconWrapper: {
        marginBottom: 4,
    },
    activeIconWrapper: {
        marginTop: -32,
        marginBottom: 0,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
    },
    circleWrapper: {
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -32,
    },
    activeCircle: {
        position: 'absolute',
        width: 65,
        height: 65,
        borderRadius: 32.5,
    },
    centerIcon: {
        zIndex: 2,
    },
    shadowBlue: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2979FF',
        opacity: 0.4,
        transform: [{ scale: 1.2 }],
        // iOS Shadow
        shadowColor: '#2979FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        // Android Elevation
        elevation: 15,
    },
});

export default CustomTabBar;
