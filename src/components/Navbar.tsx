import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  Truck, 
  Users, 
  Building2, 
  Clock, 
  Route, 
  AlertTriangle, 
  Languages, 
  Volume2, 
  VolumeX, 
  FileSpreadsheet, 
  Mic2, 
  Activity,
  CreditCard,
  Download,
  Smartphone,
  RotateCcw,
  Menu,
  X
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { StorageService } from '../utils/storage';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  emergencyCount: number;
  onTriggerEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentLang,
  setCurrentLang,
  audioAlertsEnabled,
  setAudioAlertsEnabled,
  emergencyCount,
  onTriggerEmergency,
}) => {
  const t = translations[currentLang];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // PWA install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Africa/Addis_Ababa',
        }) + ' EAT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Activity },
    { id: 'liveTracking', label: t.liveTracking, icon: MapPin, highlight: true },
    { id: 'queueTurns', label: t.queueTurns, icon: Clock },
    { id: 'vehicles', label: t.vehicles, icon: Truck },
    { id: 'drivers', label: t.drivers, icon: Users },
    { id: 'owners', label: t.owners, icon: Building2 },
    { id: 'routesTariffs', label: t.routesTariffs, icon: Route },
    { id: 'paymentsSettlements', label: t.paymentsSettlements, icon: CreditCard, highlight: true },
    { id: 'safetyCitizenTips', label: t.safetyCitizenTips, icon: ShieldAlert, badge: emergencyCount },
    { id: 'voiceTranslator', label: t.voiceTranslator, icon: Mic2, pulse: true },
    { id: 'reportsExport', label: t.reportsExport, icon: FileSpreadsheet },
  ];

  const languagesList: { code: Language; label: string; sub: string }[] = [
    { code: 'am', label: 'አማርኛ', sub: 'Amharic' },
    { code: 'om', label: 'Afaan Oromoo', sub: 'Oromo' },
    { code: 'ti', label: 'ትግርኛ', sub: 'Tigrinya' },
    { code: 'so', label: 'Soomaali', sub: 'Somali' },
    { code: 'en', label: 'English', sub: 'Global' },
    { code: 'ar', label: 'العربية', sub: 'Arabic' },
    { code: 'fr', label: 'Français', sub: 'French' },
    { code: 'zh', label: '中文 (Chinese)', sub: '汉语' },
  ];

  const handleEmergencyClick = () => {
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    onTriggerEmergency();
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleResetData = () => {
    if (confirm('ሁሉንም መረጃዎች ወደ መጀመሪያው የሙከራ/ፋብሪካ ይዘት መመለስ ይፈልጋሉ?')) {
      StorageService.resetAllData();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="truncate">የብሔራዊ ትራንስፖርት፣ የጂፒኤስ፣ የተራና ክፍያ የቀጥታ የቁጥጥር መስመር (Active Live Production)</span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          {/* PWA Phone Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[11px] shadow border border-cyan-400/50 transition-all active:scale-95"
              title="በማንኛውም ስልክ ላይ አፑን ጫን"
            >
              <Smartphone className="w-3 h-3 animate-bounce" />
              <span>{t.installApp}</span>
            </button>
          )}

          {/* Reset Data Button */}
          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
            title="መረጃ ወደ መጀመሪያው ይዘት መልስ"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <span className="hidden md:inline font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
            {currentTime}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
              title={audioAlertsEnabled ? 'ድምፅ አጥፋ' : 'ድምፅ አብራ'}
              className={`p-1 rounded transition-colors ${
                audioAlertsEnabled ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {audioAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Identity */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                  LIVE PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-sm">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Action Center: Quick Emergency & Lang Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Emergency Button */}
            <button
              onClick={handleEmergencyClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-950/50 hover:shadow-red-600/30 transition-all border border-red-500 animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">አስቸኳይ ጥሪ / SOS</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <div className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200">
                <Languages className="w-4 h-4 text-emerald-400" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as Language)}
                  className="bg-transparent text-xs text-slate-100 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {languagesList.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white py-1">
                      {l.label} ({l.sub})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                } ${item.pulse ? 'ring-1 ring-amber-500/40 text-amber-300 hover:text-amber-200' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.pulse ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* iOS & Phone Install Guided Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold">አፑን በስልክዎ ላይ ይጫኑ (Install App)</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1.5">
                <span className="font-bold text-emerald-400 block">📱 በአይፎን (iPhone / iPad - Safari):</span>
                <p>1. በሳፋሪ (Safari) ብሮውዘር ስር የሚገኘውን <strong>"Share / አጋራ" (⎋)</strong> ምልክት ይጫኑ።</p>
                <p>2. ወደ ታች ዝቅ ብለው <strong>"Add to Home Screen / ወደ መነሻ ገጽ አክል" (+)</strong> የሚለውን ይምረጡ።</p>
              </div>

              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1.5">
                <span className="font-bold text-cyan-400 block">🤖 በአንድሮይድ (Android / Chrome):</span>
                <p>1. በክሮም የላይኛው ቀኝ ጥግ ላይ ያሉትን <strong>ሶስት ነጥቦች (⋮)</strong> ይጫኑ።</p>
                <p>2. <strong>"Install app / አፕሊኬሽኑን ጫን"</strong> የሚለውን ይምረጡ።</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              ተረድቻለሁ (Got It)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
