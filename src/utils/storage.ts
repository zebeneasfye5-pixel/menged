/**
 * Persistent Storage Engine for Live Production Operations
 * Stores and retrieves records in localStorage with fallback to initial production dataset.
 */

import { 
  Driver, 
  Owner, 
  PassengerTicketPayment, 
  QueueTurn, 
  SafetyReport, 
  TerminalExitFee, 
  TransportRoute, 
  Vehicle,
  OwnerSettlement 
} from '../types';

import { 
  INITIAL_DRIVERS, 
  INITIAL_OWNERS, 
  INITIAL_QUEUES, 
  INITIAL_ROUTES, 
  INITIAL_SAFETY_REPORTS, 
  INITIAL_VEHICLES 
} from '../data/mockData';
import { resolveExactLocation } from './geoLocator';

const STORAGE_KEYS = {
  VEHICLES: 'transport_et_vehicles_v3',
  DRIVERS: 'transport_et_drivers_v3',
  OWNERS: 'transport_et_owners_v3',
  QUEUES: 'transport_et_queues_v3',
  ROUTES: 'transport_et_routes_v3',
  REPORTS: 'transport_et_reports_v3',
  PAYMENTS: 'transport_et_payments_v3',
  EXIT_FEES: 'transport_et_exit_fees_v3',
  SETTLEMENTS: 'transport_et_settlements_v3',
};

