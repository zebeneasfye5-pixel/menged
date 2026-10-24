export type Language = 'am' | 'om' | 'ti' | 'so' | 'en' | 'ar' | 'fr' | 'zh';

export type VehicleType = 
  | 'bajaj'          // ባጃጅ (3-Wheeler Auto Rickshaw)
  | 'motorcycle'     // ሞተርሳይክል (Motorbike Taxi)
  | 'damas'          // ዳማስ / ሱዙኪ ቫን (Small Mini Van)
  | 'taxi'           // ታክሲ (Sedan / Lada Taxi)
  | 'minibus'        // ሚኒባስ ታክሲ (12-16 Seats)
  | 'midibus'        // ኮድ 3 መካከለኛ አውቶቡስ (27-32 Seats)
  | 'bus'            // የረጅም ርቀት አውቶቡስ (45-65 Seats)
  | 'vip_coach'      // ቪአይፒ የቅንጦት ባስ (Luxury Coach)
  | 'truck'          // አይሱዙ / ሲኖትራክ የከባድ ጭነት (Freight Truck)
  | 'special';       // ልዩ ተሽከርካሪ (Special Vehicle / Tanker / Ambulance)

export type VehicleStatus = 'active' | 'on_route' | 'in_queue' | 'maintenance' | 'suspended';

export type InspectionStatus = 'passed' | 'warning' | 'expired';

export interface Vehicle {
  id: string;
  plateNumber: string; // e.g. 3-A24591 አ.አ
  vehicleType: VehicleType | string;
  makeModel: string;
  year: number;
  capacity: number; // passenger seats or cargo tons
  ownerId: string;
  ownerName: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  speedLimiterId: string;
  status: VehicleStatus;
  inspectionStatus: InspectionStatus;
  inspectionExpiry: string;
  fuelLevel: number; // 0-100%
  currentSpeed: number; // km/h
  speedLimit: number; // km/h
  lat: number;
  lng: number;
  routeId?: string;
  routeName?: string;
  origin?: string;
  destination?: string;
  lastUpdate: string;
}

export interface Driver {
  id: string;
  fullName: string;
  licenseNumber: string;
  licenseGrade: string; // Any grade allowed (ደረጃ 1-5, ህዝብ 1-2, ሞተር/ባጃጅ, International, etc.)
  phone: string;
  experienceYears: number;
  rating: number; // 1-5
  status: 'active' | 'on_route' | 'resting' | 'suspended';
  penaltyPoints: number;
  assignedPlate: string;
  avatarUrl: string;
  healthCertExpiry: string;
}

export interface Owner {
  id: string;
  name: string;
  type: 'association' | 'company' | 'individual' | 'cooperative';
  tin: string;
  phone: string;
  email: string;
  city: string;
  bankName?: string;
  bankAccountNo?: string;
  telebirrPhone?: string;
  vehiclesCount: number;
  activeVehicles: number;
  fleetRevenueEtb: number;
}

export interface QueueTurn {
  id: string;
  terminalId: string;
  terminalName: string;
  routeId: string;
  routeName: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType?: string;
  driverName: string;
  driverPhone: string;
  turnNumber: number;
  entryTime: string;
  estimatedDeparture: string;
  status: 'waiting' | 'calling' | 'boarding' | 'dispatched' | 'cancelled';
  capacity: number;
  bookedSeats: number;
  ticketCode: string;
  tariffPerSeat: number;
  exitFeePaid?: boolean;
  totalCollectedEtb?: number;
}

export interface TransportRoute {
  id: string;
  code: string;
  name: string;
  origin: string; // Any city/sub-city worldwide
  destination: string; // Any city/destination worldwide
  distanceKm: number;
  standardTariffBirr: number;
  estimatedHours: number;
  checkpointsCount: number;
  tollFee: number;
  roadQuality: 'expressway' | 'asphalt_good' | 'mountain_corridor' | 'standard' | 'gravel_rural';
}

export interface SafetyReport {
  id: string;
  trackingNumber: string;
  vehiclePlate: string;
  reportedBy: string;
  reporterPhone?: string;
  incidentType: 'overspeed' | 'overloading' | 'reckless_driving' | 'tariff_extortion' | 'accident' | 'checkpoint_bribe' | 'mechanical_failure' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location: string;
  description: string;
  hasAudio: boolean;
  audioBlobUrl?: string;
  audioNoteDuration?: string;
  photoUrl?: string;
  status: 'pending' | 'under_investigation' | 'fine_issued' | 'resolved';
  speedRecorded?: number;
  actionTaken?: string;
}

export interface VoiceMessage {
  id: string;
  senderRole: 'dispatcher' | 'driver' | 'passenger' | 'traffic_officer';
  senderName: string;
  sourceLang: Language;
  targetLang: Language;
  sourceText: string;
  translatedText: string;
  timestamp: string;
  isPlaying?: boolean;
}

// Payment & Financial Reconciliation Models
export interface PassengerTicketPayment {
  id: string;
  ticketNumber: string;
  queueTurnId?: string;
  passengerName: string;
  passengerPhone: string;
  vehiclePlate: string;
  routeName: string;
  seatNumber: number;
  amountBirr: number;
  paymentMethod: 'telebirr' | 'cbe_birr' | 'cash' | 'bank_transfer';
  paymentRefNumber: string;
  paymentStatus: 'completed' | 'pending' | 'refunded';
  issuedAt: string;
}

export interface TerminalExitFee {
  id: string;
  queueTurnId: string;
  vehiclePlate: string;
  vehicleType: string;
  ownerName: string;
  driverName: string;
  routeName: string;
  feeAmountBirr: number;
  paymentMethod: 'telebirr' | 'cash' | 'cbe_birr';
  paymentRef: string;
  receiptNumber: string;
  dispatchedAt: string;
  clearedByInspector: string;
}

export interface OwnerSettlement {
  id: string;
  settlementNumber: string;
  ownerId: string;
  ownerName: string;
  vehiclePlate: string;
  routeName: string;
  periodDate: string;
  totalPassengersCount: number;
  grossFaresCollectedBirr: number; // Total passenger fares
  terminalServiceFeeDeductedBirr: number; // Station exit/dispatch fee
  associationCommissionBirr: number; // Association dues
  netPayoutToOwnerBirr: number; // Final net handed over to owner
  payoutMethod: 'telebirr' | 'bank_account' | 'cash';
  payoutAccountOrPhone: string;
  transactionRef: string;
  status: 'paid' | 'pending';
  handedOverBy: string;
  receivedBy: string;
  settledAt: string;
}
