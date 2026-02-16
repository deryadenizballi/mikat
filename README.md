# 🕌 Mikat - Namaz Vakitleri Uygulaması

Mikat, React Native ve Expo kullanılarak geliştirilmiş, modern ve kullanıcı dostu bir namaz vakitleri uygulamasıdır. Firebase ile entegre çalışan uygulama, Türkiye'deki tüm il ve ilçeler için güncel namaz vakitlerini sunar.

## ✨ Özellikler

### 🏠 Ana Ekran
- **Gerçek Zamanlı Geri Sayım Sayaçları**: 
  - Bir sonraki namaz vaktine kalan süre (saniye hassasiyetinde)
  - İftar vaktine kalan süre
  - Sahur vaktine kalan süre
  - Kaydırılabilir timer carousel ile tüm sayaçlara kolay erişim
- **Dairesel İlerleme Göstergeleri**: Vakitlere kalan süreyi görsel olarak gösteren animasyonlu progress ring'ler
- **Günlük Namaz Vakitleri Grid'i**: Tüm vakitleri (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı) tek bakışta görüntüleme
- **Hicri ve Miladi Tarih**: Güncel tarih bilgisi her iki takvimde de gösterilir
- **Günün Hadisi**: Her gün farklı bir hadis ve günlük öneriler
- **Günlük Menü Önerileri**: Sahur ve iftar için detaylı yemek menüleri (kalori bilgisi dahil)

### 📅 Aylık Vakitler Ekranı
- Seçili ay için tüm günlerin namaz vakitlerini tablo formatında görüntüleme
- Bugünün satırı özel olarak vurgulanır
- Kaydırılabilir liste ile kolay navigasyon
- Her gün için 6 vakit bilgisi (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı)

### ⚙️ Ayarlar Ekranı
- **Konum Yönetimi**: 
  - Türkiye'deki tüm il ve ilçeler arasından seçim
  - Firebase'den gerçek zamanlı konum verileri
- **Bildirim Tercihleri**:
  - Tüm namaz vakitleri için bildirimler
  - İftar bildirimi (özelleştirilebilir)
  - Sahur bildirimi (özelleştirilebilir)
- **Kullanıcı Profili**: İsim düzenleme ve kişiselleştirme
- **Vakitleri Güncelle**: Manuel güncelleme seçeneği

### 🎯 Onboarding Deneyimi
- İlk kullanımda kullanıcı adı alma
- Şehir ve ilçe seçimi
- **Conditional Routing**: Onboarding tamamlanmışsa doğrudan ana ekrana yönlendirme
- **Kalıcı Durum**: Onboarding durumu AsyncStorage'da güvenli bir şekilde saklanır

### 🔔 Bildirim Sistemi
- Expo Notifications ile entegre push bildirimleri
- **Günlük Bildirim Planlaması**: Her gün sadece o güne ait namaz vakitleri planlanır (tercihlere göre)
- **Background Task Entegrasyonu**: Uygulama kapalıyken bile arka planda bildirimler güncellenir
- Özelleştirilebilir bildirim tercihleri (Tümü, İftar, Sahur)
- Android için özel bildirim kanalı ve iOS için HIGH priority desteği

## 🏗️ Mimari ve Teknik Detaylar

### Proje Yapısı
```
mikat/
├── src/
│   ├── components/          # Yeniden kullanılabilir UI bileşenleri
│   │   ├── CustomTabBar.tsx      # Özel tasarım tab bar
│   │   ├── PrimaryButton.tsx     # Ana buton bileşeni
│   │   └── TextInputField.tsx    # Özel text input
│   ├── config/              # Yapılandırma dosyaları
│   │   └── firebase.ts           # Firebase konfigürasyonu
│   ├── context/             # React Context API
│   │   └── AppContext.tsx        # Global state yönetimi
│   ├── data/                # Statik veri dosyaları
│   │   ├── hadiths.json          # Günlük hadisler (365 gün)
│   │   └── meals.json            # Ramazan menüleri (30 gün)
│   ├── hooks/               # Custom React hooks
│   │   ├── useCountdown.ts       # Geri sayım hook'u
│   │   └── usePrayerTimes.ts     # Namaz vakitleri hook'u
│   ├── navigation/          # React Navigation yapılandırması
│   │   ├── MainTabNavigator.tsx  # Ana tab navigasyon
│   │   └── OnboardingNavigator.tsx # Onboarding akışı
│   ├── screens/             # Uygulama ekranları
│   │   ├── HomeScreen.tsx        # Ana sayfa (41KB - kompleks UI)
│   │   ├── PrayerTimesScreen.tsx # Aylık vakitler
│   │   ├── SettingsScreen.tsx    # Ayarlar
│   │   ├── OnboardingScreen.tsx  # İlk kurulum
│   │   └── CitySelectionScreen.tsx # Şehir seçimi
│   ├── services/            # İş mantığı servisleri
│   │   ├── prayerTimesService.ts # Firebase Firestore işlemleri
│   │   ├── notificationService.ts # Bildirim yönetimi
│   │   ├── storageService.ts     # AsyncStorage işlemleri
│   │   ├── backgroundTaskService.ts # Arka plan görev yönetimi
│   │   └── index.ts              # Servis exports
│   ├── styles/              # Tema ve stil tanımlamaları
│   │   └── theme.ts              # Renk paleti ve stil sabitleri
│   └── types/               # TypeScript tip tanımlamaları
│       └── index.ts              # Tüm interface'ler ve tipler
├── assets/                  # Görseller ve ikonlar
├── App.tsx                  # Ana uygulama bileşeni
└── package.json             # Bağımlılıklar ve scriptler
```

