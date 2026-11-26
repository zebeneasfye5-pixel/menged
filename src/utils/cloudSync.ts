import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Driver,
  Owner,
  OwnerSettlement,
  PassengerTicketPayment,
  QueueTurn,
  SafetyReport,
  TerminalExitFee,
  TransportRoute,
  Vehicle,
} from '../types';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'zebeneasfye5@gmail.com';

export function sanitizeId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return (cleaned || `id_${Date.now()}`).slice(0, 128);
}

export function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const s = typeof val === 'string' ? val : String(val ?? fallback);
  return s.slice(0, maxLen);
}

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function safeUrlOrEmpty(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  if (val.startsWith('data:') && val.length > maxLen) return '';
  return val.slice(0, maxLen);
}

export const CONTRACT_DOC_ID = 'CNT-TECH-2026-0048';

export interface SmartContractRecord {
  id: string;
  developerName: string;
  authorityOfficial: string;
  contractDate: string;
  contractValueBirr: number;
  warrantyMonths: number;
  isSigned: boolean;
}

export function isVerifiedAdmin(user: User | null): boolean {
  if (!user || !user.emailVerified) return false;
  return user.email === BOOTSTRAPPED_ADMIN_EMAIL;
}

export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) return true;

  const path = `admins/${user.uid}`;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', sanitizeId(user.uid)));
    return adminSnap.exists();
  } catch (error) {
    console.warn(`Admin allowlist check failed for ${path}:`, error);
    return false;
  }
}

