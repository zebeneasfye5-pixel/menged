import React, { useState } from 'react';
import { 
  Clock, 
  Volume2, 
  Ticket, 
  Send, 
  Plus, 
  Building, 
  CheckCircle, 
  Printer, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Language, QueueTurn, Vehicle } from '../types';
import { translations } from '../data/translations';
import { playStationChime, playSuccessTone, speakText } from '../utils/audio';
import { exportQueueToCSV } from '../utils/exportHelpers';

interface QueueTurnManagerProps {
  queues: QueueTurn[];
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateQueue: (updated: QueueTurn[]) => void;
  audioAlertsEnabled: boolean;
}

export const QueueTurnManager: React.FC<QueueTurnManagerProps> = ({
  queues,
  vehicles,
  currentLang,
  onUpdateQueue,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all');
  const [ticketModalItem, setTicketModalItem] = useState<QueueTurn | null>(null);
  const [newTurnModalOpen, setNewTurnModalOpen] = useState<boolean>(false);

  // New queue turn form state
  const [newVehiclePlate, setNewVehiclePlate] = useState<string>('');
  const [newRouteName, setNewRouteName] = useState<string>('አዲስ አበባ - ሀዋሳ');
  const [newTerminal, setNewTerminal] = useState<string>('አዲስ አበባ - ቃሊቲ መናኸሪያ (Kality Terminal)');

  const terminals = [
    { id: 'all', name: 'ሁሉም መናኸሪያዎች (All Terminals)' },
    { id: 'term_kality', name: 'አዲስ አበባ - ቃሊቲ መናኸሪያ (Kality)' },
    { id: 'term_autobis', name: 'አዲስ አበባ - አውቶቡስ ተራ (Autobis Tera)' },
    { id: 'term_lambert', name: 'አዲስ አበባ - ላምበርት መናኸሪያ (Lambert)' },
    { id: 'term_asko', name: 'አዲስ አበባ - አስኮ መናኸሪያ (Asko)' },
  ];

  const filteredQueues = queues.filter((q) => {
    if (selectedTerminal === 'all') return true;
    return q.terminalId === selectedTerminal;
  });

  const handleCallTurn = (turn: QueueTurn) => {
    if (audioAlertsEnabled) {
      playStationChime();
    }

    // Voice announcement in Amharic
    const voiceMsg = `የተራ ጥሪ ማስታወቂያ፡ የተሽከርካሪ ሰሌዳ ቁጥር ${turn.plateNumber}፣ መስመር ${turn.routeName}፣ ተራ ቁጥር ${turn.turnNumber} ደርሷል። እባክዎ ወደ መጫኛ መድረክ ያስገቡ።`;
    speakText(voiceMsg, 'am');

    // Update status to boarding
    const updated = queues.map((q) => (q.id === turn.id ? { ...q, status: 'boarding' as const } : q));
    onUpdateQueue(updated);
  };

  const handleDispatchTurn = (turn: QueueTurn) => {
    if (audioAlertsEnabled) {
      playSuccessTone();
    }
    const voiceMsg = `ተሽከርካሪ ${turn.plateNumber} በሰላም ተሸኝቷል። መልካም ጉዞ!`;
    speakText(voiceMsg, 'am');

    const updated = queues.map((q) => (q.id === turn.id ? { ...q, status: 'dispatched' as const } : q));
    onUpdateQueue(updated);
  };

  const handleRegisterNewTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehiclePlate) return;

    const matchedVeh = vehicles.find((v) => v.plateNumber === newVehiclePlate);
    const driverName = matchedVeh?.driverName || 'ተመዳቢ አሽከርካሪ';
    const driverPhone = matchedVeh?.driverPhone || '+251 91 100 0000';
    const capacity = matchedVeh?.capacity || 50;

    const newTurn: QueueTurn = {
      id: `q_${Date.now()}`,
      terminalId: 'term_kality',
      terminalName: newTerminal,
      routeId: 'r_custom',
      routeName: newRouteName,
      vehicleId: matchedVeh?.id || 'veh_custom',
      plateNumber: newVehiclePlate,
      driverName,
      driverPhone,
      turnNumber: queues.length + 1,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDeparture: 'በተራ መሰረት',
      status: 'waiting',
      capacity,
      bookedSeats: 0,
      ticketCode: `TRN-${Date.now().toString().slice(-6)}`,
      tariffPerSeat: 450,
    };

    onUpdateQueue([...queues, newTurn]);
    setNewTurnModalOpen(false);
    setNewVehiclePlate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{t.queueTurns} (Terminal Turn & Departure Management)</span>
          </h2>
          <p className="text-xs text-slate-400">
            የተሽከርካሪዎችን ተራ በዲጂታል ስርዓት መቆጣጠሪያ፣ የድምፅ ማስታወቂያና የተራ ቲኬት መስጫ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Terminal Selector */}
          <select
            value={selectedTerminal}
            onChange={(e) => setSelectedTerminal(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {terminals.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>

          {/* Export to Excel Button */}
          <button
            onClick={() => exportQueueToCSV(queues)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportExcel}</span>
          </button>

          {/* Register New Turn */}
          <button
            onClick={() => setNewTurnModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>አዲስ ተራ አስመዝግብ</span>
          </button>
        </div>
      </div>

      {/* Turn Overview Board Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow">
          <span className="text-[11px] text-slate-400 block">{t.waitingVehicles}</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono">
            {queues.filter((q) => q.status === 'waiting').length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">በተራ የሚጠብቁ</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow">
          <span className="text-[11px] text-slate-400 block">{t.boardingNow}</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">
            {queues.filter((q) => q.status === 'boarding').length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">በመጫን ላይ ያሉ</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow">
          <span className="text-[11px] text-slate-400 block">{t.dispatched}</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">
            {queues.filter((q) => q.status === 'dispatched').length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">ዛሬ የተሸኙ ተሽከርካሪዎች</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow">
          <span className="text-[11px] text-slate-400 block">የተሳፈሩ መንገደኞች</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">
            {queues.reduce((acc, q) => acc + q.bookedSeats, 0)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">አጠቃላይ መቀመጫዎች</span>
        </div>
      </div>

      {/* Live Turn Roster Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>የተሽከርካሪዎች የተራ ሰሌዳ (Active Dispatch Roster)</span>
            <span className="text-xs bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-slate-700">
              {filteredQueues.length} ተሽከርካሪዎች
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">ተራ #</th>
                <th className="px-4 py-3">{t.plateNumber}</th>
                <th className="px-4 py-3">መስመርና መናኸሪያ</th>
                <th className="px-4 py-3">አሽከርካሪ</th>
                <th className="px-4 py-3">መቀመጫ (ተሳፋሪ)</th>
                <th className="px-4 py-3">የመነሻ ሰዓት</th>
                <th className="px-4 py-3">{t.status}</th>
                <th className="px-4 py-3 text-right">የስራ ትዕዛዞች (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQueues.map((turn) => (
                <tr key={turn.id} className="hover:bg-slate-750/50 transition-colors">
                  {/* Turn # Badge */}
                  <td className="px-4 py-3.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center border border-slate-700">
                      #{turn.turnNumber}
                    </span>
                  </td>

                  {/* Plate */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700 text-xs">
                      {turn.plateNumber}
                    </span>
                  </td>

                  {/* Route & Terminal */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-100">{turn.routeName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      <span>{turn.terminalName.split('(')[0]}</span>
                    </p>
                  </td>

                  {/* Driver */}
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-200">{turn.driverName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{turn.driverPhone}</p>
                  </td>

                  {/* Seats progress */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">
                        {turn.bookedSeats}/{turn.capacity}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({Math.round((turn.bookedSeats / turn.capacity) * 100)}%)
                      </span>
                    </div>
                    <div className="w-20 bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${(turn.bookedSeats / turn.capacity) * 100}%` }}
                      />
                    </div>
                  </td>

                  {/* Departure */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-slate-300">{turn.estimatedDeparture}</span>
                    <span className="block text-[10px] text-slate-500">የገባበት: {turn.entryTime}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        turn.status === 'boarding'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                          : turn.status === 'waiting'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {turn.status === 'boarding' ? 'በመጫን ላይ' : turn.status === 'waiting' ? 'በመጠበቅ ላይ' : 'ተሸኝቷል'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Call Turn */}
                      {turn.status === 'waiting' && (
                        <button
                          onClick={() => handleCallTurn(turn)}
                          title={t.callTurn}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span>ተራ ጥራ</span>
                        </button>
                      )}

                      {/* Dispatch Button */}
                      {turn.status === 'boarding' && (
                        <button
                          onClick={() => handleDispatchTurn(turn)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>አሰናብት (Dispatch)</span>
                        </button>
                      )}

                      {/* Issue/View Ticket */}
                      <button
                        onClick={() => setTicketModalItem(turn)}
                        title="የተራ ትኬት ይመልከቱ / አትሙ"
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {ticketModalItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">ህጋዊ የተራ መነሻ ትኬት (Departure Ticket)</h3>
              </div>
              <button
                onClick={() => setTicketModalItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card View */}
            <div className="bg-white text-slate-950 p-5 rounded-2xl shadow-inner space-y-4 font-sans border-2 border-dashed border-slate-300">
              <div className="text-center border-b pb-2">
                <h4 className="font-extrabold text-sm uppercase">የመንገድና ትራንስፖርት ባለስልጣን</h4>
                <p className="text-[10px] text-slate-600">{ticketModalItem.terminalName}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">የተራ ቁጥር</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-700">
                    #{ticketModalItem.turnNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">የቲኬት ቁጥር</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {ticketModalItem.ticketCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-600">ሰሌዳ ቁጥር:</span>
                  <span className="font-bold font-mono">{ticketModalItem.plateNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-600">የጉዞ መስመር:</span>
                  <span className="font-bold">{ticketModalItem.routeName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-600">አሽከርካሪ:</span>
                  <span className="font-medium">{ticketModalItem.driverName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-600">የመነሻ ሰዓት:</span>
                  <span className="font-bold font-mono">{ticketModalItem.estimatedDeparture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">የአንድ መንገደኛ ታሪፍ:</span>
                  <span className="font-extrabold text-emerald-700">{ticketModalItem.tariffPerSeat} ብር</span>
                </div>
              </div>

              {/* QR Code Barcode Representation */}
              <div className="text-center pt-2 border-t">
                <div className="w-32 h-10 bg-slate-900 mx-auto flex items-center justify-center text-white text-[10px] font-mono tracking-widest rounded">
                  ||||| {ticketModalItem.ticketCode} |||||
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">በጣቢያው መውጫ ኬላ ላይ ይቃኙ</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>አትም (Print Ticket)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Turn Modal */}
      {newTurnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">ተሽከርካሪ በተራ ሰሌዳ መዝግብ</h3>
              </div>
              <button
                onClick={() => setNewTurnModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewTurn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  የተሽከርካሪ ሰሌዳ ይምረጡ *
                </label>
                <select
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- ሰሌዳ ይምረጡ --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} - {v.makeModel} ({v.driverName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">መናኸሪያ</label>
                <select
                  value={newTerminal}
                  onChange={(e) => setNewTerminal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="አዲስ አበባ - ቃሊቲ መናኸሪያ (Kality Terminal)">አዲስ አበባ - ቃሊቲ መናኸሪያ (Kality)</option>
                  <option value="አዲስ አበባ - አውቶቡስ ተራ (Autobis Tera)">አዲስ አበባ - አውቶቡስ ተራ (Autobis Tera)</option>
                  <option value="አዲስ አበባ - ላምበርት መናኸሪያ (Lambert Terminal)">አዲስ አበባ - ላምበርት መናኸሪያ (Lambert)</option>
                  <option value="አዲስ አበባ - አስኮ መናኸሪያ (Asko Terminal)">አዲስ አበባ - አስኮ መናኸሪያ (Asko)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">የጉዞ መስመር</label>
                <select
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="አዲስ አበባ - ሀዋሳ">አዲስ አበባ - ሀዋሳ (Hawassa Line)</option>
                  <option value="አዲስ አበባ - ባህር ዳር">አዲስ አበባ - ባህር ዳር (Bahir Dar Line)</option>
                  <option value="አዲስ አበባ - ድሬዳዋ">አዲስ አበባ - ድሬዳዋ (Dire Dawa Line)</option>
                  <option value="አዲስ አበባ - ጅማ">አዲስ አበባ - ጅማ (Jimma Line)</option>
                  <option value="አዲስ አበባ - አዳማ">አዲስ አበባ - አዳማ (Adama Expressway)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewTurnModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
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
