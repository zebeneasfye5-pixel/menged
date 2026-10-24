import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  AlertTriangle, 
  Fuel, 
  Navigation, 
  User, 
  Volume2, 
  Layers,
  Info,
  Radio,
  Clock,
  Compass
} from 'lucide-react';
import { Language, Vehicle } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren, speakText } from '../utils/audio';

interface GpsLiveTrackingProps {
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateVehicleSpeed?: (id: string, newSpeed: number) => void;
  audioAlertsEnabled: boolean;
}

// Major cities for SVG coordinate plotting within Ethiopia boundary
// Ethiopia rough bounding box: Lat 3.4°N to 14.9°N, Lng 33.0°E to 48.0°E
// We map this into an SVG viewport 800x600
function projectLatLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = 34.0;
  const maxLng = 44.5;
  const minLat = 4.0;
  const maxLat = 14.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
  const y = 570 - ((lat - minLat) / (maxLat - minLat)) * 540;
  return { x, y };
}

interface CityNode {
  name: string;
  nameAm: string;
  lat: number;
  lng: number;
  isHub?: boolean;
}

const CITIES: CityNode[] = [
  { name: 'Addis Ababa', nameAm: 'አዲስ አበባ', lat: 9.02, lng: 38.75, isHub: true },
  { name: 'Hawassa', nameAm: 'ሀዋሳ', lat: 7.05, lng: 38.47 },
  { name: 'Adama', nameAm: 'አዳማ', lat: 8.54, lng: 39.27 },
  { name: 'Bahir Dar', nameAm: 'ባህር ዳር', lat: 11.59, lng: 37.39 },
  { name: 'Gondar', nameAm: 'ጎንደር', lat: 12.60, lng: 37.46 },
  { name: 'Mekelle', nameAm: 'መቀሌ', lat: 13.49, lng: 39.47 },
  { name: 'Dire Dawa', nameAm: 'ድሬዳዋ', lat: 9.59, lng: 41.86 },
  { name: 'Jimma', nameAm: 'ጅማ', lat: 7.67, lng: 36.83 },
  { name: 'Dessie', nameAm: 'ደሴ', lat: 11.13, lng: 39.63 },
  { name: 'Moyale', nameAm: 'ሞያሌ', lat: 3.53, lng: 39.05 },
];

