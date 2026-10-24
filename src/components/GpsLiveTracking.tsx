import React, { useState, useEffect, useRef } from 'react';
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
  Search, 
  Radio, 
  Clock, 
  Compass,
  MapPin,
  ExternalLink,
  Camera
} from 'lucide-react';
import L from 'leaflet';
import { Language, Vehicle } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren, speakText } from '../utils/audio';

interface GpsLiveTrackingProps {
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateVehicleSpeed?: (id: string, newSpeed: number) => void;
  audioAlertsEnabled: boolean;
}

// Major cities with real imagery thumbnails & descriptions
interface CityLandmark {
  name: string;
  nameAm: string;
  lat: number;
  lng: number;
  imageUrl: string;
  description: string;
}

const LANDMARKS: CityLandmark[] = [
  { 
    name: 'Addis Ababa', 
    nameAm: 'አዲስ አበባ (ዋና ማዕከል)', 
    lat: 9.0222, 
    lng: 38.7468, 
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    description: 'የአፍሪካ ህብረትና የመንገድ ትራንስፖርት ዋና መናኸሪያ'
  },
  { 
    name: 'Hawassa', 
    nameAm: 'ሀዋሳ (ደቡብ ኮሪደር)', 
    lat: 7.0504, 
    lng: 38.4674, 
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    description: 'ሀዋሳ ሐይቅና የኢንዱስትሪ ፓርክ ፈጣን የትራንስፖርት መስመር'
  },
  { 
    name: 'Adama', 
    nameAm: 'አዳማ / ናዝሬት', 
    lat: 8.5400, 
    lng: 39.2700, 
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
    description: 'የፈጣን መንገድ (Expressway) ዋና መገናኛ'
  },
  { 
    name: 'Bahir Dar', 
    nameAm: 'ባህር ዳር (ጣና)', 
    lat: 11.5940, 
    lng: 37.3900, 
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    description: 'የጣና ሐይቅና ዓባይ ወንዝ መነሻ መስመር'
  },
  { 
    name: 'Dire Dawa', 
    nameAm: 'ድሬዳዋ / ጅቡቲ መስመር', 
    lat: 9.5931, 
    lng: 41.8661, 
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    description: 'የምስራቅ ኢትዮጵያና የጅቡቲ ወደብ የንግድ ኮሪደር'
  },
  { 
    name: 'Jimma', 
    nameAm: 'ጅማ ከተማ', 
    lat: 7.6734, 
    lng: 36.8344, 
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    description: 'የቡናና የደቡብ ምዕራብ ኢትዮጵያ የትራንስፖርት መስመር'
  },
];

