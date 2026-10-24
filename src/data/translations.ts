import { Language } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  dashboard: string;
  vehicles: string;
  drivers: string;
  owners: string;
  queueTurns: string;
  liveTracking: string;
  routesTariffs: string;
  safetyCitizenTips: string;
  voiceTranslator: string;
  paymentsSettlements: string;
  reportsExport: string;

  // Common actions
  search: string;
  filter: string;
  addNew: string;
  exportExcel: string;
  downloadPdf: string;
  printManifest: string;
  status: string;
  actions: string;
  details: string;
  save: string;
  cancel: string;
  refresh: string;
  emergencyAlert: string;
  all: string;
  active: string;
  suspended: string;
  plateNumber: string;
  installApp: string;
  resetData: string;

  // Dashboard Stats
  totalVehicles: string;
  activeOnRoute: string;
  todayPassengers: string;
  safetyAlerts: string;
  dispatchedQueues: string;
  terminalEfficiency: string;
  activeFleets: string;
  speedViolations: string;

  // Queue
  turnNumber: string;
  callTurn: string;
  issueTicket: string;
  departureStation: string;
  destinationStation: string;
  waitingVehicles: string;
  boardingNow: string;
  dispatched: string;
  estimatedDeparture: string;

  // Live GPS
  speed: string;
  speedLimit: string;
  telemetry: string;
  fuel: string;
  heading: string;
  corridor: string;
  simulation: string;
  playSimulation: string;
  pauseSimulation: string;
  fastForward: string;

  // Safety & Tips
  reportIncident: string;
  incidentType: string;
  tipDescription: string;
  attachPhoto: string;
  recordAudioTip: string;
  submitTip: string;
  overspeed: string;
  overloading: string;
  recklessDriving: string;
  tariffExtortion: string;
  accident: string;

  // Voice Intercom
  voiceIntercomTitle: string;
  voiceIntercomDesc: string;
  speaker1: string;
  speaker2: string;
  pressToSpeak: string;
  listening: string;
  autoSpeakTranslation: string;
  instantTranslate: string;
  samplePhrases: string;

  // Payments & Settlements
  passengerFares: string;
  terminalExitFee: string;
  ownerSettlements: string;
  collectFare: string;
  payExitFee: string;
  handoverPayout: string;
}

