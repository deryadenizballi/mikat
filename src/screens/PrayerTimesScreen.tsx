import React from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrayerTimesScreen: React.FC = () => {
    // Örnek veri oluşturma (3 gün öncesinden 30 gün sonrasına)
    const generateMockData = () => {
        const data = [];
        const today = new Date();
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

        for (let i = -3; i <= 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            data.push({
                id: i.toString(),
                dateText: `${date.getDate()} ${months[date.getMonth()]}`,
                dayName: days[date.getDay()],
                isToday: i === 0,
                times: {
                    imsak: '06:06',
                    gunes: '07:27',
                    ogle: '12:56',
                    ikindi: '15:49',
                    aksam: '18:14',
                    yatsi: '19:31',
                }
            });
        }
        return data;
    };

    const prayerData = generateMockData();

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
            <RN.Text style={[styles.timeText, styles.highlightedTimeText, item.isToday && styles.todayText]}>{item.times.imsak}</RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>{item.times.gunes}</RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>{item.times.ogle}</RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>{item.times.ikindi}</RN.Text>
            <RN.Text style={[styles.timeText, styles.highlightedTimeText, item.isToday && styles.todayText]}>{item.times.aksam}</RN.Text>
            <RN.Text style={[styles.timeText, item.isToday && styles.todayText]}>{item.times.yatsi}</RN.Text>
        </RN.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <RN.View style={styles.header}>
                <RN.Text style={styles.title}>Aylık Vakitler</RN.Text>
            </RN.View>
            {renderHeader()}
            <RN.FlatList
                data={prayerData}
                keyExtractor={(item: any) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        color: '#1E3A5F',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E3A5F',
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
        color: '#1E3A5F',
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
});

export default PrayerTimesScreen;
