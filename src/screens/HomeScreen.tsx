import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { Colors } from '../styles/theme';
import { useApp } from '../context/AppContext';
import { getTodayPrayerTimes } from '../services/prayerTimesService';
import { DayData } from '../types';

type HomeScreenRouteProp = RouteProp<MainTabParamList, 'Home'>;

interface HomeScreenProps {
    route: HomeScreenRouteProp;
}

const { width } = RN.Dimensions.get('window');

// Android için LayoutAnimation desteğini etkinleştir
if (RN.Platform.OS === 'android' && RN.UIManager.setLayoutAnimationEnabledExperimental) {
    RN.UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Reusable Circular Timer Component
const TimerCircle = ({
    size,
    label,
    time,
    colors,
    subLabel,
    progress = 1,
    small = false,
    onPress
}: {
    size: number;
    label: string;
    time: string;
    colors: string[];
    subLabel: string;
    progress?: number;
    small?: boolean;
    onPress?: () => void;
}) => {
    const strokeWidth = small ? 4 : 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <RN.TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={!onPress}
            style={[styles.timerCircleContainer, { width: size }]}
        >
            <RN.View style={[styles.outerCircle, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]}>
                {/* Visual Circle */}
                <Svg height={size} width={size} style={styles.progressRing}>
                    <Defs>
                        <SvgGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={colors[0]} />
                            <Stop offset="100%" stopColor={colors[1]} />
                        </SvgGradient>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={`url(#grad-${label})`}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </Svg>

                <RN.View style={styles.innerCircle}>
                    <RN.Text style={[styles.timerLabel, small && styles.timerLabelSmall]}>{label}</RN.Text>
                    <RN.Text style={[styles.timerTime, small && styles.timerTimeSmall, { color: colors[1] }]}>{time}</RN.Text>
                    <RN.Text style={[styles.remainingLabel, small && styles.remainingLabelSmall]}>{subLabel}</RN.Text>
                </RN.View>
            </RN.View>
        </RN.TouchableOpacity>
    );
};

