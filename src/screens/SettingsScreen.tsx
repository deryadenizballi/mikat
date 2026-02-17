import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../styles/theme';

// Firebase Services
import { getAllStates, getDistrictsForState } from '../services/prayerTimesService';
import {
    getSelectedLocation,
    saveSelectedLocation,
    getIftarNotification,
    getSahurNotification,
    saveIftarNotification,
    saveSahurNotification,
    getAllPrayerNotification,
    saveAllPrayerNotification,
    getUserName,
    saveUserName,
} from '../services/storageService';
import { schedulePrayerNotifications } from '../services/notificationService';
import { SelectedLocation } from '../types';

interface StateItem {
    id: string;
    name: string;
    countryId: number;
}

interface DistrictItem {
    id: string;
    name: string;
    stateId: string;
}

import { useApp } from '../context/AppContext';

const SettingItem = ({ icon, title, subtitle, onPress, isLast, rightIcon = '›' }: any) => (
    <RN.TouchableOpacity style={[styles.item, isLast && { borderBottomWidth: 0 }]} onPress={onPress}>
        <RN.View style={styles.itemLeft}>
            <RN.View style={styles.iconContainer}>
                <RN.Text style={styles.icon}>{icon}</RN.Text>
            </RN.View>
            <RN.View>
                <RN.Text style={styles.itemTitle}>{title}</RN.Text>
                {subtitle && <RN.Text style={styles.itemSubtitle}>{subtitle}</RN.Text>}
            </RN.View>
        </RN.View>
        <RN.Text style={[styles.chevron, rightIcon === '✅' && { color: '#34D399', fontSize: 20 }]}>{rightIcon}</RN.Text>
    </RN.TouchableOpacity>
);

// Modal Liste Bileşeni
const SelectionModal = ({
    visible,
    onClose,
    data,
    onSelect,
    title,
    keyExtractor,
    labelExtractor
}: {
    visible: boolean;
    onClose: () => void;
    data: any[];
    onSelect: (item: any) => void;
    title: string;
    keyExtractor: (item: any) => string;
    labelExtractor: (item: any) => string;
}) => (
    <RN.Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <RN.TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={onClose}
        >
            <BlurView intensity={20} tint="dark" style={RN.StyleSheet.absoluteFill} />
            <RN.View style={styles.modalContent}>
                <RN.View style={styles.modalHandle} />
                <RN.View style={styles.modalHeader}>
                    <RN.Text style={styles.modalTitle}>{title}</RN.Text>
                    <RN.TouchableOpacity onPress={onClose}>
                        <RN.Text style={styles.modalClose}>✕</RN.Text>
                    </RN.TouchableOpacity>
                </RN.View>
                <RN.FlatList
                    data={data}
                    keyExtractor={keyExtractor}
                    renderItem={({ item }: { item: any }) => (
                        <RN.TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => onSelect(item)}
                        >
                            <RN.Text style={styles.modalItemText}>{labelExtractor(item)}</RN.Text>
                        </RN.TouchableOpacity>
                    )}
                    style={styles.modalList}
                />
            </RN.View>
        </RN.TouchableOpacity>
    </RN.Modal>
);

