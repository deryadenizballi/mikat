import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/MainTabNavigator';

type HomeScreenRouteProp = RouteProp<MainTabParamList, 'Home'>;

interface HomeScreenProps {
    route: HomeScreenRouteProp;
}

const HomeScreen = ({ route }: HomeScreenProps) => {
    const city = route.params?.city || 'İstanbul';
    const district = route.params?.district || 'Kadıköy';

    const [timeLeft, setTimeLeft] = useState('04:20:15');
    const [foodModalVisible, setFoodModalVisible] = useState(false);
    const [hadithModalVisible, setHadithModalVisible] = useState(false);

    // Vakitler için mock veri
    const prayerTimes = [
        { name: 'İmsak', time: '06:44' },
        { name: 'Güneş', time: '08:12' },
        { name: 'Öğle', time: '13:21' },
        { name: 'İkindi', time: '15:55' },
        { name: 'Akşam', time: '18:19' },
        { name: 'Yatsı', time: '19:42' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <RN.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Şehir ve İlçe Bilgisi (Ortalı) */}
                <RN.View style={styles.topHeader}>
                    <RN.Text style={styles.locationTitle}>{city} / {district}</RN.Text>
                </RN.View>

                {/* 2. 3 Kolonlu İnteraktif Bölüm */}
                <RN.View style={styles.actionRow}>
                    <RN.TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setFoodModalVisible(true)}
                    >
                        <RN.View style={styles.actionIconContainer}>
                            <RN.Text style={styles.emojiIcon}>🍲</RN.Text>
                        </RN.View>
                        <RN.Text style={styles.actionLabel}>Yemek Önerisi</RN.Text>
                    </RN.TouchableOpacity>

                    <RN.View style={styles.centerLogoContainer}>
                        <RN.Image
                            source={require('../../assets/logo-placeholder.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </RN.View>

                    <RN.TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => setHadithModalVisible(true)}
                    >
                        <RN.View style={styles.actionIconContainer}>
                            <RN.Text style={styles.emojiIcon}>📜</RN.Text>
                        </RN.View>
                        <RN.Text style={styles.actionLabel}>Günün Hadisi</RN.Text>
                    </RN.TouchableOpacity>
                </RN.View>

                {/* İftar Sayacı Kartı */}
                <RN.View style={styles.countdownCard}>
                    <RN.Text style={styles.countdownLabel}>İftara Kalan Süre</RN.Text>
                    <RN.Text style={styles.timerText}>{timeLeft}</RN.Text>
                </RN.View>

                {/* Namaz Vakitleri (Grid yapısı + Orijinal Renkler) */}
                <RN.View style={styles.prayerSection}>
                    <RN.View style={styles.sectionHeader}>
                        <RN.Text style={styles.sectionTitle}>{district} Namaz Vakitleri</RN.Text>
                        <RN.Text style={styles.dateText}>7 Şubat Cumartesi</RN.Text>
                    </RN.View>

                    <RN.View style={styles.gridContainer}>
                        {prayerTimes.map((item, index) => {
                            const isActive = item.name === 'Akşam'; // Örnek olarak İftar vakti aktif
                            return (
                                <RN.View
                                    key={index}
                                    style={[
                                        styles.prayerCard,
                                        isActive && styles.activePrayerCard
                                    ]}
                                >
                                    <RN.Text style={[styles.prayerNameText, isActive && styles.activeText]}>
                                        {item.name}
                                    </RN.Text>
                                    <RN.Text style={[styles.prayerTimeText, isActive && styles.activeText]}>
                                        {item.time}
                                    </RN.Text>
                                </RN.View>
                            );
                        })}
                    </RN.View>
                </RN.View>
            </RN.ScrollView>

            {/* Yemek Önerisi Modalı (Modal renkleri de uyumlu) */}
            <RN.Modal
                animationType="fade"
                transparent={true}
                visible={foodModalVisible}
                onRequestClose={() => setFoodModalVisible(false)}
            >
                <RN.Pressable
                    style={styles.modalOverlay}
                    onPress={() => setFoodModalVisible(false)}
                >
                    <RN.View style={styles.modalContent}>
                        <RN.Text style={styles.modalEmoji}>🍲</RN.Text>
                        <RN.Text style={styles.modalTitle}>Günün Yemek Önerisi</RN.Text>
                        <RN.Text style={styles.modalBody}>
                            Mercimek Çorbası{"\n"}
                            İzmir Köfte{"\n"}
                            Pirinç Pilavı{"\n"}
                            Kemalpaşa Tatlısı
                        </RN.Text>
                        <RN.TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setFoodModalVisible(false)}
                        >
                            <RN.Text style={styles.closeButtonText}>Kapat</RN.Text>
                        </RN.TouchableOpacity>
                    </RN.View>
                </RN.Pressable>
            </RN.Modal>

            {/* Hadis Modalı */}
            <RN.Modal
                animationType="fade"
                transparent={true}
                visible={hadithModalVisible}
                onRequestClose={() => setHadithModalVisible(false)}
            >
                <RN.Pressable
                    style={styles.modalOverlay}
                    onPress={() => setHadithModalVisible(false)}
                >
                    <RN.View style={styles.modalContent}>
                        <RN.Text style={styles.modalEmoji}>📜</RN.Text>
                        <RN.Text style={styles.modalTitle}>Günün Hadisi</RN.Text>
                        <RN.Text style={styles.modalBody}>
                            "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz." (Buhârî, İlim, 11)
                        </RN.Text>
                        <RN.TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setHadithModalVisible(false)}
                        >
                            <RN.Text style={styles.closeButtonText}>Kapat</RN.Text>
                        </RN.TouchableOpacity>
                    </RN.View>
                </RN.Pressable>
            </RN.Modal>
        </SafeAreaView>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    topHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A5F',
        letterSpacing: 0.5,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    actionItem: {
        alignItems: 'center',
        flex: 1,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emojiIcon: {
        fontSize: 22,
    },
    actionLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '700',
        textAlign: 'center',
    },
    centerLogoContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    logo: {
        width: 44,
        height: 44,
    },
    countdownCard: {
        backgroundColor: '#1E3A5F',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: 20,
    },
    countdownLabel: {
        color: '#B8C5D4',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 44,
        fontWeight: 'bold',
    },
    prayerSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A5F',
    },
    dateText: {
        fontSize: 13,
        color: '#64748B',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    prayerCard: {
        width: '31%', // 3 kolon
        aspectRatio: 1,
        backgroundColor: '#F1F5F9', // Orijinal açık gri tonu
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    activePrayerCard: {
        backgroundColor: '#3B82F6', // Orijinal mavi vurgu rengi
    },
    prayerNameText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 4,
    },
    prayerTimeText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E3A5F',
    },
    activeText: {
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    modalEmoji: {
        fontSize: 50,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A5F',
        marginBottom: 16,
    },
    modalBody: {
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    closeButton: {
        backgroundColor: '#1E3A5F',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default HomeScreen;
