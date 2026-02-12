import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../styles/theme';

// Firebase Services
import { getMonthlyPrayerTimes } from '../services/prayerTimesService';
import { getSelectedLocation } from '../services/storageService';
import { DayData } from '../types';
import { useApp } from '../context/AppContext';

const PrayerTimesScreen: React.FC = () => {
    const { location } = useApp();
    const [prayerData, setPrayerData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                setLoading(true);
                setError(null);

                if (!location?.districtKey) {
                    setError('Lütfen önce şehir ve ilçe seçin.');
                    setLoading(false);
                    return;
                }

                // Bu ayın vakitlerini çek
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1; // 1-indexed

                console.log('Fetching prayer times for:', {
                    districtId: location.districtKey,
                    year,
                    month,
                    expectedDocId: `${location.districtKey}_${year}`
                });

                const monthlyData = await getMonthlyPrayerTimes(
                    location.districtKey,
                    year,
                    month
                );

                console.log('Monthly data received:', monthlyData.length, 'days');

                if (monthlyData.length === 0) {
                    setError(`${months[month - 1]} ${year} için veri bulunamadı. Lütfen Firebase'de bu ay için veri olduğundan emin olun.`);
                    setLoading(false);
                    return;
                }

                // Veriyi UI formatına dönüştür
                const formattedData = monthlyData.map((day: DayData, index: number) => {
                    const date = new Date(day.date);
                    const isToday = day.date === now.toISOString().split('T')[0];

                    return {
                        id: index.toString(),
                        dateText: `${date.getDate()} ${months[date.getMonth()]}`,
                        dayName: days[date.getDay()],
                        isToday,
                        date: day.date,
                        times: day.prayerTimes,
                    };
                });

                // Tarihe göre sırala
                formattedData.sort((a: any, b: any) => a.date.localeCompare(b.date));

                setPrayerData(formattedData);
            } catch (err) {
                console.error('Prayer times fetch error:', err);
                setError('Vakitler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [location]);

    const renderHeader = () => (
        <RN.View style={styles.tableHeader}>
            <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                style={RN.StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <RN.Text style={[styles.headerText, { flex: 2 }]}>Tarih</RN.Text>
            <RN.Text style={styles.headerText}>İmsak</RN.Text>
            <RN.Text style={styles.headerText}>Güneş</RN.Text>
            <RN.Text style={styles.headerText}>Öğle</RN.Text>
            <RN.Text style={styles.headerText}>İkindi</RN.Text>
            <RN.Text style={styles.headerText}>Akşam</RN.Text>
            <RN.Text style={styles.headerText}>Yatsı</RN.Text>
        </RN.View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <RN.View style={[styles.tableRow, item.isToday && styles.todayRow]}>
            <LinearGradient
                colors={item.isToday ? ['rgba(52, 211, 153, 0.1)', 'rgba(16, 185, 129, 0.05)'] : ['transparent', 'transparent']}
                style={RN.StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <RN.View style={{ flex: 2 }}>
                <RN.Text style={[styles.dateText, item.isToday && styles.todayText]}>{item.dateText}</RN.Text>
                <RN.Text style={[styles.dayText, item.isToday && styles.todayText]}>{item.dayName}</RN.Text>
            </RN.View>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.imsak || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.gunes || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.ogle || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.ikindi || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.aksam || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.yatsi || '-'}
            </RN.Text>
        </RN.View>
    );

    if (loading) {
        return (
            <RN.View style={styles.container}>
                <LinearGradient
                    colors={['#0F172A', '#0B121C', '#05080D']}
                    style={RN.StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <RN.View style={styles.loadingContainer}>
                        <RN.ActivityIndicator size="large" color="#34D399" />
                        <RN.Text style={styles.loadingText}>Vakitler yükleniyor...</RN.Text>
                    </RN.View>
                </SafeAreaView>
            </RN.View>
        );
    }

    if (error) {
        return (
            <RN.View style={styles.container}>
                <LinearGradient
                    colors={['#0F172A', '#0B121C', '#05080D']}
                    style={RN.StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <RN.View style={styles.errorContainer}>
                        <RN.Text style={styles.errorIcon}>⚠️</RN.Text>
                        <RN.Text style={styles.errorText}>{error}</RN.Text>
                    </RN.View>
                </SafeAreaView>
            </RN.View>
        );
    }

    return (
        <RN.View style={styles.container}>
            {/* Premium Dark Gradient Background */}
            <LinearGradient
                colors={['#064E3B', '#022C22', '#000000']}
                style={RN.StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <RN.View style={styles.header}>
                    <RN.Text style={styles.title}>Aylık Vakitler</RN.Text>
                    {location && (
                        <RN.View style={styles.locationContainer}>
                            <RN.Text style={styles.locationIcon}>📍</RN.Text>
                            <RN.Text style={styles.locationText}>
                                {location.cityName}, {location.districtName}
                            </RN.Text>
                        </RN.View>
                    )}
                </RN.View>

                {/* Main Card Container */}
                <RN.View style={styles.mainCard}>
                    {renderHeader()}
                    {prayerData.length > 0 ? (
                        <RN.FlatList
                            data={prayerData}
                            keyExtractor={(item: any) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <RN.View style={styles.emptyContainer}>
                            <RN.Text style={styles.emptyText}>Bu ay için veri bulunamadı.</RN.Text>
                        </RN.View>
                    )}
                </RN.View>
            </SafeAreaView>
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
    header: {
        paddingHorizontal: 24,
        paddingVertical: 15,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    locationIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    locationText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    mainCard: {
        margin: 16,
        marginBottom: 80, // Tab bar için boşluk
        borderRadius: 24,
        backgroundColor: 'rgba(6, 78, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        overflow: 'hidden',
        flex: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerText: {
        flex: 1,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    todayRow: {
        // backgroundColor handled by gradient
        borderLeftWidth: 3,
        borderLeftColor: '#10B981',
    },
    dateText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    dayText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    timeText: {
        flex: 1,
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '500',
    },
    todayText: {
        color: '#34D399',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});

export default PrayerTimesScreen;