export const GpsLiveTracking: React.FC<GpsLiveTrackingProps> = ({
  vehicles,
  currentLang,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets'>('satellite');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.origin && v.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.destination && v.destination.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' 
      ? true 
      : filterType === 'overspeed' 
      ? v.currentSpeed > v.speedLimit 
      : v.vehicleType === filterType;

    return matchesSearch && matchesType;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Ethiopia (Addis Ababa hub)
    const map = L.map(mapContainerRef.current, {
      center: [9.02, 38.75],
      zoom: 6.8,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Satellite Tile Layer
    const tileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri &mdash; National Geographic, GIS User Community',
        maxZoom: 18,
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Map Layer (Satellite vs Street)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl =
      mapLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newLayer = L.tileLayer(newUrl, {
      attribution: mapLayer === 'satellite' ? '&copy; Esri World Imagery' : '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapLayer]);

  // Update Vehicle Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Plot Landmark Pins with photos & names
    LANDMARKS.forEach((city) => {
      const landmarkIcon = L.divIcon({
        className: 'custom-city-pin',
        html: `
          <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #10b981; border-radius: 8px; padding: 2px 6px; color: #fff; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span>${city.nameAm}</span>
          </div>
        `,
        iconSize: [100, 24],
        iconAnchor: [50, 12],
      });

      const m = L.marker([city.lat, city.lng], { icon: landmarkIcon });
      m.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; max-width: 200px;">
          <img src="${city.imageUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <strong style="color: #065f46; font-size: 13px;">${city.nameAm}</strong>
          <p style="margin: 4px 0 0; color: #4b5563; font-size: 11px;">${city.description}</p>
        </div>
      `);
      markersLayerRef.current?.addLayer(m);
    });

    // 2. Plot Vehicles with real emoji, speed indicator and selection
    filteredVehicles.forEach((v) => {
      const isSelected = v.id === selectedVehicleId;
      const isOverspeed = v.currentSpeed > v.speedLimit;

      const vehicleEmoji =
        v.vehicleType === 'bajaj'
          ? '🛺'
          : v.vehicleType === 'motorcycle'
          ? '🏍️'
          : v.vehicleType === 'damas' || v.vehicleType === 'minibus'
          ? '🚐'
          : v.vehicleType === 'truck'
          ? '🚚'
          : '🚌';

      const bgClr = isOverspeed ? '#dc2626' : isSelected ? '#0284c7' : '#0f172a';
      const borderClr = isOverspeed ? '#ef4444' : isSelected ? '#38bdf8' : '#10b981';

      const vehIcon = L.divIcon({
        className: 'custom-veh-marker',
        html: `
          <div style="cursor: pointer; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
            <div style="background: ${bgClr}; border: 2px solid ${borderClr}; border-radius: 10px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.6); position: relative;">
              ${vehicleEmoji}
              ${isOverspeed ? '<span style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; border: 1.5px solid #fff;"></span>' : ''}
            </div>
            <div style="background: rgba(15,23,42,0.92); color: ${isOverspeed ? '#fca5a5' : '#38bdf8'}; font-family: monospace; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; text-align: center; margin-top: 2px; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">
              ${v.plateNumber.split(' ')[0]} (${v.currentSpeed}k)
            </div>
          </div>
        `,
        iconSize: [44, 50],
        iconAnchor: [22, 25],
      });

      const marker = L.marker([v.lat, v.lng], { icon: vehIcon });
      marker.on('click', () => {
        setSelectedVehicleId(v.id);
        mapInstanceRef.current?.flyTo([v.lat, v.lng], 11, { duration: 1 });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredVehicles, selectedVehicleId]);

  const handleZoomToVehicle = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
    mapInstanceRef.current?.flyTo([v.lat, v.lng], 12, { duration: 1.2 });
  };

  const handleVoiceWarningToDriver = (vehicle: Vehicle) => {
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    const warningMsg = `ማስጠንቀቂያ ለአሽከርካሪ ${vehicle.driverName}፡ ፍጥነትዎ ${vehicle.currentSpeed} ኪሎሜትር በሰዓት ሆኗል! እባክዎ አሁኑኑ ፍጥነትዎን ይቀንሱ።`;
    speakText(warningMsg, 'am');
  };

  return (
    <div className="space-y-4">
      {/* Control Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t.liveTracking} (Satellite Imagery & Unlimited Fleet Telemetry)
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/60">
                {vehicles.length} ተሽከርካሪዎች በቅኝት ላይ
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ትክክለኛውን ቦታ በሳተላይት ምስልና በከተማ ስም የሚያሳይ የቀጥታ የጂፒኤስ ካርታ
            </p>
          </div>
        </div>

        {/* Controls: Search, Layers & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search any vehicle or place */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ሰሌዳ፣ ቦታ ወይም አሽከርካሪ..."
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
            />
          </div>

          {/* Map Layer Toggle */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ሳተላይት (Satellite)
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mapLayer === 'streets' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ጎዳና (Street Map)
            </button>
          </div>

          {/* Vehicle Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">ሁሉም ({vehicles.length})</option>
            <option value="overspeed">⚠️ የፍጥነት ወሰን ያለፉ</option>
            <option value="bajaj">ባጃጅ (Bajaj)</option>
            <option value="damas">ዳማስ (Damas)</option>
            <option value="minibus">ሚኒባስ (Minibus)</option>
            <option value="bus">አውቶቡስ (Buses)</option>
            <option value="truck">የጭነት (Trucks)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Satellite Leaflet Map + HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Real Leaflet Map */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-2 relative shadow-2xl overflow-hidden min-h-[520px] flex flex-col justify-between">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] rounded-xl z-0 overflow-hidden" 
          />

          {/* Map floating badges */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 pointer-events-auto text-xs font-mono text-emerald-400 font-bold flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>IRIDIUM / 4G HIGH RESOLUTION GPS MESH</span>
            </div>
          </div>
        </div>

        {/* Selected Vehicle HUD Live Panel */}
        <div className="lg:col-span-4 space-y-3">
          {selectedVehicle ? (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 shadow-xl space-y-3">
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
                      {selectedVehicle.status === 'on_route' ? 'በጉዞ ላይ' : selectedVehicle.status === 'in_queue' ? 'በተራ ላይ' : 'ዝግጁ'}
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
                className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                  selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                    ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50'
                    : 'bg-slate-900/90 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ፍጥነት (Speedometer)</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ወሰን: {selectedVehicle.speedLimit} ኪ.ሜ/ሰ
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-extrabold font-mono tracking-tight ${
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

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
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

              {/* Action: Voice Warning to Driver */}
              <button
                onClick={() => handleVoiceWarningToDriver(selectedVehicle)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>ለአሽከርካሪው የድምፅ ማስጠንቀቂያ አሰማ (Voice Alert)</span>
              </button>

              {/* Trip Route & Corridors */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>የጉዞ መስመር</span>
                  </span>
                  <span className="font-semibold text-emerald-400 truncate max-w-[140px]">
                    {selectedVehicle.routeName || 'አገር አቀፍ መስመር'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-0.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">መነሻ</span>
                    <span className="font-semibold">{selectedVehicle.origin || 'አዲስ አበባ'}</span>
                  </div>
                  <div className="text-center px-1">
                    <span className="text-slate-500">➔</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">መዳረሻ</span>
                    <span className="font-semibold">{selectedVehicle.destination || 'ክፍት'}</span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>አሽከርካሪ</span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate">{selectedVehicle.driverName}</p>
                  <p className="text-[11px] font-mono text-slate-400">{selectedVehicle.driverPhone}</p>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.fuel}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-slate-100 text-sm">{selectedVehicle.fuelLevel}%</span>
                    <span className="text-[10px] text-slate-400">ታንክ</span>
                  </div>
                </div>
              </div>

              {/* Exact GPS Coordinates */}
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>ትክክለኛ ኬክሮስ/ኬንትሮስ:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedVehicle.lat.toFixed(4)}°N, {selectedVehicle.lng.toFixed(4)}°E
                </span>
              </div>
            </div>
          ) : null}

          {/* Quick Click-to-Zoom List for all vehicles */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-3 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>በቅኝት ላይ ያሉ ተሽከርካሪዎች ({filteredVehicles.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">ካርታው ላይ ጠቅ ያድርጉ</span>
            </h3>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => handleZoomToVehicle(v)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                    selectedVehicleId === v.id
                      ? 'bg-slate-700/90 border-emerald-500/80 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {v.vehicleType === 'bajaj'
                        ? '🛺'
                        : v.vehicleType === 'motorcycle'
                        ? '🏍️'
                        : v.vehicleType === 'damas' || v.vehicleType === 'minibus'
                        ? '🚐'
                        : v.vehicleType === 'truck'
                        ? '🚚'
                        : '🚌'}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-amber-300">{v.plateNumber}</span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{v.origin || v.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span
                      className={`font-bold ${
                        v.currentSpeed > v.speedLimit ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                      }`}
                    >
                      {v.currentSpeed} km/h
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
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