export const GpsLiveTracking: React.FC<GpsLiveTrackingProps> = ({
  vehicles,
  currentLang,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[3]?.id || vehicles[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'corridors'>('corridors');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const filteredVehicles = vehicles.filter((v) => {
    if (filterType === 'all') return true;
    if (filterType === 'overspeed') return v.currentSpeed > v.speedLimit;
    return v.vehicleType === filterType;
  });

  const handleVoiceWarningToDriver = (vehicle: Vehicle) => {
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    const warningMsg = `ማስጠንቀቂያ ለአሽከርካሪ ${vehicle.driverName}፡ ፍጥነትዎ ${vehicle.currentSpeed} ኪሎሜትር በሰዓት ሆኗል! እባክዎ አሁኑኑ ፍጥነትዎን ይቀንሱ።`;
    speakText(warningMsg, 'am');
  };

  // High corridor paths
  const addis = projectLatLngToSvg(9.02, 38.75);
  const adama = projectLatLngToSvg(8.54, 39.27);
  const hawassa = projectLatLngToSvg(7.05, 38.47);
  const moyale = projectLatLngToSvg(3.53, 39.05);
  const diredawa = projectLatLngToSvg(9.59, 41.86);
  const bahirdar = projectLatLngToSvg(11.59, 37.39);
  const gondar = projectLatLngToSvg(12.60, 37.46);
  const mekelle = projectLatLngToSvg(13.49, 39.47);
  const jimma = projectLatLngToSvg(7.67, 36.83);
  const dessie = projectLatLngToSvg(11.13, 39.63);

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t.liveTracking} (Live GPS Telemetry & Control)
                <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  {vehicles.filter(v => v.status === 'on_route').length} በጉዞ ላይ
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                የኢትዮጵያ አገር አቀፍ የፍጥነት መቆጣጠሪያ (Speed Limiter) ሳተላይት ማዕከል
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Filter & Simulation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Layer Selector */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => setMapLayer('corridors')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                mapLayer === 'corridors' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ኮሪደሮች (Corridors)
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ሳተላይት (Satellite)
            </button>
          </div>

          {/* Simulation Toggle */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                isSimulating ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulating ? 'ቆም አድርግ' : 'አስጀምር'}</span>
            </button>
            <button
              onClick={() => setSimSpeedMultiplier(m => m === 1 ? 2 : m === 2 ? 5 : 1)}
              title="Simulation Speed Multiplier"
              className="flex items-center gap-1 px-2 py-1 text-xs text-amber-300 hover:text-white ml-1 font-mono font-bold"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{simSpeedMultiplier}x</span>
            </button>
          </div>

          {/* Filter vehicles */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">ሁሉም ተሽከርካሪዎች ({vehicles.length})</option>
            <option value="overspeed">⚠️ የፍጥነት ወሰን ያለፉ</option>
            <option value="bus">አውቶቡሶች (Buses)</option>
            <option value="minibus">ሚኒባሶች (Minibuses)</option>
            <option value="truck">የጭነት (Heavy Freight)</option>
            <option value="vip_coach">ቪአይፒ ኮች (VIP Coach)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive GPS Map + Real-time HUD Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Radar Map View */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-2xl border border-slate-800 p-3 sm:p-4 relative shadow-2xl overflow-hidden min-h-[520px] flex flex-col justify-between">
          {/* Map Grid Pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Top Bar HUD indicators */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/60 pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                GPS LIVE TELEMETRY: 4G/IRIDIUM MESH
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-700/60 text-xs text-slate-300 font-mono">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>ኢትዮጵያ (EAST AFRICA TRANSIT)</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[450px] my-2">
            <svg viewBox="0 0 800 600" className="w-full h-full select-none">
              {/* Region Outline hint */}
              <path
                d="M 120 180 Q 220 80 400 90 T 580 140 T 730 320 T 680 480 T 480 560 T 320 540 T 140 420 Z"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Highway Corridor Paths */}
              {/* Addis to Hawassa & Moyale */}
              <line x1={addis.x} y1={addis.y} x2={adama.x} y2={adama.y} stroke="#059669" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
              <line x1={adama.x} y1={adama.y} x2={hawassa.x} y2={hawassa.y} stroke="#059669" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
              <line x1={hawassa.x} y1={hawassa.y} x2={moyale.x} y2={moyale.y} stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />

              {/* Addis to Dire Dawa (Djibouti Corridor) */}
              <line x1={adama.x} y1={adama.y} x2={diredawa.x} y2={diredawa.y} stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />

              {/* Addis to Bahir Dar & Gondar */}
              <line x1={addis.x} y1={addis.y} x2={bahirdar.x} y2={bahirdar.y} stroke="#d97706" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
              <line x1={bahirdar.x} y1={bahirdar.y} x2={gondar.x} y2={gondar.y} stroke="#d97706" strokeWidth="2.5" opacity="0.7" />

              {/* Addis to Dessie & Mekelle */}
              <line x1={addis.x} y1={addis.y} x2={dessie.x} y2={dessie.y} stroke="#8b5cf6" strokeWidth="3" opacity="0.75" />
              <line x1={dessie.x} y1={dessie.y} x2={mekelle.x} y2={mekelle.y} stroke="#8b5cf6" strokeWidth="2.5" opacity="0.7" />

              {/* Addis to Jimma */}
              <line x1={addis.x} y1={addis.y} x2={jimma.x} y2={jimma.y} stroke="#06b6d4" strokeWidth="3" opacity="0.7" />

              {/* City Nodes */}
              {CITIES.map((city, idx) => {
                const pos = projectLatLngToSvg(city.lat, city.lng);
                return (
                  <g key={idx} className="cursor-pointer group">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={city.isHub ? 7 : 4.5}
                      fill={city.isHub ? '#10b981' : '#38bdf8'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    {city.isHub && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}
                    <text
                      x={pos.x + 9}
                      y={pos.y + 4}
                      fill="#e2e8f0"
                      fontSize={city.isHub ? '12' : '10'}
                      fontWeight={city.isHub ? 'bold' : 'normal'}
                      className="font-sans pointer-events-none drop-shadow"
                    >
                      {city.nameAm} ({city.name})
                    </text>
                  </g>
                );
              })}

              {/* Moving Vehicles Markers */}
              {filteredVehicles.map((vehicle) => {
                const pos = projectLatLngToSvg(vehicle.lat, vehicle.lng);
                const isSelected = selectedVehicle?.id === vehicle.id;
                const isOverspeed = vehicle.currentSpeed > vehicle.speedLimit;

                return (
                  <g
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className="cursor-pointer transition-all duration-300"
                  >
                    {/* Overspeed or selection pulse beacon */}
                    {isOverspeed && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="22"
                        fill="#ef4444"
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="18"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin origin-center"
                      />
                    )}

                    {/* Vehicle Pin Icon Box */}
                    <rect
                      x={pos.x - 14}
                      y={pos.y - 14}
                      width="28"
                      height="28"
                      rx="8"
                      fill={isOverspeed ? '#dc2626' : isSelected ? '#0284c7' : '#1e293b'}
                      stroke={isOverspeed ? '#fca5a5' : isSelected ? '#38bdf8' : '#475569'}
                      strokeWidth="2"
                      className="drop-shadow-lg"
                    />

                    {/* Simple Vehicle Icon in SVG */}
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fill="#ffffff"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {vehicle.vehicleType === 'truck' ? '🚚' : '🚌'}
                    </text>

                    {/* Floating Plate Label */}
                    <rect
                      x={pos.x - 40}
                      y={pos.y - 32}
                      width="80"
                      height="16"
                      rx="4"
                      fill="#0f172a"
                      opacity="0.92"
                      stroke={isOverspeed ? '#ef4444' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 20}
                      fill={isOverspeed ? '#fca5a5' : '#38bdf8'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {vehicle.plateNumber.split(' ')[0]} ({vehicle.currentSpeed}k)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer: Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>መደበኛ ፍጥነት (Normal)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-semibold">ከፍጥነት ወሰን በላይ (&gt;80 ኪ.ሜ/ሰ)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                <span>የተመረጠ (Selected)</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              ጠቅላላ ተሽከርካሪዎች: {vehicles.length} | ሳተላይት ሲግናል: 100%
            </div>
          </div>
        </div>

        {/* Selected Vehicle HUD Live Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedVehicle ? (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 shadow-xl space-y-4">
              {/* Header with Plate & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-md font-mono text-sm shadow">
                      {selectedVehicle.plateNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        selectedVehicle.status === 'on_route'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : selectedVehicle.status === 'in_queue'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                    >
                      {selectedVehicle.status === 'on_route' ? 'በጉዞ ላይ' : selectedVehicle.status === 'in_queue' ? 'በተራ ላይ' : 'የታገደ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    {selectedVehicle.makeModel} ({selectedVehicle.year})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">አቅም</span>
                  <span className="text-sm font-bold text-slate-100">{selectedVehicle.capacity} ተሳፋሪ</span>
                </div>
              </div>

              {/* Speedometer Gauge Widget */}
              <div
                className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                  selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                    ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50'
                    : 'bg-slate-900/90 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {t.speed}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ወሰን: {selectedVehicle.speedLimit} ኪ.ሜ/ሰ
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold font-mono tracking-tight ${
                        selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                          ? 'text-red-400 animate-pulse'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedVehicle.currentSpeed}
                    </span>
                    <span className="text-xs text-slate-400">km/h</span>
                  </div>

                  {selectedVehicle.currentSpeed > selectedVehicle.speedLimit && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold animate-bounce shadow">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>የፍጥነት ጥሰት!</span>
                    </div>
                  )}
                </div>

                {/* Speed progress meter */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                        ? 'bg-red-500'
                        : selectedVehicle.currentSpeed > 65
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (selectedVehicle.currentSpeed / 120) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Voice Warning Button for Authority Dispatcher */}
              <button
                onClick={() => handleVoiceWarningToDriver(selectedVehicle)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>ለአሽከርካሪው የድምፅ ማስጠንቀቂያ አሰማ (Voice Chime & Alert)</span>
              </button>

              {/* Trip Route & Corridors */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>የጉዞ መስመር</span>
                  </span>
                  <span className="font-semibold text-emerald-400">{selectedVehicle.routeName || 'አገር አቀፍ መስመር'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-0.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">መነሻ</span>
                    <span className="font-semibold">{selectedVehicle.origin || 'አዲስ አበባ'}</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="text-slate-500">➔</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">መዳረሻ</span>
                    <span className="font-semibold">{selectedVehicle.destination || 'ሀዋሳ'}</span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Driver Box */}
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>አሽከርካሪ</span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{selectedVehicle.driverName}</p>
                  <p className="text-[11px] font-mono text-slate-400">{selectedVehicle.driverPhone}</p>
                </div>

                {/* Fuel Level */}
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.fuel}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-slate-100 text-base">{selectedVehicle.fuelLevel}%</span>
                    <span className="text-[10px] text-slate-400">ታንክ</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${selectedVehicle.fuelLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Inspection & Device ID */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>GPS Tracker ID:</span>
                  <span className="text-slate-200">{selectedVehicle.speedLimiterId}</span>
                </div>
                <div className="flex justify-between">
                  <span>የቴክኒክ ምርመራ:</span>
                  <span className={selectedVehicle.inspectionStatus === 'passed' ? 'text-emerald-400' : 'text-amber-400'}>
                    {selectedVehicle.inspectionStatus === 'passed' ? 'ብቁ (Passed)' : 'ማስጠንቀቂያ (Warning)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>የባለቤት ማህበር:</span>
                  <span className="text-slate-200 truncate max-w-[160px]">{selectedVehicle.ownerName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl p-6 text-center text-slate-400 border border-slate-700">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p>ተሽከርካሪ በመምረጥ የቀጥታ ቴሌሜትሪ ይመልከቱ።</p>
            </div>
          )}

          {/* Quick list of other active vehicles on the road */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>በጉዞ ላይ ያሉ ተሽከርካሪዎች</span>
              <span className="text-[11px] font-mono text-slate-400">{filteredVehicles.length} ጠቅላላ</span>
            </h3>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                    selectedVehicleId === v.id
                      ? 'bg-slate-700/90 border-emerald-500/80 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300">{v.plateNumber}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{v.routeName || v.destination}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`font-bold ${
                        v.currentSpeed > v.speedLimit ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                      }`}
                    >
                      {v.currentSpeed} km/h
                    </span>
                    {v.currentSpeed > v.speedLimit && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
