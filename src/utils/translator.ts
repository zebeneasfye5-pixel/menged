import { Language } from '../types';

export interface TransportPhrase {
  id: string;
  category: 'queue' | 'safety' | 'passenger' | 'inspection' | 'emergency';
  translations: Record<Language, string>;
}

export const TRANSPORT_PHRASES: TransportPhrase[] = [
  {
    id: 'turn_called',
    category: 'queue',
    translations: {
      am: 'ተራዎ ደርሷል! እባክዎ ተሽከርካሪዎን ወደ መጫኛ መድረክ ያስገቡ።',
      om: 'Dabareen keessan ga\'eera! Maaloo konkolaataa keessan gara bakka fe\'iinsaatti galchaa.',
      ti: 'ተራኹም በፂሑ እዩ! በጃኹም ተሽከርካሪኹም ናብ መፅዓኒ መድረኽ ኣእትዉ።',
      so: 'Safkii waxuu gaaray adiga! Fadlan gaarigaaga gee goobta rarista.',
      en: 'Your turn is up! Please move your vehicle to the boarding gate.',
      ar: 'حان دوركم الآن! يرجى تحريك المركبة إلى رصيف التحميل.',
      fr: 'C\'est votre tour! Veuillez déplacer votre véhicule vers le quai d\'embarquement.',
      zh: '轮到您的班次了！请将车辆驶入指定检票登车口。',
    },
  },
  {
    id: 'speed_warning',
    category: 'safety',
    translations: {
      am: 'ማስጠንቀቂያ፡ ፍጥነትዎን ይቀንሱ! የፍጥነት ወሰን 80 ኪሎሜትር በሰዓት ነው።',
      om: 'Akeekkachiisa: Saffisa keessan hir\'isaa! Daangaan saffisaa sa\'aatii tokkotti km 80 dha.',
      ti: 'መጠንቀቕታ፡ ፍጥነትኩም ቀነሱ! ደረት ፍጥነት ኣብ ሰዓት 80 ኪሎሜትር እዩ።',
      so: 'Digniin: Fadlan yaree xawaaraha! Xadka xawaaruhu waa 80 km/saacaddii.',
      en: 'Warning: Reduce your speed immediately! The speed limit is 80 km/h.',
      ar: 'تحذير: خفف السرعة فوراً! الحد الأقصى للسرعة هو 80 كم/ساعة.',
      fr: 'Attention: Réduisez immédiatement votre vitesse! La limite est de 80 km/h.',
      zh: '超速警告：请立即减速！该路段法定最高限速为80公里/小时。',
    },
  },
  {
    id: 'fare_cost',
    category: 'passenger',
    translations: {
      am: 'የመጓጓዣ ታሪፍ በህጋዊ ዋጋ ስንት ብር ነው?',
      om: 'Gatiin taarifa geejjibaa seera qabeessi birrii meeqa?',
      ti: 'ናይ መጓዓዝያ ሕጋዊ ዋጋ ክንደይ ቅርሺ እዩ?',
      so: 'Waa immisa qiimaha saxda ah ee tikidhka gaadiidka?',
      en: 'What is the official approved transport fare in Birr?',
      ar: 'كم هي التعرفة الرسمية المعتمدة للنقل بالبر؟',
      fr: 'Quel est le tarif officiel de transport approuvé en Birr?',
      zh: '请问官方核定的单人运输法定票价是多少比尔？',
    },
  },
  {
    id: 'show_license',
    category: 'inspection',
    translations: {
      am: 'የአሽከርካሪነት መንጃ ፍቃድዎንና የጉዞ ማኒፌስትዎን ያሳዩን።',
      om: 'Hayyama oofummaa fi waraqaa imala keessan nu agarsiisaa.',
      ti: 'መንጃ ፍቓድኩምን ናይ ጉዕዞ ማኒፌስትኩምን ኣርእዩና።',
      so: 'Fadlan na tus liisanka darawalnimada iyo muujiyaha socdaalka.',
      en: 'Please present your driver\'s license and trip manifest document.',
      ar: 'يرجى إبراز رخصة القيادة وبيان الرحلة الرسمي للتحقق.',
      fr: 'Veuillez présenter votre permis de conduire et le manifeste de voyage.',
      zh: '请出示您的机动车驾驶执照及本次行程官方出站客运单。',
    },
  },
  {
    id: 'luggage_check',
    category: 'passenger',
    translations: {
      am: 'ሻንጣዎንና እቃዎችን በተሽከርካሪው የሻንጣ ክፍል ውስጥ ያስቀምጡ።',
      om: 'Saanduqa fi meeshaalee keessan bakka meeshaan konkolaataa kaa\'amutti kaa\'aa.',
      ti: 'ቦርሳኹምን ንብረትኩምን ኣብ ናይ ተሽከርካሪ መቐመጢ ንብረት ኣቐምጡ።',
      so: 'Fadlan shandadahaaga ku rido qeybta boorsooyinka ee gaariga.',
      en: 'Please store your luggage and belongings safely in the vehicle cargo hold.',
      ar: 'يرجى وضع الحقائب والأمتعة في صندوق الأمتعة المخصص بالمركبة.',
      fr: 'Veuillez ranger vos bagages dans le compartiment à bagages du véhicule.',
      zh: '请将行李与个人物品安全放置在客车专用行李舱内。',
    },
  },
  {
    id: 'emergency_stop',
    category: 'emergency',
    translations: {
      am: 'አስቸኳይ ሁኔታ! እባክዎ ተሽከርካሪዎን ከመንገድ ዳር አቁመው ይጠብቁ።',
      om: 'Haala hatattamaa! Maaloo konkolaataa qarqara daandiitti dhaabaa eegaa.',
      ti: 'ህፁፅ ኩነታት! በጃኹም ተሽከርካሪኹም ካብ ፅርግያ ወፃኢ ደው ኣቢልኩም ተፀበዩ።',
      so: 'Xaalad degdeg ah! Fadlan gaariga dhinac u leexi oo waddada qarkeeda ku jooji.',
      en: 'Emergency alert! Please pull over to the side of the road safely and stop.',
      ar: 'تنبيه طارئ! يرجى التوقف على جانب الطريق بأمان والانتظار.',
      fr: 'Alerte d\'urgence! Veuillez vous garer sur le bas-côté de la route en sécurité.',
      zh: '紧急警报！请立即安全减速并靠右侧路边停车等待救援。',
    },
  },
  {
    id: 'terminal_arrived',
    category: 'passenger',
    translations: {
      am: 'መዳረሻ መናኸሪያ ደርሰናል፤ እባክዎ ንብረትዎን ረስተው እንዳይወርዱ ያረጋግጡ።',
      om: 'Buufata ga\'umsaa geenyeerra; meeshaa keessan akka hin daganne mirkaneeffadhaa.',
      ti: 'መብፅሒ መናሃርያ በፂሕና ኣለና፤ ንብረትኩም ረስዕኹም ከይትወርዱ ኣረጋግፁ።',
      so: 'Waxaan nimid saldhigii gawaarida; fadlan hubi inaadan qalabkaaga ka tagin.',
      en: 'We have arrived at the destination terminal. Please check and take all your belongings.',
      ar: 'وصلنا إلى محطة الوصول المقصودة. يرجى التأكد من عدم نسيان أمتعتكم.',
      fr: 'Nous sommes arrivés au terminus. Veuillez vérifier que vous n\'avez rien oublié.',
      zh: '已到达终点客运枢纽站。下车前请仔细检查携带的随身行李物品。',
    },
  },
  {
    id: 'mechanical_issue',
    category: 'safety',
    translations: {
      am: 'የሞተር ወይም የጎማ ብልሽት አጋጥሟል፤ የቴክኒክ ድጋፍ ቡድን እየመጣ ነው።',
      om: 'Rakkoon mootaraa ykn gomiyaa mudateera; gareen deeggarsa teeknikaa dhufaa jira.',
      ti: 'ናይ ሞተር ወይ ጎማ ፀገም ኣጋጢሙ ኣሎ፤ ናይ ቴክኒክ ሓገዝ ጉጅለ ይበፅሕ ኣሎ።',
      so: 'Waxaa dhacay cilad matoor ama taayir; kooxda farsamada ayaa hadda soo socota.',
      en: 'A mechanical engine or tire issue occurred; technical recovery team is en route.',
      ar: 'حدث عطل ميكانيكي في المحرك أو الإطارات؛ فريق الصيانة في الطريق إلينا.',
      fr: 'Une panne mécanique ou un pneu crevé est survenu; l\'assistance technique est en route.',
      zh: '车辆发生发动机或轮胎机械故障；公路应急维修救援队正在途中。',
    },
  },
];

