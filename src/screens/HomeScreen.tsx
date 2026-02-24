import React, { useState, useEffect, useRef } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { MainTabParamList } from '../navigation/MainTabNavigator';
import { Colors } from '../styles/theme';
import { useApp } from '../context/AppContext';
import { saveInstallDate, getInstallDate } from '../services/storageService';
import { DayData } from '../types';
import mealData from '../data/meals.json';
import hadithData from '../data/hadiths.json';

type HomeScreenRouteProp = RouteProp<MainTabParamList, 'Home'>;

interface HomeScreenProps {
    route: HomeScreenRouteProp;
}

const { width, height } = RN.Dimensions.get('window');

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
    onPress,
    animatedStyle
}: {
    size: number;
    label: string;
    time: string;
    colors: string[];
    subLabel: string;
    progress?: number;
    onPress?: () => void;
    animatedStyle?: any;
}) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <RN.Animated.View style={[{ width: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
            <RN.TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                disabled={!onPress}
                style={[styles.timerCircleContainer, { width: size }]}
            >
                <RN.View style={[styles.outerCircle, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]}>
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
                        <RN.Text style={styles.timerLabel}>{label}</RN.Text>
                        <RN.Text style={[styles.timerTime, { color: colors[1] }]}>{time}</RN.Text>
                        <RN.Text style={styles.remainingLabel}>{subLabel}</RN.Text>
                    </RN.View>
                </RN.View>
            </RN.TouchableOpacity>
        </RN.Animated.View>
    );
};

const HomeScreen = ({ route }: HomeScreenProps) => {
    const { location, todayData: prayerTimes, prayerTimesLoading: loading } = useApp();

    // Timers
    const [nextPrayerTimeLeft, setNextPrayerTimeLeft] = useState('--:--:--');
    const [nextPrayerName, setNextPrayerName] = useState('Yükleniyor...');
    const [nextPrayerProgress, setNextPrayerProgress] = useState(1);

    const [activePrayerName, setActivePrayerName] = useState('Yükleniyor...'); // For grid highlight

    const [iftarTimeLeft, setIftarTimeLeft] = useState('--:--:--');
    const [iftarProgress, setIftarProgress] = useState(1);

    const [sahurTimeLeft, setSahurTimeLeft] = useState('--:--:--');
    const [sahurProgress, setSahurProgress] = useState(1);

    // Slider Logic
    const scrollX = useRef(new RN.Animated.Value(0)).current;
    const flatListRef = useRef<RN.FlatList>(null);
    const ITEM_WIDTH = width * 0.48; // Circle boyutuyla aynı
    const SPACING = (width - ITEM_WIDTH) / 2; // Tam ortalama için

    const timerData = [
        { id: 'next', label: nextPrayerName, time: nextPrayerTimeLeft, progress: nextPrayerProgress, colors: ['#10B981', '#059669'] },
        { id: 'iftar', label: "İftar'a", time: iftarTimeLeft, progress: iftarProgress, colors: ['#34D399', '#10B981'] },
        { id: 'sahur', label: "Sahur'a", time: sahurTimeLeft, progress: sahurProgress, colors: ['#10B981', '#059669'] },
    ];

    const handleTimerPress = (index: number) => {
        flatListRef.current?.scrollToOffset({
            offset: index * ITEM_WIDTH,
            animated: true,
        });
    };

    // ... (keep useEffects/getDailyMenu/etc as is)

    // ... (skipping to renderItem update inside return if needed, but I'll do it in one chunk if possible)


    const [isMealModalVisible, setIsMealModalVisible] = useState(false);
    const [isHadithModalVisible, setIsHadithModalVisible] = useState(false);

    // Accordion State
    const [isSahurOpen, setIsSahurOpen] = useState(false);
    const [isIftarOpen, setIsIftarOpen] = useState(true);

    const toggleSection = (section: 'sahur' | 'iftar') => {
        RN.LayoutAnimation.configureNext(RN.LayoutAnimation.Presets.easeInEaseOut);
        if (section === 'sahur') setIsSahurOpen(!isSahurOpen);
        else setIsIftarOpen(!isIftarOpen);
    };



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

    // Get Daily Menu - Kurulum tarihinden itibaren sırayla, liste bitince başa döner
    const [dailyMenu, setDailyMenu] = useState(mealData.days[0]);

    useEffect(() => {
        async function loadDailyMenu() {
            // İlk kurulum tarihini kaydet (zaten varsa tekrar kaydetmez)
            await saveInstallDate();
            const installDate = await getInstallDate();

            if (installDate) {
                const install = new Date(installDate);
                const today = new Date();
                // Gün farkını hesapla
                const diffTime = today.getTime() - install.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                // Modulo ile döngüsel index (liste bitince başa döner)
                const index = diffDays % mealData.days.length;
                setDailyMenu(mealData.days[index]);
            }
        }
        loadDailyMenu();
    }, []);

    // Get Daily Hadith
    const getDailyHadith = () => {
        // Simple modulo logic for demo/daily rotation
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = (today as any) - (start as any);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % hadithData.days.length;
        return hadithData.days[index];
    };

    const dailyHadith = getDailyHadith();

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

                    {/* Date Card */}
                    <RN.View style={styles.dateCard}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.12)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.View style={styles.dateInfo}>
                            <RN.Text style={styles.hijriDate}>{hijriDate}</RN.Text>
                            <RN.Text style={styles.gregorianDate}>{formattedDate}</RN.Text>
                        </RN.View>
                    </RN.View>

                    {/* 3-Timer Slider Section */}
                    <RN.View style={styles.timerSection}>
                        <RN.Animated.FlatList
                            ref={flatListRef}
                            data={timerData}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            snapToInterval={ITEM_WIDTH}
                            decelerationRate="fast"
                            contentContainerStyle={{
                                paddingHorizontal: SPACING,
                                alignItems: 'center'
                            }}
                            onScroll={RN.Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                { useNativeDriver: true }
                            )}
                            renderItem={({ item, index }) => {
                                const inputRange = [
                                    (index - 1) * ITEM_WIDTH,
                                    index * ITEM_WIDTH,
                                    (index + 1) * ITEM_WIDTH,
                                ];

                                const scale = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.35, 1, 0.35],
                                    extrapolate: 'clamp',
                                });

                                const opacity = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp',
                                });

                                return (
                                    <TimerCircle
                                        size={width * 0.48}
                                        label={item.label}
                                        time={item.time}
                                        subLabel="Kaldı"
                                        colors={item.colors}
                                        progress={item.progress}
                                        animatedStyle={{ transform: [{ scale }], opacity }}
                                        onPress={() => handleTimerPress(index)}
                                    />
                                );
                            }}
                        />

                        {/* Pagination Dots Indicator */}
                        <RN.View style={styles.paginationContainer}>
                            {timerData.map((_, index) => {
                                const inputRange = [
                                    (index - 1) * ITEM_WIDTH,
                                    index * ITEM_WIDTH,
                                    (index + 1) * ITEM_WIDTH,
                                ];

                                const dotScale = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [1, 1.5, 1],
                                    extrapolate: 'clamp',
                                });

                                const dotOpacity = scrollX.interpolate({
                                    inputRange,
                                    outputRange: [0.3, 1, 0.3],
                                    extrapolate: 'clamp',
                                });

                                return (
                                    <RN.Animated.View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            {
                                                transform: [{ scale: dotScale }],
                                                opacity: dotOpacity,
                                            }
                                        ]}
                                    />
                                );
                            })}
                        </RN.View>
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

            <RN.Modal
                animationType="slide"
                transparent={true}
                visible={isMealModalVisible}
                onRequestClose={() => setIsMealModalVisible(false)}
            >
                <RN.View style={styles.modalOverlay}>
                    {/* Backdrop */}
                    <RN.Pressable
                        style={RN.StyleSheet.absoluteFill}
                        onPress={() => setIsMealModalVisible(false)}
                    >
                        <BlurView intensity={20} tint="dark" style={RN.StyleSheet.absoluteFill} />
                    </RN.Pressable>

                    {/* Modal Content */}
                    <RN.View style={[styles.modalContent, { height: height * 0.7, maxHeight: height * 0.9 }]}>
                        <RN.View style={styles.modalHandle} />
                        <RN.Text style={styles.modalTitle}>Günün Yemek Menüsü</RN.Text>
                        <RN.Text style={styles.menuDate}>Bugünün Menüsü</RN.Text>

                        <RN.ScrollView
                            style={{ flex: 1, marginTop: 10 }}
                            contentContainerStyle={{ paddingBottom: 60 }}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            {/* Sahur Section */}
                            <RN.View style={styles.menuSection}>
                                <RN.TouchableOpacity
                                    onPress={() => toggleSection('sahur')}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
                                >
                                    <RN.Text style={[styles.menuSectionTitle, { marginBottom: 0 }]}>🌙 Sahur</RN.Text>
                                    <RN.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>{isSahurOpen ? '▼' : '▶'}</RN.Text>
                                </RN.TouchableOpacity>
                                <RN.View style={styles.modalDivider} />

                                {isSahurOpen && (
                                    dailyMenu.sahur.map((item, index) => (
                                        <RN.View key={`sahur-${index}`} style={styles.mealItem}>
                                            <RN.Text style={styles.mealEmoji}>🥗</RN.Text>
                                            <RN.Text style={styles.mealName}>{item}</RN.Text>
                                        </RN.View>
                                    ))
                                )}
                            </RN.View>

                            {/* Iftar Section */}
                            <RN.View style={styles.menuSection}>
                                <RN.TouchableOpacity
                                    onPress={() => toggleSection('iftar')}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
                                >
                                    <RN.Text style={[styles.menuSectionTitle, { marginBottom: 0 }]}>🍲 İftar</RN.Text>
                                    <RN.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>{isIftarOpen ? '▼' : '▶'}</RN.Text>
                                </RN.TouchableOpacity>
                                <RN.View style={styles.modalDivider} />

                                {isIftarOpen && (
                                    <>
                                        <RN.View style={styles.mealInfoRow}>
                                            <RN.Text style={styles.mealCalorie}>🔥 {dailyMenu.calorie} kcal</RN.Text>
                                            <RN.Text style={styles.mealType}>
                                                ✨ {dailyMenu.type ? (dailyMenu.type.charAt(0).toUpperCase() + dailyMenu.type.slice(1)) : 'Standart'}
                                            </RN.Text>
                                        </RN.View>

                                        {dailyMenu.iftar && dailyMenu.iftar.length > 0 ? (
                                            dailyMenu.iftar.map((item, index) => (
                                                <RN.View key={`iftar-${index}`} style={styles.mealItem}>
                                                    <RN.Text style={styles.mealEmoji}>🥘</RN.Text>
                                                    <RN.Text style={styles.mealName}>{item}</RN.Text>
                                                </RN.View>
                                            ))
                                        ) : (
                                            <RN.Text style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
                                                İftar menüsü bulunamadı.
                                            </RN.Text>
                                        )}
                                        <RN.View style={{ height: 40 }} />
                                    </>
                                )}
                            </RN.View>
                        </RN.ScrollView>
                    </RN.View>
                </RN.View>
            </RN.Modal>

            {/* Hadith Modal */}
            <RN.Modal
                animationType="slide"
                transparent={true}
                visible={isHadithModalVisible}
                onRequestClose={() => setIsHadithModalVisible(false)}
            >
                <RN.View style={styles.modalOverlay}>
                    {/* Backdrop */}
                    <RN.Pressable
                        style={RN.StyleSheet.absoluteFill}
                        onPress={() => setIsHadithModalVisible(false)}
                    >
                        <BlurView intensity={20} tint="dark" style={RN.StyleSheet.absoluteFill} />
                    </RN.Pressable>

                    {/* Modal Content */}
                    <RN.View style={[styles.modalContent, { height: height * 0.6, maxHeight: height * 0.8 }]}>
                        <RN.View style={styles.modalHandle} />
                        <RN.Text style={styles.modalTitle}>Günün Hadisi</RN.Text>

                        <RN.ScrollView
                            style={{ flex: 1, marginTop: 10 }}
                            contentContainerStyle={{ paddingBottom: 60 }}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            <RN.View style={[styles.menuSection, { backgroundColor: 'rgba(255,255,255,0.05)', padding: 25, borderRadius: 24, width: '100%' }]}>
                                <RN.Text style={[styles.hadithText, { marginTop: 0, fontSize: 18, lineHeight: 28 }]}>
                                    "{dailyHadith.text}"
                                </RN.Text>
                                <RN.Text style={[styles.hadithSource, { marginTop: 20 }]}>- {dailyHadith.source}</RN.Text>
                            </RN.View>

                            {dailyHadith.tips && dailyHadith.tips.length > 0 && (
                                <RN.View style={{ marginTop: 25 }}>
                                    <RN.Text style={[styles.menuSectionTitle, { fontSize: 16, color: '#34D399', marginBottom: 15 }]}>✨ Günün Önerileri</RN.Text>
                                    {dailyHadith.tips.map((tip, index) => (
                                        <RN.View key={index} style={[styles.mealItem, { marginBottom: 12, padding: 15, backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                                            <RN.Text style={{ color: '#34D399', fontSize: 18, marginRight: 12 }}>•</RN.Text>
                                            <RN.Text style={[styles.mealName, { flex: 1, fontSize: 14, lineHeight: 20 }]}>{tip}</RN.Text>
                                        </RN.View>
                                    ))}
                                </RN.View>
                            )}
                        </RN.ScrollView>
                    </RN.View>
                </RN.View>
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
        justifyContent: 'center',
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
        marginBottom: 25,
        marginHorizontal: -24, // ScrollView'ın paddingHorizontal'ını iptal et
        height: 240,
        justifyContent: 'center',
    },
    timerCircleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginHorizontal: 4,
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
        marginBottom: 15,
    },
    menuDate: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 20,
    },
    menuSection: {
        marginBottom: 20,
    },
    menuSectionTitle: {
        color: '#34D399',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mealInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    mealCalorie: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    mealType: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: 'bold',
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
