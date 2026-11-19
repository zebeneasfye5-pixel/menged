import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  User, 
  Fuel,
  Trash2,
  X,
  BookOpen,
  QrCode,
  ShieldCheck,
  MapPin,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { Language, Vehicle } from '../types';
import { translations } from '../data/translations';
import { exportVehiclesToCSV } from '../utils/exportHelpers';
import { 
  ALL_VEHICLE_MODELS, 
  COMPLETE_VEHICLE_CATALOG, 
  getVehicleEmoji, 
  getVehicleTypeLabel 
} from '../data/vehicleCatalog';
import { ETHIOPIA_PLACES, resolveExactLocation } from '../utils/geoLocator';

interface VehiclesManagementProps {
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
}

export const VehiclesManagement: React.FC<VehiclesManagementProps> = ({
  vehicles,
  currentLang,
  onUpdateVehicles,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [qrModalVehicle, setQrModalVehicle] = useState<Vehicle | null>(null);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newMakeModel, setNewMakeModel] = useState('Bajaj RE 4-Stroke (Compact)');
  const [newType, setNewType] = useState<string>('bajaj');
  const [newYear, setNewYear] = useState(2025);
  const [newCapacity, setNewCapacity] = useState(3);
  const [newOwner, setNewOwner] = useState('የግል ባለንብረት');
  const [newDriver, setNewDriver] = useState('');
  const [newPhone, setNewPhone] = useState('+251 9');
  const [newOrigin, setNewOrigin] = useState('አዲስ አበባ');
  const [newDestination, setNewDestination] = useState('መዳረሻ');
  const [newSpeedLimit, setNewSpeedLimit] = useState(50);
  const [newLimiterId] = useState(`GPS-${Math.floor(10000 + Math.random() * 90000)}`);

  const handleTypeChange = (typeVal: string) => {
    setNewType(typeVal);
    const cat = COMPLETE_VEHICLE_CATALOG.find((c) => c.type === typeVal);
    if (cat) {
      setNewCapacity(cat.defaultCapacity);
      setNewSpeedLimit(cat.defaultSpeedLimit);
      setNewMakeModel(cat.models[0] || '');
    }
  };

  const handlePickFromCatalog = (typeVal: string, modelName: string) => {
    const cat = COMPLETE_VEHICLE_CATALOG.find((c) => c.type === typeVal);
    setNewType(typeVal);
    setNewMakeModel(modelName);
    if (cat) {
      setNewCapacity(cat.defaultCapacity);
      setNewSpeedLimit(cat.defaultSpeedLimit);
    }
    setIsDirectoryOpen(false);
    setIsAddModalOpen(true);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.origin && v.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.destination && v.destination.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || v.vehicleType === filterType;
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newMakeModel) return;

    // Match origin city coordinates if typed
    const matchedOriginPlace = ETHIOPIA_PLACES.find((p) =>
      p.nameAm.toLowerCase().includes(newOrigin.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(newOrigin.toLowerCase())
    );
    const startLat = matchedOriginPlace ? matchedOriginPlace.lat : 9.0222;
    const startLng = matchedOriginPlace ? matchedOriginPlace.lng : 38.7468;
    const locInfo = resolveExactLocation(startLat, startLng);

    const nowTime = new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      timeZone: 'Africa/Addis_Ababa',
    });

    const newVeh: Vehicle = {
      id: `veh_${Date.now()}`,
      plateNumber: newPlate,
      vehicleType: newType,
      makeModel: newMakeModel,
      year: Number(newYear),
      capacity: Number(newCapacity),
      ownerId: `own_${Date.now()}`,
      ownerName: newOwner || 'የግል ባለንብረት',
      driverId: `drv_${Date.now()}`,
      driverName: newDriver || 'ያልተመደበ አሽከርካሪ',
      driverPhone: newPhone,
      speedLimiterId: newLimiterId,
      status: 'on_route',
      inspectionStatus: 'passed',
      inspectionExpiry: '2028-12-30',
      fuelLevel: 90,
      currentSpeed: 42,
      speedLimit: Number(newSpeedLimit),
      lat: startLat,
      lng: startLng,
      heading: 90,
      currentLocationName: locInfo.formattedLabel,
      currentLocationImage: locInfo.imageUrl,
      trail: [
        {
          lat: startLat,
          lng: startLng,
          speed: 42,
          timestamp: nowTime,
          placeName: locInfo.formattedLabel,
        },
      ],
      origin: newOrigin || 'ያልተወሰነ',
      destination: newDestination || 'ያልተወሰነ',
      routeName: `${newOrigin || 'መነሻ'} ➔ ${newDestination || 'መዳረሻ'}`,
      lastUpdate: `${nowTime} EAT`,
    };

    onUpdateVehicles([newVeh, ...vehicles]);
    setIsAddModalOpen(false);
    setNewPlate('');
    setNewDriver('');
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('ተሽከርካሪውን ከስርዓቱ ማውጣት ይፈልጋሉ?')) {
      onUpdateVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const selectedCategoryObj = COMPLETE_VEHICLE_CATALOG.find((c) => c.type === newType);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>{t.vehicles} (ጠቅላላ የተሽከርካሪዎች ዝርዝርና መዝገብ)</span>
          </h2>
          <p className="text-xs text-slate-400">
            ከባጃጅ እና ሞተርሳይክል ጀምሮ ዳማስ፣ ኤሌክትሪክ ታክሲ፣ ሚኒባስ፣ አንበሳ/ሸገር ባስ፣ ቪአይፒ አውቶቡስ፣ ፒካፕ፣ ቦቴ፣ ተሳቢ ጭነት እና አምቡላንስን ሙሉ በሙሉ ያካተተ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Complete Vehicle Name Directory Button */}
          <button
            onClick={() => setIsDirectoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold shadow transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>ሙሉ የተሽከርካሪዎች ስም መዝገብ ({ALL_VEHICLE_MODELS.length}+ ሞዴሎች)</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportVehiclesToCSV(vehicles)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportExcel}</span>
          </button>

          {/* Add Vehicle Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="በሰሌዳ፣ ሞዴል (Bajaj, HiAce, Yutong, Volvo, Sinotruk...)፣ አሽከርካሪ ወይም ባለቤት ፈልግ..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">ሁሉም የተሽከርካሪ ዓይነቶች ({COMPLETE_VEHICLE_CATALOG.length} መደቦች)</option>
            {COMPLETE_VEHICLE_CATALOG.map((cat) => (
              <option key={cat.type} value={cat.type}>
                {cat.emoji} {cat.amharicName}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">ሁሉም ሁኔታዎች (All Status)</option>
            <option value="on_route">በጉዞ ላይ (On Route)</option>
            <option value="in_queue">በተራ ላይ (In Queue)</option>
            <option value="active">ስራ ዝግጁ (Active)</option>
            <option value="suspended">የታገደ (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">{t.plateNumber}</th>
                <th className="px-4 py-3">ዓይነትና ሞዴል</th>
                <th className="px-4 py-3">ባለቤት / ማህበር</th>
                <th className="px-4 py-3">አሽከርካሪ</th>
                <th className="px-4 py-3">አሁን ያለበት ቦታ / መስመር</th>
                <th className="px-4 py-3">ፍጥነትና ቴሌሜትሪ</th>
                <th className="px-4 py-3">{t.status}</th>
                <th className="px-4 py-3 text-right">QR / ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVehicles.map((v) => {
                const loc = resolveExactLocation(v.lat, v.lng);
                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-700">
                        {v.plateNumber}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                        {v.speedLimiterId}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getVehicleEmoji(v.vehicleType)}</span>
                        <div>
                          <p className="font-semibold text-slate-100">{v.makeModel}</p>
                          <p className="text-[10px] text-slate-400">
                            {getVehicleTypeLabel(v.vehicleType)} • {v.capacity}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-200">{v.ownerName}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-200">{v.driverName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 pl-5">{v.driverPhone}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{v.currentLocationName || loc.formattedLabel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {v.origin || 'መነሻ'} ➔ {v.destination || 'ክፍት'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs ${
                            v.currentSpeed > v.speedLimit ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                          }`}
                        >
                          {v.currentSpeed} km/h
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">/ {v.speedLimit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Fuel className="w-3 h-3 text-cyan-400" />
                        <span>{v.fuelLevel}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          v.status === 'on_route'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : v.status === 'in_queue'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : v.status === 'suspended'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {v.status === 'on_route'
                          ? 'በጉዞ ላይ'
                          : v.status === 'in_queue'
                          ? 'በተራ ላይ'
                          : v.status === 'suspended'
                          ? 'የታገደ'
                          : 'ዝግጁ'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setQrModalVehicle(v)}
                          className="p-1.5 hover:bg-cyan-900/40 text-cyan-400 rounded-lg transition-colors"
                          title="የዲጂታል QR ሰርተፍኬት"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v.id)}
                          className="p-1.5 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title="አስወግድ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Vehicle Encyclopedia / Name Catalog Modal */}
      {isDirectoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base">ጠቅላላ የተሽከርካሪዎች ስም እና መደብ መዝገብ (Complete Fleet Directory)</h3>
                  <p className="text-[11px] text-slate-400">
                    በኢትዮጵያና በአለም አቀፍ ደረጃ የሚገኙ ሁሉም የተሽከርካሪ ዓይነቶችና ሞዴሎች — ለመመዝገብ የፈለጉትን ሞዴል ይጫኑ
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDirectoryOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="የተሽከርካሪ ስም ፈልግ (Bajaj, Damas, BYD, HiAce, Anbessa, Yutong, Sinotruk, Volvo, Ambulance...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {COMPLETE_VEHICLE_CATALOG.map((cat) => {
                const matchingModels = cat.models.filter(
                  (m) =>
                    !directorySearch ||
                    m.toLowerCase().includes(directorySearch.toLowerCase()) ||
                    cat.amharicName.toLowerCase().includes(directorySearch.toLowerCase()) ||
                    cat.englishName.toLowerCase().includes(directorySearch.toLowerCase())
                );
                if (matchingModels.length === 0) return null;

                return (
                  <div key={cat.type} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span>{cat.amharicName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({cat.englishName})</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        መደበኛ ወሰን: {cat.defaultSpeedLimit} km/h
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {matchingModels.map((model) => (
                        <button
                          key={model}
                          onClick={() => handlePickFromCatalog(cat.type, model)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-400 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <span>{model}</span>
                          <Plus className="w-3 h-3 opacity-70" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Digital QR Verification Certificate Modal */}
      {qrModalVehicle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">የብሔራዊ ትራንስፖርት ዲጂታል መታወቂያ (QR Pass)</h3>
              </div>
              <button onClick={() => setQrModalVehicle(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-slate-900 rounded-2xl p-5 space-y-3 text-center">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">የተረጋገጠ ተሽከርካሪ</span>
                  <span className="font-mono font-black text-lg text-slate-950">{qrModalVehicle.plateNumber}</span>
                </div>
                <span className="text-3xl">{getVehicleEmoji(qrModalVehicle.vehicleType)}</span>
              </div>

              {/* Clean SVG Deterministic QR Verification Pattern */}
              <div className="mx-auto w-36 h-36 bg-slate-950 p-3 rounded-xl flex items-center justify-center">
                <QrCode className="w-full h-full text-white" />
              </div>

              <div className="text-xs space-y-1 text-left bg-slate-100 p-3 rounded-xl">
                <p><strong>ሞዴል፡</strong> {qrModalVehicle.makeModel}</p>
                <p><strong>አሽከርካሪ፡</strong> {qrModalVehicle.driverName}</p>
                <p><strong>ባለቤት፡</strong> {qrModalVehicle.ownerName}</p>
                <p><strong>GPS ID:</strong> <span className="font-mono">{qrModalVehicle.speedLimiterId}</span></p>
                <p className="text-emerald-700 font-bold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>የቴክኒክ ምርመራ የጸደቀ እስከ {qrModalVehicle.inspectionExpiry}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>አትም (Print QR Pass)</span>
              </button>
              <button
                onClick={() => setQrModalVehicle(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">አዲስ ተሽከርካሪ መዝግብ (ሁሉም መደቦች ክፍት)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    የተሽከርካሪ ዓይነት *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    {COMPLETE_VEHICLE_CATALOG.map((cat) => (
                      <option key={cat.type} value={cat.type}>
                        {cat.emoji} {cat.amharicName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    የሰሌዳ ቁጥር (Plate No) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ለምሳሌ፡ 1-A10482 አ.አ"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ሞዴል / የተሽከርካሪ ስም *</label>
                  <input
                    type="text"
                    required
                    list="vehicle-models-datalist"
                    value={newMakeModel}
                    onChange={(e) => setNewMakeModel(e.target.value)}
                    placeholder="ስም ይምረጡ ወይም ይጻፉ..."
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                  <datalist id="vehicle-models-datalist">
                    {(selectedCategoryObj ? selectedCategoryObj.models : ALL_VEHICLE_MODELS).map((m) => (
                      <option key={m} value={m} />
                    ))}
                    {ALL_VEHICLE_MODELS.map((m) => (
                      <option key={`all-${m}`} value={m} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    የመጫን አቅም ({selectedCategoryObj?.unitLabel || 'Seats / Tons'})
                  </label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">መነሻ ቦታ (የትኛውም ቦታ)</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ መርካቶ፣ ቃሊቲ..."
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">መዳረሻ ቦታ (የትኛውም ቦታ)</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ፒያሳ፣ ሀዋሳ..."
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ባለቤት / ማህበር *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="የማህበሩ ወይም የባለቤቱ ስም..."
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የምርት ዓመት</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ተመዳቢ አሽከርካሪ</label>
                  <input
                    type="text"
                    placeholder="ሙሉ ስም"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ስልክ ቁጥር</label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
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