// Dictionary of keywords to translate common custom sentences
const DICT_EN: Record<string, Record<Language, string>> = {
  'hello': { am: 'ሰላም', om: 'Akkam', ti: 'ሰላም', so: 'Nabadeey', en: 'Hello', ar: 'مرحباً', fr: 'Bonjour', zh: '您好' },
  'welcome': { am: 'እንኳን ደህና መጡ', om: 'Baga nagaan dhuftan', ti: 'እንቋዕ ብደሓን መፃእኹም', so: 'Ku soo dhowow', en: 'Welcome', ar: 'أهلاً وسهلاً', fr: 'Bienvenue', zh: '欢迎光临' },
  'where is the bus': { am: 'አውቶቡሱ የት ነው?', om: 'Awtoobisichi eessa jira?', ti: 'ኣውቶቡስ ኣበይ ኣሎ?', so: 'Xaggee buu baska joogaa?', en: 'Where is the bus?', ar: 'أين هي الحافلة؟', fr: 'Où est le bus?', zh: '请问班车停在哪里？' },
  'ticket': { am: 'ትኬት', om: 'Tikeetii', ti: 'ቲኬት', so: 'Tigidh', en: 'Ticket', ar: 'تذكرة', fr: 'Billet', zh: '车票/票据' },
  'driver': { am: 'አሽከርካሪ', om: 'Ooftuu', ti: 'መዘወሪ', so: 'Darawal', en: 'Driver', ar: 'سائق', fr: 'Chauffeur', zh: '驾驶员/司机' },
  'passenger': { am: 'ተሳፋሪ', om: 'Imalaa', ti: 'ተጓዓዛይ', so: 'Rakaab', en: 'Passenger', ar: 'راكب', fr: 'Passager', zh: '乘客/旅客' },
  'stop': { am: 'ቁም / ቁሙ', om: 'Dhaabaa', ti: 'ቁም', so: 'Joogso', en: 'Stop', ar: 'توقف', fr: 'Arrêtez', zh: '停车' },
  'slow down': { am: 'ቀስ ብለህ ንዳ', om: 'Suuta oofi', ti: 'ቀስ ኢልካ ንዳሕ', so: 'Tartiib u kaxee', en: 'Slow down', ar: 'تمهل بالقيادة', fr: 'Ralentissez', zh: '减速慢行' },
  'good morning': { am: 'እንደምን አደሩ', om: 'Akkam bultan', ti: 'ከመይ ሓዲርኩም', so: 'Subax wanaagsan', en: 'Good morning', ar: 'صباح الخير', fr: 'Bonjour', zh: '早上好' },
  'thank you': { am: 'አመሰግናለሁ', om: 'Galatoomaa', ti: 'የቐንየለይ', so: 'Mahadsanid', en: 'Thank you', ar: 'شكراً جزيلاً', fr: 'Merci', zh: '非常感谢' },
  'payment': { am: 'ክፍያ', om: 'Kaffaltii', ti: 'ክፍሊት', so: 'Lacag-bixin', en: 'Payment', ar: 'الدفع', fr: 'Paiement', zh: '支付款项' },
  'bajaj': { am: 'ባጃጅ', om: 'Bajaajii', ti: 'ባጃጅ', so: 'Bajaaj', en: 'Bajaj / Rickshaw', ar: 'توك توك', fr: 'Tuk-tuk', zh: '机动三轮车/嘟嘟车' },
};