const HomeScreen = ({ route }: HomeScreenProps) => {
    const { location } = useApp();
    const [prayerTimes, setPrayerTimes] = useState<DayData | null>(null);
    const [loading, setLoading] = useState(true);

    // Timers
    const [nextPrayerTimeLeft, setNextPrayerTimeLeft] = useState('--:--:--');
    const [nextPrayerName, setNextPrayerName] = useState('Yükleniyor...');
    const [nextPrayerProgress, setNextPrayerProgress] = useState(1);

    const [activePrayerName, setActivePrayerName] = useState('Yükleniyor...'); // For grid highlight

    const [iftarTimeLeft, setIftarTimeLeft] = useState('--:--:--');
    const [iftarProgress, setIftarProgress] = useState(1);

    const [sahurTimeLeft, setSahurTimeLeft] = useState('--:--:--');
    const [sahurProgress, setSahurProgress] = useState(1);

    // Timer Order State: [Left, Center, Right]
    const [timerPositions, setTimerPositions] = useState<('next' | 'iftar' | 'sahur')[]>(['next', 'iftar', 'sahur']);

    const handleTimerPress = (index: number) => {
        if (index === 1) return; // Ortadaki zaten odaklanmış durumda

        // Animasyon ekle
        RN.LayoutAnimation.configureNext(RN.LayoutAnimation.Presets.easeInEaseOut);

        const newPositions = [...timerPositions];
        const temp = newPositions[1];
        newPositions[1] = newPositions[index];
        newPositions[index] = temp;
        setTimerPositions(newPositions);
    };

    const [isMealModalVisible, setIsMealModalVisible] = useState(false);
    const [isHadithModalVisible, setIsHadithModalVisible] = useState(false);

    // Namaz vakitlerini çek
    useEffect(() => {
        async function fetchTimes() {
            if (location) {
                try {
                    setLoading(true);
                    const data = await getTodayPrayerTimes(location.cityPlateCode, location.districtKey);
                    setPrayerTimes(data);
                } catch (error) {
                    console.error('Namaz vakitleri çekilemedi:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchTimes();
    }, [location]);

    // Timer Logic
    useEffect(() => {
        if (!prayerTimes) return;

        const timer = setInterval(() => {
            const now = new Date();
            const currentTimeSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

            const parseToSeconds = (timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number);
                return h * 3600 + m * 60;
            };

            const times = {
                imsak: parseToSeconds(prayerTimes.prayerTimes.imsak),
                gunes: parseToSeconds(prayerTimes.prayerTimes.gunes),
                ogle: parseToSeconds(prayerTimes.prayerTimes.ogle),
                ikindi: parseToSeconds(prayerTimes.prayerTimes.ikindi),
                aksam: parseToSeconds(prayerTimes.prayerTimes.aksam), // Iftar
                yatsi: parseToSeconds(prayerTimes.prayerTimes.yatsi),
            };

            const formatDuration = (diffSeconds: number) => {
                let diff = diffSeconds;
                if (diff < 0) diff += 24 * 3600;
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };

            const calculateProgress = (diffSeconds: number, totalSeconds: number) => {
                if (totalSeconds <= 0) return 0;
                // Süre azaldıkça dolmasını istiyoruz: 1 - (kalan / toplam)
                const progress = 1 - (diffSeconds / totalSeconds);
                return Math.max(0, Math.min(1, progress));
            };

            // 1. Next Prayer (Sol)
            let nextP = '';
            let nextDiff = 0;
            let nextTotal = 0;

            if (currentTimeSeconds < times.imsak) {
                // Sahur (Imsak) sağda var, Güneş'e odaklan. Pencere dünkü Yatsı'dan başlar.
                nextP = 'Güneş';
                nextDiff = times.gunes - currentTimeSeconds;
                nextTotal = times.gunes - (times.yatsi - 24 * 3600);
            } else if (currentTimeSeconds < times.gunes) {
                nextP = 'Güneş';
                nextDiff = times.gunes - currentTimeSeconds;
                nextTotal = times.gunes - times.imsak;
            } else if (currentTimeSeconds < times.ogle) {
                nextP = 'Öğle';
                nextDiff = times.ogle - currentTimeSeconds;
                nextTotal = times.ogle - times.gunes;
            } else if (currentTimeSeconds < times.ikindi) {
                nextP = 'İkindi';
                nextDiff = times.ikindi - currentTimeSeconds;
                nextTotal = times.ikindi - times.ogle;
            } else if (currentTimeSeconds < times.aksam) {
                // İftar (Akşam) ortada var, Yatsı'ya odaklan. Pencere İkindi'den başlar.
                nextP = 'Yatsı';
                nextDiff = times.yatsi - currentTimeSeconds;
                nextTotal = times.yatsi - times.ikindi;
            } else if (currentTimeSeconds < times.yatsi) {
                nextP = 'Yatsı';
                nextDiff = times.yatsi - currentTimeSeconds;
                nextTotal = times.yatsi - times.aksam;
            } else {
                // Yatsı geçti, Sahur sağda var, Güneş'e odaklan. Pencere bugünkü Yatsı'dan başlar.
                nextP = 'Güneş';
                nextDiff = (24 * 3600 + times.gunes) - currentTimeSeconds;
                nextTotal = (24 * 3600 + times.gunes) - times.yatsi;
            }
            setNextPrayerName(nextP);
            setNextPrayerTimeLeft(formatDuration(nextDiff));
            setNextPrayerProgress(calculateProgress(nextDiff, nextTotal));

            // Grid Highlight Logic
            let realNext = '';
            if (currentTimeSeconds < times.imsak) realNext = 'İmsak';
            else if (currentTimeSeconds < times.gunes) realNext = 'Güneş';
            else if (currentTimeSeconds < times.ogle) realNext = 'Öğle';
            else if (currentTimeSeconds < times.ikindi) realNext = 'İkindi';
            else if (currentTimeSeconds < times.aksam) realNext = 'Akşam';
            else if (currentTimeSeconds < times.yatsi) realNext = 'Yatsı';
            else realNext = 'İmsak';
            setActivePrayerName(realNext);

            // 2. Iftar (Orta)
            let iftarDiff = times.aksam - currentTimeSeconds;
            let iftarTotal = 24 * 3600; // 24 saatlik döngü
            if (currentTimeSeconds >= times.aksam) {
                iftarDiff += 24 * 3600;
            }
            setIftarTimeLeft(formatDuration(iftarDiff));
            setIftarProgress(calculateProgress(iftarDiff, iftarTotal));

            // 3. Sahur (Sağ)
            let sahurDiff = times.imsak - currentTimeSeconds;
            let sahurTotal = 24 * 3600; // 24 saatlik döngü
            if (currentTimeSeconds >= times.imsak) {
                sahurDiff += 24 * 3600;
            }
            setSahurTimeLeft(formatDuration(sahurDiff));
            setSahurProgress(calculateProgress(sahurDiff, sahurTotal));

        }, 1000);

        return () => clearInterval(timer);
    }, [prayerTimes]);

    const formattedDate = new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });

    const hijriDate = prayerTimes?.hijriDate || '15 Ramazan, 1445';

    // Sizes
    const centerSize = width * 0.45; // Increased center slightly for balance
    const sideSize = width * 0.16; // Reduced by another 10% (0.18 -> 0.16)

    return (
        <RN.View style={styles.container}>
            <LinearGradient
                colors={['#064E3B', '#022C22', '#000000']}
                style={RN.StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <RN.Image
                source={require('../../assets/home-bg-ui.png')}
                style={styles.decorativeImage}
                resizeMode="contain"
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <RN.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Date Navigation Card */}
                    <RN.View style={styles.dateCard}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.12)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.TouchableOpacity style={styles.arrowBtn}>
                            <RN.Text style={styles.arrowText}>‹</RN.Text>
                        </RN.TouchableOpacity>

                        <RN.View style={styles.dateInfo}>
                            <RN.Text style={styles.hijriDate}>{hijriDate}</RN.Text>
                            <RN.Text style={styles.gregorianDate}>{formattedDate}</RN.Text>
                        </RN.View>

                        <RN.TouchableOpacity style={styles.arrowBtn}>
                            <RN.Text style={styles.arrowText}>›</RN.Text>
                        </RN.TouchableOpacity>
                    </RN.View>

                    {/* 3-Timer Section */}
                    <RN.View style={styles.timerSection}>
                        {timerPositions.map((type, index) => {
                            const isCenter = index === 1;
                            const size = isCenter ? centerSize : sideSize;
                            const isSmall = !isCenter;

                            if (type === 'next') {
                                return (
                                    <TimerCircle
                                        key="next"
                                        size={size}
                                        label={nextPrayerName}
                                        time={nextPrayerTimeLeft}
                                        subLabel="Kaldı"
                                        colors={['#10B981', '#059669']}
                                        progress={nextPrayerProgress}
                                        small={isSmall}
                                        onPress={() => handleTimerPress(index)}
                                    />
                                );
                            } else if (type === 'iftar') {
                                return (
                                    <TimerCircle
                                        key="iftar"
                                        size={size}
                                        label="İftar'a"
                                        time={iftarTimeLeft}
                                        subLabel="Kaldı"
                                        colors={['#34D399', '#10B981']}
                                        progress={iftarProgress}
                                        small={isSmall}
                                        onPress={() => handleTimerPress(index)}
                                    />
                                );
                            } else {
                                return (
                                    <TimerCircle
                                        key="sahur"
                                        size={size}
                                        label="Sahur'a"
                                        time={sahurTimeLeft}
                                        subLabel="Kaldı"
                                        colors={['#10B981', '#059669']}
                                        progress={sahurProgress}
                                        small={isSmall}
                                        onPress={() => handleTimerPress(index)}
                                    />
                                );
                            }
                        })}
                    </RN.View>

                    {/* Namaz Vakitleri Grid Section */}
                    <RN.View style={styles.vakitlerContainer}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.View style={styles.vakitHeader}>
                            <RN.Text style={styles.vakitHeaderText}>🌙✨ {location ? location.districtName : 'Şehir Seçiniz'} Namaz Vakitleri</RN.Text>
                        </RN.View>

                        {prayerTimes ? (
                            <RN.View style={styles.vakitGrid}>
                                {[
                                    { label: 'İmsak', time: prayerTimes.prayerTimes.imsak, active: activePrayerName === 'İmsak' },
                                    { label: 'Güneş', time: prayerTimes.prayerTimes.gunes, active: activePrayerName === 'Güneş' },
                                    { label: 'Öğle', time: prayerTimes.prayerTimes.ogle, active: activePrayerName === 'Öğle' },
                                    { label: 'İkindi', time: prayerTimes.prayerTimes.ikindi, active: activePrayerName === 'İkindi' },
                                    { label: 'Akşam', time: prayerTimes.prayerTimes.aksam, active: activePrayerName === 'Akşam' },
                                    { label: 'Yatsı', time: prayerTimes.prayerTimes.yatsi, active: activePrayerName === 'Yatsı' },
                                ].map((vakit, index) => (
                                    <RN.View key={index} style={[styles.vakitCard, vakit.active && styles.vakitCardActive]}>
                                        <LinearGradient
                                            colors={vakit.active ? ['#059669', '#047857'] : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                                            style={RN.StyleSheet.absoluteFill}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        />
                                        <RN.Text style={[styles.vakitLabel, vakit.active && styles.vakitLabelActive]}>{vakit.label}</RN.Text>
                                        <RN.Text style={[styles.vakitTime, vakit.active && styles.vakitTimeActive]}>{vakit.time}</RN.Text>
                                    </RN.View>
                                ))}
                            </RN.View>
                        ) : (
                            <RN.Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>Yükleniyor...</RN.Text>
                        )}
                    </RN.View>

                    {/* Quick Action Row */}
                    <RN.View style={styles.actionRow}>
                        <RN.TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsMealModalVisible(true)}
                        >
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
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
                                colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
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
        backgroundColor: '#022C22',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
        paddingTop: 10,
    },
    // ... (Keep existing styles for header, logo, location etc. if needed, or remove if unused)
    dateCard: {
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: 'rgba(6, 78, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        marginBottom: 20, // Add margin bottom
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
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute evenly
        alignItems: 'center', // Align centers vertically
        marginBottom: 25,
        paddingHorizontal: 10, // Add some padding to avoid edge touch
    },
    timerCircleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerCircle: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight background
    },
    innerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    progressRing: {
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
    },
    timerLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12, // Adjusted for main timer
        fontWeight: '500',
        marginBottom: 2,
        textAlign: 'center',
    },
    timerLabelSmall: {
        fontSize: 9, // Smaller for side timers
        marginBottom: 0,
    },
    timerTime: {
        fontSize: 24, // Reduced from 28 to fit HH:MM:SS
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    timerTimeSmall: {
        fontSize: 10, // Reduced from 14 to fit HH:MM:SS
        fontWeight: 'bold',
        letterSpacing: -0.2,
    },
    remainingLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },
    remainingLabelSmall: {
        fontSize: 8,
        marginTop: 0,
    },
    vakitlerContainer: {
        marginTop: 10,
        marginBottom: 0,
        backgroundColor: 'rgba(6, 78, 59, 0.3)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
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
        borderColor: '#34D399',
        borderWidth: 2,
        shadowColor: "#34D399",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    vakitLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        marginBottom: 4,
    },
    vakitLabelActive: {
        color: '#FFFFFF',
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
        backgroundColor: 'rgba(6, 78, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
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
        backgroundColor: '#064E3B',
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
    decorativeImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: 350,
        opacity: 0.05,
    },
});

export default HomeScreen;
