import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../styles/theme';

// Firebase Services
import { getAllCities, getDistrictsForCity } from '../services/prayerTimesService';
import {
    getSelectedLocation,
    saveSelectedLocation,
    getIftarNotification,
    getSahurNotification,
    saveIftarNotification,
    saveSahurNotification
} from '../services/storageService';
import { SelectedLocation } from '../types';

interface CityItem {
    plateCode: string;
    name: string;
}

interface DistrictItem {
    key: string;
    name: string;
}

const SettingsScreen: React.FC = () => {
    const [iftarNotification, setIftarNotification] = useState(true);
    const [sahurNotification, setSahurNotification] = useState(true);

    // Mevcut konum
    const [currentLocation, setCurrentLocation] = useState<SelectedLocation | null>(null);

    // Firebase verileri
    const [cities, setCities] = useState<CityItem[]>([]);
    const [districts, setDistricts] = useState<DistrictItem[]>([]);

    // Modal states
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);

    // Loading
    const [loading, setLoading] = useState(true);

    // İlk yükleme
    useEffect(() => {
        async function initialize() {
            try {
                // Mevcut konumu yükle
                const location = await getSelectedLocation();
                setCurrentLocation(location);

                // Bildirim ayarlarını yükle
                const iftar = await getIftarNotification();
                const sahur = await getSahurNotification();
                setIftarNotification(iftar);
                setSahurNotification(sahur);

                // Şehirleri yükle
                const fetchedCities = await getAllCities();
                setCities(fetchedCities);

                // Eğer şehir seçiliyse ilçeleri de yükle
                if (location?.cityPlateCode) {
                    const fetchedDistricts = await getDistrictsForCity(location.cityPlateCode);
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

    // Şehir seçildiğinde
    const handleCitySelect = async (city: CityItem) => {
        setCityModalVisible(false);

        // İlçeleri yükle
        const fetchedDistricts = await getDistrictsForCity(city.plateCode);
        setDistricts(fetchedDistricts);

        // Yeni konum (ilçe henüz seçilmedi)
        const newLocation: SelectedLocation = {
            cityPlateCode: city.plateCode,
            cityName: city.name,
            districtKey: '',
            districtName: '',
        };
        setCurrentLocation(newLocation);

        // İlçe seçimi modalını aç
        setDistrictModalVisible(true);
    };

    // İlçe seçildiğinde
    const handleDistrictSelect = async (district: DistrictItem) => {
        setDistrictModalVisible(false);

        if (currentLocation) {
            const newLocation: SelectedLocation = {
                ...currentLocation,
                districtKey: district.key,
                districtName: district.name,
            };
            setCurrentLocation(newLocation);
            await saveSelectedLocation(newLocation);
        }
    };

    // Bildirim toggle
    const handleIftarToggle = async (value: boolean) => {
        setIftarNotification(value);
        await saveIftarNotification(value);
    };

    const handleSahurToggle = async (value: boolean) => {
        setSahurNotification(value);
        await saveSahurNotification(value);
    };

    const SettingItem = ({ icon, title, subtitle, onPress }: any) => (
        <RN.TouchableOpacity style={styles.item} onPress={onPress}>
            <RN.View style={styles.itemLeft}>
                <RN.View style={styles.iconContainer}>
                    <RN.Text style={styles.icon}>{icon}</RN.Text>
                </RN.View>
                <RN.View>
                    <RN.Text style={styles.itemTitle}>{title}</RN.Text>
                    {subtitle && <RN.Text style={styles.itemSubtitle}>{subtitle}</RN.Text>}
                </RN.View>
            </RN.View>
            <RN.Text style={styles.chevron}>›</RN.Text>
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
            <RN.View style={styles.modalOverlay}>
                <RN.View style={styles.modalContent}>
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
            </RN.View>
        </RN.Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <RN.View style={styles.loadingContainer}>
                    <RN.ActivityIndicator size="large" color={Colors.primary} />
                </RN.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <RN.View style={styles.header}>
                <RN.Text style={styles.headerIcon}>⚙️</RN.Text>
                <RN.Text style={styles.title}>Ayarlar</RN.Text>
            </RN.View>

            <RN.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Konum Ayarları */}
                <RN.View style={styles.section}>
                    <SettingItem
                        icon="📍"
                        title="Şehir Seçimi"
                        subtitle={currentLocation?.cityName || 'Seçilmedi'}
                        onPress={() => setCityModalVisible(true)}
                    />
                    <SettingItem
                        icon="🏢"
                        title="İlçe Seçimi"
                        subtitle={currentLocation?.districtName || 'Seçilmedi'}
                        onPress={() => {
                            if (currentLocation?.cityPlateCode) {
                                setDistrictModalVisible(true);
                            } else {
                                RN.Alert.alert('Uyarı', 'Önce şehir seçmelisiniz.');
                            }
                        }}
                    />
                </RN.View>

                {/* Güncelleme */}
                <RN.View style={styles.section}>
                    <SettingItem
                        icon="🔄"
                        title="Vakitleri Güncelle"
                    />
                </RN.View>

                {/* Bildirim Ayarları */}
                <RN.View style={styles.notificationSection}>
                    <RN.View style={styles.notificationHeader}>
                        <RN.Text style={styles.icon}>🔔</RN.Text>
                        <RN.Text style={styles.sectionTitle}>Bildirim Ayarları</RN.Text>
                    </RN.View>

                    <RN.View style={styles.switchRow}>
                        <RN.Text style={styles.switchLabel}>İftar Bildirimi</RN.Text>
                        <RN.Switch
                            value={iftarNotification}
                            onValueChange={handleIftarToggle}
                            trackColor={{ false: Colors.border, true: Colors.accent }}
                            thumbColor="#FFFFFF"
                        />
                    </RN.View>

                    <RN.View style={styles.divider} />

                    <RN.View style={styles.switchRow}>
                        <RN.Text style={styles.switchLabel}>Sahur Bildirimi</RN.Text>
                        <RN.Switch
                            value={sahurNotification}
                            onValueChange={handleSahurToggle}
                            trackColor={{ false: Colors.border, true: Colors.accent }}
                            thumbColor="#FFFFFF"
                        />
                    </RN.View>
                </RN.View>

                {/* Diğer */}
                <RN.View style={styles.section}>
                    <SettingItem
                        icon="⭐"
                        title="Uygulamayı Değerlendir"
                    />
                </RN.View>

                <RN.Text style={styles.versionText}>Versiyon 1.0.0</RN.Text>
            </RN.ScrollView>

            {/* Şehir Seçim Modal */}
            <SelectionModal
                visible={cityModalVisible}
                onClose={() => setCityModalVisible(false)}
                data={cities}
                onSelect={handleCitySelect}
                title="Şehir Seçiniz"
                keyExtractor={(item) => item.plateCode}
                labelExtractor={(item) => item.name}
            />

            {/* İlçe Seçim Modal */}
            <SelectionModal
                visible={districtModalVisible}
                onClose={() => setDistrictModalVisible(false)}
                data={districts}
                onSelect={handleDistrictSelect}
                title="İlçe Seçiniz"
                keyExtractor={(item) => item.key}
                labelExtractor={(item) => item.name}
            />
        </SafeAreaView>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderBottomWidth: 2,
        borderColor: '#E2E8F0',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 18,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    chevron: {
        fontSize: 24,
        color: '#CBD5E1',
        fontWeight: '300',
    },
    notificationSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderBottomWidth: 2,
        borderColor: '#E2E8F0',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginLeft: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    switchLabel: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    versionText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 30,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: RN.Dimensions.get('window').height * 0.6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    modalClose: {
        fontSize: 24,
        color: '#94A3B8',
    },
    modalList: {
        paddingHorizontal: 20,
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalItemText: {
        fontSize: 16,
        color: '#334155',
    },
});

export default SettingsScreen;
