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
  Smartphone,
  Menu,
  X,
  Heart,
  Share2,
  FileCheck2,
  Cloud,
  LogIn,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Language } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren, speakText } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  emergencyCount: number;
  onTriggerEmergency: () => void;
  activeRole?: 'user' | 'inspector';
  onRoleChange?: (role: 'user' | 'inspector') => void;
  onOpenShareModal?: () => void;
  onOpenContractModal?: () => void;
  cloudUser?: FirebaseUser | null;
  onCloudSignIn?: () => void;
  onCloudSignOut?: () => void;
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
  activeRole = 'user',
  onRoleChange,
  onOpenShareModal,
  onOpenContractModal,
  cloudUser,
  onCloudSignIn,
  onCloudSignOut,
}) => {
  const t = translations[currentLang];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Like state
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

  const { isInstallable, isInstalled, install } = usePWAInstall();

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
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
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
    } else {
      setShowIOSGuide(true);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white">
      {/* Left-Docked Dashboard Entry Logo & Identity */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <button
          onClick={() => {
            setCurrentTab('dashboard');
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 text-left group p-2 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-emerald-500/30 transition-all"
          title="ወደ ዳሽቦርድ መግቢያ"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent truncate">
                {t.appName}
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>የዳሽቦርድ መግቢያ • {currentTime}</span>
            </span>
          </div>
        </button>

        {/* Left Role Switcher */}
        {onRoleChange && (
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onRoleChange('user')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                activeRole === 'user' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ተጠቃሚ
            </button>
            <button
              onClick={() => onRoleChange('inspector')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                activeRole === 'inspector' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ተቆጣጣሪ
            </button>
          </div>
        )}

        {/* Cloud Database Auth Control (Backend Sync) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs">
          {cloudUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block font-bold text-emerald-300 truncate">
                    {cloudUser.displayName || 'Cloud Sync Active'}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate">{cloudUser.email}</span>
                </div>
              </div>
              {onCloudSignOut && (
                <button
                  onClick={onCloudSignOut}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                  title="ውጣ (Sign Out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            onCloudSignIn && (
              <button
                onClick={onCloudSignIn}
                className="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>በGoogle ግባ (Cloud Sync)</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Left Vertical Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md ring-1 ring-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${item.pulse && !isActive ? 'ring-1 ring-amber-500/30 text-amber-300' : ''}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.pulse ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Left Footer Tools (Language, Audio, SOS, Like/Share, Contract, Install PWA) */}
      <div className="p-3 border-t border-slate-800 space-y-2.5 bg-slate-950/60">
        {/* Language & Audio */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <Languages className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as Language)}
              className="w-full bg-transparent text-xs text-slate-100 font-semibold focus:outline-none cursor-pointer"
            >
              {languagesList.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.label} ({l.sub})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
            title={audioAlertsEnabled ? 'ድምፅ አጥፋ' : 'ድምፅ አብራ'}
            className={`p-2 rounded-xl border transition-colors ${
              audioAlertsEnabled
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50'
                : 'text-slate-400 bg-slate-800 border-slate-700'
            }`}
          >
            {audioAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Like, Share, Smart Contract */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            onClick={handleToggleLike}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-xl font-bold border transition-all ${
              hasLiked
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : 'text-rose-400'}`} />
            <span className="font-mono">{likeCount}</span>
          </button>

          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center justify-center gap-1 py-1.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ሸር</span>
            </button>
          )}

          {onOpenContractModal && (
            <button
              onClick={onOpenContractModal}
              className="flex items-center justify-center gap-1 py-1.5 rounded-xl font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>ውል</span>
            </button>
          )}
        </div>

        {/* Emergency SOS & Install App */}
        <div className="flex gap-2">
          <button
            onClick={handleEmergencyClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow border border-red-500"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS 991</span>
          </button>

          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow border border-cyan-400/40"
            >
              <Smartphone className="w-4 h-4" />
              <span>አፑን ጫን</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Left-Aligned Minimal Top Bar (Right side completely clean) */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 h-14 flex items-center justify-start gap-3 text-white shadow-lg">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30"
          aria-label="Open Dashboard Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-700 flex items-center justify-center">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-sm bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent truncate">
            {t.appName}
          </span>
        </button>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-0 h-screen z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Left Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Phone Install Guided Instructions Modal */}
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
    </>
  );
};
