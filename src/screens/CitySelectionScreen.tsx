import React, { useState, useEffect } from 'react';
import {
    View as RNView,
    Text as RNText,
    StyleSheet,
    Image as RNImage,
    TouchableOpacity as RNTouchableOpacity,
    ScrollView as RNScrollView,
    Dimensions,
    ActivityIndicator as RNActivityIndicator,
    Modal as RNModal,
    FlatList as RNFlatList,
} from 'react-native';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ScrollView = RNScrollView as any;
const ActivityIndicator = RNActivityIndicator as any;
const Modal = RNModal as any;
const FlatList = RNFlatList as any;

import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase Services
import { getAllStates, getDistrictsForState } from '../services/prayerTimesService';
import { SelectedLocation } from '../types';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

type CitySelectionScreenNavigationProp = NativeStackNavigationProp<
    OnboardingStackParamList,
    'CitySelection'
>;

type CitySelectionScreenRouteProp = RouteProp<OnboardingStackParamList, 'CitySelection'>;

interface CitySelectionScreenProps {
    navigation: CitySelectionScreenNavigationProp;
    route: CitySelectionScreenRouteProp;
}

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

// Dropdown bileşeni
const DropdownSelector = ({
    label,
    value,
    onPress,
    loading,
    disabled
}: {
    label: string;
    value: string | null;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}) => (
    <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
    >
        {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
            <>
                <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
                    {value || label}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </>
        )}
    </TouchableOpacity>
);

// Modal liste bileşeni
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
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={keyExtractor}
                    renderItem={({ item }: { item: any }) => (
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={styles.modalItemText}>{labelExtractor(item)}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.modalList}
                />
            </View>
        </View>
    </Modal>
);

