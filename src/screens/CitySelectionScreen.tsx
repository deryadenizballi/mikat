import React, { useState } from 'react';
import {
    View as RNView,
    Text as RNText,
    StyleSheet,
    Image as RNImage,
    TouchableOpacity as RNTouchableOpacity,
    ScrollView as RNScrollView,
} from 'react-native';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ScrollView = RNScrollView as any;
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';
import PrimaryButton from '../components/PrimaryButton';
import TextInputField from '../components/TextInputField';

type CitySelectionScreenNavigationProp = NativeStackNavigationProp<
    OnboardingStackParamList,
    'CitySelection'
>;

type CitySelectionScreenRouteProp = RouteProp<
    OnboardingStackParamList,
    'CitySelection'
>;

interface CitySelectionScreenProps {
    navigation: CitySelectionScreenNavigationProp;
    route: CitySelectionScreenRouteProp;
}

interface District {
    id: string;
    name: string;
}

interface City {
    id: string;
    name: string;
    districts: District[];
}

const popularCities: City[] = [
    {
        id: '1',
        name: 'İstanbul',
        districts: [
            { id: '1-1', name: 'Kadıköy' },
            { id: '1-2', name: 'Beşiktaş' },
            { id: '1-3', name: 'Üsküdar' },
            { id: '1-4', name: 'Fatih' },
            { id: '1-5', name: 'Bakırköy' },
            { id: '1-6', name: 'Şişli' },
            { id: '1-7', name: 'Beyoğlu' },
            { id: '1-8', name: 'Sarıyer' },
        ],
    },
    {
        id: '2',
        name: 'Ankara',
        districts: [
            { id: '2-1', name: 'Çankaya' },
            { id: '2-2', name: 'Keçiören' },
            { id: '2-3', name: 'Mamak' },
            { id: '2-4', name: 'Yenimahalle' },
            { id: '2-5', name: 'Etimesgut' },
            { id: '2-6', name: 'Sincan' },
        ],
    },
    {
        id: '3',
        name: 'İzmir',
        districts: [
            { id: '3-1', name: 'Konak' },
            { id: '3-2', name: 'Karşıyaka' },
            { id: '3-3', name: 'Bornova' },
            { id: '3-4', name: 'Buca' },
            { id: '3-5', name: 'Bayraklı' },
            { id: '3-6', name: 'Çiğli' },
        ],
    },
    {
        id: '4',
        name: 'Londra',
        districts: [
            { id: '4-1', name: 'Westminster' },
            { id: '4-2', name: 'Camden' },
            { id: '4-3', name: 'Greenwich' },
            { id: '4-4', name: 'Hackney' },
            { id: '4-5', name: 'Tower Hamlets' },
        ],
    },
];

const CitySelectionScreen: React.FC<CitySelectionScreenProps> = ({ navigation, route }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const { userName } = route.params;

    const handleCitySelect = (city: City) => {
        if (selectedCity?.id !== city.id) {
            setSelectedCity(city);
            setSelectedDistrict(null); // İlçe seçimini sıfırla
        }
    };

    const handleDistrictSelect = (district: District) => {
        setSelectedDistrict(district);
    };

    const handleLocateMe = () => {
        // Placeholder for location functionality
        console.log('Locate Me button pressed');
    };

    const handleSaveCity = () => {
        if (selectedCity && selectedDistrict) {
            console.log('Onboarding complete!');
            navigation.navigate('MainApp', {
                city: selectedCity.name,
                district: selectedDistrict.name
            });
        }
    };

    // Hem şehir hem ilçe seçilmeli
    const isButtonDisabled = selectedCity === null || selectedDistrict === null;

    // Filter cities based on search query
    const filteredCities = popularCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo-placeholder.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.headerTitle}>Şehir Seçimi</Text>
                    <Text style={styles.headerSubtitle}>
                        Doğru namaz vakitleri için şehir ve ilçenizi seçin
                    </Text>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <TextInputField
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Şehrinizi arayın..."
                        style={styles.searchInput}
                    />

                    <TouchableOpacity
                        style={styles.locateButton}
                        onPress={handleLocateMe}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.locateButtonIcon}>📍</Text>
                        <Text style={styles.locateButtonText}>Konumumu Otomatik Bul</Text>
                    </TouchableOpacity>
                </View>

                {/* Popular Cities Section */}
                <View style={styles.citiesSection}>
                    <Text style={styles.sectionTitle}>Popüler Şehirler</Text>
                    <View style={styles.citiesGrid}>
                        {filteredCities.map((city) => (
                            <TouchableOpacity
                                key={city.id}
                                style={[
                                    styles.cityButton,
                                    selectedCity?.id === city.id && styles.cityButtonSelected,
                                ]}
                                onPress={() => handleCitySelect(city)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.cityButtonText,
                                        selectedCity?.id === city.id && styles.cityButtonTextSelected,
                                    ]}
                                >
                                    {city.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Districts Section - Şehir seçildiğinde göster */}
                {selectedCity && (
                    <View style={styles.districtsSection}>
                        <Text style={styles.sectionTitle}>
                            {selectedCity.name} İlçeleri
                        </Text>
                        <View style={styles.citiesGrid}>
                            {selectedCity.districts.map((district) => (
                                <TouchableOpacity
                                    key={district.id}
                                    style={[
                                        styles.districtButton,
                                        selectedDistrict?.id === district.id && styles.districtButtonSelected,
                                    ]}
                                    onPress={() => handleDistrictSelect(district)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.districtButtonText,
                                            selectedDistrict?.id === district.id && styles.districtButtonTextSelected,
                                        ]}
                                    >
                                        {district.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Selected Info */}
                {selectedCity && selectedDistrict && (
                    <View style={styles.selectedInfo}>
                        <Text style={styles.selectedInfoText}>
                            📍 {selectedCity.name}, {selectedDistrict.name}
                        </Text>
                    </View>
                )}

                {/* Spacer to push button to bottom */}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Save Button - Fixed at bottom */}
            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Kaydet"
                    onPress={handleSaveCity}
                    disabled={isButtonDisabled}
                    style={styles.saveButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        paddingTop: 24,
        paddingBottom: 24,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E3A5F',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 16,
    },
    logo: {
        width: 50,
        height: 50,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A5F',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
    },
    searchSection: {
        marginBottom: 24,
    },
    searchInput: {
        marginBottom: 12,
    },
    locateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
    },
    locateButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    locateButtonText: {
        fontSize: 15,
        color: '#1E3A5F',
        fontWeight: 'normal',
    },
    citiesSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A5F',
        marginBottom: 12,
    },
    citiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    cityButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cityButtonSelected: {
        backgroundColor: '#1E3A5F',
        borderColor: '#1E3A5F',
        shadowColor: '#1E3A5F',
        shadowOpacity: 0.25,
        elevation: 4,
    },
    cityButtonText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: 'normal',
    },
    cityButtonTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    districtsSection: {
        marginBottom: 24,
    },
    districtButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    districtButtonSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    districtButtonText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: 'normal',
    },
    districtButtonTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    selectedInfo: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    selectedInfoText: {
        fontSize: 15,
        color: '#1E40AF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    spacer: {
        flex: 1,
        minHeight: 16,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 24,
        backgroundColor: '#F8FAFC',
    },
    saveButton: {
        alignSelf: 'stretch',
    },
});

export default CitySelectionScreen;
