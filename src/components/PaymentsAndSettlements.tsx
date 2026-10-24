import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  ArrowRightLeft, 
  CheckCircle, 
  Printer, 
  Plus, 
  Search, 
  DollarSign, 
  Download, 
  Building2, 
  Truck, 
  User, 
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Language, 
  Owner, 
  OwnerSettlement, 
  PassengerTicketPayment, 
  QueueTurn, 
  TerminalExitFee, 
  Vehicle 
} from '../types';
import { translations } from '../data/translations';
import { playSuccessTone, speakText } from '../utils/audio';

interface PaymentsAndSettlementsProps {
  payments: PassengerTicketPayment[];
  exitFees: TerminalExitFee[];
  settlements: OwnerSettlement[];
  vehicles: Vehicle[];
  owners: Owner[];
  queues: QueueTurn[];
  currentLang: Language;
  onUpdatePayments: (payments: PassengerTicketPayment[]) => void;
  onUpdateExitFees: (fees: TerminalExitFee[]) => void;
  onUpdateSettlements: (settlements: OwnerSettlement[]) => void;
  onUpdateQueues: (queues: QueueTurn[]) => void;
  audioAlertsEnabled: boolean;
}

export const PaymentsAndSettlements: React.FC<PaymentsAndSettlementsProps> = ({
  payments,
  exitFees,
  settlements,
  vehicles,
  owners,
  queues,
  currentLang,
  onUpdatePayments,
  onUpdateExitFees,
  onUpdateSettlements,
  onUpdateQueues,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [activeSubTab, setActiveSubTab] = useState<'passenger' | 'exit_fee' | 'settlement'>('passenger');

  // Modal states
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [exitFeeModalOpen, setExitFeeModalOpen] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // New ticket payment form
  const [passName, setPassName] = useState('');
  const [passPhone, setPassPhone] = useState('+251 9');
  const [passPlate, setPassPlate] = useState(vehicles[0]?.plateNumber || '');
  const [passRoute, setPassRoute] = useState('አዲስ አበባ - ሀዋሳ');
  const [passSeat, setPassSeat] = useState(1);
  const [passAmount, setPassAmount] = useState(450);
  const [passMethod, setPassMethod] = useState<'telebirr' | 'cbe_birr' | 'cash' | 'bank_transfer'>('telebirr');
  const [passRef, setPassRef] = useState(`TEL-${Math.floor(10000000 + Math.random() * 90000000)}`);

  // New exit fee form
  const [exitPlate, setExitPlate] = useState(vehicles[0]?.plateNumber || '');
  const [exitFeeAmount, setExitFeeAmount] = useState(150);
  const [exitMethod, setExitMethod] = useState<'telebirr' | 'cash' | 'cbe_birr'>('telebirr');
  const [exitInspector, setExitInspector] = useState('የጣቢያ ተቆጣጣሪ ካሳሁን');

  // New settlement form
  const [stlOwner, setStlOwner] = useState(owners[0]?.name || 'ሰላም የሕዝብ ማመላለሻ አ.ማ');
  const [stlPlate, setStlPlate] = useState(vehicles[0]?.plateNumber || '');
  const [stlRoute, setStlRoute] = useState('አዲስ አበባ - ሀዋሳ');
  const [stlPassengers, setStlPassengers] = useState(48);
  const [stlGross, setStlGross] = useState(21600); // 48 * 450
  const [stlExitFeeDeduction, setStlExitFeeDeduction] = useState(200);
  const [stlCommission, setStlCommission] = useState(500);
  const [stlPayoutMethod, setStlPayoutMethod] = useState<'telebirr' | 'bank_account' | 'cash'>('bank_account');
  const [stlAccount, setStlAccount] = useState('CBE 100029384712');
  const [stlReceiver, setStlReceiver] = useState('አቶ ግርማ (የባለቤቱ ህጋዊ ተወካይ)');

  // Auto-calculate net payout
  const netCalculated = Math.max(0, stlGross - stlExitFeeDeduction - stlCommission);

  // Handlers
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passName) return;

    const newPayment: PassengerTicketPayment = {
      id: `pay_${Date.now()}`,
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      passengerName: passName,
      passengerPhone: passPhone,
      vehiclePlate: passPlate,
      routeName: passRoute,
      seatNumber: Number(passSeat),
      amountBirr: Number(passAmount),
      paymentMethod: passMethod,
      paymentRefNumber: passRef,
      paymentStatus: 'completed',
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onUpdatePayments([newPayment, ...payments]);
    setTicketModalOpen(false);

    if (audioAlertsEnabled) {
      playSuccessTone();
    }
    speakText(`ክፍያ ተፈጽሟል! የትኬት ቁጥር ${newPayment.ticketNumber} ወንበር ቁጥር ${newPayment.seatNumber}`, 'am');
  };

  const handleCreateExitFee = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = vehicles.find((v) => v.plateNumber === exitPlate);

    const newExitFee: TerminalExitFee = {
      id: `exit_${Date.now()}`,
      queueTurnId: `q_${Date.now()}`,
      vehiclePlate: exitPlate,
      vehicleType: matched?.vehicleType || 'bus',
      ownerName: matched?.ownerName || 'የግል ባለንብረት',
      driverName: matched?.driverName || 'አሽከርካሪ',
      routeName: matched?.routeName || 'አገር አቀፍ መስመር',
      feeAmountBirr: Number(exitFeeAmount),
      paymentMethod: exitMethod,
      paymentRef: `RCP-EXT-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptNumber: `GATE-${Date.now().toString().slice(-6)}`,
      dispatchedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clearedByInspector: exitInspector,
    };

    onUpdateExitFees([newExitFee, ...exitFees]);

    // Mark exit fee paid in queue if vehicle is in queue
    const updatedQueues = queues.map((q) =>
      q.plateNumber === exitPlate ? { ...q, exitFeePaid: true } : q
    );
    onUpdateQueues(updatedQueues);

    setExitFeeModalOpen(false);

    if (audioAlertsEnabled) {
      playSuccessTone();
    }
    speakText(`የመውጫ ኬላ ክፍያ ${exitFeeAmount} ብር ተከፍሏል፤ ተሽከርካሪው መውጣት ይችላል።`, 'am');
  };

  const handleCreateSettlement = (e: React.FormEvent) => {
    e.preventDefault();

    const newStl: OwnerSettlement = {
      id: `stl_${Date.now()}`,
      settlementNumber: `STL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: 'own_selected',
      ownerName: stlOwner,
      vehiclePlate: stlPlate,
      routeName: stlRoute,
      periodDate: new Date().toISOString().split('T')[0],
      totalPassengersCount: Number(stlPassengers),
      grossFaresCollectedBirr: Number(stlGross),
      terminalServiceFeeDeductedBirr: Number(stlExitFeeDeduction),
      associationCommissionBirr: Number(stlCommission),
      netPayoutToOwnerBirr: netCalculated,
      payoutMethod: stlPayoutMethod,
      payoutAccountOrPhone: stlAccount,
      transactionRef: `TRX-${Date.now().toString().slice(-8)}`,
      status: 'paid',
      handedOverBy: 'የመናኸሪያ ዋና ገንዘብ ያዥ',
      receivedBy: stlReceiver,
      settledAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onUpdateSettlements([newStl, ...settlements]);
    setSettlementModalOpen(false);

    if (audioAlertsEnabled) {
      playSuccessTone();
    }
    speakText(`ለባለተሽከርካሪው የተጣራ ${netCalculated} ብር የሂሳብ ርክክብ ተጠናቋል!`, 'am');
  };

  // Quick auto-set exit fee by vehicle type
  const handleVehiclePlateChangeForExit = (plate: string) => {
    setExitPlate(plate);
    const v = vehicles.find((item) => item.plateNumber === plate);
    if (!v) return;
    if (v.vehicleType === 'bajaj' || v.vehicleType === 'motorcycle') setExitFeeAmount(15);
    else if (v.vehicleType === 'damas' || v.vehicleType === 'taxi') setExitFeeAmount(40);
    else if (v.vehicleType === 'minibus') setExitFeeAmount(70);
    else if (v.vehicleType === 'midibus') setExitFeeAmount(120);
    else if (v.vehicleType === 'bus' || v.vehicleType === 'vip_coach') setExitFeeAmount(200);
    else if (v.vehicleType === 'truck') setExitFeeAmount(250);
  };

  const totalFaresCollected = payments.reduce((acc, p) => acc + p.amountBirr, 0);
  const totalExitFeesCollected = exitFees.reduce((acc, e) => acc + e.feeAmountBirr, 0);
  const totalSettledToOwners = settlements.reduce((acc, s) => acc + s.netPayoutToOwnerBirr, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              {t.paymentsSettlements} (Fare Collection, Gate Exit Fee & Owner Payouts)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            የተሳፋሪ ዲጂታል ታሪፍ ክፍያ፣ የተሽከርካሪ መናኸሪያ መውጫ ክፍያና ለባለተሽከርካሪው የተሰበሰበው ብር ህጋዊ የርክክብ ስርዓት
          </p>
        </div>

        {/* Global Financial Summary Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 block">የተሰበሰበ ታሪፍ</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {totalFaresCollected.toLocaleString()} ETB
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 block">ለመውጫ የተከፈለ</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {totalExitFeesCollected.toLocaleString()} ETB
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 block">ለባለቤቶች የተረከበ</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {totalSettledToOwners.toLocaleString()} ETB
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('passenger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'passenger'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>1. {t.passengerFares} ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exit_fee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'exit_fee'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>2. {t.terminalExitFee} ({exitFees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settlement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'settlement'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>3. {t.ownerSettlements} ({settlements.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PASSENGER FARES */}
      {activeSubTab === 'passenger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">የተሳፋሪዎች የትራንስፖርት ትኬት ክፍያ መዝገብ</h3>
              <p className="text-xs text-slate-400">
                ቴሌብር፣ የኢትዮጵያ ንግድ ባንክ (CBE Birr) እና ጥሬ ገንዘብ ክፍያዎች
              </p>
            </div>

            <button
              onClick={() => setTicketModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>{t.collectFare}</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">የትኬት ቁጥር</th>
                    <th className="px-4 py-3">ተሳፋሪ</th>
                    <th className="px-4 py-3">ተሽከርካሪና መስመር</th>
                    <th className="px-4 py-3">ወንበር</th>
                    <th className="px-4 py-3">የክፍያ ዘዴ / Ref</th>
                    <th className="px-4 py-3">የተከፈለው ብር</th>
                    <th className="px-4 py-3">ሁኔታ</th>
                    <th className="px-4 py-3 text-right">ሰነድ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {p.ticketNumber}
                        <span className="block text-[10px] text-slate-500">{p.issuedAt}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white">{p.passengerName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{p.passengerPhone}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-amber-300 font-bold">{p.vehiclePlate}</span>
                        <span className="block text-[10px] text-slate-400">{p.routeName}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        #{p.seatNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 font-mono">
                          {p.paymentMethod}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{p.paymentRefNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-300 text-sm">
                        {p.amountBirr} ETB
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ተረጋግጧል ✓
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt({ type: 'ticket', data: p })}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
                          title="ትኬት አትም"
                        >
                          <Printer className="w-4 h-4 text-emerald-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TERMINAL EXIT FEE */}
      {activeSubTab === 'exit_fee' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">የተሽከርካሪዎች መናኸሪያ መውጫ ክፍያ (Gate Exit Toll)</h3>
              <p className="text-xs text-slate-400">
                ከባጃጅ እስከ ትላልቅ አውቶቡሶች መናኸሪያውን ለቀው ሲወጡ የሚከፍሉት የአገልግሎት ክፍያ
              </p>
            </div>

            <button
              onClick={() => setExitFeeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>{t.payExitFee}</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">ደረሰኝ / Pass ቁጥር</th>
                    <th className="px-4 py-3">ተሽከርካሪና ዓይነት</th>
                    <th className="px-4 py-3">ባለቤትና አሽከርካሪ</th>
                    <th className="px-4 py-3">መስመር</th>
                    <th className="px-4 py-3">የመውጫ ክፍያ</th>
                    <th className="px-4 py-3">ያረጋገጠው ተቆጣጣሪ</th>
                    <th className="px-4 py-3 text-right">ሰነድ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {exitFees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-cyan-400">
                        {e.receiptNumber}
                        <span className="block text-[10px] text-slate-500">{e.dispatchedAt}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-amber-300 font-bold">{e.vehiclePlate}</span>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">{e.vehicleType}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-white">{e.ownerName}</span>
                        <span className="block text-[10px] text-slate-400">{e.driverName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-200">
                        {e.routeName}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-cyan-300 text-sm">
                        {e.feeAmountBirr} ETB
                        <span className="block text-[10px] text-slate-500 uppercase">{e.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {e.clearedByInspector}
                        <span className="block text-[10px] text-emerald-400 font-semibold">መውጫ ተፈቅዷል ✓</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt({ type: 'exit_pass', data: e })}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
                          title="የመውጫ ወረቀት አትም"
                        >
                          <Printer className="w-4 h-4 text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: OWNER SETTLEMENT & PAYOUT */}
      {activeSubTab === 'settlement' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">ለባለተሽከርካሪው የተሰበሰበው ብር የሂሳብ ርክክብ (Owner Cash Settlement)</h3>
              <p className="text-xs text-slate-400">
                ጠቅላላ የተሰበሰበውን የታሪፍ ገቢ፣ የመውጫና የአገልግሎት ክፍያ ተቀንሶ ለባለቤቱ የተጣራ ክፍያ ማስረከቢያ
              </p>
            </div>

            <button
              onClick={() => setSettlementModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>{t.handoverPayout}</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">የሰነድ ቁጥር</th>
                    <th className="px-4 py-3">ባለቤት / ማህበር</th>
                    <th className="px-4 py-3">ተሽከርካሪና መስመር</th>
                    <th className="px-4 py-3">ተሳፋሪ</th>
                    <th className="px-4 py-3">ጠቅላላ ገቢ</th>
                    <th className="px-4 py-3">ተቀናሽ (መውጫ/ማህበር)</th>
                    <th className="px-4 py-3">የተጣራ የተረከበው</th>
                    <th className="px-4 py-3">የተረካቢ ስም / ሂሳብ</th>
                    <th className="px-4 py-3 text-right">ርክክብ ሰነድ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-amber-400">
                        {s.settlementNumber}
                        <span className="block text-[10px] text-slate-500">{s.settledAt}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {s.ownerName}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-amber-300 font-bold">{s.vehiclePlate}</span>
                        <span className="block text-[10px] text-slate-400">{s.routeName}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {s.totalPassengersCount} ተሳፋሪ
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {s.grossFaresCollectedBirr.toLocaleString()} ETB
                      </td>
                      <td className="px-4 py-3.5 font-mono text-red-400">
                        -{(s.terminalServiceFeeDeductedBirr + s.associationCommissionBirr).toLocaleString()} ETB
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-400 text-sm">
                        {s.netPayoutToOwnerBirr.toLocaleString()} ETB
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-200">{s.receivedBy}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{s.payoutAccountOrPhone}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt({ type: 'settlement', data: s })}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
                          title="የገንዘብ ርክክብ ሰነድ አትም"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PASSENGER TICKET PAYMENT */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">የተሳፋሪ ታሪፍ ክፍያና የትኬት መስጫ</h3>
              </div>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የተሳፋሪ ስም *</label>
                  <input
                    type="text"
                    required
                    placeholder="ሙሉ ስም"
                    value={passName}
                    onChange={(e) => setPassName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ስልክ ቁጥር</label>
                  <input
                    type="text"
                    required
                    value={passPhone}
                    onChange={(e) => setPassPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ተሽከርካሪ ሰሌዳ (ከባጃጅ እስከ አውቶቡስ)</label>
                  <select
                    value={passPlate}
                    onChange={(e) => setPassPlate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plateNumber}>
                        {v.plateNumber} ({v.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የወንበር ቁጥር</label>
                  <input
                    type="number"
                    min="1"
                    value={passSeat}
                    onChange={(e) => setPassSeat(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">የጉዞ መስመር</label>
                <input
                  type="text"
                  required
                  value={passRoute}
                  onChange={(e) => setPassRoute(e.target.value)}
                  placeholder="የትኛውም መነሻ እና መዳረሻ..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የክፍያ ዘዴ</label>
                  <select
                    value={passMethod}
                    onChange={(e) => setPassMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="telebirr">ቴሌብር (Telebirr)</option>
                    <option value="cbe_birr">ንግድ ባንክ ብር (CBE Birr)</option>
                    <option value="cash">ጥሬ ገንዘብ (Cash)</option>
                    <option value="bank_transfer">የባንክ ዝውውር</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የታሪፍ ዋጋ (ብር)</label>
                  <input
                    type="number"
                    min="1"
                    value={passAmount}
                    onChange={(e) => setPassAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">የግብይት መለያ (Transaction / Ref No)</label>
                <input
                  type="text"
                  value={passRef}
                  onChange={(e) => setPassRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ክፍያ ተቀበልና ትኬት ቁረጥ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TERMINAL EXIT FEE */}
      {exitFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">የተሽከርካሪ መናኸሪያ መውጫ ክፍያ (Gate Exit Toll)</h3>
              </div>
              <button
                onClick={() => setExitFeeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExitFee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">የተሽከርካሪ ሰሌዳ ይምረጡ</label>
                <select
                  value={exitPlate}
                  onChange={(e) => handleVehiclePlateChangeForExit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} - {v.makeModel} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የመውጫ ክፍያ መጠን (ብር)</label>
                  <input
                    type="number"
                    min="5"
                    value={exitFeeAmount}
                    onChange={(e) => setExitFeeAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    (ባጃጅ: 15 ብር | ሚኒባስ: 70 ብር | አውቶቡስ: 200 ብር)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">የክፍያ ዘዴ</label>
                  <select
                    value={exitMethod}
                    onChange={(e) => setExitMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="telebirr">ቴሌብር (Telebirr QR)</option>
                    <option value="cash">ጥሬ ገንዘብ በኬላ</option>
                    <option value="cbe_birr">ንግድ ባንክ ብር</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ያረጋገጠው ተቆጣጣሪ</label>
                <input
                  type="text"
                  value={exitInspector}
                  onChange={(e) => setExitInspector(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExitFeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ክፍያውን አረጋግጥና መውጫ ፍቀድ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: OWNER SETTLEMENT & CASH PAYOUT */}
      {settlementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">ለባለተሽከርካሪው የተሰበሰበውን ብር ማስረከቢያ (Settlement)</h3>
              </div>
              <button
                onClick={() => setSettlementModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ባለቤት / ማህበር</label>
                  <input
                    type="text"
                    required
                    value={stlOwner}
                    onChange={(e) => setStlOwner(e.target.value)}
                    placeholder="የባለቤቱ ወይም ማህበሩ ስም..."
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ተሽከርካሪ ሰሌዳ</label>
                  <select
                    value={stlPlate}
                    onChange={(e) => setStlPlate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plateNumber}>
                        {v.plateNumber} ({v.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የጉዞ መስመር</label>
                  <input
                    type="text"
                    value={stlRoute}
                    onChange={(e) => setStlRoute(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የተጓጓዙ ተሳፋሪዎች ቁጥር</label>
                  <input
                    type="number"
                    value={stlPassengers}
                    onChange={(e) => setStlPassengers(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-slate-200 block text-xs border-b border-slate-700 pb-1">
                  የሂሳብ ስሌት መግለጫ (Financial Breakdown):
                </span>

                <div className="flex justify-between items-center text-slate-300">
                  <span>ጠቅላላ የተሰበሰበ ታሪፍ (Gross Fares):</span>
                  <input
                    type="number"
                    value={stlGross}
                    onChange={(e) => setStlGross(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>ተቀናሽ የመናኸሪያ መውጫ ክፍያ:</span>
                  <input
                    type="number"
                    value={stlExitFeeDeduction}
                    onChange={(e) => setStlExitFeeDeduction(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-red-400"
                  />
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>ተቀናሽ የማህበር ኮሚሽን / መዋጮ:</span>
                  <input
                    type="number"
                    value={stlCommission}
                    onChange={(e) => setStlCommission(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-red-400"
                  />
                </div>

                <div className="flex justify-between items-center text-slate-100 pt-2 border-t border-slate-700 font-bold">
                  <span className="text-emerald-400">ለባለቤቱ የተጣራ የሚከፈል (Net Payout):</span>
                  <span className="font-mono text-lg text-emerald-400">
                    {netCalculated.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የክፍያ ማስተላለፊያ መንገድ</label>
                  <select
                    value={stlPayoutMethod}
                    onChange={(e) => setStlPayoutMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="bank_account">የባንክ ሂሳብ ቁጥር (Bank Account)</option>
                    <option value="telebirr">ቴሌብር (Telebirr Payout)</option>
                    <option value="cash">ጥሬ ገንዘብ ርክክብ (Cash Voucher)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የባንክ / ቴሌብር ሂሳብ ቁጥር</label>
                  <input
                    type="text"
                    required
                    value={stlAccount}
                    onChange={(e) => setStlAccount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ገንዘቡን የተረከበው ህጋዊ ሰው ስም</label>
                <input
                  type="text"
                  required
                  value={stlReceiver}
                  onChange={(e) => setStlReceiver(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  ሂሳብ አስረክብና ሰነድ አዘጋጅ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT / VOUCHER MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border-4 border-slate-800 font-sans">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="font-extrabold uppercase text-xs">የመንገድና ትራንስፖርት ባለስልጣን</h4>
                <p className="text-[10px] text-slate-600">ህጋዊ የክፍያና ርክክብ ሰነድ</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedReceipt.type === 'ticket' && (
              <div className="space-y-2 text-xs">
                <div className="text-center bg-slate-100 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">የተሳፋሪ ዲጂታል ትኬት</span>
                  <span className="font-mono font-extrabold text-base text-emerald-800">
                    {selectedReceipt.data.ticketNumber}
                  </span>
                </div>

                <div className="space-y-1.5 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ተሳፋሪ:</span>
                    <span className="font-bold">{selectedReceipt.data.passengerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ተሽከርካሪ ሰሌዳ:</span>
                    <span className="font-mono font-bold">{selectedReceipt.data.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">የጉዞ መስመር:</span>
                    <span className="font-semibold">{selectedReceipt.data.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">የወንበር ቁጥር:</span>
                    <span className="font-bold font-mono">#{selectedReceipt.data.seatNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">የክፍያ ዘዴ:</span>
                    <span className="font-mono uppercase">{selectedReceipt.data.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold text-sm">
                    <span>የተከፈለ ታሪፍ:</span>
                    <span className="text-emerald-700 font-mono">{selectedReceipt.data.amountBirr} ETB</span>
                  </div>
                </div>
              </div>
            )}

            {selectedReceipt.type === 'exit_pass' && (
              <div className="space-y-2 text-xs">
                <div className="text-center bg-slate-100 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">የመናኸሪያ መውጫ ፈቃድ ሰነድ (Gate Exit Pass)</span>
                  <span className="font-mono font-extrabold text-base text-cyan-800">
                    {selectedReceipt.data.receiptNumber}
                  </span>
                </div>

                <div className="space-y-1.5 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ተሽከርካሪ ሰሌዳ:</span>
                    <span className="font-mono font-bold text-sm">{selectedReceipt.data.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ዓይነት:</span>
                    <span className="font-semibold uppercase">{selectedReceipt.data.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ባለቤት:</span>
                    <span className="font-medium">{selectedReceipt.data.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">መስመር:</span>
                    <span className="font-medium">{selectedReceipt.data.routeName}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold text-sm">
                    <span>የተከፈለ የመውጫ ክፍያ:</span>
                    <span className="text-cyan-800 font-mono">{selectedReceipt.data.feeAmountBirr} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ያረጋገጠው ተቆጣጣሪ:</span>
                    <span>{selectedReceipt.data.clearedByInspector}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedReceipt.type === 'settlement' && (
              <div className="space-y-2 text-xs">
                <div className="text-center bg-slate-100 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">ህጋዊ የባለተሽከርካሪ የገንዘብ ርክክብ ሰነድ (Settlement Voucher)</span>
                  <span className="font-mono font-extrabold text-base text-amber-800">
                    {selectedReceipt.data.settlementNumber}
                  </span>
                </div>

                <div className="space-y-1.5 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ባለቤት:</span>
                    <span className="font-bold">{selectedReceipt.data.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ተሽከርካሪ ሰሌዳ:</span>
                    <span className="font-mono font-bold">{selectedReceipt.data.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ጠቅላላ የተሰበሰበ ታሪፍ:</span>
                    <span className="font-mono">{selectedReceipt.data.grossFaresCollectedBirr.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>ተቀናሽ (መውጫና ማህበር):</span>
                    <span className="font-mono">-{(selectedReceipt.data.terminalServiceFeeDeductedBirr + selectedReceipt.data.associationCommissionBirr).toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between border-t border-b py-1.5 font-extrabold text-sm text-emerald-800">
                    <span>ለባለቤቱ የተጣራ የተረከበው:</span>
                    <span className="font-mono">{selectedReceipt.data.netPayoutToOwnerBirr.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ተረካቢ:</span>
                    <span className="font-bold">{selectedReceipt.data.receivedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">የክፍያ ሂሳብ / ስልክ:</span>
                    <span className="font-mono">{selectedReceipt.data.payoutAccountOrPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Barcode representation */}
            <div className="text-center pt-2 border-t">
              <div className="w-36 h-9 bg-slate-900 mx-auto flex items-center justify-center text-white text-[10px] font-mono tracking-widest rounded">
                |||| OFFICIAL VERIFIED ||||
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow hover:bg-black"
              >
                <Printer className="w-4 h-4" />
                <span>አትም (Print Document)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