const RAW_EXPANDED_VEHICLES: Vehicle[] = [
  {
    id: 'veh_bajaj_01',
    plateNumber: '1-A10482 አ.አ',
    vehicleType: 'bajaj',
    makeModel: 'Bajaj RE 4-Stroke (Compact)',
    year: 2025,
    capacity: 3,
    ownerId: 'own_05',
    ownerName: 'አቶ ዘበነ አስፋው (የግል)',
    driverId: 'drv_bajaj_01',
    driverName: 'አቤል ተፈራ ዳዲ',
    driverPhone: '+251 92 110 9988',
    speedLimiterId: 'GPS-BJ-10029',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-09-15',
    fuelLevel: 90,
    currentSpeed: 36,
    speedLimit: 50,
    lat: 9.0315,
    lng: 38.7372,
    heading: 85,
    origin: 'መርካቶ አውቶቡስ ተራ',
    destination: 'ፒያሳ / አራት ኪሎ',
    routeName: 'መርካቶ ➔ ፒያሳ ➔ አራት ኪሎ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_moto_01',
    plateNumber: '1-M40912 አ.አ',
    vehicleType: 'motorcycle',
    makeModel: 'Bajaj Boxer BM150',
    year: 2025,
    capacity: 1,
    ownerId: 'own_05',
    ownerName: 'ፈጣን ፖስታና ትራንስፖርት',
    driverId: 'drv_05',
    driverName: 'ዳዊት በላይ ሞላ',
    driverPhone: '+251 91 552 3300',
    speedLimiterId: 'GPS-MT-20811',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-10-12',
    fuelLevel: 82,
    currentSpeed: 44,
    speedLimit: 60,
    lat: 9.0108,
    lng: 38.7613,
    heading: 120,
    origin: 'መስቀል አደባባይ',
    destination: 'ቦሌ / ላምበርት',
    routeName: 'መስቀል አደባባይ ➔ ቦሌ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_damas_01',
    plateNumber: '2-B88190 ኦሮ',
    vehicleType: 'damas',
    makeModel: 'Suzuki Carry / Damas Van',
    year: 2024,
    capacity: 7,
    ownerId: 'own_04',
    ownerName: 'ኦዳ የተሽከርካሪ ባለንብረቶች ህብረት',
    driverId: 'drv_05',
    driverName: 'ጌታቸው ወርቁ ካሳሁን',
    driverPhone: '+251 91 399 8877',
    speedLimiterId: 'GPS-DM-44019',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-05-10',
    fuelLevel: 75,
    currentSpeed: 54,
    speedLimit: 70,
    lat: 8.5450,
    lng: 39.2700,
    heading: 45,
    origin: 'አዳማ ከተማ',
    destination: 'መተሃራ',
    routeName: 'አዳማ ➔ መተሃራ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_ev_01',
    plateNumber: '2-E77410 አ.አ',
    vehicleType: 'ev_taxi',
    makeModel: 'BYD Seagull / Dolphin EV',
    year: 2026,
    capacity: 4,
    ownerId: 'own_05',
    ownerName: 'አረንጓዴ ኢ-ታክሲ ማህበር',
    driverId: 'drv_01',
    driverName: 'ሳሙኤል ተሾመ',
    driverPhone: '+251 91 774 1020',
    speedLimiterId: 'GPS-EV-90211',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2028-01-20',
    fuelLevel: 94,
    currentSpeed: 62,
    speedLimit: 80,
    lat: 8.9265,
    lng: 38.7735,
    heading: 150,
    origin: 'ቃሊቲ',
    destination: 'ቢሾፍቱ',
    routeName: 'ቃሊቲ ➔ ዱከም ➔ ቢሾፍቱ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_citybus_01',
    plateNumber: '3-A01288 አ.አ',
    vehicleType: 'city_bus',
    makeModel: 'Anbessa / Sheger Electric City Bus',
    year: 2025,
    capacity: 85,
    ownerId: 'own_01',
    ownerName: 'የአዲስ አበባ ከተማ አውቶቡስ',
    driverId: 'drv_02',
    driverName: 'ሃብታሙ ንጉሴ',
    driverPhone: '+251 91 881 0044',
    speedLimiterId: 'GPS-CB-33012',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-12-01',
    fuelLevel: 88,
    currentSpeed: 42,
    speedLimit: 60,
    lat: 9.0205,
    lng: 38.8215,
    heading: 265,
    origin: 'ላምበርት መናኸሪያ',
    destination: 'መርካቶ',
    routeName: 'ላምበርት ➔ መገናኛ ➔ መርካቶ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_tanker_01',
    plateNumber: '3-T90844 ኢት',
    vehicleType: 'tanker',
    makeModel: 'Sinotruk Howo 45,000L Fuel Tanker',
    year: 2024,
    capacity: 45,
    ownerId: 'own_02',
    ownerName: 'አባይ የነዳጅ ትራንስፖርት ማህበር',
    driverId: 'drv_03',
    driverName: 'በቀለ ታደሰ ገብሬ',
    driverPhone: '+251 91 312 8899',
    speedLimiterId: 'GPS-TK-55102',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-07-19',
    fuelLevel: 78,
    currentSpeed: 58,
    speedLimit: 60,
    lat: 8.9000,
    lng: 39.9167,
    heading: 255,
    origin: 'አዋሽ 7 ኪሎ',
    destination: 'አዳማ',
    routeName: 'ጅቡቲ ➔ አዋሽ ➔ አዳማ ➔ አዲስ አበባ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_trailer_01',
    plateNumber: '3-E66109 ኢት',
    vehicleType: 'trailer',
    makeModel: 'Volvo FH16 / FH13 Tractor Head',
    year: 2025,
    capacity: 60,
    ownerId: 'own_02',
    ownerName: 'ብሔራዊ የደረቅ ጭነት ተሳቢዎች',
    driverId: 'drv_03',
    driverName: 'ሙሉጌታ ጥላሁን አሰፋ',
    driverPhone: '+251 91 200 4411',
    speedLimiterId: 'GPS-TR-77102',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-09-28',
    fuelLevel: 81,
    currentSpeed: 60,
    speedLimit: 65,
    lat: 8.5868,
    lng: 39.1211,
    heading: 310,
    origin: 'ሞጆ ደረቅ ወደብ',
    destination: 'ቃሊቲ ጭነት ማዕከል',
    routeName: 'ሞጆ ደረቅ ወደብ ➔ ቃሊቲ',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  {
    id: 'veh_amb_01',
    plateNumber: '4-A00907 አ.አ',
    vehicleType: 'ambulance',
    makeModel: 'Toyota Land Cruiser 78 Ambulance',
    year: 2025,
    capacity: 4,
    ownerId: 'own_01',
    ownerName: 'የኢትዮጵያ ቀይ መስቀል / 907',
    driverId: 'drv_01',
    driverName: 'ታምራት አለሙ',
    driverPhone: '+251 91 907 0907',
    speedLimiterId: 'GPS-AMB-00907',
    status: 'on_route',
    inspectionStatus: 'passed',
    inspectionExpiry: '2028-03-01',
    fuelLevel: 96,
    currentSpeed: 88,
    speedLimit: 110,
    lat: 9.6795,
    lng: 39.5326,
    heading: 215,
    origin: 'ደብረ ብርሃን',
    destination: 'አዲስ አበባ',
    routeName: 'ደብረ ብርሃን ➔ አዲስ አበባ (907 ድንገተኛ)',
    lastUpdate: 'አሁን (የቀጥታ)',
  },
  ...INITIAL_VEHICLES,
];

const EXPANDED_INITIAL_VEHICLES: Vehicle[] = RAW_EXPANDED_VEHICLES.map((v) => {
  const loc = resolveExactLocation(v.lat, v.lng);
  return {
    ...v,
    heading: v.heading ?? 90,
    currentLocationName: loc.formattedLabel,
    currentLocationImage: loc.imageUrl,
    trail: [
      {
        lat: Number((v.lat - 0.004).toFixed(5)),
        lng: Number((v.lng - 0.004).toFixed(5)),
        speed: v.currentSpeed,
        timestamp: new Date(Date.now() - 2000).toLocaleTimeString('en-GB', { hour12: false }),
        placeName: loc.formattedLabel,
      },
      {
        lat: v.lat,
        lng: v.lng,
        speed: v.currentSpeed,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        placeName: loc.formattedLabel,
      },
    ],
  };
});

// Initial Drivers including Bajaj and diverse fleet drivers
const EXPANDED_INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv_bajaj_01',
    fullName: 'አቤል ተፈራ ዳዲ',
    licenseNumber: 'ETH-LIC-BJ-00912',
    licenseGrade: 'ሞተር / ባጃጅ መንጃ ፍቃድ',
    phone: '+251 92 110 9988',
    experienceYears: 4,
    rating: 4.9,
    status: 'on_route',
    penaltyPoints: 0,
    assignedPlate: '1-A10482 አ.አ',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    healthCertExpiry: '2027-11-20',
  },
  ...INITIAL_DRIVERS,
];