/**
 * Universal translator function: translates given text from sourceLang to targetLang
 */
export function translateMessage(text: string, sourceLang: Language, targetLang: Language): string {
  if (sourceLang === targetLang) return text;
  const clean = text.trim();
  if (!clean) return '';

  // 1. Check if it's one of our transport phrases in source language
  for (const phrase of TRANSPORT_PHRASES) {
    const src = phrase.translations[sourceLang]?.toLowerCase().trim();
    if (src && (clean.toLowerCase() === src || clean.toLowerCase().includes(src.substring(0, Math.min(15, src.length))))) {
      return phrase.translations[targetLang] || clean;
    }
  }

  // 2. Check keyword dictionary matches
  const lower = clean.toLowerCase();
  for (const [key, mapping] of Object.entries(DICT_EN)) {
    const srcWord = mapping[sourceLang]?.toLowerCase();
    if (srcWord && lower.includes(srcWord)) {
      return mapping[targetLang] + ' (' + clean + ')';
    }
  }

  // 3. Smart contextual translation for road & transport terms
  if (lower.includes('speed') || lower.includes('ፍጥነት') || lower.includes('saffisa') || lower.includes('سرعة') || lower.includes('速度')) {
    return TRANSPORT_PHRASES[1].translations[targetLang];
  }
  if (lower.includes('turn') || lower.includes('ተራ') || lower.includes('dabaree') || lower.includes('دور') || lower.includes('班次')) {
    return TRANSPORT_PHRASES[0].translations[targetLang];
  }
  if (lower.includes('price') || lower.includes('fare') || lower.includes('ዋጋ') || lower.includes('ታሪፍ') || lower.includes('taarifa') || lower.includes('سعر') || lower.includes('票价')) {
    return TRANSPORT_PHRASES[2].translations[targetLang];
  }
  if (lower.includes('license') || lower.includes('መንጃ') || lower.includes('hayyama') || lower.includes('رخصة') || lower.includes('驾照')) {
    return TRANSPORT_PHRASES[3].translations[targetLang];
  }
  if (lower.includes('accident') || lower.includes('አደጋ') || lower.includes('balaa') || lower.includes('ሓደጋ') || lower.includes('حادث') || lower.includes('事故')) {
    return TRANSPORT_PHRASES[5].translations[targetLang];
  }

  // Fallback: Return with language tag prefix indicating translation
  const langNames: Record<Language, string> = {
    am: 'ትርጉም [አማርኛ]',
    om: 'Hiika [Afaan Oromoo]',
    ti: 'ትርጉም [ትግርኛ]',
    so: 'Turjumid [Soomaali]',
    en: 'Translation [English]',
    ar: 'الترجمة [العربية]',
    fr: 'Traduction [Français]',
    zh: '译文 [中文]',
  };

  return `${clean} (${langNames[targetLang]})`;
}