export async function loadSignedContract(user: User | null): Promise<SmartContractRecord | null> {
  if (!user || !user.emailVerified) return null;
  const path = 'contracts';
  try {
    const isAdmin = await checkIsAdminUser(user);
    const q = isAdmin
      ? query(collection(db, 'contracts'), where('id', '==', CONTRACT_DOC_ID))
      : query(collection(db, 'contracts'), where('createdBy', '==', user.uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const matched = snap.docs.find((d) => d.id === CONTRACT_DOC_ID) || snap.docs[0];
    return matched.data() as SmartContractRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveSignedContract(
  user: User,
  contract: Omit<SmartContractRecord, 'id'>
): Promise<void> {
  if (!user.emailVerified) return;
  const isAdmin = await checkIsAdminUser(user);
  const docId = isAdmin ? CONTRACT_DOC_ID : sanitizeId(`${CONTRACT_DOC_ID}_${user.uid}`);
  const path = `contracts/${docId}`;

  try {
    const q = isAdmin
      ? query(collection(db, 'contracts'), where('id', '==', docId))
      : query(collection(db, 'contracts'), where('createdBy', '==', user.uid));
    const snap = await getDocs(q);
    const existingDoc = snap.docs.find((d) => d.id === docId);

    if (!existingDoc) {
      await setDoc(doc(db, 'contracts', docId), {
        id: docId,
        developerName: clampStr(contract.developerName, 160, 'Developer') || 'Developer',
        authorityOfficial: clampStr(contract.authorityOfficial, 160, 'Authority') || 'Authority',
        contractDate: clampStr(contract.contractDate, 40),
        contractValueBirr: Math.max(0, Number(contract.contractValueBirr ?? 0)),
        warrantyMonths: Math.max(0, Number(contract.warrantyMonths ?? 0)),
        isSigned: Boolean(contract.isSigned),
        createdBy: sanitizeId(user.uid),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingDoc.data();
      const ownerUid = typeof existingData.createdBy === 'string' ? existingData.createdBy : user.uid;
      if (isAdmin) {
        await setDoc(
          doc(db, 'contracts', docId),
          {
            id: docId,
            developerName: clampStr(contract.developerName, 160, 'Developer') || 'Developer',
            authorityOfficial: clampStr(contract.authorityOfficial, 160, 'Authority') || 'Authority',
            contractDate: clampStr(contract.contractDate, 40),
            contractValueBirr: Math.max(0, Number(contract.contractValueBirr ?? 0)),
            warrantyMonths: Math.max(0, Number(contract.warrantyMonths ?? 0)),
            isSigned: Boolean(contract.isSigned),
            createdBy: sanitizeId(ownerUid),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else if (ownerUid === user.uid && existingData.isSigned === false) {
        await setDoc(
          doc(db, 'contracts', docId),
          {
            isSigned: Boolean(contract.isSigned),
            contractDate: clampStr(contract.contractDate, 40),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Ensure user profile document exists in /users/{uid}
 */
export async function ensureUserProfile(user: User): Promise<void> {
  if (!user.emailVerified) return;
  const path = `users/${user.uid}`;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: sanitizeId(user.uid),
        displayName: clampStr(user.displayName || user.email || 'User', 120, 'User'),
        preferredRole: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function buildVehiclePayload(v: Vehicle, uid: string, isCreate: boolean) {
  const allowedStatuses = ['active', 'on_route', 'in_queue', 'maintenance', 'suspended'];
  const allowedInspections = ['passed', 'warning', 'expired'];
  return {
    id: sanitizeId(v.id),
    plateNumber: clampStr(v.plateNumber, 40, 'UNKNOWN') || 'UNKNOWN',
    vehicleType: clampStr(v.vehicleType, 40, 'bajaj') || 'bajaj',
    makeModel: clampStr(v.makeModel, 120, 'Vehicle') || 'Vehicle',
    year: clampNum(v.year, 1950, 2100, 2024),
    capacity: clampNum(v.capacity, 0, 500, 3),
    ownerId: clampStr(v.ownerId, 128),
    ownerName: clampStr(v.ownerName, 160),
    driverId: clampStr(v.driverId, 128),
    driverName: clampStr(v.driverName, 120),
    driverPhone: clampStr(v.driverPhone, 40),
    speedLimiterId: clampStr(v.speedLimiterId, 64),
    status: allowedStatuses.includes(v.status) ? v.status : 'active',
    inspectionStatus: allowedInspections.includes(v.inspectionStatus) ? v.inspectionStatus : 'passed',
    inspectionExpiry: clampStr(v.inspectionExpiry, 40),
    fuelLevel: clampNum(v.fuelLevel, 0, 100, 80),
    currentSpeed: clampNum(v.currentSpeed, 0, 300, 0),
    speedLimit: clampNum(v.speedLimit, 10, 200, 80),
    lat: clampNum(v.lat, -90, 90, 9.02),
    lng: clampNum(v.lng, -180, 180, 38.75),
    heading: clampNum(v.heading, 0, 360, 0),
    currentLocationName: clampStr(v.currentLocationName, 200),
    currentLocationImage: safeUrlOrEmpty(v.currentLocationImage, 500),
    origin: clampStr(v.origin, 160),
    destination: clampStr(v.destination, 160),
    routeId: clampStr(v.routeId, 128),
    routeName: clampStr(v.routeName, 200),
    lastUpdate: clampStr(v.lastUpdate, 64),
    visibility: 'public',
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildDriverPayload(d: Driver, uid: string, isCreate: boolean) {
  const allowedStatuses = ['active', 'on_route', 'resting', 'suspended'];
  return {
    id: sanitizeId(d.id),
    fullName: clampStr(d.fullName, 120, 'Driver') || 'Driver',
    licenseNumber: clampStr(d.licenseNumber, 64, 'LIC') || 'LIC',
    licenseGrade: clampStr(d.licenseGrade, 80),
    phone: clampStr(d.phone, 40),
    experienceYears: clampNum(d.experienceYears, 0, 80, 0),
    rating: clampNum(d.rating, 0, 5, 5),
    status: allowedStatuses.includes(d.status) ? d.status : 'active',
    penaltyPoints: clampNum(d.penaltyPoints, 0, 1000, 0),
    assignedPlate: clampStr(d.assignedPlate, 40),
    avatarUrl: safeUrlOrEmpty(d.avatarUrl, 500),
    healthCertExpiry: clampStr(d.healthCertExpiry, 40),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildOwnerPayload(o: Owner, uid: string, isCreate: boolean) {
  const allowedTypes = ['association', 'company', 'individual', 'cooperative'];
  return {
    id: sanitizeId(o.id),
    name: clampStr(o.name, 160, 'Owner') || 'Owner',
    type: allowedTypes.includes(o.type) ? o.type : 'individual',
    tin: clampStr(o.tin, 40),
    phone: clampStr(o.phone, 40),
    email: clampStr(o.email, 120),
    city: clampStr(o.city, 80),
    bankName: clampStr(o.bankName, 80),
    bankAccountNo: clampStr(o.bankAccountNo, 64),
    telebirrPhone: clampStr(o.telebirrPhone, 40),
    vehiclesCount: Number(o.vehiclesCount ?? 0),
    activeVehicles: Number(o.activeVehicles ?? 0),
    fleetRevenueEtb: Number(o.fleetRevenueEtb ?? 0),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildQueuePayload(q: QueueTurn, uid: string, isCreate: boolean) {
  const allowedStatuses = ['waiting', 'calling', 'boarding', 'dispatched', 'cancelled'];
  return {
    id: sanitizeId(q.id),
    terminalId: clampStr(q.terminalId, 80),
    terminalName: clampStr(q.terminalName, 160, 'Terminal') || 'Terminal',
    routeId: clampStr(q.routeId, 80),
    routeName: clampStr(q.routeName, 160, 'Route') || 'Route',
    vehicleId: clampStr(q.vehicleId, 80),
    plateNumber: clampStr(q.plateNumber, 40, 'PLATE') || 'PLATE',
    vehicleType: clampStr(q.vehicleType, 40),
    driverName: clampStr(q.driverName, 120),
    driverPhone: clampStr(q.driverPhone, 40),
    turnNumber: clampNum(q.turnNumber, 0, 10000, 1),
    entryTime: clampStr(q.entryTime, 40),
    estimatedDeparture: clampStr(q.estimatedDeparture, 40),
    status: allowedStatuses.includes(q.status) ? q.status : 'waiting',
    capacity: Number(q.capacity ?? 16),
    bookedSeats: Number(q.bookedSeats ?? 0),
    ticketCode: clampStr(q.ticketCode, 64),
    tariffPerSeat: Number(q.tariffPerSeat ?? 0),
    exitFeePaid: Boolean(q.exitFeePaid),
    totalCollectedEtb: Number(q.totalCollectedEtb ?? 0),
    visibility: 'public',
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildRoutePayload(r: TransportRoute, uid: string, isCreate: boolean) {
  let roadQuality: string = r.roadQuality || 'asphalt_good';
  if (roadQuality === 'standard') roadQuality = 'asphalt_good';
  if (roadQuality === 'gravel_rural') roadQuality = 'gravel';
  if (!['expressway', 'asphalt_good', 'mountain_corridor', 'gravel'].includes(roadQuality)) {
    roadQuality = 'asphalt_good';
  }

  return {
    id: sanitizeId(r.id),
    code: clampStr(r.code, 40),
    name: clampStr(r.name, 160, 'Route') || 'Route',
    origin: clampStr(r.origin, 160, 'Origin') || 'Origin',
    destination: clampStr(r.destination, 160, 'Destination') || 'Destination',
    distanceKm: Math.max(0, Number(r.distanceKm ?? 0)),
    standardTariffBirr: Math.max(0, Number(r.standardTariffBirr ?? 0)),
    estimatedHours: Math.max(0, Number(r.estimatedHours ?? 1)),
    checkpointsCount: Math.max(0, Number(r.checkpointsCount ?? 0)),
    tollFee: Math.max(0, Number(r.tollFee ?? 0)),
    roadQuality,
    visibility: 'public',
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildReportPayload(rep: SafetyReport, uid: string, isCreate: boolean) {
  let incidentType: string = rep.incidentType;
  if (
    !['overspeed', 'overloading', 'reckless_driving', 'tariff_extortion', 'accident', 'mechanical_issue'].includes(
      incidentType
    )
  ) {
    incidentType = 'mechanical_issue';
  }
  const severity = ['low', 'medium', 'high', 'critical'].includes(rep.severity) ? rep.severity : 'medium';
  const status = isCreate
    ? 'pending'
    : ['pending', 'under_investigation', 'resolved', 'fine_issued'].includes(rep.status)
    ? rep.status
    : 'pending';

  return {
    id: sanitizeId(rep.id),
    trackingNumber: clampStr(rep.trackingNumber, 64, 'SAF') || 'SAF',
    vehiclePlate: clampStr(rep.vehiclePlate, 40, 'PLATE') || 'PLATE',
    reportedBy: clampStr(rep.reportedBy, 120),
    reporterPhone: clampStr(rep.reporterPhone, 40),
    incidentType,
    severity,
    timestamp: clampStr(rep.timestamp, 64),
    location: clampStr(rep.location, 200),
    description: clampStr(rep.description, 1500),
    hasAudio: Boolean(rep.hasAudio),
    audioNoteDuration: clampStr(rep.audioNoteDuration, 20),
    photoUrl: safeUrlOrEmpty(rep.photoUrl, 500),
    status,
    speedRecorded: Number(rep.speedRecorded ?? 0),
    actionTaken: clampStr(rep.actionTaken, 600),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildPaymentPayload(p: PassengerTicketPayment, uid: string, isCreate: boolean) {
  const allowedMethods = ['telebirr', 'cbe_birr', 'mpesa', 'amole', 'cash', 'bank_transfer'];
  const allowedStatuses = ['completed', 'pending', 'refunded'];
  return {
    id: sanitizeId(p.id),
    ticketNumber: clampStr(p.ticketNumber, 64, 'TKT') || 'TKT',
    passengerName: clampStr(p.passengerName, 120),
    passengerPhone: clampStr(p.passengerPhone, 40),
    vehiclePlate: clampStr(p.vehiclePlate, 40, 'PLATE') || 'PLATE',
    routeName: clampStr(p.routeName, 160),
    seatNumber: Number(p.seatNumber ?? 1),
    amountBirr: Math.max(0, Number(p.amountBirr ?? 0)),
    paymentMethod: allowedMethods.includes(p.paymentMethod) ? p.paymentMethod : 'telebirr',
    paymentRefNumber: clampStr(p.paymentRefNumber, 80),
    paymentStatus: allowedStatuses.includes(p.paymentStatus) ? p.paymentStatus : 'completed',
    issuedAt: clampStr(p.issuedAt, 64),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildExitFeePayload(f: TerminalExitFee, uid: string, isCreate: boolean) {
  const allowedMethods = ['telebirr', 'cbe_birr', 'cash', 'bank_transfer'];
  return {
    id: sanitizeId(f.id),
    queueTurnId: clampStr(f.queueTurnId, 80),
    vehiclePlate: clampStr(f.vehiclePlate, 40, 'PLATE') || 'PLATE',
    vehicleType: clampStr(f.vehicleType, 40),
    ownerName: clampStr(f.ownerName, 160),
    driverName: clampStr(f.driverName, 120),
    routeName: clampStr(f.routeName, 160),
    feeAmountBirr: Math.max(0, Number(f.feeAmountBirr ?? 0)),
    paymentMethod: allowedMethods.includes(f.paymentMethod) ? f.paymentMethod : 'telebirr',
    paymentRef: clampStr(f.paymentRef, 80),
    receiptNumber: clampStr(f.receiptNumber, 80, 'RCP') || 'RCP',
    dispatchedAt: clampStr(f.dispatchedAt, 64),
    clearedByInspector: clampStr(f.clearedByInspector, 120),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export function buildSettlementPayload(s: OwnerSettlement, uid: string, isCreate: boolean) {
  let payoutMethod: string = s.payoutMethod || 'telebirr';
  if (payoutMethod === 'cash') payoutMethod = 'cash_handover';
  if (!['telebirr', 'bank_account', 'cbe_birr', 'cash_handover'].includes(payoutMethod)) {
    payoutMethod = 'telebirr';
  }

  let status: string = s.status || 'pending_handover';
  if (status === 'pending') status = 'pending_handover';
  if (!['paid', 'pending_handover', 'disputed'].includes(status)) {
    status = 'pending_handover';
  }

  return {
    id: sanitizeId(s.id),
    settlementNumber: clampStr(s.settlementNumber, 64, 'STL') || 'STL',
    ownerId: clampStr(s.ownerId, 80),
    ownerName: clampStr(s.ownerName, 160, 'Owner') || 'Owner',
    vehiclePlate: clampStr(s.vehiclePlate, 40, 'PLATE') || 'PLATE',
    routeName: clampStr(s.routeName, 160),
    periodDate: clampStr(s.periodDate, 40),
    totalPassengersCount: Number(s.totalPassengersCount ?? 0),
    grossFaresCollectedBirr: Number(s.grossFaresCollectedBirr ?? 0),
    terminalServiceFeeDeductedBirr: Number(s.terminalServiceFeeDeductedBirr ?? 0),
    associationCommissionBirr: Number(s.associationCommissionBirr ?? 0),
    netPayoutToOwnerBirr: Math.max(0, Number(s.netPayoutToOwnerBirr ?? 0)),
    payoutMethod,
    payoutAccountOrPhone: clampStr(s.payoutAccountOrPhone, 80),
    transactionRef: clampStr(s.transactionRef, 80),
    status,
    handedOverBy: clampStr(s.handedOverBy, 120),
    receivedBy: clampStr(s.receivedBy, 120),
    settledAt: clampStr(s.settledAt, 64),
    createdBy: sanitizeId(uid),
    ...(isCreate ? { createdAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  };
}

export async function seedCloudDatabaseIfEmpty(
  user: User,
  localState: {
    vehicles: Vehicle[];
    drivers: Driver[];
    owners: Owner[];
    queues: QueueTurn[];
    routes: TransportRoute[];
    reports: SafetyReport[];
    payments: PassengerTicketPayment[];
    exitFees: TerminalExitFee[];
    settlements: OwnerSettlement[];
  }
): Promise<void> {
  if (!isVerifiedAdmin(user)) return;

  try {
    const existingVehicles = await getDocs(collection(db, 'vehicles'));
    if (!existingVehicles.empty) return;

    const batch = writeBatch(db);
    const uid = user.uid;

    localState.vehicles.forEach((v) => {
      const id = sanitizeId(v.id);
      batch.set(doc(db, 'vehicles', id), buildVehiclePayload({ ...v, id }, uid, true));
    });

    localState.queues.forEach((q) => {
      const id = sanitizeId(q.id);
      batch.set(doc(db, 'queues', id), buildQueuePayload({ ...q, id }, uid, true));
    });

    localState.routes.forEach((r) => {
      const id = sanitizeId(r.id);
      batch.set(doc(db, 'routes', id), buildRoutePayload({ ...r, id }, uid, true));
    });

    localState.drivers.forEach((d) => {
      const id = sanitizeId(d.id);
      batch.set(doc(db, 'drivers', id), buildDriverPayload({ ...d, id }, uid, true));
    });

    localState.owners.forEach((o) => {
      const id = sanitizeId(o.id);
      batch.set(doc(db, 'owners', id), buildOwnerPayload({ ...o, id }, uid, true));
    });

    localState.reports.forEach((rep) => {
      const id = sanitizeId(rep.id);
      batch.set(doc(db, 'safetyReports', id), buildReportPayload({ ...rep, id }, uid, true));
    });

    localState.payments.forEach((p) => {
      const id = sanitizeId(p.id);
      batch.set(doc(db, 'payments', id), buildPaymentPayload({ ...p, id }, uid, true));
    });

    localState.exitFees.forEach((f) => {
      const id = sanitizeId(f.id);
      batch.set(doc(db, 'exitFees', id), buildExitFeePayload({ ...f, id }, uid, true));
    });

    localState.settlements.forEach((s) => {
      const id = sanitizeId(s.id);
      batch.set(doc(db, 'settlements', id), buildSettlementPayload({ ...s, id }, uid, true));
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

export function subscribeCloudCollections(
  user: User,
  callbacks: {
    onVehicles: (items: Vehicle[]) => void;
    onQueues: (items: QueueTurn[]) => void;
    onRoutes: (items: TransportRoute[]) => void;
    onDrivers: (items: Driver[]) => void;
    onOwners: (items: Owner[]) => void;
    onReports: (items: SafetyReport[]) => void;
    onPayments: (items: PassengerTicketPayment[]) => void;
    onExitFees: (items: TerminalExitFee[]) => void;
    onSettlements: (items: OwnerSettlement[]) => void;
  },
  isAdminOverride?: boolean
): () => void {
  const unsubs: Unsubscribe[] = [];
  const admin = isAdminOverride ?? isVerifiedAdmin(user);

  // Publicly operational collections
  unsubs.push(
    onSnapshot(
      query(collection(db, 'vehicles'), where('visibility', '==', 'public')),
      (snap) => {
        if (!snap.empty) {
          callbacks.onVehicles(snap.docs.map((d) => d.data() as Vehicle));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'queues'), where('visibility', '==', 'public')),
      (snap) => {
        if (!snap.empty) {
          callbacks.onQueues(snap.docs.map((d) => d.data() as QueueTurn));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'queues')
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'routes'), where('visibility', '==', 'public')),
      (snap) => {
        if (!snap.empty) {
          callbacks.onRoutes(snap.docs.map((d) => d.data() as TransportRoute));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'routes')
    )
  );

  // Role-scoped collections (Admin sees all; regular verified user sees own createdBy)
  const makeScopedQuery = (colName: string) =>
    admin
      ? collection(db, colName)
      : query(collection(db, colName), where('createdBy', '==', user.uid));

  if (user.emailVerified) {
    unsubs.push(
      onSnapshot(
        makeScopedQuery('drivers'),
        (snap) => {
          if (!snap.empty) callbacks.onDrivers(snap.docs.map((d) => d.data() as Driver));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'drivers')
      )
    );

    unsubs.push(
      onSnapshot(
        makeScopedQuery('owners'),
        (snap) => {
          if (!snap.empty) callbacks.onOwners(snap.docs.map((d) => d.data() as Owner));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'owners')
      )
    );

    unsubs.push(
      onSnapshot(
        makeScopedQuery('safetyReports'),
        (snap) => {
          if (!snap.empty) callbacks.onReports(snap.docs.map((d) => d.data() as SafetyReport));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'safetyReports')
      )
    );

    unsubs.push(
      onSnapshot(
        makeScopedQuery('payments'),
        (snap) => {
          if (!snap.empty) callbacks.onPayments(snap.docs.map((d) => d.data() as PassengerTicketPayment));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
      )
    );

    unsubs.push(
      onSnapshot(
        makeScopedQuery('exitFees'),
        (snap) => {
          if (!snap.empty) callbacks.onExitFees(snap.docs.map((d) => d.data() as TerminalExitFee));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'exitFees')
      )
    );

    unsubs.push(
      onSnapshot(
        makeScopedQuery('settlements'),
        (snap) => {
          if (!snap.empty) {
            callbacks.onSettlements(
              snap.docs.map((d) => {
                const raw = d.data() as Omit<OwnerSettlement, 'payoutMethod' | 'status'> & {
                  payoutMethod: string;
                  status: string;
                };
                const normalizedMethod: OwnerSettlement['payoutMethod'] =
                  raw.payoutMethod === 'cash_handover'
                    ? 'cash'
                    : raw.payoutMethod === 'bank_account'
                    ? 'bank_account'
                    : 'telebirr';
                const normalizedStatus: OwnerSettlement['status'] =
                  raw.status === 'pending_handover' || raw.status === 'disputed' ? 'pending' : 'paid';
                return {
                  ...raw,
                  payoutMethod: normalizedMethod,
                  status: normalizedStatus,
                };
              })
            );
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'settlements')
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function syncArrayDiffToFirestore<T extends { id: string }>(
  colName: string,
  prevItems: T[],
  nextItems: T[],
  user: User | null,
  mapper: (item: T, uid: string, isCreate: boolean) => Record<string, unknown>,
  isAdminOverride?: boolean
): Promise<void> {
  if (!user || !user.emailVerified) return;

  const prevMap = new Map(prevItems.map((i) => [sanitizeId(i.id), i]));
  const nextMap = new Map(nextItems.map((i) => [sanitizeId(i.id), i]));
  const admin = isAdminOverride ?? isVerifiedAdmin(user);

  try {
    // Created or updated items
    for (const item of nextItems) {
      const id = sanitizeId(item.id);
      const prev = prevMap.get(id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
        const docRef = doc(db, colName, id);
        const existingSnap = await getDoc(docRef);
        const isCreate = !existingSnap.exists();
        const existingData = existingSnap.data();

        if (isCreate) {
          const payload = mapper({ ...item, id }, user.uid, true);
          await setDoc(docRef, payload);
        } else if (existingData) {
          const ownerUid = typeof existingData.createdBy === 'string' ? existingData.createdBy : user.uid;
          if (!admin && ownerUid !== user.uid) continue;

          const fullUpdate = mapper({ ...item, id }, ownerUid, false);
          if (admin) {
            await setDoc(docRef, fullUpdate, { merge: true });
          } else {
            // Non-admin update: keep only fields allowed by collection update rule
            const allowedSubset = pickNonAdminUpdateFields(colName, fullUpdate, existingData.status);
            await setDoc(docRef, allowedSubset, { merge: true });
          }
        }
      }
    }

    // Deleted items
    for (const prevItem of prevItems) {
      const id = sanitizeId(prevItem.id);
      if (!nextMap.has(id)) {
        const docRef = doc(db, colName, id);
        const existingSnap = await getDoc(docRef);
        if (existingSnap.exists()) {
          const ownerUid = existingSnap.data()?.createdBy;
          if (admin || ownerUid === user.uid) {
            await deleteDoc(docRef);
          }
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, colName);
  }
}

function pickNonAdminUpdateFields(
  colName: string,
  payload: Record<string, unknown>,
  existingStatus?: unknown
): Record<string, unknown> {
  const allowedByCollection: Record<string, string[]> = {
    vehicles: [
      'lat',
      'lng',
      'heading',
      'currentSpeed',
      'fuelLevel',
      'currentLocationName',
      'currentLocationImage',
      'lastUpdate',
      'status',
      'updatedAt',
    ],
    drivers: ['phone', 'status', 'assignedPlate', 'updatedAt'],
    owners: ['phone', 'email', 'city', 'vehiclesCount', 'activeVehicles', 'updatedAt'],
    queues: ['status', 'bookedSeats', 'exitFeePaid', 'totalCollectedEtb', 'updatedAt'],
    routes: ['standardTariffBirr', 'tollFee', 'roadQuality', 'updatedAt'],
    safetyReports: ['description', 'location', 'updatedAt'],
    payments: ['paymentStatus', 'paymentRefNumber', 'updatedAt'],
    settlements: ['status', 'transactionRef', 'receivedBy', 'settledAt', 'updatedAt'],
  };

  const keys = allowedByCollection[colName] || ['updatedAt'];
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (k in payload) {
      out[k] = payload[k];
    }
  }
  if (colName === 'safetyReports' && existingStatus === 'pending') {
    out.status = 'pending';
  }
  return out;
}