// Initial Payment Records
const INITIAL_PAYMENTS: PassengerTicketPayment[] = [
  {
    id: 'pay_01',
    ticketNumber: 'TKT-2026-9901',
    passengerName: 'ይልማ ኃይሌ',
    passengerPhone: '+251 91 234 5678',
    vehiclePlate: '3-A24591 አ.አ',
    routeName: 'አዲስ አበባ - ሀዋሳ',
    seatNumber: 14,
    amountBirr: 450,
    paymentMethod: 'telebirr',
    paymentRefNumber: 'TEL-ET-88492014',
    paymentStatus: 'completed',
    issuedAt: '2026-11-19 07:15',
  },
  {
    id: 'pay_02',
    ticketNumber: 'TKT-2026-9902',
    passengerName: 'ፋጡማ አህመድ',
    passengerPhone: '+251 94 881 2200',
    vehiclePlate: '3-D88192 ድሬ',
    routeName: 'አዲስ አበባ - ድሬዳዋ',
    seatNumber: 8,
    amountBirr: 720,
    paymentMethod: 'cbe_birr',
    paymentRefNumber: 'CBE-TX-440192',
    paymentStatus: 'completed',
    issuedAt: '2026-11-19 07:22',
  },
  {
    id: 'pay_03',
    ticketNumber: 'TKT-2026-9903',
    passengerName: 'ደስታ ገብሩ',
    passengerPhone: '+251 92 111 2233',
    vehiclePlate: '1-A10482 አ.አ',
    routeName: 'መርካቶ - ፒያሳ',
    seatNumber: 2,
    amountBirr: 25,
    paymentMethod: 'cash',
    paymentRefNumber: 'CSH-REC-001',
    paymentStatus: 'completed',
    issuedAt: '2026-11-19 07:30',
  },
];

