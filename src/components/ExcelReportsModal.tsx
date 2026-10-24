import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  CheckCircle, 
  Truck, 
  Users, 
  Clock, 
  ShieldAlert, 
  FileText
} from 'lucide-react';
import { Driver, Language, QueueTurn, SafetyReport, Vehicle } from '../types';
import { translations } from '../data/translations';
import { 
  exportVehiclesToCSV, 
  exportDriversToCSV, 
  exportQueueToCSV, 
  exportSafetyReportsToCSV 
} from '../utils/exportHelpers';

interface ExcelReportsModalProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  queues: QueueTurn[];
  reports: SafetyReport[];
  currentLang: Language;
}

export const ExcelReportsModal: React.FC<ExcelReportsModalProps> = ({
  vehicles,
  drivers,
  queues,
  reports,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedVehicleForManifest, setSelectedVehicleForManifest] = useState<string>(vehicles[0]?.plateNumber || '');
  const [manifestPassengerCount, setManifestPassengerCount] = useState<number>(48);
  const [manifestRoute, setManifestRoute] = useState<string>('አዲስ አበባ (ቃሊቲ) - ሀዋሳ');
  const [showPrintManifest, setShowPrintManifest] = useState<boolean>(false);

  const matchedVeh = vehicles.find((v) => v.plateNumber === selectedVehicleForManifest) || vehicles[0];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {t.reportsExport} (Excel & CSV Reports Center)
            </h2>
            <p className="text-xs text-slate-400">
              የተሽከርካሪዎችን፣ የአሽከርካሪዎችን፣ የተራዎችንና የደህንነት ጥቆማዎችን ወደ ኤክሴል (CSV) በቀጥታ ማውረጃና ህጋዊ ማኒፌስት ማተሚያ
            </p>
          </div>
        </div>
      </div>

      {/* 4 Primary Excel Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicles CSV */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">የተሽከርካሪዎች ማህደር ኤክሴል</h3>
            <p className="text-xs text-slate-400 mt-1">
              ሰሌዳ፣ ሞዴል፣ ቴክኒክ ምርመራ፣ የፍጥነት መቆጣጠሪያ መለያና ባለቤት የያዘ ዝርዝር
            </p>
          </div>
          <button
            onClick={() => exportVehiclesToCSV(vehicles)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ኤክሴል አውርድ ({vehicles.length})</span>
          </button>
        </div>

        {/* Drivers CSV */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl w-fit mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">የአሽከርካሪዎች መረጃ ኤክሴል</h3>
            <p className="text-xs text-slate-400 mt-1">
              የመንጃ ፍቃድ ደረጃ፣ ስልክ ቁጥር፣ የደህንነት ነጥብና የቅጣት መዝገብ
            </p>
          </div>
          <button
            onClick={() => exportDriversToCSV(drivers)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ኤክሴል አውርድ ({drivers.length})</span>
          </button>
        </div>

        {/* Queues CSV */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl w-fit mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">የተራዎችና የስምሪት ኤክሴል</h3>
            <p className="text-xs text-slate-400 mt-1">
              የመናኸሪያ የተራ ቁጥሮች፣ የቲኬት ኮዶች፣ የመነሻ ሰዓትና የተሳፋሪ ብዛት
            </p>
          </div>
          <button
            onClick={() => exportQueueToCSV(queues)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ኤክሴል አውርድ ({queues.length})</span>
          </button>
        </div>

        {/* Safety Reports CSV */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl w-fit mb-2">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">የትራፊክ ደህንነትና ጥቆማ</h3>
            <p className="text-xs text-slate-400 mt-1">
              የፍጥነት ወሰን ጥሰቶች፣ የዜጎች ጥቆማዎች፣ ማስረጃዎችና የተወሰዱ ውሳኔዎች
            </p>
          </div>
          <button
            onClick={() => exportSafetyReportsToCSV(reports)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ኤክሴል አውርድ ({reports.length})</span>
          </button>
        </div>
      </div>

      {/* Official Government Trip Manifest / Waybill Generator */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              ህጋዊ የመንገድ ጉዞ ፈቃድና ማኒፌስት ማመንጫ (Official Trip Waybill & Manifest)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">ተሽከርካሪ ይምረጡ</label>
            <select
              value={selectedVehicleForManifest}
              onChange={(e) => setSelectedVehicleForManifest(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.plateNumber}>
                  {v.plateNumber} - {v.makeModel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">የጉዞ መስመር</label>
            <input
              type="text"
              value={manifestRoute}
              onChange={(e) => setManifestRoute(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">የተሳፋሪዎች ቁጥር</label>
            <input
              type="number"
              value={manifestPassengerCount}
              onChange={(e) => setManifestPassengerCount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowPrintManifest(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>ማኒፌስቱን አዘጋጅና አትም (Generate & Print Manifest)</span>
          </button>
        </div>
      </div>

      {/* Printable Manifest Preview */}
      {showPrintManifest && matchedVeh && (
        <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-2xl border-4 border-slate-800 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight">የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ</h2>
              <h3 className="text-base font-bold text-emerald-800">የመንገድ እና ትራንስፖርት ባለስልጣን</h3>
              <p className="text-xs text-slate-600">ህጋዊ የሕዝብ/የጭነት መጓጓዣ የመንገድ ፈቃድና የጉዞ ማኒፌስት</p>
            </div>

            <div className="border-2 border-slate-900 p-2 text-center rounded font-mono text-xs">
              <span className="block text-[9px] uppercase font-bold">የማኒፌስት መለያ ቁጥር</span>
              <span className="font-extrabold text-sm text-red-600">
                MNF-2026-{Math.floor(100000 + Math.random() * 900000)}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border p-4 rounded-xl bg-slate-50">
            <div>
              <span className="text-slate-500 block">የሰሌዳ ቁጥር:</span>
              <span className="font-mono font-bold text-sm">{matchedVeh.plateNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ተሽከርካሪ ሞዴል:</span>
              <span className="font-bold">{matchedVeh.makeModel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">አሽከርካሪ:</span>
              <span className="font-bold">{matchedVeh.driverName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ስልክ:</span>
              <span className="font-mono">{matchedVeh.driverPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የባለቤት ስም:</span>
              <span className="font-semibold">{matchedVeh.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የጉዞ መስመር:</span>
              <span className="font-bold text-emerald-700">{manifestRoute}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የተሳፋሪ ቁጥር:</span>
              <span className="font-mono font-bold">{manifestPassengerCount} ተሳፋሪዎች</span>
            </div>
            <div>
              <span className="text-slate-500 block">የቴክኒክ ምርመራ:</span>
              <span className="font-semibold text-emerald-600">ብቁ (Passed)</span>
            </div>
          </div>

          {/* Signature and Stamp Seals */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-xs text-center">
            <div>
              <span className="text-slate-500 block">የመናኸሪያ ተቆጣጣሪ ፊርማ:</span>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
            <div>
              <span className="text-slate-500 block">የአሽከርካሪ ፊርማ:</span>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-700 flex items-center justify-center text-[9px] font-bold text-emerald-800 text-center uppercase rotate-12">
                ማህተም<br />OFFICIAL
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setShowPrintManifest(false)}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg"
            >
              ዝጋ
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
            >
              <Printer className="w-4 h-4" />
              <span>ወደ ፕሪንተር ላክ (Print Document)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
