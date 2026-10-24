/**
 * Persistent Storage Engine for Live Production Operations
 * Stores and retrieves records in localStorage with fallback to initial seed.
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

const STORAGE_KEYS = {
  VEHICLES: 'transport_et_vehicles_v2',
  DRIVERS: 'transport_et_drivers_v2',
  OWNERS: 'transport_et_owners_v2',
  QUEUES: 'transport_et_queues_v2',
  ROUTES: 'transport_et_routes_v2',
  REPORTS: 'transport_et_reports_v2',
  PAYMENTS: 'transport_et_payments_v2',
  EXIT_FEES: 'transport_et_exit_fees_v2',
  SETTLEMENTS: 'transport_et_settlements_v2',
};

// Initial Bajaj and Diverse Vehicles Seed to satisfy "ከባጃጅ ጀምሮ ሁሉንም እንዲካተቱ አድርግ"
const EXPANDED_INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_bajaj_01',
    plateNumber: '1-A10482 አ.አ',
    vehicleType: 'bajaj',
    makeModel: 'Bajaj RE 4-Stroke Auto Rickshaw',
    year: 2024,
    capacity: 3,
    ownerId: 'own_05',
    ownerName: 'አቶ ዘበነ አስፋው (የግል)',
    driverId: 'drv_bajaj_01',
    driverName: 'አቤል ተፈራ ዳዲ',
    driverPhone: '+251 92 110 9988',
    speedLimiterId: 'SL-BJ-10029',
    status: 'active',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-09-15',
    fuelLevel: 90,
    currentSpeed: 38,
    speedLimit: 50,
    lat: 9.0250,
    lng: 38.7450,
    origin: 'መርካቶ አውቶቡስ ተራ',
    destination: 'ፒያሳ / አራት ኪሎ',
    lastUpdate: 'አሁን',
  },
  {
    id: 'veh_damas_01',
    plateNumber: '2-B88190 ኦሮ',
    vehicleType: 'damas',
    makeModel: 'Suzuki Carry / Damas Mini Van',
    year: 2023,
    capacity: 7,
    ownerId: 'own_04',
    ownerName: 'ኦዳ የተሽከርካሪ ባለንብረቶች ህብረት',
    driverId: 'drv_05',
    driverName: 'ጌታቸው ወርቁ ካሳሁን',
    driverPhone: '+251 91 399 8877',
    speedLimiterId: 'SL-DM-44019',
    status: 'in_queue',
    inspectionStatus: 'passed',
    inspectionExpiry: '2027-05-10',
    fuelLevel: 75,
    currentSpeed: 0,
    speedLimit: 60,
    lat: 8.5450,
    lng: 39.2700,
    origin: 'አዳማ ከተማ',
    destination: 'ወንጂ / መተሃራ',
    lastUpdate: 'ከ3 ደቂቃ በፊት',
  },
  ...INITIAL_VEHICLES,
];

// Initial Drivers including Bajaj and Damas drivers
const EXPANDED_INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv_bajaj_01',
    fullName: 'አቤል ተፈራ ዳዲ',
    licenseNumber: 'ETH-LIC-BJ-00912',
    licenseGrade: 'ሞተር / ባጃጅ መንጃ ፍቃድ',
    phone: '+251 92 110 9988',
    experienceYears: 4,
    rating: 4.9,
    status: 'active',
    penaltyPoints: 0,
    assignedPlate: '1-A10482 አ.አ',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    healthCertExpiry: '2027-11-20',
  },
  ...INITIAL_DRIVERS,
];

// Initial Payment Records Seed
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
    issuedAt: '2026-10-24 07:15',
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
    issuedAt: '2026-10-24 07:22',
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
    issuedAt: '2026-10-24 07:30',
  },
];

// Initial Exit Fees Seed
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
    dispatchedAt: '2026-10-24 06:45',
    clearedByInspector: 'ተቆጣጣሪ ካሳሁን',
  },
];

// Initial Owner Settlements Seed
const INITIAL_SETTLEMENTS: OwnerSettlement[] = [
  {
    id: 'stl_01',
    settlementNumber: 'STL-2026-0089',
    ownerId: 'own_01',
    ownerName: 'ሰላም የሕዝብ ማመላለሻ አ.ማ (Selam Bus)',
    vehiclePlate: '3-A24591 አ.አ',
    routeName: 'አዲስ አበባ - ሀዋሳ',
    periodDate: '2026-10-24',
    totalPassengersCount: 46,
    grossFaresCollectedBirr: 20700, // 46 * 450 ETB
    terminalServiceFeeDeductedBirr: 200,
    associationCommissionBirr: 500,
    netPayoutToOwnerBirr: 20000,
    payoutMethod: 'bank_account',
    payoutAccountOrPhone: 'CBE 100019283741',
    transactionRef: 'CBE-STL-884920',
    status: 'paid',
    handedOverBy: 'የመናኸሪያ ገንዘብ ያዥ',
    receivedBy: 'ተወካይ ሰላም ባስ',
    settledAt: '2026-10-24 07:40',
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
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.OWNERS);
    localStorage.removeItem(STORAGE_KEYS.QUEUES);
    localStorage.removeItem(STORAGE_KEYS.ROUTES);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXIT_FEES);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
    window.location.reload();
  },
};
