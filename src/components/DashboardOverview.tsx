import React, { useState } from 'react';
import { 
  Activity, 
  Truck, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  Mic2, 
  FileSpreadsheet, 
  ArrowUpRight,
  Radio,
  CheckCircle2,
  Building2,
  Heart,
  Share2,
  CreditCard,
  Search,
  Navigation,
  FileCheck2,
  PhoneCall,
  Volume2,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Language, QueueTurn, SafetyReport, Vehicle } from '../types';
import { translations } from '../data/translations';
import { speakText } from '../utils/audio';

interface DashboardOverviewProps {
  vehicles: Vehicle[];
  queues: QueueTurn[];
  reports: SafetyReport[];
  currentLang: Language;
  onNavigateTab: (tab: string) => void;
  audioAlertsEnabled: boolean;
  activeRole?: 'user' | 'inspector';
  onRoleChange?: (role: 'user' | 'inspector') => void;
  onOpenShareModal?: () => void;
  onOpenContractModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vehicles,
  queues,
  reports,
  currentLang,
  onNavigateTab,
  audioAlertsEnabled,
  activeRole = 'user',
  onRoleChange,
  onOpenShareModal,
  onOpenContractModal,
}) => {
  const t = translations[currentLang];
  const [internalRole, setInternalRole] = useState<'user' | 'inspector'>(activeRole);

  const currentRole = onRoleChange ? activeRole : internalRole;
  const setRole = (role: 'user' | 'inspector') => {
    setInternalRole(role);
    if (onRoleChange) onRoleChange(role);
  };

  // Like system state in dashboard
  const [likeCount, setLikeCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transport_et_likes');
      return saved ? parseInt(saved, 10) : 1482;
    }
    return 1482;
  });
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transport_et_user_has_liked') === 'true';
    }
    return false;
  });

  const handleToggleLike = () => {
    if (hasLiked) {
      const next = Math.max(0, likeCount - 1);
      setLikeCount(next);
      setHasLiked(false);
      localStorage.setItem('transport_et_likes', next.toString());
      localStorage.setItem('transport_et_user_has_liked', 'false');
    } else {
      const next = likeCount + 1;
      setLikeCount(next);
      setHasLiked(true);
      localStorage.setItem('transport_et_likes', next.toString());
      localStorage.setItem('transport_et_user_has_liked', 'true');
      if (audioAlertsEnabled) {
        speakText('እናመሰግናለን! ስርዓቱን ወደዱት!', 'am');
      }
    }
  };

  // Passenger Journey Finder State (unrestricted origin & destination)
  const [searchOrigin, setSearchOrigin] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    route?: string;
    fare?: number;
    distance?: string;
    availableVehicles?: number;
  } | null>(null);

  const handleSearchJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrigin.trim() && !searchDestination.trim()) return;

    // Search existing queue or vehicles or simulate unrestricted route match
    const matchingQueue = queues.find(q => 
      q.routeName.toLowerCase().includes(searchOrigin.toLowerCase()) ||
      q.routeName.toLowerCase().includes(searchDestination.toLowerCase())
    );

    const baseFare = Math.floor(Math.random() * 250) + 120;
    const estDistance = `${Math.floor(Math.random() * 320) + 45} ኪ.ሜ`;
    const count = vehicles.filter(v => v.status === 'in_queue' || v.status === 'on_route').length;

    setSearchResult({
      found: true,
      route: `${searchOrigin || 'አዲስ አበባ'} ➔ ${searchDestination || 'መድረሻ'}`,
      fare: matchingQueue ? 280 : baseFare,
      distance: estDistance,
      availableVehicles: Math.max(1, count),
    });

    if (audioAlertsEnabled) {
      speakText(`${searchOrigin} ወደ ${searchDestination} የጉዞ መስመር ተገኝቷል`, 'am');
    }
  };

  // Metrics calculations
  const onRouteCount = vehicles.filter((v) => v.status === 'on_route').length;
  const inQueueCount = vehicles.filter((v) => v.status === 'in_queue').length;
  const overspeedCount = vehicles.filter((v) => v.currentSpeed > v.speedLimit).length;
  const criticalReports = reports.filter((r) => r.status === 'pending' || r.status === 'under_investigation').length;
  const todayPassengers = queues.reduce((acc, q) => acc + q.bookedSeats, 0) + 1420;

  return (
    <div className="space-y-6">
      {/* Role Switcher Tabs Header - Clean, Clutter-Free */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-2 sm:p-3 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setRole('user')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentRole === 'user'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>የተጠቃሚና መንገደኛ ዳሽቦርድ (Passenger/Citizen)</span>
          </button>

          <button
            onClick={() => setRole('inspector')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentRole === 'inspector'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>የተቆጣጣሪና ባለስልጣን ዳሽቦርድ (Inspector/Command)</span>
          </button>
        </div>

        {/* Social Like, Share & Smart Contract Fast Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              hasLiked
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-500/50 hover:text-rose-400'
            }`}
            title="ስርዓቱን ላይክ አድርግ"
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : 'text-rose-400'}`} />
            <span className="font-mono text-xs">{likeCount}</span>
          </button>

          {/* Share Button */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all shadow-sm"
              title="አጋራ / ሸር"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ሸር (Share)</span>
            </button>
          )}

          {/* Smart Contract Button */}
          {onOpenContractModal && (
            <button
              onClick={onOpenContractModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-500/50 shadow-md transition-all"
              title="የገንቢውና የተቋሙ ስማርት ውል"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ስማርት ውል</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: USER / CITIZEN DASHBOARD (የተጠቃሚና የመንገደኛ ዳሽቦርድ)
         ========================================================================= */}
      {currentRole === 'user' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Clean User Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    የተጠቃሚና የመንገደኛ አገልግሎት ማዕከል (Citizen Portal)
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  የትራንስፖርት ጉዞዎን ያቅዱ፣ ተራና ቲኬት ይከታተሉ
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  ከባጃጅ እስከ አገር አቋራጭ አውቶቡስ ያሉ ተሽከርካሪዎችን መነሻና መዳረሻ በየትኛውም ቦታ ይፈልጉ::
                </p>
              </div>

              {/* Passenger Quick Action Shortcuts */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onNavigateTab('liveTracking')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>የቀጥታ ጂፒኤስ ካርታ</span>
                </button>

                <button
                  onClick={() => onNavigateTab('safetyCitizenTips')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>ጥቆማ / SOS ስጥ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unrestricted Journey Finder Widget (መነሻና መዳረሻ ያለገደብ መፈለጊያ) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm sm:text-base">
                    የጉዞ መፈለጊያ እና የታሪፍ ማረጋገጫ (Trip & Tariff Finder)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    ያለገደብ በየትኛውም ከተማ፣ ወረዳ ወይም ገጠር መነሻና መዳረሻ ያስገቡ
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700">
                100% ያለገደብ ክፍት
              </span>
            </div>

            <form onSubmit={handleSearchJourney} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">መነሻ ቦታ (Origin)</label>
                <input
                  type="text"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  placeholder="ምሳሌ፡ አዲስ አበባ / መርካቶ / ጎጃም..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">መድረሻ ቦታ (Destination)</label>
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="ምሳሌ፡ ሀዋሳ / ባህር ዳር / ጅማ / ኬላ..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-4 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>ተሽከርካሪና ታሪፍ ፈልግ</span>
                </button>
              </div>
            </form>

            {/* Journey Search Result Box */}
            {searchResult && (
              <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-emerald-300">{searchResult.route}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      {searchResult.distance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ህጋዊ የትራንስፖርት ታሪፍ፡ <strong className="text-amber-400 font-mono text-sm">{searchResult.fare} ብር</strong> | በቅርብ የሚገኙ ተሽከርካሪዎች፡ <strong className="text-white font-mono">{searchResult.availableVehicles}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateTab('paymentsSettlements')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>የቲኬት ክፍያ ፈጽም</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('liveTracking')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700"
                  >
                    በካርታ እይ ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Passenger Live Terminal Board & Vehicle Types */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Terminal Live Board */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    የመናኸሪያዎች የቀጥታ መነሻ ሰሌዳ (Active Departures)
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('queueTurns')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  ተጨማሪ ተራዎችን እይ ➔
                </button>
              </div>

              <div className="space-y-2.5">
                {queues.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/70 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center border border-slate-700 text-xs">
                        #{q.turnNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{q.plateNumber}</span>
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                            {q.vehicleType}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{q.routeName}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          q.status === 'boarding'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : q.status === 'waiting'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {q.status === 'boarding' ? 'በመጫን ላይ' : q.status === 'waiting' ? 'በመጠበቅ ላይ' : 'ተሸኝቷል'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ክፍት ወንበር፡ {Math.max(0, q.capacity - q.bookedSeats)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Vehicle Type Directory & Passenger Tools */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>ሁሉንም ያካተተ የተሽከርካሪ መደቦች</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2.5">
                    <span className="text-xl">🛺</span>
                    <div>
                      <strong className="text-white block text-xs">ባጃጅ / ባለ 3 እግር</strong>
                      <span className="text-[10px] text-slate-400">የአካባቢ ፈጣን ጉዞ</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2.5">
                    <span className="text-xl">🚐</span>
                    <div>
                      <strong className="text-white block text-xs">ሚኒባስ / ዳማስ</strong>
                      <span className="text-[10px] text-slate-400">የከተማና የቅርብ ርቀት</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2.5">
                    <span className="text-xl">🚌</span>
                    <div>
                      <strong className="text-white block text-xs">አገር አቋራጭ አውቶቡስ</strong>
                      <span className="text-[10px] text-slate-400">ደረጃ 1፣ 2 እና 3</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2.5">
                    <span className="text-xl">🚚</span>
                    <div>
                      <strong className="text-white block text-xs">የጭነት ተሽከርካሪዎች</strong>
                      <span className="text-[10px] text-slate-400">ሲኖትራክና አይሱዙ</span>
                    </div>
                  </div>
                </div>

                {/* Direct Help Shortcuts */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>ነጻ የጥቆማ መስመር፡ <strong className="text-amber-400 font-mono">991</strong></span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('voiceTranslator')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    ባለብዙ ቋንቋ ተርጓሚ ➔
                  </button>
                </div>
              </div>

              {/* Digital Payment / Settlement Quick Card */}
              <div 
                onClick={() => onNavigateTab('paymentsSettlements')}
                className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-3xl p-4 shadow-lg cursor-pointer hover:border-emerald-400/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">ዲጂታል የትራንስፖርት ክፍያና ርክክብ</h4>
                      <p className="text-[11px] text-slate-400">የቴሌብርና ሲቢኢ የቲኬት ክፍያ ፈጽም ወይም የርክክብ ደረሰኝ እይ</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: INSPECTOR & AUTHORITY COMMAND DASHBOARD (የተቆጣጣሪና ባለስልጣን ዳሽቦርድ)
         ========================================================================= */}
      {currentRole === 'inspector' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Authority Command Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 border border-cyan-500/40 p-6 sm:p-7 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    የመንገድና ትራንስፖርት ባለስልጣን የቁጥጥርና ትእዛዝ ክፍል (Authority Command)
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  የአገር አቀፍ የፍሊት፣ የኬላና የተራ የቀጥታ ቁጥጥር
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  የፍጥነት ወሰን ጥሰት፣ የኬላ መውጫ ክፍያ፣ የደህንነት ጥቆማዎችና ህጋዊ የውል ስምምነት ክትትል::
                </p>
              </div>

              {/* Inspector Fast Action Shortcuts */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => onNavigateTab('reportsExport')}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>ኤክሴል ሪፖርት አውርድ</span>
                </button>

                {onOpenContractModal && (
                  <button
                    onClick={onOpenContractModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/60"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>የተቋሙ ስማርት ውል</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Primary Inspector KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Fleet */}
            <div
              onClick={() => onNavigateTab('vehicles')}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg hover:border-cyan-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{t.totalVehicles}</span>
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">{vehicles.length}</span>
                <span className="text-xs text-cyan-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 100% በጂፒኤስ ቁጥጥር ስር
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">ከባጃጅ እስከ አገር አቋራጭ</p>
            </div>

            {/* Metric 2: Active on Road */}
            <div
              onClick={() => onNavigateTab('liveTracking')}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{t.activeOnRoute}</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">{onRouteCount}</span>
                <span className="text-xs text-slate-400">በጉዞ ላይ</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">በቀጥታ ሳተላይት ክትትል</p>
            </div>

            {/* Metric 3: Safety Violations */}
            <div
              onClick={() => onNavigateTab('safetyCitizenTips')}
              className={`rounded-3xl p-5 shadow-lg cursor-pointer transition-all border ${
                overspeedCount > 0
                  ? 'bg-red-950/40 border-red-500/80 hover:border-red-400 shadow-red-950/50 animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">የፍጥነት ወሰን ጥሰት</span>
                <div className="p-2.5 bg-red-500/20 text-red-400 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-red-400 font-mono">{overspeedCount}</span>
                <span className="text-xs text-red-300 font-semibold">ተሽከርካሪዎች</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {criticalReports} አዳዲስ የተጠቃሚ ጥቆማዎች
              </p>
            </div>

            {/* Metric 4: Queue Flow */}
            <div
              onClick={() => onNavigateTab('queueTurns')}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg hover:border-purple-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">የመናኸሪያ ተራ ሁኔታ</span>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-400 font-mono">{inQueueCount}</span>
                <span className="text-xs text-purple-300 font-semibold">በተራ መጠበቂያ</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{todayPassengers} ዛሬ የተጓጓዙ ተሳፋሪዎች</p>
            </div>
          </div>

          {/* Inspector Controls Grid: Queue Dispatch & Smart Contract Bilateral Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Queue Dispatch Control */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">
                    የተቆጣጣሪ የተራ ጥሪ እና የፍተሻ ሰሌዳ (Queue Dispatcher)
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('queueTurns')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  ተራ አስተዳድር ➔
                </button>
              </div>

              <div className="space-y-2.5">
                {queues.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center border border-slate-700">
                        #{q.turnNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-mono">{q.plateNumber}</strong>
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                            {q.driverName}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{q.routeName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (audioAlertsEnabled) {
                            speakText(`ተራ ቁጥር ${q.turnNumber} ታርጋ ${q.plateNumber} ወደ መጫኛ መድረክ ይግቡ!`, 'am');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white rounded-lg border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="ተራ ጥሪ አሰማ"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>ጥሪ አሰማ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Contract & Checkpoint Readiness Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Smart Contract Card */}
              <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-amber-900/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white text-xs">ስማርት የውል ስምምነት (Active Contract)</h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    የጸደቀ / 100% ህጋዊ
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5 text-[11px]">
                    <span className="text-slate-400">ገንቢ / አርክቴክት፡</span>
                    <span className="font-semibold text-white">Senior Software Engineering Architect</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5 text-[11px]">
                    <span className="text-slate-400">ተቋም / ባለስልጣን፡</span>
                    <span className="font-semibold text-white">አቶ ዘበነ አስፋው (ዋና ዳይሬክተር)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">የውል መጠንና ዋስትና፡</span>
                    <span className="font-bold text-amber-400 font-mono">3,850,000 ብር (24 ወራት)</span>
                  </div>
                </div>

                {onOpenContractModal && (
                  <button
                    onClick={onOpenContractModal}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>ሙሉውን የውል ስምምነት ሰነድ ክፈት</span>
                  </button>
                )}
              </div>

              {/* National Checkpoints Status */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>የአገር አቀፍ የፍተሻ ኬላዎች ዝግጁነት</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  ሞጆ፣ አዋሽ፣ ቆቃ፣ ደብረ ብርሃን እና ደጀን የፍተሻ ኬላዎች ከሳተላይት መቆጣጠሪያው ጋር በተገናኘ መስመር እየሰሩ ናቸው።
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
