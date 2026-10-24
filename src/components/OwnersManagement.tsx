import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Truck, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle,
  CreditCard,
  Trash2,
  X
} from 'lucide-react';
import { Language, Owner } from '../types';
import { translations } from '../data/translations';

interface OwnersManagementProps {
  owners: Owner[];
  currentLang: Language;
  onUpdateOwners: (owners: Owner[]) => void;
}

export const OwnersManagement: React.FC<OwnersManagementProps> = ({
  owners,
  currentLang,
  onUpdateOwners,
}) => {
  const t = translations[currentLang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Owner['type']>('association');
  const [newTin, setNewTin] = useState(`00${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [newPhone, setNewPhone] = useState('+251 9');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('አዲስ አበባ');
  const [newVehCount, setNewVehCount] = useState(5);
  const [newBankName, setNewBankName] = useState('የኢትዮጵያ ንግድ ባንክ (CBE)');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newTelebirr, setNewTelebirr] = useState('');

  const filteredOwners = owners.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.tin.includes(searchQuery)
  );

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newOwner: Owner = {
      id: `own_${Date.now()}`,
      name: newName,
      type: newType,
      tin: newTin,
      phone: newPhone,
      email: newEmail || 'contact@fleet.et',
      city: newCity,
      bankName: newBankName,
      bankAccountNo: newBankAccount,
      telebirrPhone: newTelebirr || newPhone,
      vehiclesCount: Number(newVehCount),
      activeVehicles: Math.floor(Number(newVehCount) * 0.8),
      fleetRevenueEtb: Number(newVehCount) * 150000,
    };

    onUpdateOwners([newOwner, ...owners]);
    setIsAddModalOpen(false);

    // Reset
    setNewName('');
    setNewBankAccount('');
  };

  const handleDeleteOwner = (id: string) => {
    if (confirm('ባለቤቱን / ማህበሩን ከስርዓቱ ማውጣት ይፈልጋሉ?')) {
      onUpdateOwners(owners.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>{t.owners} (Unrestricted Transport Associations & Owners)</span>
          </h2>
          <p className="text-xs text-slate-400">
            የትኛውም የትራንስፖርት ማህበር፣ ህብረት፣ የባጃጅ ማህበር፣ አክሲዮን ማህበር ወይም የግል ባለሀብት መዝገብና የክፍያ ሂሳብ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>አዲስ ባለቤት / ማህበር መዝግብ</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-6" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="የማህበር ስም፣ ከተማ ወይም የግብር ከፋይ ቁጥር (TIN) ፈልግ..."
          className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Owners Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.map((owner) => (
          <div
            key={owner.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      owner.type === 'company'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : owner.type === 'association'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {owner.type === 'company' ? 'አክሲዮን ማህበር (S.C)' : owner.type === 'association' ? 'የትራንስፖርት ማህበር' : 'የግል ባለሀብት'}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-1.5 leading-snug">{owner.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">TIN: {owner.tin}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">ተሽከርካሪዎች</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {owner.vehiclesCount}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-750 grid grid-cols-2 gap-2 text-xs mt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">ንቁ በስራ ላይ</span>
                  <span className="font-bold text-emerald-400 font-mono">{owner.activeVehicles} ተሽከርካሪ</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">የፍሊት ገቢ</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {(owner.fleetRevenueEtb / 1000000).toFixed(1)}M ብር
                  </span>
                </div>
              </div>

              {/* Contact & Banking info */}
              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-750 pt-2 font-mono mt-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{owner.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{owner.phone}</span>
                </div>
                {owner.bankAccountNo && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">{owner.bankAccountNo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-750">
              <button
                onClick={() => handleDeleteOwner(owner.id)}
                className="p-1 text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ማህበር አስወግድ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">አዲስ ባለቤት / ማህበር መዝግብ (ያለገደብ)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  የማህበር / ባለቤት ስም (የትኛውም ስም) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ለምሳሌ፡ የቦሌ ባጃጅ አሽከርካሪዎች ማህበር ወይም ሰላም ባስ..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ዓይነት</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="association">የትራንስፖርት ማህበር</option>
                    <option value="company">አክሲዮን ማህበር (Share Co.)</option>
                    <option value="individual">የግል ባለሀብት</option>
                    <option value="cooperative">ህብረት ስራ ማህበር</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የግብር ከፋይ ቁጥር (TIN)</label>
                  <input
                    type="text"
                    required
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
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
                  <label className="block text-slate-300 font-medium mb-1">ከተማ / አካባቢ</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banking & Settlement Accounts */}
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  የሂሳብ ርክክብ መቀበያ (Bank / Telebirr for Payouts):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ባንክ ሂሳብ ቁጥር:</label>
                    <input
                      type="text"
                      placeholder="CBE 1000..."
                      value={newBankAccount}
                      onChange={(e) => setNewBankAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">ቴሌብር ስልክ:</label>
                    <input
                      type="text"
                      placeholder="+251 9..."
                      value={newTelebirr}
                      onChange={(e) => setNewTelebirr(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
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
