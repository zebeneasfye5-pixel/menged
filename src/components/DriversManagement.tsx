import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Star, 
  AlertTriangle, 
  Phone, 
  ShieldCheck, 
  Award,
  Trash2,
  X
} from 'lucide-react';
import { Driver, Language } from '../types';
import { translations } from '../data/translations';
import { exportDriversToCSV } from '../utils/exportHelpers';

interface DriversManagementProps {
  drivers: Driver[];
  currentLang: Language;
  onUpdateDrivers: (drivers: Driver[]) => void;
}

export const DriversManagement: React.FC<DriversManagementProps> = ({
  drivers,
  currentLang,
  onUpdateDrivers,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New driver form
  const [newName, setNewName] = useState('');
  const [newLicNum, setNewLicNum] = useState(`ETH-LIC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [newGrade, setNewGrade] = useState('ደረጃ 4 (ህዝብ 1)');
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [newPhone, setNewPhone] = useState('+251 9');
  const [newExp, setNewExp] = useState(5);
  const [newPlate, setNewPlate] = useState('1-A10482 አ.አ');

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.assignedPlate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = filterGrade === 'all' || d.licenseGrade.toLowerCase().includes(filterGrade.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const finalGrade = customGradeInput.trim() ? customGradeInput.trim() : newGrade;

    const newDriver: Driver = {
      id: `drv_${Date.now()}`,
      fullName: newName,
      licenseNumber: newLicNum,
      licenseGrade: finalGrade,
      phone: newPhone,
      experienceYears: Number(newExp),
      rating: 4.9,
      status: 'active',
      penaltyPoints: 0,
      assignedPlate: newPlate,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      healthCertExpiry: '2027-12-30',
    };

    onUpdateDrivers([newDriver, ...drivers]);
    setIsAddModalOpen(false);

    // Reset
    setNewName('');
    setCustomGradeInput('');
  };

  const handleToggleSuspend = (driverId: string) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        return {
          ...d,
          status: d.status === 'suspended' ? ('active' as const) : ('suspended' as const),
        };
      }
      return d;
    });
    onUpdateDrivers(updated);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm('አሽከርካሪውን ከስርዓቱ መሰረዝ ይፈልጋሉ?')) {
      onUpdateDrivers(drivers.filter((d) => d.id !== driverId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>{t.drivers} (Drivers Registry - Unlimited License Categories)</span>
          </h2>
          <p className="text-xs text-slate-400">
            ከሞተርና ባጃጅ ጀምሮ እስከ ህዝብ 1፣ 2፣ ከባድ ጭነትና ዓለም አቀፍ የመንጃ ፍቃድ ያለገደብ የሚመዘገብበት
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportDriversToCSV(drivers)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportExcel}</span>
          </button>

          {/* Add Driver Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="በስም፣ ደረጃ (ሞተር/ባጃጅ/ህዝብ)፣ ፍቃድ ቁጥር ወይም በስልክ ፈልግ..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">ሁሉም የመንጃ ፍቃድ ደረጃዎች</option>
            <option value="ባጃጅ">ሞተር / ባጃጅ ፍቃድ</option>
            <option value="ደረጃ 3">ደረጃ 3 (ታክሲ/ሚኒባስ)</option>
            <option value="ደረጃ 4">ደረጃ 4 (ህዝብ 1)</option>
            <option value="ደረጃ 5">ደረጃ 5 (ህዝብ 2)</option>
            <option value="ጭነት">የከባድ ጭነት</option>
            <option value="አለም አቀፍ">ዓለም አቀፍ (International)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">ሁሉም ሁኔታዎች</option>
            <option value="active">ዝግጁ / ንቁ</option>
            <option value="on_route">በጉዞ ላይ</option>
            <option value="suspended">የታገደ</option>
          </select>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg hover:border-slate-600 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with avatar & info */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={driver.avatarUrl}
                  alt={driver.fullName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm truncate">{driver.fullName}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        driver.status === 'suspended'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : driver.status === 'on_route'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {driver.status === 'suspended' ? 'የታገደ' : driver.status === 'on_route' ? 'በጉዞ ላይ' : 'ዝግጁ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold">{driver.licenseGrade}</p>
                  <p className="text-[10px] font-mono text-slate-400">{driver.licenseNumber}</p>
                </div>
              </div>

              {/* Stats & Assignment */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-750 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">የተመደበለት ተሽከርካሪ:</span>
                  <span className="font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded">
                    {driver.assignedPlate}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">ደህንነት ደረጃ (Rating):</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{driver.rating} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">የቅጣት ነጥብ (Penalties):</span>
                  <span
                    className={`font-mono font-bold ${
                      driver.penaltyPoints >= 10
                        ? 'text-red-400 animate-pulse'
                        : driver.penaltyPoints > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {driver.penaltyPoints} ነጥብ
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>ስልክ:</span>
                  </span>
                  <span className="font-mono text-slate-200">{driver.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                ልምድ: {driver.experienceYears} ዓመት
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSuspend(driver.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    driver.status === 'suspended'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40'
                  }`}
                >
                  {driver.status === 'suspended' ? 'ዕገዳ አንሳ' : 'አግድ'}
                </button>

                <button
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="p-1.5 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="አስወግድ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">አዲስ አሽከርካሪ መዝግብ (ያለደረጃ ገደብ)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ሙሉ ስም (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="የአሽከርካሪው ሙሉ ስም"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የመንጃ ፍቃድ ቁጥር</label>
                  <input
                    type="text"
                    required
                    value={newLicNum}
                    onChange={(e) => setNewLicNum(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ደረጃ መምረጫ</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="ሞተር / ባጃጅ መንጃ ፍቃድ">ሞተር / ባጃጅ መንጃ ፍቃድ</option>
                    <option value="ደረጃ 3 (ታክሲ/ሚኒባስ)">ደረጃ 3 (ታክሲ/ሚኒባስ)</option>
                    <option value="ደረጃ 4 (ህዝብ 1)">ደረጃ 4 (ህዝብ 1)</option>
                    <option value="ደረጃ 5 (ህዝብ 2)">ደረጃ 5 (ህዝብ 2)</option>
                    <option value="ደረጃ 5 (የከባድ ጭነት)">ደረጃ 5 (የከባድ ጭነት)</option>
                    <option value="ዓለም አቀፍ መንጃ ፍቃድ (International)">ዓለም አቀፍ መንጃ ፍቃድ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ወይም የፍቃድ ዓይነት በነፃነት ይፃፉ (Free-form custom grade):
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፡ ልዩ የኤሌክትሪክ ተሽከርካሪ / የውጭ አገር መንጃ ፍቃድ..."
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ስልክ ቁጥር</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የልምድ ዓመታት</label>
                  <input
                    type="number"
                    value={newExp}
                    onChange={(e) => setNewExp(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">የሚመደብበት ሰሌዳ ቁጥር</label>
                <input
                  type="text"
                  placeholder="1-A10482 አ.አ"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
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