// Initial Exit Fees
const INITIAL_EXIT_FEES: TerminalExitFee[] = [
  {
    id: 'exit_01',
    queueTurnId: 'q_03',
    vehiclePlate: '3-B10928 ኦሮ',
    vehicleType: 'bus',
    ownerName: 'አባይ የትራንስፖርት ማህበር',
    driverName: 'አልማው ከበደ ሃይሌ',
    routeName: 'አዲስ አበባ - ባህር ዳር',
    feeAmountBirr: 150,
    paymentMethod: 'telebirr',
    paymentRef: 'TEL-EXIT-99120',
    receiptNumber: 'RCP-GATE-0041',
    dispatchedAt: '2026-11-19 06:45',
    clearedByInspector: 'ተቆጣጣሪ ካሳሁን',
  },
];

// Initial Owner Settlements
const INITIAL_SETTLEMENTS: OwnerSettlement[] = [
  {
    id: 'stl_01',
    settlementNumber: 'STL-2026-0089',
    ownerId: 'own_01',
    ownerName: 'ሰላም የሕዝብ ማመላለሻ አ.ማ (Selam Bus)',
    vehiclePlate: '3-A24591 አ.አ',
    routeName: 'አዲስ አበባ - ሀዋሳ',
    periodDate: '2026-11-19',
    totalPassengersCount: 46,
    grossFaresCollectedBirr: 20700,
    terminalServiceFeeDeductedBirr: 200,
    associationCommissionBirr: 500,
    netPayoutToOwnerBirr: 20000,
    payoutMethod: 'bank_account',
    payoutAccountOrPhone: 'CBE 100019283741',
    transactionRef: 'CBE-STL-884920',
    status: 'paid',
    handedOverBy: 'የመናኸሪያ ገንዘብ ያዥ',
    receivedBy: 'ተወካይ ሰላም ባስ',
    settledAt: '2026-11-19 07:40',
  },
];

function loadItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to read from localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function saveItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write to localStorage key "${key}":`, err);
  }
}

export const StorageService = {
  getVehicles: (): Vehicle[] => loadItem(STORAGE_KEYS.VEHICLES, EXPANDED_INITIAL_VEHICLES),
  saveVehicles: (vehicles: Vehicle[]) => saveItem(STORAGE_KEYS.VEHICLES, vehicles),

  getDrivers: (): Driver[] => loadItem(STORAGE_KEYS.DRIVERS, EXPANDED_INITIAL_DRIVERS),
  saveDrivers: (drivers: Driver[]) => saveItem(STORAGE_KEYS.DRIVERS, drivers),

  getOwners: (): Owner[] => loadItem(STORAGE_KEYS.OWNERS, INITIAL_OWNERS),
  saveOwners: (owners: Owner[]) => saveItem(STORAGE_KEYS.OWNERS, owners),

  getQueues: (): QueueTurn[] => loadItem(STORAGE_KEYS.QUEUES, INITIAL_QUEUES),
  saveQueues: (queues: QueueTurn[]) => saveItem(STORAGE_KEYS.QUEUES, queues),

  getRoutes: (): TransportRoute[] => loadItem(STORAGE_KEYS.ROUTES, INITIAL_ROUTES),
  saveRoutes: (routes: TransportRoute[]) => saveItem(STORAGE_KEYS.ROUTES, routes),

  getReports: (): SafetyReport[] => loadItem(STORAGE_KEYS.REPORTS, INITIAL_SAFETY_REPORTS),
  saveReports: (reports: SafetyReport[]) => saveItem(STORAGE_KEYS.REPORTS, reports),

  getPayments: (): PassengerTicketPayment[] => loadItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: PassengerTicketPayment[]) => saveItem(STORAGE_KEYS.PAYMENTS, payments),

  getExitFees: (): TerminalExitFee[] => loadItem(STORAGE_KEYS.EXIT_FEES, INITIAL_EXIT_FEES),
  saveExitFees: (fees: TerminalExitFee[]) => saveItem(STORAGE_KEYS.EXIT_FEES, fees),

  getSettlements: (): OwnerSettlement[] => loadItem(STORAGE_KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS),
  saveSettlements: (settlements: OwnerSettlement[]) => saveItem(STORAGE_KEYS.SETTLEMENTS, settlements),

  resetAllData: () => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  },
};
