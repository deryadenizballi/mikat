import React, { useState } from 'react';
import * as RN from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen: React.FC = () => {
    const [iftarNotification, setIftarNotification] = useState(true);
    const [sahurNotification, setSahurNotification] = useState(true);

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
                        subtitle="İSTANBUL"
                    />
                    <SettingItem
                        icon="🏢"
                        title="İlçe Seçimi"
                        subtitle="KADIKÖY"
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
                            onValueChange={setIftarNotification}
                            trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
                            thumbColor="#FFFFFF"
                        />
                    </RN.View>

                    <RN.View style={styles.divider} />

                    <RN.View style={styles.switchRow}>
                        <RN.Text style={styles.switchLabel}>Sahur Bildirimi</RN.Text>
                        <RN.Switch
                            value={sahurNotification}
                            onValueChange={setSahurNotification}
                            trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
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
        </SafeAreaView>
    );
};

const styles = RN.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        color: '#1E3A5F',
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
        color: '#1E3A5F',
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
        color: '#1E3A5F',
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
});

export default SettingsScreen;
