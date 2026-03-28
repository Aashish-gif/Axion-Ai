"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  sd: { name: 'Sindhi', nativeName: 'سنڌي' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  raj: { name: 'Rajasthani', nativeName: 'राजस्थानी' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া' },
  ur: { name: 'Urdu', nativeName: 'اردو' },
  ks: { name: 'Kashmiri', nativeName: 'کٲشُر' },
  ne: { name: 'Nepali', nativeName: 'नेपाली' },
  kok: { name: 'Konkani', nativeName: 'कोंकणी' },
  mai: { name: 'Maithili', nativeName: 'मैथिली' },
  sa: { name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  doi: { name: 'Dogri', nativeName: 'डोगरी' },
  brx: { name: 'Bodo', nativeName: 'बड़ो' },
  mn: { name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  sat: { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱞᱤ' },
  gom: { name: 'Konkani (Goan)', nativeName: 'कोंकणी (गोवा)' },
} as const;

type Language = keyof typeof LANGUAGES;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

// Comprehensive translations for all UI elements
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.comments': 'Reply Studio',
    'nav.reports': 'Video Reports',
    'nav.ideas': 'Idea Factory',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.analytics': 'Analytics',
    'dashboard.recent': 'Recent Videos',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.analyze_video': 'Analyze Video',
    'dashboard.view_reports': 'View Reports',
    'dashboard.manage_comments': 'Manage Comments',
    
    // Video Reports
    'reports.title': 'Video Reports',
    'reports.sentiment': 'Sentiment Score',
    'reports.comments': 'Comments Analyzed',
    'reports.views': 'Views',
    'reports.likes': 'Likes',
    'reports.download': 'Download Report',
    'reports.back': 'Back to Dashboard',
    'reports.summary': 'Executive Summary',
    'reports.strengths': "What's Working",
    'reports.improvements': 'Areas to Improve',
    'reports.next_video': 'Next Video Idea',
    
    // Comments
    'comments.title': 'Reply Studio',
    'comments.pending': 'Pending Replies',
    'comments.smart_reply': 'Smart Reply',
    'comments.analyze': 'Analyze Comments',
    
    // Settings
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.email_notifications': 'Email Notifications',
    'settings.email_desc': 'Receive emails when reports are ready',
    'settings.dark_mode': 'Dark Mode',
    'settings.dark_mode_desc': 'Toggle between light and dark theme',
    'settings.language': 'Language',
    'settings.language_desc': 'Choose your preferred language',
    'settings.channels': 'Connected Channels',
    'settings.connect': 'Connect Channel',
    'settings.disconnect': 'Disconnect',
    
    // Profile
    'profile.title': 'Profile',
    'profile.info': 'Profile Information',
    'profile.connected': 'Connected Channels',
    'profile.add_channel': 'Add Channel',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.on': 'ON',
    'common.off': 'OFF',
    'common.yes': 'Yes',
    'common.no': 'No',
  },
  gu: {
    // Navigation
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.comments': 'રિપ્લાય સ્ટુડિયો',
    'nav.reports': 'વિડિયો રિપોર્ટ્સ',
    'nav.ideas': 'આઇડિયા ફેક્ટરી',
    'nav.settings': 'સેટિંગ્સ',
    'nav.profile': 'પ્રોફાઇલ',
    'nav.logout': 'લોગઆઉટ',
    
    // Dashboard
    'dashboard.title': 'ડેશબોર્ડ',
    'dashboard.welcome': 'પાછા આવતાં સ્વાગત છે',
    'dashboard.overview': 'ઓવરવ્યૂ',
    'dashboard.analytics': 'એનાલિટિક્સ',
    'dashboard.recent': 'તાજેતરના વિડિયો',
    'dashboard.quick_actions': 'ઝડપી ક્રિયાઓ',
    'dashboard.analyze_video': 'વિડિયો એનાલાઈઝ કરો',
    'dashboard.view_reports': 'રિપોર્ટ્સ જુઓ',
    'dashboard.manage_comments': 'કોમેન્ટ્સ મેનેજ કરો',
    
    // Video Reports
    'reports.title': 'વિડિયો રિપોર્ટ્સ',
    'reports.sentiment': 'સેન્ટિમેન્ટ સ્કોર',
    'reports.comments': 'ટિપ્પણીઓનું વિશ્લેષણ',
    'reports.views': 'વ્યૂઝ',
    'reports.likes': 'લાઇક્સ',
    'reports.download': 'રિપોર્ટ ડાઉનલોડ કરો',
    'reports.back': 'ડેશબોર્ડ પર પાછા',
    'reports.summary': 'કાર્યકારી સારાંશ',
    
    // Comments
    'comments.title': 'રિપ્લાય સ્ટુડિયો',
    
    // Settings
    'settings.title': 'સેટિંગ્સ',
    'settings.notifications': 'નોટિફિકેશન્સ',
    'settings.email_notifications': 'ઇમેઇલ નોટિફિકેશન્સ',
    'settings.email_desc': 'જ્યારે રિપોર્ટ તૈયાર હોય ત્યારે ઇમેઇલ મેળવો',
    'settings.dark_mode': 'ડાર્ક મોડ',
    'settings.dark_mode_desc': 'લાઇટ અને ડાર્ક થીમ વચ્ચે ટોગલ કરો',
    'settings.language': 'ભાષા',
    'settings.language_desc': 'તમારી પસંદગીની ભાષા પસંદ કરો',
    'settings.channels': 'કનેક્ટેડ ચેનલ્સ',
    'settings.connect': 'ચેનલ કનેક્ટ કરો',
    'settings.disconnect': 'ડિસ્કનેક્ટ કરો',
    
    // Profile
    'profile.title': 'પ્રોફાઇલ',
    
    // Common
    'common.save': 'સેવ કરો',
    'common.cancel': 'રદ કરો',
    'common.loading': 'લોડ થઈ રહ્યું છે...',
    'common.on': 'ચાલુ',
    'common.off': 'બંધ',
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.comments': 'रिप्लाई स्टूडियो',
    'nav.reports': 'वीडियो रिपोर्ट्स',
    'nav.ideas': 'आइडिया फैक्ट्री',
    'nav.settings': 'सेटिंग्स',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.welcome': 'वापसी पर स्वागत',
    'dashboard.overview': 'अवलोकन',
    'dashboard.analytics': 'एनालिटिक्स',
    'dashboard.recent': 'हाल के वीडियो',
    'dashboard.quick_actions': 'त्वरित कार्रवाई',
    'dashboard.analyze_video': 'वीडियो विश्लेषण करें',
    'dashboard.view_reports': 'रिपोर्ट देखें',
    'dashboard.manage_comments': 'कमेंट्स प्रबंधित करें',
    
    // Video Reports
    'reports.title': 'वीडियो रिपोर्ट्स',
    'reports.sentiment': 'सेंटीमेंट स्कोर',
    'reports.comments': 'टिप्पणियां विश्लेषित',
    'reports.views': 'व्यूज',
    'reports.likes': 'लाइक्स',
    'reports.download': 'रिपोर्ट डाउनलोड करें',
    'reports.back': 'डैशबोर्ड पर वापस',
    'reports.summary': 'कार्यकारी सारांश',
    
    // Comments
    'comments.title': 'रिप्लाई स्टूडियो',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.notifications': 'सूचनाएं',
    'settings.email_notifications': 'ईमेल सूचनाएं',
    'settings.email_desc': 'जब रिपोर्ट तैयार हो तो ईमेल प्राप्त करें',
    'settings.dark_mode': 'डार्क मोड',
    'settings.dark_mode_desc': 'लाइट और डार्क थीम के बीच टॉगल करें',
    'settings.language': 'भाषा',
    'settings.language_desc': 'अपनी पसंदीदा भाषा चुनें',
    'settings.channels': 'कनेक्टेड चैनल्स',
    'settings.connect': 'चैनल कनेक्ट करें',
    'settings.disconnect': 'डिस्कनेक्ट करें',
    
    // Profile
    'profile.title': 'प्रोफाइल',
    
    // Common
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
    'common.on': 'चालू',
    'common.off': 'बंद',
  },
  // Add more languages as needed
  sd: { 'app.title': 'Axion AI', 'dashboard.title': 'ڈیشبورڊ', 'settings.title': 'سیٹنگس', 'profile.title': 'پروفائل', 'comments.title': 'تبصرے', 'reports.title': 'رپورٽس', 'dark_mode': 'ارک موڊ', 'email_notifications': 'ایمیل نوٽيفيڪيشنز', 'language': 'زبان', 'connect_channel': 'چينل جوڙيو', 'disconnect': 'ڊسڪنيڪٽ', 'add_channel': 'چينل شامل ڪريو', 'download_report': 'رپورٽ ڈاؤن لوڊ ڪريو', 'sentiment_score': 'سينٽيمنٽ اسڪور', 'comments_analyzed': 'تبصرن جو تجزيو', 'views': 'ويوز', 'likes': 'لائڪس', 'shares': 'شيئرز', },
  mr: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'डॅशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पण्या', 'reports.title': 'रिपोर्ट्स', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचना', 'language': 'भाषा', 'connect_channel': 'चॅनेल जोडा', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चॅनेल जोडा', 'download_report': 'रिपोर्ट डाउनलोड करा', 'sentiment_score': 'सेंटिमेंट स्कोअर', 'comments_analyzed': 'टिप्पण्यांचे विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेअर्स', },
  // Add other Indian languages with basic translations
  raj: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'डैशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणियां', 'reports.title': 'रिपोर्ट्स', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचनाएं', 'language': 'भाषा', 'connect_channel': 'चैनल जोड़ें', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चैनल जोड़ें', 'download_report': 'रिपोर्ट डाउनलोड करें', 'sentiment_score': 'सेंटीमेंट स्कोर', 'comments_analyzed': 'टिप्पणियों का विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेयर्स', },
  pa: { 'app.title': 'ਐਕਸ਼ਨ AI', 'dashboard.title': 'ਡੈਸ਼ਬੋਰਡ', 'settings.title': 'ਸੈਟਿੰਗਾਂ', 'profile.title': 'ਪ੍ਰੋਫਾਈਲ', 'comments.title': 'ਟਿੱਪਣੀਆਂ', 'reports.title': 'ਰਿਪੋਰਟਾਂ', 'dark_mode': 'ਡਾਰਕ ਮੋਡ', 'email_notifications': 'ਈਮੇਲ ਸੂਚਨਾਵਾਂ', 'language': 'ਭਾਸ਼ਾ', 'connect_channel': 'ਚੈਨਲ ਕਨੈਕਟ ਕਰੋ', 'disconnect': 'ਡਿਸਕਨੈਕਟ', 'add_channel': 'ਚੈਨਲ ਸ਼ਾਮਲ ਕਰੋ', 'download_report': 'ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ', 'sentiment_score': 'ਸੈਂਟੀਮੈਂਟ ਸਕੋਰ', 'comments_analyzed': 'ਟਿੱਪਣੀਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ', 'views': 'ਵਿਊਜ਼', 'likes': 'ਲਾਈਕਸ', 'shares': 'ਸ਼ੇਅਰਾਂ', },
  bn: { 'app.title': 'এক্সিয়ন AI', 'dashboard.title': 'ড্যাশবোর্ড', 'settings.title': 'সেটিংস', 'profile.title': 'প্রোফাইল', 'comments.title': 'মন্তব্য', 'reports.title': 'রিপোর্টস', 'dark_mode': 'ডার্ক মোড', 'email_notifications': 'ইমেল বিজ্ঞপ্তি', 'language': 'ভাষা', 'connect_channel': 'চ্যানেল সংযোগ করুন', 'disconnect': 'বিচ্ছিন্ন করুন', 'add_channel': 'চ্যানেল যোগ করুন', 'download_report': 'রিপোর্ট ডাউনলোড করুন', 'sentiment_score': 'সেন্টিমেন্ট স্কোর', 'comments_analyzed': 'মন্তব্য বিশ্লেষণ', 'views': 'ভিউস', 'likes': 'লাইকস', 'shares': 'শেয়ারস', },
  ta: { 'app.title': 'ஆக்ஸியான் AI', 'dashboard.title': 'டாஷ்போர்டு', 'settings.title': 'அமைப்புகள்', 'profile.title': 'சுயவிவரம்', 'comments.title': 'கருத்துகள்', 'reports.title': 'அறிக்கைகள்', 'dark_mode': 'இருட்டை பயன்முறை', 'email_notifications': 'மின்னஞ்சல் அறிவிப்புகள்', 'language': 'மொழி', 'connect_channel': 'சேனலை இணைக்கவும்', 'disconnect': 'துண்டிக்கவும்', 'add_channel': 'சேனலைச் சேர்க்கவும்', 'download_report': 'அறிக்கையைப் பதிவிறக்கவும்', 'sentiment_score': 'உணர்வு மதிப்பெண்', 'comments_analyzed': 'கருத்துகள் பகுப்பாய்வு', 'views': 'காட்சிகள்', 'likes': 'விருப்பங்கள்', 'shares': 'பகிர்வுகள்', },
  te: { 'app.title': 'యాక్షన్ AI', 'dashboard.title': 'డ్యాష్‌బోర్డ్', 'settings.title': 'సెట్టింగ్‌లు', 'profile.title': 'ప్రొఫైల్', 'comments.title': 'వ్యాఖ్యలు', 'reports.title': 'నివేదికలు', 'dark_mode': 'డార్క్ మోడ్', 'email_notifications': 'ఇమెయిల్ నోటిఫికేషన్‌లు', 'language': 'భాష', 'connect_channel': 'ఛానల్‌ని కనెక్ట్ చేయండి', 'disconnect': 'డిస్కనెక్ట్ చేయండి', 'add_channel': 'ఛానల్‌ని జోడిండి', 'download_report': 'నివేదికను డౌన్‌లోడ్ చేయండి', 'sentiment_score': 'సెంటిమెంట్ స్కోర్', 'comments_analyzed': 'వ్యాఖ్యల విశ్లేషణ', 'views': 'వీక్షణాలు', 'likes': 'లైక్‌లు', 'shares': 'షేర్‌లు', },
  ml: { 'app.title': 'ആക്ഷിയൻ AI', 'dashboard.title': 'ഡാഷ്ബോർഡ്', 'settings.title': 'ക്രമീകരണങ്ങൾ', 'profile.title': 'പ്രൊഫൈൽ', 'comments.title': 'അഭിപ്രായങ്ങൾ', 'reports.title': 'റിപ്പോർട്ടുകൾ', 'dark_mode': 'ഡാർക്ക് മോഡ്', 'email_notifications': 'ഇമെയിൽ അറിയിപ്പുകൾ', 'language': 'ഭാഷ', 'connect_channel': 'ചാനൽ ബന്ധിപ്പിക്കുക', 'disconnect': 'വിച്ഛേദിക്കുക', 'add_channel': 'ചാനൽ ചേർക്കുക', 'download_report': 'റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക', 'sentiment_score': 'സെന്റിമെന്റ് സ്കോർ', 'comments_analyzed': 'അഭിപ്രായങ്ങളുടെ വിശകലനം', 'views': 'കാഴ്ചകൾ', 'likes': 'ഇഷ്ടങ്ങൾ', 'shares': 'പങ്കുവെയ്യലുകൾ', },
  kn: { 'app.title': 'ಆಕ್ಷಿಯಾನ್ AI', 'dashboard.title': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'settings.title': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', 'profile.title': 'ಪ್ರೊಫೈಲ್', 'comments.title': 'ಕಾಮೆಂಟ್‌ಗಳು', 'reports.title': 'ವರದಿಗಳು', 'dark_mode': 'ಡಾರ್ಕ್ ಮೋಡ್', 'email_notifications': 'ಇಮೇಲ್ ಅಧಿಸೂಚನೆಗಳು', 'language': 'ಭಾಷೆ', 'connect_channel': 'ಚಾನೆಲ್ ಸಂಪರ್ಕಿಸಿ', 'disconnect': 'ಸಂಪರ್ಕ ಕಡಿದುಹಾಕಿ', 'add_channel': 'ಚಾನೆಲ್ ಸೇರಿಸಿ', 'download_report': 'ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', 'sentiment_score': 'ಸೆಂಟಿಮೆಂಟ್ ಸ್ಕೋರ್', 'comments_analyzed': 'ಕಾಮೆಂಟ್‌ಗಳ ವಿಶ್ಲೇಷಣ', 'views': 'ವೀಕ್ಷಣಗಳು', 'likes': 'ಲೈಕ್‌ಗಳು', 'shares': 'ಹಂಚಿಕೆಗಳು', },
  or: { 'app.title': 'ଆକ୍ସିଆନ୍ AI', 'dashboard.title': 'ଡ୍ୟାସବୋର୍ଡ', 'settings.title': 'ସେଟିଂସ୍', 'profile.title': 'ପ୍ରୋଫାଇଲ୍', 'comments.title': 'ମନ୍ତବ୍ୟ', 'reports.title': 'ରିପୋର୍ଟସ୍', 'dark_mode': 'ଡାର୍କ ମୋଡ୍', 'email_notifications': 'ଇମେଲ ବିଜ୍ଞାପ୍ତି', 'language': 'ଭାଷା', 'connect_channel': 'ଚ୍ୟାନେଲ ସଂଯୋଗ କରନ୍ତୁ', 'disconnect': 'ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ କରନ୍ତୁ', 'add_channel': 'ଚ୍ୟାନେଲ ଯୋଗ କରନ୍ତୁ', 'download_report': 'ରିପୋର୍ଟ ଡାଉନଲୋଡ୍ କରନ୍ତୁ', 'sentiment_score': 'ସେଣ୍ଟିମେଣ୍ଟ ସ୍କୋର୍', 'comments_analyzed': 'ମନ୍ତବ୍ୟ ବିଶ୍ଳେଷଣ', 'views': 'ଦୃଶ୍ୟ', 'likes': 'ଲାଇସ୍', 'shares': 'ସେୟାରସ୍', },
  as: { 'app.title': 'অক্ষিয়ন AI', 'dashboard.title': 'ডেশবৰ্ড', 'settings.title': 'ছেটিংস', 'profile.title': 'প্ৰফাইল', 'comments.title': 'মন্তব্য', 'reports.title': 'ৰিপোৰ্টস', 'dark_mode': 'ডাৰ্ক মোড', 'email_notifications': 'ইমেইল সূচনাসমূহ', 'language': 'ভাষা', 'connect_channel': 'চেনেল সংযোগ কৰক', 'disconnect': 'বিচ্ছিন্ন কৰক', 'add_channel': 'চেনেল যোগ কৰক', 'download_report': 'ৰিপোৰ্ট ডাউনলোড কৰক', 'sentiment_score': 'ছেন্টিমেণ্ট স্কোৰ', 'comments_analyzed': 'মন্তব্য বিশ্লেষণ', 'views': 'ভিউজ', 'likes': 'লাইকছ', 'shares': 'শ্বেৰছ', },
  ur: { 'app.title': 'ایکسیان AI', 'dashboard.title': 'ڈیش بورڈ', 'settings.title': 'سیٹنگس', 'profile.title': 'پروفائل', 'comments.title': 'تبصرے', 'reports.title': 'رپورٹس', 'dark_mode': 'ڈارک موڈ', 'email_notifications': 'ایمیل نوٹیفیکیشنز', 'language': 'زبان', 'connect_channel': 'چینل جوڑیں', 'disconnect': 'ڈسکنیکٹ', 'add_channel': 'چینل شامل کریں', 'download_report': 'رپورٹ ڈاؤن لوڈ کریں', 'sentiment_score': 'سینٹیمنٹ اسکور', 'comments_analyzed': 'تبصروں کا تجزیہ', 'views': 'ویوز', 'likes': 'لائیکس', 'shares': 'شیئرز', },
  ks: { 'app.title': 'आक्सियन AI', 'dashboard.title': 'डैशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणियां', 'reports.title': 'रिपोर्ट्स', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचनाएं', 'language': 'भाषा', 'connect_channel': 'चैनल जोड़ें', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चैनल जोड़ें', 'download_report': 'रिपोर्ट डाउनलोड करें', 'sentiment_score': 'सेंटीमेंट स्कोर', 'comments_analyzed': 'टिप्पणियों का विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेयर्स', },
  ne: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'ड्यासबोर्ड', 'settings.title': 'सेटिङ्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणीहरू', 'reports.title': 'रिपोर्टहरू', 'dark_mode': 'डार्क मोड', 'email_notifications': 'इमेल सूचनाहरू', 'language': 'भाषा', 'connect_channel': 'च्यानल जडानुहोस्', 'disconnect': 'डिस्कनेक्ट गर्नुहोस्', 'add_channel': 'च्यानल थप्नुहोस्', 'download_report': 'रिपोर्ट डाउनलोड गर्नुहोस्', 'sentiment_score': 'सेन्टिमेन्ट स्कोर', 'comments_analyzed': 'टिप्पणीको विश्लेषण', 'views': 'दृश्यहरू', 'likes': 'लाइकहरू', 'shares': 'सेयरहरू', },
  kok: { 'app.title': 'आक्शियन AI', 'dashboard.title': 'डॅशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पण्यो', 'reports.title': 'अहवाल', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचना', 'language': 'भास', 'connect_channel': 'चॅनल जोडात', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चॅनल जोडात', 'download_report': 'अहवाल डाउनलोड करात', 'sentiment_score': 'सेंटिमेंट स्कोर', 'comments_analyzed': 'टिप्पण्यांचे विश्लेषण', 'views': 'व्ह्यूज', 'likes': 'लाइक्स', 'shares': 'शेअर्स', },
  mai: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'डैशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणी', 'reports.title': 'रिपोर्ट', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचना', 'language': 'भाषा', 'connect_channel': 'चैनल जोड़ू', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चैनल जोड़ू', 'download_report': 'रिपोर्ट डाउनलोड करू', 'sentiment_score': 'सेंटीमेंट स्कोर', 'comments_analyzed': 'टिप्पणी क विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेयर्स', },
  sa: { 'app.title': 'एक्षियन AI', 'dashboard.title': 'ड्याशबोर्ड्', 'settings.title': 'सेटिंग्स्', 'profile.title': 'प्रोफाइल्', 'comments.title': 'टिप्पणयः', 'reports.title': 'विवरणानि', 'dark_mode': 'अन्धकारः प्रकारः', 'email_notifications': 'विपत्रसूचनाः', 'language': 'भाषा', 'connect_channel': 'चैनलं सम्बध्यताम्', 'disconnect': 'विसंबध्यताम्', 'add_channel': 'चैनलं योजयताम्', 'download_report': 'विवरणं डाउनलोड् कुरुताम्', 'sentiment_score': 'सेन्टिमेन्ट् स्कोर्', 'comments_analyzed': 'टिप्पणीनां विश्लेषणम्', 'views': 'दृश्यानि', 'likes': 'इष्टानि', 'shares': 'संवितरणानि', },
  doi: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'डैशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणियां', 'reports.title': 'रिपोर्ट्स', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचनाएं', 'language': 'भाषा', 'connect_channel': 'चैनल जोड़ें', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चैनल जोड़ें', 'download_report': 'रिपोर्ट डाउनलोड करें', 'sentiment_score': 'सेंटीमेंट स्कोर', 'comments_analyzed': 'टिप्पणियों का विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेयर्स', },
  brx: { 'app.title': 'एक्सियन AI', 'dashboard.title': 'डैशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पणी', 'reports.title': 'रिपोर्ट', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचना', 'language': 'भाषा', 'connect_channel': 'चैनल जोड़ू', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चैनल जोड़ू', 'download_report': 'रिपोर्ट डाउनलोड करू', 'sentiment_score': 'सेंटीमेंट स्कोर', 'comments_analyzed': 'टिप्पणी क विश्लेषण', 'views': 'व्यूज', 'likes': 'लाइक्स', 'shares': 'शेयर्स', },
  mn: { 'app.title': 'এক্সিয়ন AI', 'dashboard.title': 'ড্যাশবোর্ড', 'settings.title': 'ছেটিংস', 'profile.title': 'প্ৰফাইল', 'comments.title': 'মন্তব্য', 'reports.title': 'ৰিপোৰ্টস', 'dark_mode': 'ডাৰ্ক মোড', 'email_notifications': 'ইমেইল সূচনাসমূহ', 'language': 'ভাষা', 'connect_channel': 'চেনেল সংযোগ কৰক', 'disconnect': 'বিচ্ছিন্ন কৰক', 'add_channel': 'চেনেল যোগ কৰক', 'download_report': 'ৰিপোৰ্ট ডাউনলোড কৰক', 'sentiment_score': 'ছেন্টিমেণ্ট স্কোৰ', 'comments_analyzed': 'মন্তব্য বিশ্লেষণ', 'views': 'ভিউজ', 'likes': 'লাইকছ', 'shares': 'শ্বেৰছ', },
  sat: { 'app.title': 'ᱟᱠᱥᱤᱟᱱ AI', 'dashboard.title': 'ᱰᱟᱥᱵᱚᱨᱰ', 'settings.title': 'ᱥᱮᱴᱤᱝᱥ', 'profile.title': 'ᱯᱨᱚᱯᱷᱟᱭᱞ', 'comments.title': 'ᱢᱚᱱᱛᱛᱚᱢᱞᱟ', 'reports.title': 'ᱨᱤᱯᱚᱨᱴᱥ', 'dark_mode': 'ᱰᱟᱨᱠ ᱢᱚᱰ', 'email_notifications': 'ᱤᱢᱮᱞ ᱱᱚᱴᱤᱯᱷᱤᱠᱮᱥᱚᱱ', 'language': 'ᱟᱥᱟ', 'connect_channel': 'ᱮᱱᱮᱞ ᱡᱚᱲᱟᱭ', 'disconnect': 'ᱰᱤᱥᱠᱚᱱᱮᱠᱴ', 'add_channel': 'ᱪᱮᱱᱮᱞ ᱡᱚᱲᱟᱭ', 'download_report': 'ᱨᱤᱯᱚᱨᱴ ᱰᱟᱩᱱᱞᱚᱰ ᱠᱚᱨ', 'sentiment_score': 'ᱥᱮᱱᱴᱤᱢᱮᱱᱴ ᱥᱠᱚᱨ', 'comments_analyzed': 'ᱢᱚᱱᱛᱛᱚᱢᱞᱟ ᱵᱤᱥᱞᱮᱥᱚᱬ', 'views': 'ᱤᱣᱥ', 'likes': 'ᱟᱭᱠᱥ', 'shares': 'ᱮᱭᱟᱨᱥ', },
  gom: { 'app.title': 'आक्शियन AI', 'dashboard.title': 'डॅशबोर्ड', 'settings.title': 'सेटिंग्स', 'profile.title': 'प्रोफाइल', 'comments.title': 'टिप्पण्यो', 'reports.title': 'अहवाल', 'dark_mode': 'डार्क मोड', 'email_notifications': 'ईमेल सूचना', 'language': 'भास', 'connect_channel': 'चॅनल जोडात', 'disconnect': 'डिस्कनेक्ट', 'add_channel': 'चॅनल जोडात', 'download_report': 'अहवाल डाउनलोड करात', 'sentiment_score': 'सेंटिमेंट स्कोर', 'comments_analyzed': 'टिप्पण्यांचे विश्लेषण', 'views': 'व्ह्यूज', 'likes': 'लाइक्स', 'shares': 'शेअर्स', },
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
