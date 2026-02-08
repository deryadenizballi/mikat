import React, { useState } from 'react';
import {
    View as RNView,
    Text as RNText,
    StyleSheet,
    Image as RNImage,
    TouchableOpacity as RNTouchableOpacity,
    ScrollView as RNScrollView,
    Dimensions,
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
import { Colors } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

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
];

const CitySelectionScreen: React.FC<CitySelectionScreenProps> = ({ navigation, route }) => {
    const { userName } = route.params;
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

    const handleCitySelect = (city: City) => {
        if (selectedCity?.id !== city.id) {
            setSelectedCity(city);
            setSelectedDistrict(null);
        }
    };

    const handleDistrictSelect = (district: District) => {
        setSelectedDistrict(district);
    };

    const handleLocateMe = () => {
        console.log('Locate Me button pressed');
    };

    const handleSaveCity = () => {
        if (selectedCity && selectedDistrict) {
            navigation.navigate('MainApp', {
                city: selectedCity.name,
                district: selectedDistrict.name
            });
        }
    };

    const isButtonDisabled = selectedCity === null || selectedDistrict === null;

    const filteredCities = popularCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.flex1}>
            {/* Background Image (Mosque) */}
            <Image
                source={require('../../assets/city-bg.jpg')}
                style={styles.absoluteBackground}
                resizeMode="cover"
            />

            {/* Gradient Overlay (Dark Greenish/Black) */}
            <LinearGradient
                colors={['transparent', 'rgba(11, 28, 45, 0.8)', 'rgba(11, 28, 45, 1)']}
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
                        <Text style={styles.headerTitle}>Şehir Seçimi</Text>
                        <Text style={styles.headerSubtitle}>
                            Selam {userName}, vaktini hesaplamak için şehri ve ilçeni seçmelisin.
                        </Text>
                    </View>

                    <View style={styles.searchSection}>
                        <TextInputField
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Şehrinizi arayın..."
                            style={styles.glassInput}
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            inputStyle={{ color: '#FFFFFF' }}
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

                    <View style={styles.spacer} />
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title="Kaydet ve Devam Et"
                        onPress={handleSaveCity}
                        disabled={isButtonDisabled}
                        style={styles.saveButton}
                        textStyle={{ color: '#111' }}
                    />
                </View>
            </SafeAreaView>
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
        marginTop: -2, // Görsel hizalama için
    },
    absoluteBackground: {
        position: 'absolute',
        width: width,
        height: height * 0.6, // Only top part shows clearly
        top: 0,
        left: 0,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11, 28, 45, 0.6)',
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
        paddingBottom: 24,
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
    searchSection: {
        marginBottom: 32,
    },
    glassInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 16,
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
    citiesSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
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
    districtsSection: {
        marginBottom: 32,
    },
    districtButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        margin: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    districtButtonSelected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    districtButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    districtButtonTextSelected: {
        color: '#111',
        fontWeight: 'bold',
    },
    spacer: {
        height: 100,
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
});

export default CitySelectionScreen;
