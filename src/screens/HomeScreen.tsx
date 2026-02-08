import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { Colors } from '../styles/theme';

type HomeScreenRouteProp = RouteProp<MainTabParamList, 'Home'>;

interface HomeScreenProps {
    route: HomeScreenRouteProp;
}

const { width } = RN.Dimensions.get('window');

const HomeScreen = ({ route }: HomeScreenProps) => {
    const city = route.params?.city || 'İstanbul';
    const district = route.params?.district || 'Kadıköy';

    const [timeLeft, setTimeLeft] = useState('05:28');
    const [isMealModalVisible, setIsMealModalVisible] = useState(false);
    const [isHadithModalVisible, setIsHadithModalVisible] = useState(false);

    return (
        <RN.View style={styles.container}>
            {/* Premium Dark Gradient Background */}
            <LinearGradient
                colors={['#0F172A', '#0B121C', '#05080D']}
                style={RN.StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <RN.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>



                    {/* 2. Date Navigation Card */}
                    <RN.View style={styles.dateCard}>
                        <LinearGradient
                            colors={['rgba(0, 225, 255, 0.12)', 'rgba(41, 121, 255, 0.12)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.TouchableOpacity style={styles.arrowBtn}>
                            <RN.Text style={styles.arrowText}>‹</RN.Text>
                        </RN.TouchableOpacity>

                        <RN.View style={styles.dateInfo}>
                            <RN.Text style={styles.hijriDate}>15 Ramazan, 1445</RN.Text>
                            <RN.Text style={styles.gregorianDate}>16 Mart 2025</RN.Text>
                        </RN.View>

                        <RN.TouchableOpacity style={styles.arrowBtn}>
                            <RN.Text style={styles.arrowText}>›</RN.Text>
                        </RN.TouchableOpacity>
                    </RN.View>

                    {/* 3. Central Circular Timer Section */}
                    <RN.View style={styles.timerSection}>
                        <RN.View style={styles.outerCircle}>
                            {/* Inner Circle Content */}
                            <RN.View style={styles.innerCircle}>
                                <RN.Text style={styles.timerLabel}>İftar Vakti</RN.Text>
                                <Svg height="65" width="160">
                                    <Defs>
                                        <SvgGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <Stop offset="0%" stopColor="#00E5FF" />
                                            <Stop offset="100%" stopColor="#2979FF" />
                                        </SvgGradient>
                                    </Defs>
                                    <SvgText
                                        fill="url(#textGrad)"
                                        fontSize="50"
                                        fontWeight="bold"
                                        x="80"
                                        y="50"
                                        textAnchor="middle"
                                    >
                                        {timeLeft}
                                    </SvgText>
                                </Svg>
                                <RN.Text style={styles.remainingLabel}>Kalan Süre</RN.Text>
                            </RN.View>

                            {/* Visual representation of the progress ring with gradient */}
                            <Svg height={width * 0.55} width={width * 0.55} style={styles.progressRing}>
                                <Defs>
                                    <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <Stop offset="0%" stopColor="#00E5FF" />
                                        <Stop offset="100%" stopColor="#2979FF" />
                                    </SvgGradient>
                                </Defs>
                                <Circle
                                    cx={(width * 0.55) / 2}
                                    cy={(width * 0.55) / 2}
                                    r={(width * 0.55 - 8) / 2}
                                    stroke="url(#grad)"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={`${(Math.PI * (width * 0.55 - 8)) * 0.7} ${Math.PI * (width * 0.55 - 8)}`}
                                    strokeLinecap="round"
                                />
                            </Svg>
                        </RN.View>
                    </RN.View>

                    {/* 4. Namaz Vakitleri Grid Section */}
                    <RN.View style={styles.vakitlerContainer}>
                        <LinearGradient
                            colors={['rgba(0, 229, 255, 0.15)', 'rgba(41, 121, 255, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.View style={styles.vakitHeader}>
                            <RN.Text style={styles.vakitHeaderText}>🌙✨ {district} Namaz Vakitleri</RN.Text>
                        </RN.View>

                        <RN.View style={styles.vakitGrid}>
                            {[
                                { label: 'İmsak', time: '04:15', active: true },
                                { label: 'Güneş', time: '05:48', active: false },
                                { label: 'Öğle', time: '13:12', active: false },
                                { label: 'İkindi', time: '16:55', active: false },
                                { label: 'Akşam', time: '19:42', active: false },
                                { label: 'Yatsı', time: '21:05', active: false },
                            ].map((vakit, index) => (
                                <RN.View key={index} style={[styles.vakitCard, vakit.active && styles.vakitCardActive]}>
                                    <LinearGradient
                                        colors={vakit.active ? ['rgba(0, 229, 255, 0.25)', 'rgba(41, 121, 255, 0.15)'] : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                                        style={RN.StyleSheet.absoluteFill}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    />
                                    <RN.Text style={[styles.vakitLabel, vakit.active && styles.vakitLabelActive]}>{vakit.label}</RN.Text>
                                    <RN.Text style={[styles.vakitTime, vakit.active && styles.vakitTimeActive]}>{vakit.time}</RN.Text>
                                </RN.View>
                            ))}
                        </RN.View>
                    </RN.View>

                    {/* 6. Quick Action Row (Meal & Hadith) */}
                    <RN.View style={styles.actionRow}>
                        <RN.TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsMealModalVisible(true)}
                        >
                            <LinearGradient
                                colors={['rgba(0, 229, 255, 0.15)', 'rgba(41, 121, 255, 0.05)']}
                                style={RN.StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <RN.Text style={styles.actionEmoji}>🍲</RN.Text>
                            <RN.Text style={styles.actionLabel}>GÜNLÜK MENÜ</RN.Text>
                            <RN.Text style={styles.actionTitle}>Yemek Önerileri</RN.Text>
                        </RN.TouchableOpacity>

                        <RN.TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsHadithModalVisible(true)}
                        >
                            <LinearGradient
                                colors={['rgba(0, 229, 255, 0.15)', 'rgba(41, 121, 255, 0.05)']}
                                style={RN.StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <RN.Text style={styles.actionEmoji}>📜</RN.Text>
                            <RN.Text style={styles.actionLabel}>GÜNÜN HİKMETİ</RN.Text>
                            <RN.Text style={styles.actionTitle}>Günün Hadisi</RN.Text>
                        </RN.TouchableOpacity>
                    </RN.View>

                </RN.ScrollView>
            </SafeAreaView>

            {/* Meal Modal */}
            <RN.Modal
                animationType="slide"
                transparent={true}
                visible={isMealModalVisible}
                onRequestClose={() => setIsMealModalVisible(false)}
            >
                <RN.TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsMealModalVisible(false)}
                >
                    <BlurView intensity={20} tint="dark" style={RN.StyleSheet.absoluteFill} />
                    <RN.View style={styles.modalContent}>
                        <RN.View style={styles.modalHandle} />
                        <RN.Text style={styles.modalTitle}>Günün Yemek Menüsü</RN.Text>
                        <RN.View style={styles.modalDivider} />
                        <RN.View style={styles.mealItem}>
                            <RN.Text style={styles.mealEmoji}>🥣</RN.Text>
                            <RN.Text style={styles.mealName}>Süzme Mercimek Çorbası</RN.Text>
                        </RN.View>
                        <RN.View style={styles.mealItem}>
                            <RN.Text style={styles.mealEmoji}>🥘</RN.Text>
                            <RN.Text style={styles.mealName}>Pirinç Pilavı & İzmir Köfte</RN.Text>
                        </RN.View>
                        <RN.View style={styles.mealItem}>
                            <RN.Text style={styles.mealEmoji}>🥗</RN.Text>
                            <RN.Text style={styles.mealName}>Mevsim Salatası</RN.Text>
                        </RN.View>
                        <RN.View style={styles.mealItem}>
                            <RN.Text style={styles.mealEmoji}>🧁</RN.Text>
                            <RN.Text style={styles.mealName}>Şekerpare</RN.Text>
                        </RN.View>
                    </RN.View>
                </RN.TouchableOpacity>
            </RN.Modal>

            {/* Hadith Modal */}
            <RN.Modal
                animationType="slide"
                transparent={true}
                visible={isHadithModalVisible}
                onRequestClose={() => setIsHadithModalVisible(false)}
            >
                <RN.TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsHadithModalVisible(false)}
                >
                    <BlurView intensity={20} tint="dark" style={RN.StyleSheet.absoluteFill} />
                    <RN.View style={styles.modalContent}>
                        <RN.View style={styles.modalHandle} />
                        <RN.Text style={styles.modalTitle}>Günün Hadisi</RN.Text>
                        <RN.View style={styles.modalDivider} />
                        <RN.Text style={styles.hadithText}>
                            "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz."
                        </RN.Text>
                        <RN.Text style={styles.hadithSource}>- Buhârî, İlm, 12</RN.Text>
                    </RN.View>
                </RN.TouchableOpacity>
            </RN.Modal>
        </RN.View>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B121C',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120, // Increased to clear the custom tab bar
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 6,
    },
    dropdownIcon: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
    gridBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridBtnText: {
        color: '#FFFFFF',
        fontSize: 24,
    },
    dateCard: {
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 255, 0.2)',
    },
    arrowBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '300',
    },
    dateInfo: {
        alignItems: 'center',
    },
    hijriDate: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    gregorianDate: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
    },
    timerSection: {
        alignItems: 'center',
        marginVertical: 25,
    },
    outerCircle: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        borderWidth: 8,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerCircle: {
        alignItems: 'center',
    },
    progressRing: {
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
    },
    timerLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    remainingLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 6,
    },
    vakitlerContainer: {
        marginTop: 10,
        marginBottom: 0,
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 255, 0.2)',
        overflow: 'hidden',
    },
    vakitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    vakitHeaderText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    vakitGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    vakitCard: {
        width: '31%',
        height: 80,
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    vakitCardActive: {
        borderColor: 'rgba(0, 229, 255, 0.5)',
        borderWidth: 1.5,
    },
    vakitLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        marginBottom: 4,
    },
    vakitLabelActive: {
        color: '#00E1FF',
        fontWeight: 'bold',
    },
    vakitTime: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    vakitTimeActive: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    statusLabel: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statusTime: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    actionButton: {
        width: '48%',
        height: 140,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 255, 0.2)',
    },
    actionEmoji: {
        fontSize: 24,
        marginBottom: 15,
    },
    actionLabel: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 6,
    },
    actionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#161F2C',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 50,
        minHeight: 300,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 12,
        borderRadius: 12,
    },
    mealEmoji: {
        fontSize: 24,
        marginRight: 15,
    },
    mealName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    hadithText: {
        color: '#FFFFFF',
        fontSize: 20,
        lineHeight: 32,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    hadithSource: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default HomeScreen;
