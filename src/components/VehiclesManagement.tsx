import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Activity,
  Fuel,
  Trash2,
  X
} from 'lucide-react';
import { Language, Vehicle } from '../types';
import { translations } from '../data/translations';
import { exportVehiclesToCSV } from '../utils/exportHelpers';

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

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newMakeModel, setNewMakeModel] = useState('');
  const [newType, setNewType] = useState<string>('bajaj');
  const [newYear, setNewYear] = useState(2024);
  const [newCapacity, setNewCapacity] = useState(3);
  const [newOwner, setNewOwner] = useState('የግል ባለንብረት');
  const [newDriver, setNewDriver] = useState('');
  const [newPhone, setNewPhone] = useState('+251 9');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newSpeedLimit, setNewSpeedLimit] = useState(60);
  const [newLimiterId, setNewLimiterId] = useState(`SL-${Math.floor(10000 + Math.random() * 90000)}`);

  const handleTypeChange = (typeVal: string) => {
    setNewType(typeVal);
    if (typeVal === 'bajaj') {
      setNewCapacity(3);
      setNewSpeedLimit(50);
      if (!newMakeModel) setNewMakeModel('Bajaj RE 4-Stroke');
    } else if (typeVal === 'motorcycle') {
      setNewCapacity(1);
      setNewSpeedLimit(60);
      if (!newMakeModel) setNewMakeModel('TVS / Haojue 125');
    } else if (typeVal === 'damas') {
      setNewCapacity(7);
      setNewSpeedLimit(70);
      if (!newMakeModel) setNewMakeModel('Suzuki Carry / Damas');
    } else if (typeVal === 'taxi') {
      setNewCapacity(4);
      setNewSpeedLimit(80);
      if (!newMakeModel) setNewMakeModel('Toyota Corolla / Lada');
    } else if (typeVal === 'minibus') {
      setNewCapacity(16);
      setNewSpeedLimit(80);
      if (!newMakeModel) setNewMakeModel('Toyota HiAce');
    } else if (typeVal === 'midibus') {
      setNewCapacity(30);
      setNewSpeedLimit(80);
      if (!newMakeModel) setNewMakeModel('Higer / Tata Midi');
    } else if (typeVal === 'bus' || typeVal === 'vip_coach') {
      setNewCapacity(50);
      setNewSpeedLimit(80);
      if (!newMakeModel) setNewMakeModel('Yutong 6122 / Golden Dragon');
    } else if (typeVal === 'truck') {
      setNewCapacity(30);
      setNewSpeedLimit(70);
      if (!newMakeModel) setNewMakeModel('Sinotruk Howo / Isuzu FSR');
    }
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
      status: 'active',
      inspectionStatus: 'passed',
      inspectionExpiry: '2027-12-30',
      fuelLevel: 85,
      currentSpeed: 0,
      speedLimit: Number(newSpeedLimit),
      lat: 9.02,
      lng: 38.75,
      origin: newOrigin || 'ያልተወሰነ',
      destination: newDestination || 'ያልተወሰነ',
      routeName: `${newOrigin || 'መነሻ'} - ${newDestination || 'መዳረሻ'}`,
      lastUpdate: 'አሁን',
    };

    onUpdateVehicles([newVeh, ...vehicles]);
    setIsAddModalOpen(false);

    // Reset form
    setNewPlate('');
    setNewMakeModel('');
    setNewDriver('');
    setNewOrigin('');
    setNewDestination('');
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('ተሽከርካሪውን ከስርዓቱ ማውጣት ይፈልጋሉ?')) {
      onUpdateVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>{t.vehicles} (National Fleet Registry - All Vehicle Types)</span>
          </h2>
          <p className="text-xs text-slate-400">
            ከባጃጅ እና ሞተርሳይክል ጀምሮ ሚኒባስ፣ ታክሲ፣ አውቶቡስና የከባድ ጭነት መኪናዎችን ያለገደብ መዝግበው የሚቆጣጠሩበት
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportVehiclesToCSV(vehicles)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
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
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="በሰሌዳ፣ ባጃጅ/ሞተር/አውቶቡስ፣ አሽከርካሪ ወይም ባለቤት ፈልግ..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">ሁሉም ዓይነቶች (ከባጃጅ እስከ አውቶቡስ)</option>
            <option value="bajaj">ባጃጅ (Bajaj Auto Rickshaw)</option>
            <option value="motorcycle">ሞተርሳይክል (Motorcycle)</option>
            <option value="damas">ዳማስ / ሱዙኪ ቫን (Damas / Mini Van)</option>
            <option value="taxi">ታክሲ (City Taxi)</option>
            <option value="minibus">ሚኒባስ (Minibus)</option>
            <option value="midibus">መካከለኛ አውቶቡስ (Midibus)</option>
            <option value="bus">ረጅም ርቀት አውቶቡስ (Bus)</option>
            <option value="vip_coach">ቪአይፒ ኮች (VIP Coach)</option>
            <option value="truck">የጭነት መኪና (Heavy Truck)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
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
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">{t.plateNumber}</th>
                <th className="px-4 py-3">ዓይነትና ሞዴል</th>
                <th className="px-4 py-3">ባለቤት / ማህበር</th>
                <th className="px-4 py-3">አሽከርካሪ</th>
                <th className="px-4 py-3">መነሻና መዳረሻ</th>
                <th className="px-4 py-3">ፍጥነትና ቴሌሜትሪ</th>
                <th className="px-4 py-3">{t.status}</th>
                <th className="px-4 py-3 text-right">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-750/50 transition-colors">
                  {/* Plate */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                      {v.plateNumber}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                      GPS: {v.speedLimiterId}
                    </span>
                  </td>

                  {/* Make/Model */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">
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
                        <p className="font-semibold text-slate-100">{v.makeModel}</p>
                        <p className="text-[11px] text-slate-400 uppercase font-mono">
                          {v.vehicleType} • {v.capacity} {v.vehicleType === 'truck' ? 'ቶን' : 'ተሳፋሪ'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-200">{v.ownerName}</span>
                  </td>

                  {/* Driver */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-200">{v.driverName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 pl-5">{v.driverPhone}</span>
                  </td>

                  {/* Origin & Destination */}
                  <td className="px-4 py-3.5 text-slate-300">
                    <span className="block font-medium">{v.origin || 'አዲስ አበባ'}</span>
                    <span className="text-[10px] text-slate-500">➔ {v.destination || 'ክፍት'}</span>
                  </td>

                  {/* Speed & Telemetry */}
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
                      <span>{v.fuelLevel}% ነዳጅ</span>
                    </div>
                  </td>

                  {/* Status */}
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

                  {/* Delete action */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1.5 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      title="አስወግድ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">አዲስ ተሽከርካሪ መዝግብ (ከባጃጅ እስከ አውቶቡስ)</h3>
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
                    <option value="bajaj">ባጃጅ (Bajaj 3-Wheeler)</option>
                    <option value="motorcycle">ሞተርሳይክል (Motorcycle)</option>
                    <option value="damas">ዳማስ / ሱዙኪ (Damas / Mini Van)</option>
                    <option value="taxi">ታክሲ (Sedan Taxi)</option>
                    <option value="minibus">ሚኒባስ ታክሲ (Minibus)</option>
                    <option value="midibus">መካከለኛ አውቶቡስ (Midibus)</option>
                    <option value="bus">የረጅም ርቀት አውቶቡስ (Long Distance Bus)</option>
                    <option value="vip_coach">ቪአይፒ የቅንጦት ባስ (Luxury Coach)</option>
                    <option value="truck">የከባድ ጭነት (Heavy Freight Truck)</option>
                    <option value="special">ልዩ ተሽከርካሪ (Special Vehicle)</option>
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
                  <label className="block text-slate-300 font-medium mb-1">ሞዴል (Make & Model) *</label>
                  <input
                    type="text"
                    required
                    value={newMakeModel}
                    onChange={(e) => setNewMakeModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">የመጫን አቅም (Seats / Tons)</label>
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

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ባለቤት / ማህበር (ያለገደብ የትኛውም ማህበር ወይም ግለሰብ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="የማህበሩ ወይም የባለቤቱ ስም ይፃፉ..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
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
