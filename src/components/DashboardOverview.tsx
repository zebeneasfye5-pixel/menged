import React from 'react';
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
  TrendingUp, 
  ArrowUpRight,
  Radio,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Language, QueueTurn, SafetyReport, Vehicle } from '../types';
import { translations } from '../data/translations';

interface DashboardOverviewProps {
  vehicles: Vehicle[];
  queues: QueueTurn[];
  reports: SafetyReport[];
  currentLang: Language;
  onNavigateTab: (tab: string) => void;
  audioAlertsEnabled: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vehicles,
  queues,
  reports,
  currentLang,
  onNavigateTab,
}) => {
  const t = translations[currentLang];

  const onRouteCount = vehicles.filter((v) => v.status === 'on_route').length;
  const inQueueCount = vehicles.filter((v) => v.status === 'in_queue').length;
  const overspeedCount = vehicles.filter((v) => v.currentSpeed > v.speedLimit).length;
  const criticalReports = reports.filter((r) => r.status === 'pending' || r.status === 'under_investigation').length;
  const todayPassengers = queues.reduce((acc, q) => acc + q.bookedSeats, 0) + 1420;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>የቀጥታ ስራ ላይ የሚገኝ ብሔራዊ የትራንስፖርት ስርዓት (Active System v3.8)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              የመንገድ እና ትራንስፖርት ተቋም የቁጥጥርና ትእዛዝ ዳሽቦርድ
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              የተሽከርካሪዎችን፣ የአሽከርካሪዎችን፣ የባለተሽከርካሪዎችን፣ የተሽከርካሪ ተራዎችን፣ የቀጥታ የጉዞ ጂፒኤስ ክትትልና የትራፊክ ደህንነትን በዘመናዊ መረጃ፣ ምስል፣ ድምፅና ባለብዙ ቋንቋ ተርጓሚ ስርዓት የሚያስተዳድር ፖርታል::
            </p>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('liveTracking')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>የቀጥታ ጂፒኤስ ካርታ ክፈት</span>
            </button>

            <button
              onClick={() => onNavigateTab('voiceTranslator')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <Mic2 className="w-4 h-4" />
              <span>የቀጥታ ድምፅ ተርጓሚ (Voice Intercom)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Fleet */}
        <div
          onClick={() => onNavigateTab('vehicles')}
          className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-emerald-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.totalVehicles}</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{vehicles.length}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% ጂፒኤስ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">የፍጥነት መቆጣጠሪያ የተገጠመላቸው</p>
        </div>

        {/* Metric 2: Active on Road */}
        <div
          onClick={() => onNavigateTab('liveTracking')}
          className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-cyan-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.activeOnRoute}</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">{onRouteCount}</span>
            <span className="text-xs text-slate-400">ተሽከርካሪዎች</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">በአገር አቀፍ አውራ ጎዳናዎች ላይ</p>
        </div>

        {/* Metric 3: Today Passengers */}
        <div
          onClick={() => onNavigateTab('queueTurns')}
          className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-purple-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.todayPassengers}</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">{todayPassengers}</span>
            <span className="text-xs text-purple-300 font-semibold flex items-center">
              +14% ከትናንት
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">በሁሉም መናኸሪያዎች የተጓጓዙ</p>
        </div>

        {/* Metric 4: Safety Alerts & Speed Violations */}
        <div
          onClick={() => onNavigateTab('safetyCitizenTips')}
          className={`rounded-2xl p-5 shadow-lg cursor-pointer transition-all border ${
            overspeedCount > 0
              ? 'bg-red-950/40 border-red-500/80 hover:border-red-400 shadow-red-950/50 animate-pulse'
              : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.safetyAlerts}</span>
            <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400 font-mono">{overspeedCount}</span>
            <span className="text-xs text-red-300 font-semibold">የፍጥነት ወሰን ጥሰት</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {criticalReports} አዳዲስ የተጠቃሚ ጥቆማዎች
          </p>
        </div>
      </div>

      {/* Middle Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Live Departures & Turns Widget */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-sm sm:text-base">
                የመናኸሪያዎች የቀጥታ የተራ መነሻ ሰሌዳ (Terminal Queue Status)
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('queueTurns')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              ሁሉንም እይ ➔
            </button>
          </div>

          <div className="space-y-2.5">
            {queues.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center border border-slate-700">
                    #{q.turnNumber}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-white">{q.plateNumber}</span>
                    <p className="text-slate-400 text-[11px]">{q.routeName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      q.status === 'boarding'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : q.status === 'waiting'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {q.status === 'boarding' ? 'በመጫን ላይ' : q.status === 'waiting' ? 'በመጠበቅ ላይ' : 'ተሸኝቷል'}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                    {q.estimatedDeparture}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Distribution & Quick System Health */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-700 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>የተሽከርካሪዎች ክፍፍል በመደብ (Fleet Distribution)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>የሕዝብ አውቶቡስ (Long Distance Buses)</span>
                  <span className="font-bold font-mono">45%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ሚኒባስ ታክሲ (Minibuses)</span>
                  <span className="font-bold font-mono">25%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>የከባድ ጭነት (Heavy Freight)</span>
                  <span className="font-bold font-mono">20%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ቪአይፒ የቅንጦት አውቶቡስ (VIP Coach)</span>
                  <span className="font-bold font-mono">10%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Authority Contacts & Support */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>የአገር አቀፍ የፍተሻ ኬላዎች ዝግጁነት</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              ሞጆ፣ አዋሽ፣ ቆቃ፣ ደብረ ብርሃን እና ደጀን የፍተሻ ኬላዎች ከሳተላይት መቆጣጠሪያው ጋር በተገናኘ መስመር እየሰሩ ናቸው።
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
