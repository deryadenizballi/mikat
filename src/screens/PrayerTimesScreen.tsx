import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../styles/theme';

// Firebase Services
import { getMonthlyPrayerTimes } from '../services/prayerTimesService';
import { getSelectedLocation } from '../services/storageService';
import { DayData, SelectedLocation } from '../types';

const PrayerTimesScreen: React.FC = () => {
    const [prayerData, setPrayerData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<SelectedLocation | null>(null);
    const [error, setError] = useState<string | null>(null);

    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Mevcut konumu al
                const savedLocation = await getSelectedLocation();
                setLocation(savedLocation);

                if (!savedLocation?.cityPlateCode || !savedLocation?.districtKey) {
                    setError('Lütfen önce şehir ve ilçe seçin.');
                    setLoading(false);
                    return;
                }

                // Bu ayın vakitlerini çek
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1; // 1-indexed

                const monthlyData = await getMonthlyPrayerTimes(
                    savedLocation.cityPlateCode,
                    savedLocation.districtKey,
                    year,
                    month
                );

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
    }, []);

    const renderHeader = () => (
        <RN.View style={styles.tableHeader}>
            <RN.Text style={[styles.headerText, { flex: 2 }]}>Gün</RN.Text>
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
            <RN.View style={{ flex: 2 }}>
                <RN.Text style={[styles.dateText, item.isToday && styles.todayText]}>{item.dateText}</RN.Text>
                <RN.Text style={[styles.dayText, item.isToday && styles.todayText]}>{item.dayName}</RN.Text>
            </RN.View>
            <RN.Text style={[styles.timeText, styles.highlightedTimeText, item.isToday && styles.todayText]}>
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
            <RN.Text style={[styles.timeText, styles.highlightedTimeText, item.isToday && styles.todayText]}>
                {item.times?.aksam || '-'}
            </RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>
                {item.times?.yatsi || '-'}
            </RN.Text>
        </RN.View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <RN.View style={styles.header}>
                    <RN.Text style={styles.title}>Aylık Vakitler</RN.Text>
                </RN.View>
                <RN.View style={styles.loadingContainer}>
                    <RN.ActivityIndicator size="large" color={Colors.primary} />
                    <RN.Text style={styles.loadingText}>Vakitler yükleniyor...</RN.Text>
                </RN.View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <RN.View style={styles.header}>
                    <RN.Text style={styles.title}>Aylık Vakitler</RN.Text>
                </RN.View>
                <RN.View style={styles.errorContainer}>
                    <RN.Text style={styles.errorIcon}>⚠️</RN.Text>
                    <RN.Text style={styles.errorText}>{error}</RN.Text>
                </RN.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <RN.View style={styles.header}>
                <RN.Text style={styles.title}>Aylık Vakitler</RN.Text>
                {location && (
                    <RN.Text style={styles.locationText}>
                        📍 {location.cityName}, {location.districtName}
                    </RN.Text>
                )}
            </RN.View>
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
        </SafeAreaView>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    locationText: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    headerText: {
        flex: 1,
        color: '#FFFFFF',
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
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    todayRow: {
        backgroundColor: '#EFF6FF',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    dateText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    dayText: {
        fontSize: 10,
        color: '#64748B',
    },
    timeText: {
        flex: 1,
        fontSize: 11,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '500',
    },
    todayText: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    highlightedTimeText: {
        color: '#3B82F6',
        fontWeight: 'bold',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
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
        color: '#64748B',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
    },
});

export default PrayerTimesScreen;