const CitySelectionScreen: React.FC<CitySelectionScreenProps> = ({ navigation, route }) => {
    const { userName } = route.params;
    const { setLocation } = useApp();

    // Seçilen il ve ilçe
    const [selectedState, setSelectedState] = useState<StateItem | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(null);

    // Firebase'den gelen veriler
    const [states, setStates] = useState<StateItem[]>([]);
    const [districts, setDistricts] = useState<DistrictItem[]>([]);

    // Loading states
    const [statesLoading, setStatesLoading] = useState(true);
    const [districtsLoading, setDistrictsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);

    // İlleri Firebase'den çek
    useEffect(() => {
        async function fetchStates() {
            try {
                setStatesLoading(true);
                const fetchedStates = await getAllStates();
                setStates(fetchedStates);
            } catch (error) {
                console.error('İller yüklenirken hata:', error);
            } finally {
                setStatesLoading(false);
            }
        }
        fetchStates();
    }, []);

    // İl seçildiğinde ilçeleri çek
    useEffect(() => {
        async function fetchDistricts() {
            if (!selectedState) {
                setDistricts([]);
                return;
            }

            try {
                setDistrictsLoading(true);
                setSelectedDistrict(null);
                const fetchedDistricts = await getDistrictsForState(selectedState.id);
                setDistricts(fetchedDistricts);
            } catch (error) {
                console.error('İlçeler yüklenirken hata:', error);
            } finally {
                setDistrictsLoading(false);
            }
        }
        fetchDistricts();
    }, [selectedState]);

    const handleStateSelect = (state: StateItem) => {
        setSelectedState(state);
        setStateModalVisible(false);
    };

    const handleDistrictSelect = (district: DistrictItem) => {
        setSelectedDistrict(district);
        setDistrictModalVisible(false);
    };

    const handleLocateMe = () => {
        console.log('Locate Me button pressed');
    };

    const handleSaveLocation = async () => {
        if (selectedState && selectedDistrict) {
            try {
                setSaving(true);
                const location: SelectedLocation = {
                    cityPlateCode: selectedState.id,
                    cityName: selectedState.name,
                    districtKey: selectedDistrict.id,
                    districtName: selectedDistrict.name,
                };
                await setLocation(location);
                navigation.navigate('MainApp', {
                    city: selectedState.name,
                    district: selectedDistrict.name
                });
            } catch (error) {
                console.error('Konum kaydedilirken hata:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    const isButtonDisabled = selectedState === null || selectedDistrict === null || saving;

    // İlk 4 il (hızlı seçim için)
    const quickStates = states.slice(0, 4);



    return (
        <View style={styles.flex1}>
            <Image
                source={require('../../assets/city-bg.jpg')}
                style={styles.absoluteBackground}
                resizeMode="cover"
            />

            <LinearGradient
                colors={['transparent', 'rgba(6, 78, 59, 0.8)', 'rgba(6, 78, 59, 1)']}
                locations={[0, 0.2, 0.5]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backButtonIcon}>←</Text>
                </TouchableOpacity>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Konum Seçimi</Text>
                        <Text style={styles.headerSubtitle}>
                            Selam {userName}, vaktini hesaplamak için ilini ve ilçeni seçmelisin.
                        </Text>
                    </View>

                    {/* İl Dropdown */}
                    <View style={styles.dropdownSection}>
                        <DropdownSelector
                            label="İl seçiniz..."
                            value={selectedState?.name || null}
                            onPress={() => setStateModalVisible(true)}
                            loading={statesLoading}
                        />
                    </View>

                    {/* İlçe Dropdown */}
                    <View style={styles.dropdownSection}>
                        <DropdownSelector
                            label="İlçe seçiniz..."
                            value={selectedDistrict?.name || null}
                            onPress={() => setDistrictModalVisible(true)}
                            loading={districtsLoading}
                            disabled={!selectedState || districtsLoading}
                        />
                    </View>

                    {/* Konumumu Otomatik Bul */}
                    <TouchableOpacity
                        style={styles.locateButton}
                        onPress={handleLocateMe}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.locateButtonIcon}>📍</Text>
                        <Text style={styles.locateButtonText}>Konumumu Otomatik Bul</Text>
                    </TouchableOpacity>

                    {/* Hızlı İl Seçimi (İlk 4) */}
                    {!statesLoading && quickStates.length > 0 && (
                        <View style={styles.quickSelectSection}>
                            <Text style={styles.sectionTitle}>İller</Text>
                            <View style={styles.citiesGrid}>
                                {quickStates.map((state) => (
                                    <TouchableOpacity
                                        key={state.id}
                                        style={[
                                            styles.cityButton,
                                            selectedState?.id === state.id && styles.cityButtonSelected,
                                        ]}
                                        onPress={() => handleStateSelect(state)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.cityButtonText,
                                                selectedState?.id === state.id && styles.cityButtonTextSelected,
                                            ]}
                                        >
                                            {state.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Seçilen İlçe Gösterimi */}
                    {selectedState && selectedDistrict && (
                        <View style={styles.selectedInfo}>
                            <Text style={styles.selectedInfoText}>
                                📍 {selectedState.name}, {selectedDistrict.name}
                            </Text>
                        </View>
                    )}

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={saving ? "Kaydediliyor..." : "Kaydet ve Devam Et"}
                        onPress={handleSaveLocation}
                        disabled={isButtonDisabled}
                        style={styles.saveButton}
                        textStyle={{ color: '#111' }}
                    />
                </View>
            </SafeAreaView>

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
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 65,
        left: 24,
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButtonIcon: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -2,
    },
    absoluteBackground: {
        position: 'absolute',
        width: width,
        height: height * 0.6,
        top: 0,
        left: 0,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 32,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    dropdownSection: {
        marginBottom: 16,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownDisabled: {
        opacity: 0.5,
    },
    dropdownText: {
        fontSize: 16,
        color: '#FFFFFF',
        flex: 1,
    },
    dropdownPlaceholder: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    dropdownArrow: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginLeft: 10,
    },
    locateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 14,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 24,
    },
    locateButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    locateButtonText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    quickSelectSection: {
        marginTop: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    citiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    cityButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 25,
        margin: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cityButtonSelected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    cityButtonText: {
        fontSize: 15,
        color: '#FFFFFF',
    },
    cityButtonTextSelected: {
        color: '#111',
        fontWeight: 'bold',
    },
    selectedInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedInfoText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
    },
    spacer: {
        height: 120,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
    },
    saveButton: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#064E3B',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    modalClose: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    modalList: {
        paddingHorizontal: 20,
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalItemText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default CitySelectionScreen;