### State Yönetimi (AppContext)
Uygulama, React Context API kullanarak global state yönetimi sağlar:

### Firebase Entegrasyonu

#### Firestore Koleksiyonları
1. **`states`**: İl bilgileri
   - `id`: İl ID (örn: "500")
   - `name`: İl adı
   - `countryId`: Ülke ID

2. **`districts`**: İlçe bilgileri
   - `id`: İlçe ID
   - `name`: İlçe adı
   - `stateId`: Bağlı olduğu il ID

3. **`prayerTimes`**: Namaz vakitleri
   - Döküman ID formatı: `{districtId}_{year}` (örn: "16704_2026")
   - Yapı:
     ```typescript
     {
       districtId: string,
       districtName: string,
       months: {
         "01": { // Ay (01-12)
           1: { // Gün (1-31)
             imsak: "05:30",
             gunes: "07:00",
             ogle: "12:30",
             ikindi: "15:15",
             aksam: "18:00",
             yatsi: "19:30",
             hijri: "15 Ramazan, 1445"
           }
         }
       }
     }
     ```

#### Firebase Servisleri
- `getPrayerTimesForDate()`: Belirli bir tarih için vakitler
- `getTodayPrayerTimes()`: Bugünün vakitleri
- `getPrayerTimesForDateRange()`: Tarih aralığı için vakitler
- `getMonthlyPrayerTimes()`: Aylık vakitler
- `getAllStates()`: Tüm illeri getir
- `getDistrictsForState()`: İle bağlı ilçeleri getir

### Veri Saklama (AsyncStorage)
Yerel veri saklama için `@react-native-async-storage/async-storage` kullanılır:

- `@mikat_user_name`: Kullanıcı adı
- `@mikat_selected_location`: Seçili konum (JSON)
- `@mikat_onboarding_completed`: Onboarding tamamlanma durumu
- `@mikat_iftar_notification`: İftar bildirimi tercihi
- `@mikat_sahur_notification`: Sahur bildirimi tercihi
- `@mikat_all_prayer_notification`: Tüm vakitler bildirimi
- `CACHED_MONTHLY_PRAYER_TIMES`: Aylık vakit verileri önbelleği (Tekil Cache Stratejisi)

### 🌙 Background Tasks (Arka Plan Görevleri)
Uygulama, `expo-background-fetch` ve `expo-task-manager` kullanarak arka planda çalışır:
- **01:00 Güncellemesi**: Her gece saat 01:00'da otomatik tetiklenir.
- **Cache Kontrolü**: Yeni aya geçilip geçilmediğini kontrol eder.
- **Otomatik Veri Çekme**: Gerekli durumlarda Firebase'den güncel aylık veriyi çeker.
- **Bildirim Yenileme**: Kullanıcı tercihlerine göre bugünün bildirimlerini yeniden planlar.

### UI/UX Özellikleri

