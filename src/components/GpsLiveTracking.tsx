import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Fuel, 
  Navigation, 
  User, 
  Volume2, 
  Search, 
  Radio, 
  Clock, 
  Compass,
  MapPin,
  Camera,
  Crosshair,
  LocateFixed,
  History,
  Gauge,
  Route,
  CheckCircle2
} from 'lucide-react';
import L from 'leaflet';
import { Language, Vehicle } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren, speakText } from '../utils/audio';
import { COMPLETE_VEHICLE_CATALOG, getVehicleEmoji } from '../data/vehicleCatalog';
import { 
  ETHIOPIA_PLACES, 
  calculateBearingAndCompass, 
  calculateDistanceKm, 
  findDestinationCoords, 
  resolveExactLocation 
} from '../utils/geoLocator';

interface GpsLiveTrackingProps {
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateVehiclePosition?: (vehicleId: string, lat: number, lng: number, speedKmh: number) => void;
  audioAlertsEnabled: boolean;
}

export const GpsLiveTracking: React.FC<GpsLiveTrackingProps> = ({
  vehicles,
  currentLang,
  onUpdateVehiclePosition,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'radar'>('satellite');
  const [followVehicle, setFollowVehicle] = useState<boolean>(true);
  const [liveGeoActive, setLiveGeoActive] = useState<boolean>(false);
  const [liveGeoError, setLiveGeoError] = useState<string>('');
  const [onlineStreetName, setOnlineStreetName] = useState<string>('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const trailLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.currentLocationName && v.currentLocationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.origin && v.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.destination && v.destination.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'overspeed'
        ? v.currentSpeed > v.speedLimit
        : v.vehicleType === filterType;

    return matchesSearch && matchesType;
  });

  // Resolve exact live location + ETA for selected vehicle
  const resolvedLoc = selectedVehicle
    ? resolveExactLocation(selectedVehicle.lat, selectedVehicle.lng)
    : null;
  const destTarget = selectedVehicle ? findDestinationCoords(selectedVehicle.destination) : null;
  const remainingKm =
    selectedVehicle && destTarget
      ? calculateDistanceKm(selectedVehicle.lat, selectedVehicle.lng, destTarget.lat, destTarget.lng)
      : 0;
  const estimatedHours =
    selectedVehicle && selectedVehicle.currentSpeed > 5
      ? remainingKm / selectedVehicle.currentSpeed
      : remainingKm / 55;
  const etaMinutes = Math.max(1, Math.round(estimatedHours * 60));

  const compassInfo =
    selectedVehicle && destTarget
      ? calculateBearingAndCompass(selectedVehicle.lat, selectedVehicle.lng, destTarget.lat, destTarget.lng)
      : { degrees: 0, compassAm: 'ሰሜን', compassEn: 'N' };

  // Optional online street-level reverse geocode (non-blocking, gracefully silent offline)
  useEffect(() => {
    if (!selectedVehicle || !navigator.onLine) {
      setOnlineStreetName('');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${selectedVehicle.lat}&lon=${selectedVehicle.lng}&zoom=16`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name) {
            const parts = String(data.display_name).split(',').slice(0, 3).join(', ');
            setOnlineStreetName(parts);
          }
        }
      } catch {
        // Silent offline fallback
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedVehicle?.id, Math.round((selectedVehicle?.lat || 0) * 200), Math.round((selectedVehicle?.lng || 0) * 200)]);

  // Real Hardware Device GPS Live Broadcast (navigator.geolocation.watchPosition)
  const toggleLiveDeviceGps = () => {
    if (liveGeoActive) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setLiveGeoActive(false);
      setLiveGeoError('');
      return;
    }

    if (!navigator.geolocation) {
      setLiveGeoError('ይህ መሳሪያ ቀጥታ የጂፒኤስ ሃርድዌርን አይደግፍም።');
      return;
    }

    setLiveGeoActive(true);
    setLiveGeoError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const speedKmh = speed !== null && !isNaN(speed) ? Math.max(0, Math.round(speed * 3.6)) : 45;
        if (selectedVehicle && onUpdateVehiclePosition) {
          onUpdateVehiclePosition(selectedVehicle.id, latitude, longitude, speedKmh);
          mapInstanceRef.current?.flyTo([latitude, longitude], 14, { duration: 0.8 });
        }
      },
      () => {
        setLiveGeoError('የጂፒኤስ ፍቃድ አልተሰጠም ወይም ሲግናል አልተገኘም — የሳተላይት መስመር ክትትል ቀጥሏል።');
        setLiveGeoActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedVehicle?.lat || 9.02, selectedVehicle?.lng || 38.75],
      zoom: 8,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri World Imagery',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;
    trailLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Map Layer (Satellite vs Street vs Dark Command Radar)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl =
      mapLayer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : mapLayer === 'radar'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newLayer = L.tileLayer(newUrl, {
      attribution: mapLayer === 'satellite' ? '&copy; Esri Satellite' : '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapLayer]);

  // Render Landmarks, Checkpoints, Breadcrumb Trail Polyline, and Vehicles
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !trailLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    trailLayerRef.current.clearLayers();

    // 1. Plot City Hubs & Safety Checkpoints with real photos
    ETHIOPIA_PLACES.forEach((place) => {
      const isCheckpoint = place.type === 'checkpoint';
      const pinColor = isCheckpoint ? '#f59e0b' : '#10b981';

      const landmarkIcon = L.divIcon({
        className: 'custom-city-pin',
        html: `
          <div style="background: rgba(15,23,42,0.88); border: 1.5px solid ${pinColor}; border-radius: 8px; padding: 2px 6px; color: #fff; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.45); display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${pinColor}; display: inline-block;"></span>
            <span>${place.nameAm.split('(')[0].trim()}</span>
          </div>
        `,
        iconSize: [110, 22],
        iconAnchor: [55, 11],
      });

      const m = L.marker([place.lat, place.lng], { icon: landmarkIcon });
      m.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; max-width: 220px;">
          <img src="${place.imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <strong style="color: #065f46; font-size: 13px; display: block;">${place.nameAm}</strong>
          <span style="font-size: 10px; color: #6b7280; display: block; margin-top: 2px;">${place.region} • ${place.lat.toFixed(4)}°N, ${place.lng.toFixed(4)}°E</span>
          <p style="margin: 4px 0 0; color: #374151; font-size: 11px;">${place.description}</p>
        </div>
      `);
      markersLayerRef.current?.addLayer(m);
    });

    // 2. Draw Live Breadcrumb Trail & Destination Corridor Vector for Selected Vehicle
    if (selectedVehicle) {
      const trailPoints = (selectedVehicle.trail || []).map((pt) => [pt.lat, pt.lng] as [number, number]);
      if (trailPoints.length > 1) {
        const trailLine = L.polyline(trailPoints, {
          color: '#38bdf8',
          weight: 4,
          opacity: 0.9,
        });
        trailLayerRef.current.addLayer(trailLine);

        // Plot individual second-by-second breadcrumb dots
        (selectedVehicle.trail || []).forEach((pt, idx) => {
          if (idx === (selectedVehicle.trail?.length || 0) - 1) return;
          const dot = L.circleMarker([pt.lat, pt.lng], {
            radius: 3.5,
            color: '#0ea5e9',
            fillColor: '#e0f2fe',
            fillOpacity: 0.9,
            weight: 1.5,
          }).bindTooltip(`${pt.timestamp} | ${pt.speed} km/h | ${pt.placeName}`, { direction: 'top' });
          trailLayerRef.current?.addLayer(dot);
        });
      }

      // Dashed projected line to destination
      if (destTarget) {
        const projectedLine = L.polyline(
          [
            [selectedVehicle.lat, selectedVehicle.lng],
            [destTarget.lat, destTarget.lng],
          ],
          {
            color: '#10b981',
            weight: 2,
            dashArray: '6, 8',
            opacity: 0.65,
          }
        );
        trailLayerRef.current.addLayer(projectedLine);
      }
    }

    // 3. Plot All Vehicles with Exact Icon, Speed, Place Badge & Click Popup
    filteredVehicles.forEach((v) => {
      const isSelected = v.id === selectedVehicleId;
      const isOverspeed = v.currentSpeed > v.speedLimit;
      const vehicleEmoji = getVehicleEmoji(v.vehicleType);
      const locInfo = resolveExactLocation(v.lat, v.lng);

      const bgClr = isOverspeed ? '#dc2626' : isSelected ? '#0284c7' : '#0f172a';
      const borderClr = isOverspeed ? '#ef4444' : isSelected ? '#38bdf8' : '#10b981';

      const vehIcon = L.divIcon({
        className: 'custom-veh-marker',
        html: `
          <div style="cursor: pointer; transform: ${isSelected ? 'scale(1.22)' : 'scale(1)'}; transition: transform 0.25s ease;">
            <div style="background: ${bgClr}; border: 2.5px solid ${borderClr}; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 6px 14px rgba(0,0,0,0.65); position: relative;">
              ${vehicleEmoji}
              ${
                v.status === 'on_route'
                  ? '<span style="position: absolute; bottom: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 1.5px solid #fff;"></span>'
                  : ''
              }
              ${
                isOverspeed
                  ? '<span style="position: absolute; top: -4px; right: -4px; width: 11px; height: 11px; border-radius: 50%; background: #ef4444; border: 1.5px solid #fff;"></span>'
                  : ''
              }
            </div>
            <div style="background: rgba(15,23,42,0.95); color: ${isOverspeed ? '#fca5a5' : '#38bdf8'}; font-family: monospace; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 5px; text-align: center; margin-top: 2px; border: 1px solid rgba(56,189,248,0.35); white-space: nowrap;">
              ${v.plateNumber.split(' ')[0]} • ${v.currentSpeed}km/h
            </div>
          </div>
        `,
        iconSize: [54, 56],
        iconAnchor: [27, 28],
      });

      const marker = L.marker([v.lat, v.lng], { icon: vehIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 210px;">
          <img src="${locInfo.imageUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color: #0f172a; font-size: 13px;">${v.plateNumber}</strong>
            <span style="background:${isOverspeed ? '#fee2e2' : '#d1fae5'}; color:${isOverspeed ? '#991b1b' : '#065f46'}; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:99px;">${v.currentSpeed} km/h</span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 3px;"><strong>${v.makeModel}</strong></div>
          <div style="font-size: 11px; color: #047857; margin-top: 4px; font-weight: 600;">📍 ${locInfo.formattedLabel}</div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 3px;">${v.lat.toFixed(5)}°N, ${v.lng.toFixed(5)}°E • ${v.lastUpdate}</div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedVehicleId(v.id);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredVehicles, selectedVehicleId]);

  // Smooth Follow-Cam when selected vehicle moves
  useEffect(() => {
    if (!followVehicle || !selectedVehicle || !mapInstanceRef.current) return;
    mapInstanceRef.current.panTo([selectedVehicle.lat, selectedVehicle.lng], {
      animate: true,
      duration: 0.9,
    });
  }, [selectedVehicle?.lat, selectedVehicle?.lng, followVehicle]);

  const handleZoomToVehicle = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
    mapInstanceRef.current?.flyTo([v.lat, v.lng], 13, { duration: 1.0 });
  };

  const handleVoiceWarningToDriver = (vehicle: Vehicle) => {
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    const locLabel = resolveExactLocation(vehicle.lat, vehicle.lng).formattedLabel;
    const warningMsg = `ማስጠንቀቂያ ለአሽከርካሪ ${vehicle.driverName}፤ አሁን የሚገኙበት ቦታ ${locLabel} ሲሆን ፍጥነትዎ ${vehicle.currentSpeed} ኪሎሜትር በሰዓት ሆኗል! እባክዎ አሁኑኑ ፍጥነትዎን ይቀንሱ።`;
    speakText(warningMsg, 'am');
  };

  return (
    <div className="space-y-4">
      {/* Control Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex flex-wrap items-center gap-2">
              <span>{t.liveTracking}</span>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                {vehicles.length} ተሽከርካሪዎች በሰከንድ ክትትል
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              እያንዳንዷ የጉዞ እንቅስቃሴ በሳተላይት ካርታ፣ በእውነተኛ የቦታ ምስል፣ በሰዓትና በኮርዲኔት
            </p>
          </div>
        </div>

        {/* Controls: Search, Follow Cam, Real Hardware GPS, Layers & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ሰሌዳ፣ ሞዴል፣ ከተማ..."
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-40 sm:w-44"
            />
          </div>

          {/* Real Device Hardware GPS Broadcast */}
          <button
            onClick={toggleLiveDeviceGps}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              liveGeoActive
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-950/60 animate-pulse'
                : 'bg-slate-800 text-cyan-300 border-slate-700 hover:border-cyan-500/50'
            }`}
            title="የስልክዎን ወይም የኮምፒውተርዎን እውነተኛ ጂፒኤስ በቀጥታ ያስተላልፉ"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{liveGeoActive ? 'ቀጥታ ጂፒኤስ እየተላለፈ ነው' : 'የራሴን ጂፒኤስ አገናኝ'}</span>
          </button>

          {/* Auto-Follow Toggle */}
          <button
            onClick={() => setFollowVehicle(!followVehicle)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              followVehicle
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ተከተል</span>
          </button>

          {/* Map Layer Toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ሳተላይት
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                mapLayer === 'streets' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ጎዳና
            </button>
            <button
              onClick={() => setMapLayer('radar')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                mapLayer === 'radar' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ራዳር
            </button>
          </div>

          {/* Unlimited Vehicle Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">ሁሉም ({vehicles.length})</option>
            <option value="overspeed">⚠️ የፍጥነት ወሰን ያለፉ</option>
            {COMPLETE_VEHICLE_CATALOG.map((cat) => (
              <option key={cat.type} value={cat.type}>
                {cat.emoji} {cat.amharicName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {liveGeoError && (
        <div className="bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{liveGeoError}</span>
        </div>
      )}

      {/* Main Grid: Interactive Satellite Map + Live Location Imagery & Second-by-Second HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Real Leaflet Map + Floating Live Position Snapshot Overlay */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 relative shadow-2xl overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-[520px] rounded-xl z-0 overflow-hidden" />

            {/* Top Floating Telemetry Status Pill */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
              <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/50 pointer-events-auto text-xs font-mono text-emerald-400 font-bold flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE GPS • 1.5s PRECISION TELEMETRY</span>
              </div>
            </div>

            {/* Bottom-Left Floating Real-Time Exact Location Image & Place Card */}
            {selectedVehicle && resolvedLoc && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-10 bg-slate-950/92 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3">
                <img
                  src={selectedVehicle.currentLocationImage || resolvedLoc.imageUrl}
                  alt={resolvedLoc.place.nameAm}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-amber-400 text-xs truncate">
                      {getVehicleEmoji(selectedVehicle.vehicleType)} {selectedVehicle.plateNumber}
                    </span>
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {selectedVehicle.lastUpdate}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{onlineStreetName || selectedVehicle.currentLocationName || resolvedLoc.formattedLabel}</span>
                  </p>
                  <p className="text-[10px] text-slate-300 font-mono">
                    {selectedVehicle.lat.toFixed(5)}°N, {selectedVehicle.lng.toFixed(5)}°E • አቅጣጫ {compassInfo.degrees}° ({compassInfo.compassAm})
                  </p>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-400 font-bold">
                      ቀሪ ርቀት፡ {remainingKm.toFixed(1)} ኪ.ሜ
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-cyan-300 font-bold">መድረሻ ግምት፡ ~{etaMinutes} ደቂቃ</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Second-by-Second Live Movement Audit Log (እያንዳንዷ እንቅስቃሴ በሰዓትና በቦታ) */}
          {selectedVehicle && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    የተሽከርካሪው እያንዳንዷ የእንቅስቃሴ ታሪክ በሰዓት፣ በካርታና በቦታ ({selectedVehicle.plateNumber})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  {(selectedVehicle.trail || []).length} የቅርብ ነጥቦች
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/80 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">ሰዓት (EAT)</th>
                      <th className="px-3 py-2">ትክክለኛ ቦታ (Place / Street)</th>
                      <th className="px-3 py-2">ኬክሮስ / ኬንትሮስ</th>
                      <th className="px-3 py-2 text-right">ፍጥነት</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {[...(selectedVehicle.trail || [])].reverse().slice(0, 12).map((pt, idx) => (
                      <tr key={`${pt.timestamp}-${idx}`} className={idx === 0 ? 'bg-cyan-950/30 text-white font-semibold' : ''}>
                        <td className="px-3 py-1.5 font-mono text-cyan-300 whitespace-nowrap">{pt.timestamp}</td>
                        <td className="px-3 py-1.5 truncate max-w-[200px]">
                          {idx === 0 ? '🟢 ' : '• '}
                          {pt.placeName}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-slate-400 whitespace-nowrap">
                          {pt.lat.toFixed(5)}°, {pt.lng.toFixed(5)}°
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-400">
                          {pt.speed} km/h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Vehicle Telemetry HUD + Location Photo & Quick Fleet Selector */}
        <div className="lg:col-span-4 space-y-3">
          {selectedVehicle && resolvedLoc && (
            <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getVehicleEmoji(selectedVehicle.vehicleType)}</span>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-md font-mono text-sm shadow">
                      {selectedVehicle.plateNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1.5 font-bold">{selectedVehicle.makeModel}</p>
                  <p className="text-[11px] text-slate-400">{selectedVehicle.ownerName}</p>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                    selectedVehicle.status === 'on_route'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : selectedVehicle.status === 'in_queue'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {selectedVehicle.status === 'on_route' ? 'በጉዞ ላይ' : selectedVehicle.status === 'in_queue' ? 'በተራ ላይ' : 'ዝግጁ'}
                </span>
              </div>

              {/* Exact Real-Time Visual Location Photo Banner */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700">
                <img
                  src={selectedVehicle.currentLocationImage || resolvedLoc.imageUrl}
                  alt={resolvedLoc.place.nameAm}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" /> የአሁኑ ቦታ ምስልና ስም
                    </span>
                    <p className="text-xs font-extrabold text-white truncate">
                      {onlineStreetName || selectedVehicle.currentLocationName || resolvedLoc.formattedLabel}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                    {resolvedLoc.place.region}
                  </span>
                </div>
              </div>

              {/* Speedometer & Heading Gauge */}
              <div
                className={`p-3 rounded-xl border relative overflow-hidden ${
                  selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                    ? 'bg-red-950/40 border-red-500/70'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>የቀጥታ ፍጥነት</span>
                  </span>
                  <span className="font-mono text-slate-400">ወሰን: {selectedVehicle.speedLimit} km/h</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-extrabold font-mono ${
                        selectedVehicle.currentSpeed > selectedVehicle.speedLimit
                          ? 'text-red-400 animate-pulse'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selectedVehicle.currentSpeed}
                    </span>
                    <span className="text-xs text-slate-400">km/h</span>
                  </div>

                  <div className="text-right text-[11px]">
                    <span className="text-cyan-300 font-bold flex items-center justify-end gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      {selectedVehicle.heading ?? compassInfo.degrees}° {compassInfo.compassAm}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ቀሪ: {remainingKm.toFixed(1)} ኪ.ሜ (~{etaMinutes} ደቂቃ)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-300 ${
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
                <span>ለአሽከርካሪው የድምፅ ማስጠንቀቂያ አሰማ</span>
              </button>

              {/* Corridor & Driver Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 mb-0.5 text-[11px]">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>አሽከርካሪ</span>
                  </div>
                  <p className="font-semibold text-slate-100 truncate">{selectedVehicle.driverName}</p>
                  <p className="text-[10px] font-mono text-slate-400">{selectedVehicle.driverPhone}</p>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-400 mb-0.5 text-[11px]">
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ነዳጅ / ባትሪ</span>
                  </div>
                  <p className="font-bold text-slate-100 text-sm font-mono">{selectedVehicle.fuelLevel}%</p>
                  <p className="text-[10px] text-emerald-400 truncate">
                    {selectedVehicle.origin} ➔ {selectedVehicle.destination}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Click-to-Zoom List for all vehicles */}
          <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-3 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>ሁሉም ተሽከርካሪዎች ({filteredVehicles.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">ካርታ ላይ ለማየት ይጫኑ</span>
            </h3>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredVehicles.map((v) => {
                const loc = resolveExactLocation(v.lat, v.lng);
                return (
                  <div
                    key={v.id}
                    onClick={() => handleZoomToVehicle(v)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                      selectedVehicleId === v.id
                        ? 'bg-slate-800 border-cyan-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{getVehicleEmoji(v.vehicleType)}</span>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-amber-300 block">{v.plateNumber}</span>
                        <p className="text-[10px] text-slate-400 truncate">{v.currentLocationName || loc.formattedLabel}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0 ml-2">
                      <span
                        className={`font-bold block ${
                          v.currentSpeed > v.speedLimit ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                        }`}
                      >
                        {v.currentSpeed} km/h
                      </span>
                      <span className="text-[9px] text-slate-500">{v.lastUpdate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
