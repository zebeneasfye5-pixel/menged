import React, { useState } from 'react';
import { 
  Route, 
  MapPin, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Search, 
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { Language, TransportRoute } from '../types';
import { translations } from '../data/translations';

interface RoutesTariffsProps {
  routes: TransportRoute[];
  currentLang: Language;
  onUpdateRoutes: (routes: TransportRoute[]) => void;
}

export const RoutesTariffs: React.FC<RoutesTariffsProps> = ({
  routes,
  currentLang,
  onUpdateRoutes,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New route form state
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDistance, setNewDistance] = useState(15);
  const [newTariff, setNewTariff] = useState(35);
  const [newHours, setNewHours] = useState(0.5);
  const [newCheckpoints, setNewCheckpoints] = useState(1);
  const [newQuality, setNewQuality] = useState<TransportRoute['roadQuality']>('asphalt_good');

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDestination) return;

    const newR: TransportRoute = {
      id: `r_${Date.now()}`,
      code: `ROU-${Math.floor(100 + Math.random() * 900)}`,
      name: `${newOrigin} - ${newDestination}`,
      origin: newOrigin,
      destination: newDestination,
      distanceKm: Number(newDistance),
      standardTariffBirr: Number(newTariff),
      estimatedHours: Number(newHours),
      checkpointsCount: Number(newCheckpoints),
      tollFee: 0,
      roadQuality: newQuality,
    };

    onUpdateRoutes([newR, ...routes]);
    setIsAddModalOpen(false);

    // Reset
    setNewOrigin('');
    setNewDestination('');
  };

  const handleDeleteRoute = (id: string) => {
    if (confirm('መስመሩን መሰረዝ ይፈልጋሉ?')) {
      onUpdateRoutes(routes.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-400" />
            <span>{t.routesTariffs} (Unrestricted Global & Local Routes & Tariffs)</span>
          </h2>
          <p className="text-xs text-slate-400">
            ከከተማ ውስጥ የባጃጅና ታክሲ መስመሮች ጀምሮ እስከ አገር አቀፍና አህጉራዊ አውራ ጎዳናዎች ያለገደብ መነሻና መዳረሻ ይመዝግቡ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>አዲስ መነሻና መዳረሻ መስመር መዝግብ</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-6" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="በየትኛውም መነሻ፣ መዳረሻ፣ ከተማ ወይም የሰፈር ስም ፈልግ..."
          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-emerald-500/50 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Header with Route Code & Quality Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    {route.code}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-1.5 leading-snug">{route.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    route.roadQuality === 'expressway'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : route.roadQuality === 'mountain_corridor'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {route.roadQuality === 'expressway' ? 'ፈጣን መንገድ' : route.roadQuality === 'mountain_corridor' ? 'ተራራማ ኮሪደር' : 'አስፋልት / ከተማ'}
                </span>
              </div>

              {/* Origin & Destination Display */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-750 space-y-2 text-xs mt-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-slate-400">መነሻ:</span>
                  <span className="font-semibold text-white truncate">{route.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-slate-400">መዳረሻ:</span>
                  <span className="font-semibold text-white truncate">{route.destination}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ርቀት & ሰዓት</span>
                  <div className="font-mono font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                    <span>{route.distanceKm} ኪ.ሜ</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300">~{route.estimatedHours} ሰዓት</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ኬላዎች</span>
                  <div className="font-mono font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{route.checkpointsCount} የፍተሻ ኬላ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Tariff Birr Highlight & Delete */}
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 p-3 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    ህጋዊ የመንግስት ታሪፍ ዋጋ
                  </span>
                  <span className="text-[10px] text-slate-300">በአንድ ተሳፋሪ ወንበር</span>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-emerald-300">
                    {route.standardTariffBirr} ETB
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="p-1 text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>መስመር ሰርዝ</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">አዲስ የመነሻና መዳረሻ መስመር መዝግብ</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    መነሻ ቦታ (የትኛውም ከተማ/ሰፈር) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ለምሳሌ፡ መርካቶ፣ ሰሚት፣ ሀዋሳ፣ ወዘተ"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    መዳረሻ ቦታ (የትኛውም ቦታ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ለምሳሌ፡ ፒያሳ፣ ናዝሬት፣ ጅማ..."
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ርቀት (ኪ.ሜ)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDistance}
                    onChange={(e) => setNewDistance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ህጋዊ ታሪፍ (ብር)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTariff}
                    onChange={(e) => setNewTariff(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የሚፈጀው ሰዓት</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የመንገድ ጥራት</label>
                  <select
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="asphalt_good">የከተማ አስፋልት</option>
                    <option value="expressway">ፈጣን አውራ ጎዳና (Expressway)</option>
                    <option value="mountain_corridor">ተራራማ መንገድ</option>
                    <option value="standard">መደበኛ አስፋልት</option>
                    <option value="gravel_rural">ጠጠር / ገጠር</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