const SettingsScreen: React.FC = () => {
    const {
        location: currentLocation,
        setLocation,
        userName: currentUserName,
        setUserName: contextSetUserName,
        refreshPrayerTimes,
        todayPrayerTimes
    } = useApp();
    const [userName, setUserName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [allNotification, setAllNotification] = useState(true);
    const [isNotificationLoading, setIsNotificationLoading] = useState(true);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [iftarNotification, setIftarNotification] = useState(true);
    const [sahurNotification, setSahurNotification] = useState(true);

    const handleUpdateTimes = async () => {
        try {
            await refreshPrayerTimes(true);
            setUpdateSuccess(true);
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Manual update error:', error);
        }
    };


    // Firebase verileri
    const [states, setStates] = useState<StateItem[]>([]);
    const [districts, setDistricts] = useState<DistrictItem[]>([]);

    // Modal states
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);

    // Loading
    const [loading, setLoading] = useState(true);

    // İlk yükleme
    useEffect(() => {
        async function initialize() {
            try {
                // Kullanıcı adını yükle
                const name = await getUserName();
                if (name) setUserName(name);



                // Bildirim ayarlarını yükle
                const all = await getAllPrayerNotification();
                const iftar = await getIftarNotification();
                const sahur = await getSahurNotification();

                setAllNotification(all);
                setIftarNotification(iftar);
                setSahurNotification(sahur);

                // İlleri yükle
                const fetchedStates = await getAllStates();
                setStates(fetchedStates);

                // Eğer il seçiliyse ilçeleri de yükle
                if (currentLocation?.cityPlateCode) {
                    const fetchedDistricts = await getDistrictsForState(currentLocation.cityPlateCode);
                    setDistricts(fetchedDistricts);
                }
            } catch (error) {
                console.error('Settings initialize error:', error);
            } finally {
                setLoading(false);
            }
        }
        initialize();
    }, []);

    const handleNameSubmit = async () => {
        await saveUserName(userName);
        setIsEditingName(false);
    };

    // İl seçildiğinde
    const handleStateSelect = async (state: StateItem) => {
        setStateModalVisible(false);

        // İlçeleri yükle
        const fetchedDistricts = await getDistrictsForState(state.id);
        setDistricts(fetchedDistricts);

        // Yeni konum (ilçe henüz seçilmedi)
        const newLocation: SelectedLocation = {
            cityPlateCode: state.id,
            cityName: state.name,
            districtKey: '',
            districtName: '',
        };
        await setLocation(newLocation);

        // İlçe seçimi modalını aç
        setDistrictModalVisible(true);
    };

    // İlçe seçildiğinde
    const handleDistrictSelect = async (district: DistrictItem) => {
        setDistrictModalVisible(false);

        if (currentLocation) {
            const newLocation: SelectedLocation = {
                ...currentLocation,
                districtKey: district.id,
                districtName: district.name,
            };
            await setLocation(newLocation);
        }
    };

    // Bildirim toggle
    // Bildirim toggle
    const handleAllNotificationToggle = async (value: boolean) => {
        setAllNotification(value);
        await saveAllPrayerNotification(value);

        if (value) {
            // Master açılınca altları da aç
            setIftarNotification(true);
            await saveIftarNotification(true);
            setSahurNotification(true);
            await saveSahurNotification(true);
        }

        // Bildirimleri anında güncelle (günlük strateji)
        if (todayPrayerTimes && currentLocation) {
            const { scheduleTodayNotifications } = await import('../services/notificationService');
            await scheduleTodayNotifications(
                { date: new Date().toISOString().split('T')[0], prayerTimes: todayPrayerTimes },
                currentLocation.cityName,
                currentLocation.districtName
            );
        }
    };

    const handleIftarToggle = async (value: boolean) => {
        setIftarNotification(value);
        await saveIftarNotification(value);

        // Alt kapatılırsa master da kapanır
        if (!value) {
            setAllNotification(false);
            await saveAllPrayerNotification(false);
        }

        // Bildirimleri anında güncelle (günlük strateji)
        if (todayPrayerTimes && currentLocation) {
            const { scheduleTodayNotifications } = await import('../services/notificationService');
            await scheduleTodayNotifications(
                { date: new Date().toISOString().split('T')[0], prayerTimes: todayPrayerTimes },
                currentLocation.cityName,
                currentLocation.districtName
            );
        }
    };

    const handleSahurToggle = async (value: boolean) => {
        setSahurNotification(value);
        await saveSahurNotification(value);

        // Alt kapatılırsa master da kapanır
        if (!value) {
            setAllNotification(false);
            await saveAllPrayerNotification(false);
        }

        // Bildirimleri anında güncelle (günlük strateji)
        if (todayPrayerTimes && currentLocation) {
            const { scheduleTodayNotifications } = await import('../services/notificationService');
            await scheduleTodayNotifications(
                { date: new Date().toISOString().split('T')[0], prayerTimes: todayPrayerTimes },
                currentLocation.cityName,
                currentLocation.districtName
            );
        }
    };



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
                    <RN.Text style={styles.headerIcon}>⚙️</RN.Text>
                    <RN.Text style={styles.title}>Ayarlar</RN.Text>
                </RN.View>

                <RN.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Profil / İsim Ayarı */}
                    <RN.View style={styles.section}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.TouchableOpacity
                            style={[styles.item, { borderBottomWidth: 0, justifyContent: 'space-between' }]}
                            activeOpacity={1}
                            onPress={() => !isEditingName && setIsEditingName(true)}
                        >
                            <RN.View style={[styles.itemLeft, { flex: 1, marginRight: 10 }]}>
                                <RN.View style={styles.iconContainer}>
                                    <RN.Text style={styles.icon}>👤</RN.Text>
                                </RN.View>
                                <RN.View style={{ flex: 1 }}>
                                    <RN.Text style={styles.itemSubtitle}>Kullanıcı Adı</RN.Text>
                                    {isEditingName ? (
                                        <RN.TextInput
                                            style={styles.nameInput}
                                            value={userName}
                                            onChangeText={setUserName}
                                            onBlur={handleNameSubmit}
                                            onSubmitEditing={handleNameSubmit}
                                            autoFocus
                                            placeholder="Adınızı giriniz"
                                            placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                            returnKeyType="done"
                                        />
                                    ) : (
                                        <RN.Text style={styles.nameText} numberOfLines={1}>
                                            {userName || 'Misafir Kullanıcı'}
                                        </RN.Text>
                                    )}
                                </RN.View>
                            </RN.View>
                            <RN.TouchableOpacity
                                onPress={() => isEditingName ? handleNameSubmit() : setIsEditingName(true)}
                                style={{
                                    padding: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 8,
                                }}
                            >
                                <RN.Text style={styles.actionIcon}>{isEditingName ? '✅' : '✏️'}</RN.Text>
                            </RN.TouchableOpacity>
                        </RN.TouchableOpacity>
                    </RN.View>

                    {/* Konum Ayarları */}
                    <RN.View style={styles.section}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <SettingItem
                            icon="📍"
                            title="İl Seçimi"
                            subtitle={currentLocation?.cityName || 'Seçilmedi'}
                            onPress={() => setStateModalVisible(true)}
                        />
                        <SettingItem
                            icon="🏢"
                            title="İlçe Seçimi"
                            subtitle={currentLocation?.districtName || 'Seçilmedi'}
                            onPress={() => {
                                if (currentLocation?.cityPlateCode) {
                                    setDistrictModalVisible(true);
                                } else {
                                    RN.Alert.alert('Uyarı', 'Önce il seçmelisiniz.');
                                }
                            }}
                            isLast={true}
                        />
                    </RN.View>

                    {/* Güncelleme */}
                    <RN.View style={styles.section}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <SettingItem
                            icon="🔄"
                            title="Vakitleri Güncelle"
                            isLast={true}
                            onPress={handleUpdateTimes}
                            rightIcon={updateSuccess ? '✅' : '›'}
                        />
                    </RN.View>

                    {/* Bildirim Ayarları */}
                    <RN.View style={styles.notificationSection}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <RN.View style={styles.notificationHeader}>
                            <RN.Text style={styles.icon}>🔔</RN.Text>
                            <RN.Text style={styles.sectionTitle}>Bildirimler</RN.Text>
                        </RN.View>

                        {/* Master Toggle */}
                        <RN.View style={styles.switchRow}>
                            <RN.Text style={[styles.switchLabel, { fontWeight: 'bold' }]}>Namaz Vakitlerini Bildir</RN.Text>
                            <RN.Switch
                                value={allNotification}
                                onValueChange={handleAllNotificationToggle}
                                trackColor={{ false: '#767577', true: '#34D399' }}
                                thumbColor={allNotification ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </RN.View>

                        <RN.View style={styles.divider} />

                        <RN.View style={styles.switchRow}>
                            <RN.Text style={styles.switchLabel}>İftar Bildirimi</RN.Text>
                            <RN.Switch
                                value={iftarNotification}
                                onValueChange={handleIftarToggle}
                                trackColor={{ false: '#767577', true: '#34D399' }}
                                thumbColor={iftarNotification ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </RN.View>

                        <RN.View style={styles.divider} />

                        <RN.View style={styles.switchRow}>
                            <RN.Text style={styles.switchLabel}>Sahur Bildirimi</RN.Text>
                            <RN.Switch
                                value={sahurNotification}
                                onValueChange={handleSahurToggle}
                                trackColor={{ false: '#767577', true: '#34D399' }}
                                thumbColor={sahurNotification ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </RN.View>
                    </RN.View>

                    {/* Diğer */}
                    <RN.View style={styles.section}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                            style={RN.StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <SettingItem
                            icon="⭐"
                            title="Uygulamayı Değerlendir"
                            isLast={true}
                        />
                    </RN.View>

                    <RN.Text style={styles.versionText}>Versiyon 1.0.0</RN.Text>
                </RN.ScrollView>

                {/* İl Seçim Modal */}
                <SelectionModal
                    visible={stateModalVisible}
                    onClose={() => setStateModalVisible(false)}
                    data={states}
                    onSelect={handleStateSelect}
                    title="İl Seçiniz"
                    keyExtractor={(item) => item.id}
                    labelExtractor={(item) => item.name}
                />

                {/* İlçe Seçim Modal */}
                <SelectionModal
                    visible={districtModalVisible}
                    onClose={() => setDistrictModalVisible(false)}
                    data={districts}
                    onSelect={handleDistrictSelect}
                    title="İlçe Seçiniz"
                    keyExtractor={(item) => item.id}
                    labelExtractor={(item) => item.name}
                />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    headerIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        backgroundColor: 'rgba(6, 78, 59, 0.4)',
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        paddingVertical: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 20,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    itemSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
    },
    chevron: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.3)',
    },
    notificationSection: {
        backgroundColor: 'rgba(6, 78, 59, 0.4)',
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        padding: 20,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    switchLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 10,
    },
    versionText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 30,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#064E3B',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: RN.Dimensions.get('window').height * 0.7,
        paddingBottom: 50,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    modalClose: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    modalList: {
        paddingHorizontal: 14,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    modalItemText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    nameInput: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        paddingVertical: 0,
        marginTop: 4,
        height: 24,
    },
    nameText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginTop: 4,
    },
    actionIcon: {
        fontSize: 18,
    },
});

export default SettingsScreen;