#### Tasarım Sistemi
- **Renk Paleti**: Yeşil tonları (#10B981, #059669, #047857) ile koyu tema
- **Gradient Arka Planlar**: LinearGradient ile premium görünüm
- **Blur Efektleri**: Modal ve overlay'lerde BlurView kullanımı
- **Animasyonlar**: 
  - React Native Animated API ile smooth geçişler
  - Carousel timer'lar için scale ve opacity animasyonları
  - LayoutAnimation ile accordion efektleri

#### Responsive Tasarım
- `Dimensions.get('window')` ile dinamik boyutlandırma
- Tüm ekran boyutlarına uyumlu layout
- SafeAreaView ile notch/status bar uyumluluğu

## 📦 Teknoloji Stack'i

### Core
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo**: ~54.0.33
- **TypeScript**: ~5.9.2

### Navigation
- `@react-navigation/native`: ^7.1.28
- `@react-navigation/bottom-tabs`: ^7.12.0
- `@react-navigation/native-stack`: ^7.12.0
- `react-native-screens`: ~4.16.0
- `react-native-safe-area-context`: ^5.6.2

### Firebase
- `firebase`: ^12.9.0 (Firestore için)

### UI Components
- `expo-linear-gradient`: ~15.0.8 (Gradient arka planlar)
- `expo-blur`: ~15.0.8 (Blur efektleri)
- `react-native-svg`: 15.12.1 (SVG grafikler ve progress ring'ler)

### Notifications
- `expo-notifications`: ~0.32.16 (Push bildirimleri)

### Storage & Background
- `@react-native-async-storage/async-storage`: ^2.2.0
- `expo-background-fetch`: ~14.0.9
- `expo-task-manager`: ~13.0.3

### Other
- `expo-status-bar`: ~3.0.9

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS için: Xcode ve iOS Simulator
- Android için: Android Studio ve Android Emulator

### Adım Adım Kurulum

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/deryadenizballi/mikat.git
   cd mikat
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Firebase yapılandırması:**
   - `src/config/firebase.ts` dosyasında Firebase credentials'ları kontrol edin
   - Kendi Firebase projenizi kullanmak isterseniz bu dosyayı güncelleyin

4. **Uygulamayı başlatın:**
   ```bash
   npm start
   # veya
   npx expo start
   ```

5. **Platform seçimi:**
   - iOS için: `i` tuşuna basın veya `npm run ios`
   - Android için: `a` tuşuna basın veya `npm run android`
   - Web için: `w` tuşuna basın veya `npm run web`

### Development Scripts
```bash
npm start          # Expo development server'ı başlat
npm run android    # Android emulator'da çalıştır
npm run ios        # iOS simulator'da çalıştır
npm run web        # Web browser'da çalıştır
```

## 📱 Özellik Detayları

### Timer Sistemi
Ana ekrandaki timer sistemi 3 farklı sayaç içerir:
1. **Sonraki Namaz**: Bir sonraki namaz vaktine kalan süre
2. **İftar**: Akşam namazına (iftar) kalan süre
3. **Sahur**: İmsak vaktine (sahur) kalan süre

Her sayaç:
- Saniye hassasiyetinde geri sayım yapar
- Dairesel progress bar ile görsel feedback sağlar
- Kaydırılabilir carousel içinde yer alır
- Aktif sayaç büyütülür ve vurgulanır

### Bildirim Mantığı
- **Tüm Vakitler Açık**: 6 vakit için de bildirim gönderilir
- **Tüm Vakitler Kapalı**: Sadece seçili vakitler (İftar/Sahur) bildirim alır
- **Zamanlama**: Vakitler geçmişse bir sonraki güne zamanlanır
- **Platform Desteği**: iOS ve Android için optimize edilmiş

### Veri Senkronizasyonu ve Cache Stratejisi
- **Unified Monthly Cache**: Uygulama, hem günlük görünüm hem aylık liste için tek bir aylık cache kullanır. Bu sayede Firebase okuma maliyetleri %90'a varan oranda düşürülmüştür.
- **Offline-First**: Veri bir kez cihazda cache'lendiğinde, ay sonuna kadar internet bağlantısı gerekmez.
- **Otomatik Güncelleme**: Arka plan görevleri sayesinde kullanıcı uygulamayı açmasa bile veriler ay sonunda güncellenir.
- **Hata Yönetimi**: Şebeke hataları durumunda mevcut cache verileri kullanılmaya devam edilir.

## 🎨 Tasarım Kararları

### Renk Şeması
- **Primary**: #10B981 (Emerald-500)
- **Primary Dark**: #059669 (Emerald-600)
- **Primary Darker**: #047857 (Emerald-700)
- **Background**: Koyu yeşil gradientler (#064E3B → #022C22 → #000000)
- **Text**: Beyaz ve yarı saydam beyaz tonları

### Tipografi
- **Başlıklar**: Bold, 24px
- **Alt Başlıklar**: SemiBold, 16-18px
- **Body Text**: Regular, 14-16px
- **Küçük Metinler**: 11-13px

### Spacing
- **Padding**: 16-24px (container'lar için)
- **Margin**: 10-20px (bileşenler arası)
- **Border Radius**: 12-24px (modern, yumuşak köşeler)

## 🔧 Geliştirme Notları

### Performans Optimizasyonları
- FlatList kullanımı ile verimli liste render'ı
- React.memo ile gereksiz re-render'ların önlenmesi
- useCallback ve useMemo hook'ları ile optimizasyon
- Animated API ile native thread animasyonları

### Bilinen Sınırlamalar
- Sadece Türkiye lokasyonları desteklenir
- Firebase bağlantısı gerektirir
- Offline modda sınırlı işlevsellik

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## 👨‍💻 Geliştirici

**Derya Deniz Ballı**
- GitHub: [@deryadenizballi](https://github.com/deryadenizballi)