export const translations: Record<Language, Translations> = {
  am: {
    appName: 'የመንገድ እና ትራንስፖርት ባለስልጣን',
    appSubtitle: 'ብሔራዊ የተሽከርካሪ፣ የአሽከርካሪ፣ የጉዞ ክትትልና የክፍያ ርክክብ የትእዛዝ ማዕከል',
    dashboard: 'ዳሽቦርድ',
    vehicles: 'ተሽከርካሪዎች',
    drivers: 'አሽከርካሪዎች',
    owners: 'የተሽከርካሪ ባለቤቶች',
    queueTurns: 'የተሽከርካሪ ተራ',
    liveTracking: 'የቀጥታ ጂፒኤስ ክትትል',
    routesTariffs: 'መነሻ፣ መዳረሻና ታሪፍ',
    safetyCitizenTips: 'ትራፊክ ደህንነትና ጥቆማ',
    voiceTranslator: 'የቀጥታ ድምፅ ተርጓሚ',
    paymentsSettlements: 'ክፍያና የሂሳብ ርክክብ',
    reportsExport: 'ሪፖርቶችና ኤክሴል',

    search: 'ፈልግ...',
    filter: 'አጣራ',
    addNew: 'አዲስ መዝግብ',
    exportExcel: 'ወደ ኤክሴል አውርድ (CSV)',
    downloadPdf: 'ማኒፌስት አትም',
    printManifest: 'የጉዞ ማኒፌስት አትም',
    status: 'ሁኔታ',
    actions: 'ድርጊቶች',
    details: 'ዝርዝር',
    save: 'መዝግብ / አስቀምጥ',
    cancel: 'ሰርዝ',
    refresh: 'አድስ',
    emergencyAlert: 'አስቸኳይ ማስጠንቀቂያ!',
    all: 'ሁሉም',
    active: 'ንቁ / ስራ ላይ',
    suspended: 'የታገደ',
    plateNumber: 'የሰሌዳ ቁጥር',
    installApp: 'አፑን ስልክ ላይ ጫን (Install App)',
    resetData: 'መረጃ አድስ / Reset',

    totalVehicles: 'ጠቅላላ ተሽከርካሪዎች',
    activeOnRoute: 'በጉዞ ላይ ያሉ',
    todayPassengers: 'የዛሬ መንገደኞች',
    safetyAlerts: 'የትራፊክ ደህንነት ማንቂያዎች',
    dispatchedQueues: 'የተሸኙ ተራዎች',
    terminalEfficiency: 'የጣቢያ አፈፃፀም',
    activeFleets: 'የማህበራት ብዛት',
    speedViolations: 'የፍጥነት ወሰን ጥሰቶች',

    turnNumber: 'የተራ ቁጥር',
    callTurn: 'ተራ ጥራ (ድምፅ አሰማ)',
    issueTicket: 'የተራ ትኬት ቁረጥ',
    departureStation: 'መነሻ መናኸሪያ',
    destinationStation: 'መዳረሻ መናኸሪያ',
    waitingVehicles: 'በተራ የሚጠብቁ',
    boardingNow: 'በመጫን ላይ ያሉ',
    dispatched: 'የተሸኙ',
    estimatedDeparture: 'የመነሻ ሰዓት',

    speed: 'ፍጥነት (ኪ.ሜ/ሰ)',
    speedLimit: 'የፍጥነት ወሰን',
    telemetry: 'የቀጥታ ቴሌሜትሪ',
    fuel: 'ነዳጅ',
    heading: 'አቅጣጫ',
    corridor: 'ኮሪደር / መስመር',
    simulation: 'የጉዞ ማስመሰያ (Simulation)',
    playSimulation: 'አስጀምር',
    pauseSimulation: 'አቁም',
    fastForward: 'አፍጥን',

    reportIncident: 'አዲስ የጥቆማ ቅሬታ አስገባ',
    incidentType: 'የጥሰት ዓይነት',
    tipDescription: 'ዝርዝር መግለጫ',
    attachPhoto: 'ምስል/ቪዲዮ አያይዝ',
    recordAudioTip: 'የድምፅ ጥቆማ ቅረጽ',
    submitTip: 'ጥቆማውን ላክ',
    overspeed: 'ከፍጥነት ወሰን በላይ መንዳት',
    overloading: 'ከመጠን በላይ መጫን',
    recklessDriving: 'አደገኛ ማሽከርከር',
    tariffExtortion: 'ያለአግባብ ታሪፍ መጨመር',
    accident: 'የትራፊክ አደጋ',

    voiceIntercomTitle: 'ሁለገብ የድምፅና የጽሁፍ የቀጥታ ቋንቋ ተርጓሚ',
    voiceIntercomDesc: 'አንዱ በፈለገው ቋንቋ ሲናገር ሌላኛው በራሱ ቋንቋ አውቶማቲካሊ የሚሰማበት ዘመናዊ መገናኛ',
    speaker1: 'ተናጋሪ 1 (አሽከርካሪ / ተቆጣጣሪ)',
    speaker2: 'ተናጋሪ 2 (መንገደኛ / ኦፕሬተር)',
    pressToSpeak: 'ተጭነው ይናገሩ',
    listening: 'እያዳመጠ ነው...',
    autoSpeakTranslation: 'ትርጉሙን በድምፅ በራስ-ሰር አሰማ',
    instantTranslate: 'ተርጉም',
    samplePhrases: 'ፈጣን የትራንስፖርት ንግግሮች',

    passengerFares: 'የተሳፋሪ ታሪፍ ክፍያ',
    terminalExitFee: 'የተሽከርካሪ መውጫ ክፍያ',
    ownerSettlements: 'የባለተሽከርካሪ ሂሳብ ርክክብ',
    collectFare: 'ክፍያ ተቀበልና ትኬት ቁረጥ',
    payExitFee: 'የመውጫ ክፍያ ክፈል (Exit Gate Fee)',
    handoverPayout: 'ሂሳብ አስረክብና ክፈል (Settlement)',
  },

  om: {
    appName: 'Abbaa Taayitaa Daandii fi Geejjibaa',
    appSubtitle: 'Wiirtuu Ajajaa fi Hordoffii Konkolaattotaa, Kaffaltii fi Raawwii Imalaa',
    dashboard: 'Daashboordii',
    vehicles: 'Konkolaattota',
    drivers: 'Ooftota',
    owners: 'Abbootii Konkolaataa',
    queueTurns: 'Dabareewwan Konkolaataa',
    liveTracking: 'Hordoffii GPS Kallattii',
    routesTariffs: 'Ka\'umsa, Ga\'umsa fi Taarifa',
    safetyCitizenTips: 'Nageenya Tiraafikaa fi Koomii',
    voiceTranslator: 'Hiika Sagalee Kallattii',
    paymentsSettlements: 'Kaffaltii fi Walharkaa Fuudhinsa',
    reportsExport: 'Gabaasaa fi Ekseel',

    search: 'Barbaadi...',
    filter: 'Filtarii',
    addNew: 'Haaraa Galmeessi',
    exportExcel: 'Gara Excel buusi (CSV)',
    downloadPdf: 'Maanifeestii Maxxansi',
    printManifest: 'Waraqaa Imalaa Maxxansi',
    status: 'Haala',
    actions: 'Tarkaanfiiwwan',
    details: 'Bal\'ina',
    save: 'Galmeessi / Olkaawi',
    cancel: 'Haqi',
    refresh: 'Haaromsi',
    emergencyAlert: 'Akeekkachiisa Yeroo Hatattamaa!',
    all: 'Hundumaa',
    active: 'Hojiirra kan jiru',
    suspended: 'Kan uggurame',
    plateNumber: 'Lakkoofsa Gabatee',
    installApp: 'Appilikeeshinii Fe\'adhu (Install)',
    resetData: 'Odeeffannoo Haaromsi',

    totalVehicles: 'Ida\'ama Konkolaattotaa',
    activeOnRoute: 'Imala Irra Kan Jiran',
    todayPassengers: 'Imaltoota Har\'aa',
    safetyAlerts: 'Akeekkachiisa Nageenyaa',
    dispatchedQueues: 'Dabaree Gaggeeysaman',
    terminalEfficiency: 'Raawwii Buufataa',
    activeFleets: 'Baay\'ina Waldaalee',
    speedViolations: 'Daangaa Saffisaa Darbuu',

    turnNumber: 'Lakkoofsa Dabaree',
    callTurn: 'Dabaree Waami (Sagalee)',
    issueTicket: 'Tikeetii Dabaree Kuti',
    departureStation: 'Buufata Ka\'umsaa',
    destinationStation: 'Buufata Ga\'umsaa',
    waitingVehicles: 'Dabaree Kan Eeggatan',
    boardingNow: 'Fe\'amaa Kan Jiran',
    dispatched: 'Kan Gaggeeysaman',
    estimatedDeparture: 'Yeroo Ka\'umsaa Tilmaamaa',

    speed: 'Saffisa (km/h)',
    speedLimit: 'Daangaa Saffisaa',
    telemetry: 'Teelemeetirii Kallattii',
    fuel: 'Boba\'aa',
    heading: 'Kallattii',
    corridor: 'Koriidarii / Daandii',
    simulation: 'Simuleeshinii Imalaa',
    playSimulation: 'Jalqabi',
    pauseSimulation: 'Dhaabi',
    fastForward: 'Daddafsi',

    reportIncident: 'Koomii Yookiin Qeeqa Ergi',
    incidentType: 'Gosa Badii',
    tipDescription: 'Ibsa Guutuu',
    attachPhoto: 'Suuraa/Viidiyoo Maxxansi',
    recordAudioTip: 'Sagalee Koomii Waraabi',
    submitTip: 'Koomii Ergi',
    overspeed: 'Saffisa Ol\'aanaa',
    overloading: 'Ba\'aa Ol\'aanaa Fe\'uu',
    recklessDriving: 'Of-eeggannoo Malee Oofuu',
    tariffExtortion: 'Taarifa Seeraan Alaa',
    accident: 'Balaa Tiraafikaa',

    voiceIntercomTitle: 'Sirna Hiika Sagalee fi Barreeffama Kallattii',
    voiceIntercomDesc: 'Namni tokko afaan fedheen yoo dubbate kan biraa afaan isaatiin akka dhaga\'uuf kan qophaa\'e',
    speaker1: 'Dubbataa 1 (Ooftuu / To\'ataa)',
    speaker2: 'Dubbataa 2 (Imalaa / Opreitara)',
    pressToSpeak: 'Dhiibii Dubbadhu',
    listening: 'Dhaggeeffachaa jira...',
    autoSpeakTranslation: 'Hiika Sagaleen Ofiin Dhageessisi',
    instantTranslate: 'Hiiki',
    samplePhrases: 'Dubbiiwwan Ariifachiisoo Geejjibaa',

    passengerFares: 'Kaffaltii Taarifa Imaltootaa',
    terminalExitFee: 'Kaffaltii Buufata Bahumsaa',
    ownerSettlements: 'Herreega Abbaa Konkolaataa',
    collectFare: 'Kaffaltii Fudhadhu',
    payExitFee: 'Kaffaltii Bahumsaa Kaffali',
    handoverPayout: 'Qarshii Abbaaf Kenni',
  },

  ti: {
    appName: 'በዓል መዚ መገዲን ትራንስፖርትን',
    appSubtitle: 'ማእከል ቁፅፅር ተሽከርከርቲ፣ መዘወርቲ፣ ክፍሊት ን ርክክብን',
    dashboard: 'ዳሽቦርድ',
    vehicles: 'ተሽከርከርቲ',
    drivers: 'መዘወርቲ',
    owners: 'ዋናታት ተሽከርከርቲ',
    queueTurns: 'ተራ ተሽከርከርቲ',
    liveTracking: 'ቀጥታዊ ናይ ጂፒኤስ ክትትል',
    routesTariffs: 'መበገሲ፣ መብፅሒን ታሪፍን',
    safetyCitizenTips: 'ድሕንነት ትራፊክን ሓበሬታን',
    voiceTranslator: 'ቀጥታዊ ተርጓሚ ድምፂ',
    paymentsSettlements: 'ክፍሊትን ርክክብ ሒሳብን',
    reportsExport: 'ፀብፃባት ን ኤክሴልን',

    search: 'ድለ...',
    filter: 'ኣፃሪ',
    addNew: 'ሓዱሽ መዝግብ',
    exportExcel: 'ናብ ኤክሴል ኣውርድ (CSV)',
    downloadPdf: 'ማኒፌስት ሕተም',
    printManifest: 'ወረቐት ጉዕዞ ሕተም',
    status: 'ኩነታት',
    actions: 'ተግባራት',
    details: 'ዝርዝር',
    save: 'መዝግብ / ኣቐምጥ',
    cancel: 'ሰርዝ',
    refresh: 'ሓድሽ',
    emergencyAlert: 'ህፁፅ መጠንቀቕታ!',
    all: 'ኩሎም',
    active: 'ንጡፍ / ስራሕ ዘሎ',
    suspended: 'ዝተኣገደ',
    plateNumber: 'ቑፅሪ ሰሌዳ',
    installApp: 'ኣብ ሞባይል ፅዓን (Install)',
    resetData: 'ሓበሬታ ሓድሽ',

    totalVehicles: 'ጠቕላላ ተሽከርከርቲ',
    activeOnRoute: 'ኣብ ጉዕዞ ዘለዉ',
    todayPassengers: 'ናይ ሎሚ ተጓዓዝቲ',
    safetyAlerts: 'መጠንቀቕታ ድሕንነት',
    dispatchedQueues: 'ዝተፋነዉ ተራታት',
    terminalEfficiency: 'ብቕዓት መናሃርያ',
    activeFleets: 'በዝሒ ማሕበራት',
    speedViolations: 'ጥሕሰት ፍጥነት',

    turnNumber: 'ቑፅሪ ተራ',
    callTurn: 'ተራ ፀውዕ (ድምፂ)',
    issueTicket: 'ቲኬት ተራ ቁረፅ',
    departureStation: 'መበገሲ መናሃርያ',
    destinationStation: 'መብፅሒ መናሃርያ',
    waitingVehicles: 'ብተራ ዝፅበዩ',
    boardingNow: 'ይፅዕኑ ዘለዉ',
    dispatched: 'ዝተፋነዉ',
    estimatedDeparture: 'ሰዓት መበገሲ',

    speed: 'ፍጥነት (ኪ.ሜ/ሰ)',
    speedLimit: 'ደረት ፍጥነት',
    telemetry: 'ቀጥታዊ ቴሌሜትሪ',
    fuel: 'ነዳዲ',
    heading: 'ኣንፈት',
    corridor: 'ኮሪደር / መስመር',
    simulation: 'ምምሳል ጉዕዞ',
    playSimulation: 'ጀምር',
    pauseSimulation: 'ጠጥው',
    fastForward: 'ኣቀላጥፍ',

    reportIncident: 'ሓዱሽ ጥርዓን/ሓበሬታ ኣእቱ',
    incidentType: 'ዓይነት ጥሕሰት',
    tipDescription: 'ዝርዝር መብርሂ',
    attachPhoto: 'ስእሊ/ቪድዮ ኣተሓሕዝ',
    recordAudioTip: 'ናይ ድምፂ ሓበሬታ ቅዳሕ',
    submitTip: 'ሓበሬታ ለኣኽ',
    overspeed: 'ካብ ደረት ንላዕሊ ምዝዋር',
    overloading: 'ካብ ዓቐን ንላዕሊ ምፅዓን',
    recklessDriving: 'ሓደገኛ ምዝዋር',
    tariffExtortion: 'ዘይሕጋዊ ወሰኽ ታሪፍ',
    accident: 'ሓደጋ ትራፊክ',

    voiceIntercomTitle: 'ቀጥታዊ ናይ ድምፂን ፅሑፍን ተርጓሚ ቋንቋታት',
    voiceIntercomDesc: 'ሓደ ሰብ ብዝደለዮ ቋንቋ እንትዛረብ እቲ ካልእ ብቋንቁኡ ብድምፂ ዝሰምዐሉ ዘመናዊ መራኸቢ',
    speaker1: 'ተዛራባይ 1 (መዘዋሪ / ተቖፃፃሪ)',
    speaker2: 'ተዛራባይ 2 (ተጓዓዛይ / ኦፕሬተር)',
    pressToSpeak: 'ፀቒጥካ ተዛረብ',
    listening: 'ይሰምዕ ኣሎ...',
    autoSpeakTranslation: 'ትርጉም ብድምፂ ኣስምዕ',
    instantTranslate: 'ተርጉም',
    samplePhrases: 'ናይ ትራንስፖርት ቅልጡፍ ቃላት',

    passengerFares: 'ክፍሊት ታሪፍ ተጓዓዝቲ',
    terminalExitFee: 'ናይ መውፅኢ ክፍሊት',
    ownerSettlements: 'ርክክብ ሒሳብ ዋና ተሽከርካሪ',
    collectFare: 'ክፍሊት ተቐበል',
    payExitFee: 'ናይ መውፅኢ ክፈል',
    handoverPayout: 'ሒሳብ ኣረክብ',
  },

  so: {
    appName: 'Hay\'adda Wadooyinka iyo Gaadiidka',
    appSubtitle: 'Xarunta Taliska Gaadiidka, Lacag-bixinta iyo Kormeerka Socdaalka',
    dashboard: 'Dashboodh',
    vehicles: 'Gaadiidka',
    drivers: 'Wadayaasha',
    owners: 'Milkiilayaasha Gaadiidka',
    queueTurns: 'Safafka Gaadiidka',
    liveTracking: 'Raadraaca GPS Tooska ah',
    routesTariffs: 'Bilowga, Dhamaadka iyo Lacagta',
    safetyCitizenTips: 'Badbaadada Taraafikada & Cabashada',
    voiceTranslator: 'Turjumaanka Codka Tooska ah',
    paymentsSettlements: 'Lacag-bixinta & Xisaab-xirka',
    reportsExport: 'Warbixinnada & Excel',

    search: 'Raadi...',
    filter: 'Kala saar',
    addNew: 'Ku dar Cusub',
    exportExcel: 'U soo deji Excel (CSV)',
    downloadPdf: 'Daabac Muujiyaha',
    printManifest: 'Daabac Warqadda Socdaalka',
    status: 'Xaaladda',
    actions: 'Tallaabooyinka',
    details: 'Faahfaahin',
    save: 'Keydi',
    cancel: 'Jooji',
    refresh: 'Cusbooneysii',
    emergencyAlert: 'Digniin Degdeg ah!',
    all: 'Dhammaan',
    active: 'Shaqeynaya',
    suspended: 'La hakiyay',
    plateNumber: 'Lambarka Taargada',
    installApp: 'Ku shubo Taleefanka (Install)',
    resetData: 'Dib u cusbooneysii',

    totalVehicles: 'Wadarta Gaadiidka',
    activeOnRoute: 'Socdaal ku jira',
    todayPassengers: 'Rakaabka Maanta',
    safetyAlerts: 'Digniinaha Badbaadada',
    dispatchedQueues: 'Safafka Baxay',
    terminalEfficiency: 'Waxqabadka Saldhigga',
    activeFleets: 'Ururada Gaadiidka',
    speedViolations: 'Jebinta Xawaaraha',

    turnNumber: 'Lambarka Safka',
    callTurn: 'U yeer Safka (Cod)',
    issueTicket: 'Jar Tigidhka Safka',
    departureStation: 'Saldhigga Ka bixitaanka',
    destinationStation: 'Saldhigga Gaarista',
    waitingVehicles: 'Safka Sugaya',
    boardingNow: 'Hadda Qaadaya',
    dispatched: 'Baxay',
    estimatedDeparture: 'Waqtiga Baxitaanka Qiyaasta',

    speed: 'Xawaaraha (km/h)',
    speedLimit: 'Xadka Xawaaraha',
    telemetry: 'Xogta Tooska ah',
    fuel: 'Shidaalka',
    heading: 'Jihada',
    corridor: 'Wadada / Khadka',
    simulation: 'Matalaada Socdaalka',
    playSimulation: 'Bilow',
    pauseSimulation: 'Jooji',
    fastForward: 'Dheeree',

    reportIncident: 'Gudbi Cabasho / Warbixin',
    incidentType: 'Nooca Xadgudubka',
    tipDescription: 'Faahfaahin Buuxda',
    attachPhoto: 'Lifaaq Sawir/Fiidiyow',
    recordAudioTip: 'Duub Codka Cabashada',
    submitTip: 'Dir Warbixinta',
    overspeed: 'Xawaare Sare',
    overloading: 'Xamuul Xad-dhaaf ah',
    recklessDriving: 'Wadista Khatarta ah',
    tariffExtortion: 'Lacag-kordhin Sharci darro ah',
    accident: 'Shilalka Taraafikada',

    voiceIntercomTitle: 'Turjumaanka Codka & Qoraalka Tooska ah',
    voiceIntercomDesc: 'Qofku luqadda uu rabo hadduu ku hadlo kan kale cod ahaan ugu maqlayo luqaddiisa',
    speaker1: 'Qofka 1 (Darawal / Kormeere)',
    speaker2: 'Qofka 2 (Rakaab / Qofka Shaqada)',
    pressToSpeak: 'Riix si aad u hadasho',
    listening: 'Waa la dhageysanayaa...',
    autoSpeakTranslation: 'Toos ugu hadal turjumaada',
    instantTranslate: 'Turjun',
    samplePhrases: 'Erayada Degdegga ah ee Gaadiidka',

    passengerFares: 'Lacagta Rakaabka',
    terminalExitFee: 'Lacagta Bixitaanka Saldhigga',
    ownerSettlements: 'Xisaab-wareejinta Milkiilaha',
    collectFare: 'Qabo Lacagta',
    payExitFee: 'Bixi Lacagta Bixitaanka',
    handoverPayout: 'U dhiib Xisaabta Milkiilaha',
  },

  en: {
    appName: 'Road & Transport Authority',
    appSubtitle: 'National Fleet, Live GPS Telemetry, Fare Collection & Owner Payout Command Center',
    dashboard: 'Dashboard',
    vehicles: 'Vehicles',
    drivers: 'Drivers',
    owners: 'Vehicle Owners',
    queueTurns: 'Queue & Turns',
    liveTracking: 'Live GPS Tracking',
    routesTariffs: 'Routes & Tariffs',
    safetyCitizenTips: 'Traffic Safety & Tips',
    voiceTranslator: 'Live Voice Intercom',
    paymentsSettlements: 'Payments & Settlements',
    reportsExport: 'Reports & Excel',

    search: 'Search anything...',
    filter: 'Filter',
    addNew: 'Register New',
    exportExcel: 'Export to Excel (CSV)',
    downloadPdf: 'Print Manifest',
    printManifest: 'Print Trip Manifest',
    status: 'Status',
    actions: 'Actions',
    details: 'Details',
    save: 'Save Record',
    cancel: 'Cancel',
    refresh: 'Refresh',
    emergencyAlert: 'EMERGENCY ALERT!',
    all: 'All',
    active: 'Active / En Route',
    suspended: 'Suspended',
    plateNumber: 'Plate Number',
    installApp: 'Install on Phone (PWA)',
    resetData: 'Reset Data',

    totalVehicles: 'Total Registered Vehicles',
    activeOnRoute: 'Active on Road',
    todayPassengers: 'Today Passengers',
    safetyAlerts: 'Active Safety Alerts',
    dispatchedQueues: 'Dispatched Turns',
    terminalEfficiency: 'Terminal Efficiency',
    activeFleets: 'Transport Associations',
    speedViolations: 'Speed Limit Violations',

    turnNumber: 'Turn #',
    callTurn: 'Call Turn (Chime & Announce)',
    issueTicket: 'Issue Turn Ticket',
    departureStation: 'Departure Terminal',
    destinationStation: 'Destination Terminal',
    waitingVehicles: 'Waiting in Queue',
    boardingNow: 'Boarding Passengers',
    dispatched: 'Dispatched & Left',
    estimatedDeparture: 'Est. Departure Time',

    speed: 'Speed (km/h)',
    speedLimit: 'Speed Limit',
    telemetry: 'Live Telemetry',
    fuel: 'Fuel Level',
    heading: 'Heading',
    corridor: 'Expressway / Corridor',
    simulation: 'Trip Simulation',
    playSimulation: 'Start',
    pauseSimulation: 'Pause',
    fastForward: 'Accelerate 2x',

    reportIncident: 'Submit Citizen Tip-Off',
    incidentType: 'Incident Type',
    tipDescription: 'Detailed Description',
    attachPhoto: 'Attach Photo/Video',
    recordAudioTip: 'Record Voice Memo',
    submitTip: 'Submit Report',
    overspeed: 'Speed Violation (>80km/h)',
    overloading: 'Passenger Overloading',
    recklessDriving: 'Reckless / Dangerous Driving',
    tariffExtortion: 'Illegal Tariff Extortion',
    accident: 'Traffic Collision / Hazard',

    voiceIntercomTitle: 'Universal Cross-Language Live Voice & Text Communicator',
    voiceIntercomDesc: 'Speak in any language, and the other person automatically hears the translation spoken in their native language',
    speaker1: 'Speaker 1 (Driver / Inspector)',
    speaker2: 'Speaker 2 (Passenger / Dispatcher)',
    pressToSpeak: 'Hold to Speak',
    listening: 'Listening to speech...',
    autoSpeakTranslation: 'Auto-play translation aloud',
    instantTranslate: 'Translate',
    samplePhrases: 'Quick Transport Phrases',

    passengerFares: 'Passenger Digital Fare Collection',
    terminalExitFee: 'Terminal Gate Exit Clearance Fee',
    ownerSettlements: 'Vehicle Owner Financial Payouts',
    collectFare: 'Collect Fare & Issue E-Ticket',
    payExitFee: 'Clear Gate Exit Fee',
    handoverPayout: 'Disburse Settlement Payout',
  },

  ar: {
    appName: 'هيئة النقل والطرق الوطنية',
    appSubtitle: 'مركز القيادة الموحد لرصد المركبات والرحلات وتحصيل الإيرادات وتسوية المستحقات',
    dashboard: 'لوحة القيادة',
    vehicles: 'المركبات',
    drivers: 'السائقون',
    owners: 'مالكو المركبات',
    queueTurns: 'أدوار وانطلاق الحافلات',
    liveTracking: 'التتبع المباشر GPS',
    routesTariffs: 'المسارات والتعريفات',
    safetyCitizenTips: 'السلامة المرورية والبلاغات',
    voiceTranslator: 'مترجم الصوت المباشر',
    paymentsSettlements: 'المدفوعات والمستحقات',
    reportsExport: 'التقارير وملفات إكسل',

    search: 'بحث...',
    filter: 'تصفية',
    addNew: 'تسجيل جديد',
    exportExcel: 'تصدير إلى إكسل (CSV)',
    downloadPdf: 'طباعة القائمة',
    printManifest: 'طباعة بيان الرحلة',
    status: 'الحالة',
    actions: 'الإجراءات',
    details: 'التفاصيل',
    save: 'حفظ',
    cancel: 'إلغاء',
    refresh: 'تحديث',
    emergencyAlert: 'تنبيه طارئ!',
    all: 'الكل',
    active: 'نشط / في الطريق',
    suspended: 'موقوف',
    plateNumber: 'رقم اللوحة',
    installApp: 'تثبيت التطبيق على الهاتف',
    resetData: 'إعادة ضبط البيانات',

    totalVehicles: 'إجمالي المركبات',
    activeOnRoute: 'في طريق السفر',
    todayPassengers: 'ركاب اليوم',
    safetyAlerts: 'تنبيهات السلامة',
    dispatchedQueues: 'الرحلات المنطلقة',
    terminalEfficiency: 'كفاءة المحطة',
    activeFleets: 'جمعيات النقل',
    speedViolations: 'مخالفات السرعة',

    turnNumber: 'رقم الدور',
    callTurn: 'نداء الدور (جرس وصوت)',
    issueTicket: 'إصدار تذكرة الدور',
    departureStation: 'محطة المغادرة',
    destinationStation: 'محطة الوصول',
    waitingVehicles: 'في الانتظار',
    boardingNow: 'تحميل الركاب',
    dispatched: 'انطلقت',
    estimatedDeparture: 'وقت المغادرة التقديري',

    speed: 'السرعة (كم/س)',
    speedLimit: 'السرعة القصوى',
    telemetry: 'بيانات القياس عن بُعد',
    fuel: 'الوقود',
    heading: 'الاتجاه',
    corridor: 'المسار السريع',
    simulation: 'محاكاة الرحلة',
    playSimulation: 'تشغيل',
    pauseSimulation: 'إيقاف',
    fastForward: 'تسريع',

    reportIncident: 'تقديم بلاغ مواطن',
    incidentType: 'نوع المخالفة',
    tipDescription: 'وصف تفصيلي',
    attachPhoto: 'إرفاق صورة/فيديو',
    recordAudioTip: 'تسجيل ملاحظة صوتية',
    submitTip: 'إرسال البلاغ',
    overspeed: 'تجاوز السرعة القانونية',
    overloading: 'حمولة زائدة',
    recklessDriving: 'قيادة متهورة',
    tariffExtortion: 'رفع التعرفة غير القانوني',
    accident: 'حادث مروري',

    voiceIntercomTitle: 'نظام الترجمة الصوتية الفورية متعدد اللغات',
    voiceIntercomDesc: 'تحدث بأي لغة وسيسمع الطرف الآخر الترجمة منطوقة آلياً بلغته الأم',
    speaker1: 'المتحدث 1 (السائق / المراقب)',
    speaker2: 'المتحدث 2 (الراكب / مأمور الحركة)',
    pressToSpeak: 'اضغط للتحدث',
    listening: 'جاري الاستماع...',
    autoSpeakTranslation: 'نطق الترجمة آلياً',
    instantTranslate: 'ترجمة',
    samplePhrases: 'عبارات النقل السريعة',

    passengerFares: 'تحصيل أجور الركاب',
    terminalExitFee: 'رسوم خروج بوابة المحطة',
    ownerSettlements: 'تسوية وصرف مستحقات المالك',
    collectFare: 'تحصيل الأجرة وإصدار التذكرة',
    payExitFee: 'سداد رسوم الخروج',
    handoverPayout: 'تسليم وصرف الإيراد للمالك',
  },

  fr: {
    appName: 'Autorité des Routes et des Transports',
    appSubtitle: 'Centre National de Commandement Flottes, GPS, Paiements & Règlements',
    dashboard: 'Tableau de bord',
    vehicles: 'Véhicules',
    drivers: 'Chauffeurs',
    owners: 'Propriétaires',
    queueTurns: 'Files d\'attente & Tours',
    liveTracking: 'Suivi GPS en Direct',
    routesTariffs: 'Itinéraires et Tarifs',
    safetyCitizenTips: 'Sécurité et Signalements',
    voiceTranslator: 'Interphone Vocal Traduit',
    paymentsSettlements: 'Paiements & Règlements',
    reportsExport: 'Rapports & Excel',

    search: 'Rechercher...',
    filter: 'Filtrer',
    addNew: 'Enregistrer nouveau',
    exportExcel: 'Exporter vers Excel (CSV)',
    downloadPdf: 'Imprimer Manifeste',
    printManifest: 'Imprimer Feuille de Route',
    status: 'Statut',
    actions: 'Actions',
    details: 'Détails',
    save: 'Enregistrer',
    cancel: 'Annuler',
    refresh: 'Actualiser',
    emergencyAlert: 'ALERTE D\'URGENCE!',
    all: 'Tous',
    active: 'En service',
    suspended: 'Suspendu',
    plateNumber: 'N° d\'immatriculation',
    installApp: 'Installer sur Téléphone (PWA)',
    resetData: 'Réinitialiser Données',

    totalVehicles: 'Total Véhicules',
    activeOnRoute: 'Sur la route',
    todayPassengers: 'Passagers du jour',
    safetyAlerts: 'Alertes de sécurité',
    dispatchedQueues: 'Départs effectués',
    terminalEfficiency: 'Efficacité Gare',
    activeFleets: 'Associations de flotte',
    speedViolations: 'Excès de vitesse',

    turnNumber: 'N° de Tour',
    callTurn: 'Appeler le Tour (Sonnerie)',
    issueTicket: 'Émettre Ticket de Tour',
    departureStation: 'Gare de départ',
    destinationStation: 'Gare d\'arrivée',
    waitingVehicles: 'En attente',
    boardingNow: 'Embarquement',
    dispatched: 'Parti',
    estimatedDeparture: 'Départ estimé',

    speed: 'Vitesse (km/h)',
    speedLimit: 'Limite de vitesse',
    telemetry: 'Télémétrie en direct',
    fuel: 'Carburant',
    heading: 'Cap',
    corridor: 'Corridor routier',
    simulation: 'Simulation de trajet',
    playSimulation: 'Lancer',
    pauseSimulation: 'Pause',
    fastForward: 'Accélérer',

    reportIncident: 'Soumettre un signalement',
    incidentType: 'Type d\'infraction',
    tipDescription: 'Description détaillée',
    attachPhoto: 'Joindre photo/vidéo',
    recordAudioTip: 'Enregistrer mémo vocal',
    submitTip: 'Envoyer signalement',
    overspeed: 'Excès de vitesse',
    overloading: 'Surcharge passagers',
    recklessDriving: 'Conduite dangereuse',
    tariffExtortion: 'Majoration tarifaire illégale',
    accident: 'Accident de la route',

    voiceIntercomTitle: 'Interphone Vocal et Traducteur Universel en Direct',
    voiceIntercomDesc: 'Parlez dans votre langue, votre interlocuteur entend automatiquement la traduction dans la sienne',
    speaker1: 'Locuteur 1 (Chauffeur / Contrôleur)',
    speaker2: 'Locuteur 2 (Passager / Régulateur)',
    pressToSpeak: 'Maintenir pour parler',
    listening: 'Écoute en cours...',
    autoSpeakTranslation: 'Lecture vocale automatique',
    instantTranslate: 'Traduire',
    samplePhrases: 'Phrases rapides de transport',

    passengerFares: 'Tarifs et Billets Passagers',
    terminalExitFee: 'Frais de Sortie de Gare',
    ownerSettlements: 'Règlement et Versement Propriétaire',
    collectFare: 'Encaisser Billet',
    payExitFee: 'Payer Frais de Sortie',
    handoverPayout: 'Verser Recettes au Propriétaire',
  },

  zh: {
    appName: '国家公路与运输管理局指挥中心',
    appSubtitle: '全国车队智能监管、实时GPS轨迹、票务收费与车主结算中枢系统',
    dashboard: '综合仪表盘',
    vehicles: '车辆管理',
    drivers: '驾驶员档案',
    owners: '车主与运输车队',
    queueTurns: '客运排队与发车',
    liveTracking: '实时GPS卫星定位',
    routesTariffs: '路线与法定运价',
    safetyCitizenTips: '交通安全与市民举报',
    voiceTranslator: '双向语音即时翻译',
    paymentsSettlements: '票款与出站清算',
    reportsExport: '报表与Excel导出',

    search: '全局搜索任何内容...',
    filter: '筛选',
    addNew: '新增登记',
    exportExcel: '导出Excel报表 (CSV)',
    downloadPdf: '打印行车单',
    printManifest: '打印出境行车单',
    status: '运行状态',
    actions: '操作',
    details: '详情',
    save: '保存记录',
    cancel: '取消',
    refresh: '刷新数据',
    emergencyAlert: '紧急安全警报！',
    all: '全部',
    active: '运营中 / 在途',
    suspended: '暂停营运',
    plateNumber: '车牌号码',
    installApp: '安装手机APP (PWA)',
    resetData: '重置/重载数据',

    totalVehicles: '在册运营车辆总数',
    activeOnRoute: '公路在途营运车辆',
    todayPassengers: '今日客运承载人次',
    safetyAlerts: '在控安全超速警报',
    dispatchedQueues: '今日已完成发班',
    terminalEfficiency: '客运枢纽准点率',
    activeFleets: '车属运输协会与企业',
    speedViolations: '超速违规记录',

    turnNumber: '班次排号',
    callTurn: '呼叫班次 (广播播报)',
    issueTicket: '开具排号出站单',
    departureStation: '始发客运站',
    destinationStation: '目的到达站',
    waitingVehicles: '场内候班车辆',
    boardingNow: '正在检票登车',
    dispatched: '已离站发运',
    estimatedDeparture: '计划发车时刻',

    speed: '时速 (km/h)',
    speedLimit: '限速标准',
    telemetry: '实时遥测数据',
    fuel: '燃油电量',
    heading: '行进方向',
    corridor: '运输主干走廊',
    simulation: '动态行程仿真',
    playSimulation: '启动模拟',
    pauseSimulation: '暂停模拟',
    fastForward: '2倍速推演',

    reportIncident: '提交违章与安全线索',
    incidentType: '违章类别',
    tipDescription: '详细经过说明',
    attachPhoto: '附带照片/视频',
    recordAudioTip: '录制现场语音凭证',
    submitTip: '立即上传举报',
    overspeed: '超速行驶违规',
    overloading: '客运超载/客货混装',
    recklessDriving: '危险危险驾驶',
    tariffExtortion: '违规抬价乱收费',
    accident: '交通事故预警',

    voiceIntercomTitle: '跨语种实时语音双向对话对讲系统',
    voiceIntercomDesc: '任意一方使用母语讲话，系统即刻自动翻译并向对方朗读其设定语言',
    speaker1: '对话方 1 (司机 / 稽查人员)',
    speaker2: '对话方 2 (乘客 / 调度员)',
    pressToSpeak: '按住说话',
    listening: '正在倾听语音输入...',
    autoSpeakTranslation: '自动朗读翻译结果',
    instantTranslate: '翻译',
    samplePhrases: '高频交通运输调度语录',

    passengerFares: '乘客客票电子支付',
    terminalExitFee: '客运站出闸服务规费',
    ownerSettlements: '车主客票结算与款项交付',
    collectFare: '售票收款并出具电子票',
    payExitFee: '缴纳出闸服务费',
    handoverPayout: '向车主交付净结算收益',
  },
};
