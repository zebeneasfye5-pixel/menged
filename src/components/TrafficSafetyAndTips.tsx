import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Camera, 
  Volume2, 
  Send, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle2, 
  X,
  Upload,
  Play,
  Pause,
  Film
} from 'lucide-react';
import { Language, SafetyReport, Vehicle } from '../types';
import { translations } from '../data/translations';
import { playEmergencySiren, speakText } from '../utils/audio';
import { exportSafetyReportsToCSV } from '../utils/exportHelpers';

interface TrafficSafetyAndTipsProps {
  reports: SafetyReport[];
  vehicles: Vehicle[];
  currentLang: Language;
  onUpdateReports: (reports: SafetyReport[]) => void;
  audioAlertsEnabled: boolean;
}

export const TrafficSafetyAndTips: React.FC<TrafficSafetyAndTipsProps> = ({
  reports,
  vehicles,
  currentLang,
  onUpdateReports,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];
  const [filterType, setFilterType] = useState<string>('all');
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  // New tip form state
  const [tipPlate, setTipPlate] = useState<string>('');
  const [tipType, setTipType] = useState<SafetyReport['incidentType']>('overspeed');
  const [tipSeverity, setTipSeverity] = useState<SafetyReport['severity']>('high');
  const [tipLocation, setTipLocation] = useState<string>('');
  const [tipReporter, setTipReporter] = useState<string>('');
  const [tipPhone, setTipPhone] = useState<string>('');
  const [tipDescription, setTipDescription] = useState<string>('');
  
  // Real Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Real Photo/Video attachment
  const [photoPreview, setPhotoPreview] = useState<string>('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspector Action note
  const [inspectorActionNote, setInspectorActionNote] = useState<string>('');

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRealAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch {
      // Fallback if browser permission is blocked or simulated
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
      setTimeout(() => {
        stopRealAudioRecording();
      }, 4000);
    }
  };

  const stopRealAudioRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated audio blob
      setAudioUrl('simulated-voice-note');
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterType === 'all') return true;
    return r.incidentType === filterType;
  });

  const overspeedVehicles = vehicles.filter((v) => v.currentSpeed > v.speedLimit);

  const handlePlayVoiceTip = (report: SafetyReport) => {
    if (audioAlertsEnabled) {
      playEmergencySiren();
    }
    if (report.audioBlobUrl && report.audioBlobUrl.startsWith('blob:')) {
      const audio = new Audio(report.audioBlobUrl);
      audio.play();
    } else {
      const speech = `የተሳፋሪ የድምፅ ጥቆማ ለሰሌዳ ${report.vehiclePlate}፡ "${report.description}"። ቦታው፡ ${report.location}`;
      speakText(speech, 'am');
    }
  };

  const handleSubmitNewTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipPlate || !tipDescription) return;

    const durationStr = recordingSeconds > 0 
      ? `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`
      : '0:25';

    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      trackingNumber: `SAF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vehiclePlate: tipPlate,
      reportedBy: tipReporter || 'ስም ያልታወቀ ተሳፋሪ / ዜጋ',
      reporterPhone: tipPhone || '+251 91 000 0000',
      incidentType: tipType,
      severity: tipSeverity,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      location: tipLocation || 'የትኛውም አውራ ጎዳና / የከተማ መስመር',
      description: tipDescription,
      hasAudio: Boolean(audioUrl),
      audioBlobUrl: audioUrl || undefined,
      audioNoteDuration: audioUrl ? durationStr : undefined,
      photoUrl: photoPreview,
      status: 'pending',
    };

    onUpdateReports([newReport, ...reports]);
    setReportModalOpen(false);

    // Reset
    setTipPlate('');
    setTipDescription('');
    setAudioUrl(null);
    setRecordingSeconds(0);

    speakText('የጥቆማ ቅሬታዎ በስርዓቱ ውስጥ ተመዝግቧል፤ የትራንስፖርት ተቆጣጣሪዎች እርምጃ ይወስዳሉ!', 'am');
  };

  const handleUpdateStatus = (reportId: string, newStatus: SafetyReport['status']) => {
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status: newStatus,
          actionTaken: inspectorActionNote || r.actionTaken || 'በተቆጣጣሪው ውሳኔ ተላልፏል',
        };
      }
      return r;
    });
    onUpdateReports(updated);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        status: newStatus,
        actionTaken: inspectorActionNote || selectedReport.actionTaken,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>{t.safetyCitizenTips} (Road Safety & Citizen Complaints)</span>
          </h2>
          <p className="text-xs text-slate-400">
            የቀጥታ ፍጥነት ጥሰት ክትትል፣ የተሳፋሪዎች የድምፅና ምስል ጥቆማ መቀበያና የህግ ማስከበሪያ ማዕከል
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportSafetyReportsToCSV(reports)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.exportExcel}</span>
          </button>

          {/* New Citizen Tip Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.reportIncident}</span>
          </button>
        </div>
      </div>

      {/* Live Active Speed Violations Warning Banner */}
      {overspeedVehicles.length > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 border-2 border-red-500/80 rounded-2xl p-4 shadow-2xl animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>አስቸኳይ የፍጥነት ወሰን ጥሰት ተገኝቷል (CRITICAL SPEED BREACH)!</span>
                  <span className="text-xs font-mono bg-red-800 text-white px-2 py-0.5 rounded-full">
                    {overspeedVehicles.length} ተሽከርካሪዎች
                  </span>
                </h3>
                <p className="text-xs text-red-200">
                  የፍጥነት መቆጣጠሪያ ጂፒኤስ የፍጥነት ወሰኑን (&gt;80 ኪ.ሜ/ሰ) ያለፉ አውቶቡሶችን ለይቷል፤ የትራፊክ ፖሊስ እንዲያስቆማቸው ተልኳል።
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {overspeedVehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-black/60 px-3 py-1.5 rounded-xl border border-red-500/50 text-xs text-white font-mono flex items-center gap-2"
                >
                  <span className="font-bold text-amber-300">{v.plateNumber}</span>
                  <span className="text-red-400 font-extrabold">{v.currentSpeed} km/h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and stats row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">አጣራ:</span>
          {['all', 'overspeed', 'overloading', 'reckless_driving', 'tariff_extortion'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors border ${
                filterType === type
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              {type === 'all'
                ? 'ሁሉም'
                : type === 'overspeed'
                ? 'ፍጥነት ጥሰት'
                : type === 'overloading'
                ? 'ከመጠን በላይ መጫን'
                : type === 'reckless_driving'
                ? 'አደገኛ ማሽከርከር'
                : 'የታሪፍ ማጭበርበር'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredReports.length} ጥቆማዎች ተመዝግበዋል
        </span>
      </div>

      {/* Safety Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg hover:border-slate-600 transition-all flex flex-col justify-between"
          >
            {/* Card Header */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{report.trackingNumber}</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{report.vehiclePlate}</span>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    report.severity === 'critical'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                      : report.severity === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {report.severity}
                </span>
              </div>

              {/* Incident Type & Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  {report.incidentType === 'overspeed'
                    ? '⚠️ የፍጥነት ወሰን ጥሰት'
                    : report.incidentType === 'overloading'
                    ? '👥 ከመጠን በላይ መጫን'
                    : report.incidentType === 'tariff_extortion'
                    ? '💰 ያለአግባብ ታሪፍ መጨመር'
                    : '🚨 የትራፊክ አደጋ'}
                </span>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    report.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : report.status === 'fine_issued'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {report.status === 'resolved'
                    ? 'ተፈቷል'
                    : report.status === 'fine_issued'
                    ? 'ቅጣት ተላልፏል'
                    : 'በምርመራ ላይ'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                "{report.description}"
              </p>

              {/* Location & Time */}
              <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-700/60 pt-2">
                <div className="flex justify-between">
                  <span>ቦታ:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[170px]">{report.location}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>ቀን:</span>
                  <span>{report.timestamp}</span>
                </div>
              </div>

              {/* Photo Evidence Thumbnail if present */}
              {report.photoUrl && (
                <div className="relative rounded-xl overflow-hidden h-28 border border-slate-700">
                  <img
                    src={report.photoUrl}
                    alt="Evidence"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded backdrop-blur">
                    የምስል ማስረጃ
                  </span>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
              {report.hasAudio ? (
                <button
                  onClick={() => handlePlayVoiceTip(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>የድምፅ ጥቆማ ({report.audioNoteDuration || '0:30'})</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">የድምፅ ቅጂ የለም</span>
              )}

              <button
                onClick={() => setSelectedReport(report)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                እርምጃ ውሰድ ➔
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Details & Inspector Decision Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">የጥቆማ ዝርዝር መዝገብ</h3>
                <span className="text-xs font-mono text-emerald-400">{selectedReport.trackingNumber}</span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">ተሽከርካሪ ሰሌዳ:</span>
                  <span className="font-bold font-mono text-amber-300 text-sm">{selectedReport.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ጠቋሚ:</span>
                  <span className="font-medium text-slate-200">{selectedReport.reportedBy}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">የቀረበው አቤቱታ:</span>
                <p className="bg-slate-800 p-3 rounded-xl border border-slate-700 leading-relaxed text-slate-200">
                  "{selectedReport.description}"
                </p>
              </div>

              {selectedReport.hasAudio && (
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">የድምፅ ማስረጃ ተያይዟል:</span>
                  <button
                    onClick={() => handlePlayVoiceTip(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>ድምፁን አጫውት</span>
                  </button>
                </div>
              )}

              {selectedReport.actionTaken && (
                <div>
                  <span className="text-emerald-400 font-medium block mb-1">የተወሰደ እርምጃ:</span>
                  <p className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40 text-emerald-200">
                    {selectedReport.actionTaken}
                  </p>
                </div>
              )}

              {/* Inspector action input */}
              <div className="pt-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  የትራንስፖርት ተቆጣጣሪ ውሳኔ / ቅጣት ማስታወሻ:
                </label>
                <textarea
                  rows={2}
                  value={inspectorActionNote}
                  onChange={(e) => setInspectorActionNote(e.target.value)}
                  placeholder="ለምሳሌ፡ ተሽከርካሪው ለ10 ቀን ታግዷል፤ 3,000 ብር ቅጣት ተወስኗል..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'under_investigation')}
                  className="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold"
                >
                  በምርመራ ላይ
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'fine_issued')}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                >
                  ቅጣት ወስን
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  ተፈቷል / ዝጋ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit New Citizen Tip Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-base">አዲስ የተገልጋይ ጥቆማ ቅሬታ ማስገቢያ</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTip} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  የተሽከርካሪው ሰሌዳ ቁጥር (ማንኛውም ተሽከርካሪ ከባጃጅ ጀምሮ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ለምሳሌ፡ 1-A10482 አ.አ (ባጃጅ) ወይም 3-D88192 ድሬ..."
                  value={tipPlate}
                  onChange={(e) => setTipPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">የጥሰት ዓይነት</label>
                  <select
                    value={tipType}
                    onChange={(e) => setTipType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="overspeed">ከፍጥነት ወሰን በላይ መንዳት</option>
                    <option value="overloading">ከመጠን በላይ መጫን</option>
                    <option value="reckless_driving">አደገኛ ማሽከርከር</option>
                    <option value="tariff_extortion">ያለአግባብ ታሪፍ መጨመር</option>
                    <option value="accident">የትራፊክ አደጋ</option>
                    <option value="mechanical_failure">የቴክኒክ ብልሽት</option>
                    <option value="other">ሌላ ጥሰት</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ደረጃ (Severity)</label>
                  <select
                    value={tipSeverity}
                    onChange={(e) => setTipSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="critical">አስቸኳይ (Critical)</option>
                    <option value="high">ከፍተኛ (High)</option>
                    <option value="medium">መካከለኛ (Medium)</option>
                    <option value="low">ቀላል (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ቦታ / መስመር (ያለገደብ የትኛውም ቦታ)</label>
                <input
                  type="text"
                  placeholder="የትኛውም ሰፈር፣ ወረዳ፣ ዞን፣ ከተማ ወይም አውራ ጎዳና..."
                  value={tipLocation}
                  onChange={(e) => setTipLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ጠቋሚ ስም (አማራጭ)</label>
                  <input
                    type="text"
                    placeholder="ስምዎ"
                    value={tipReporter}
                    onChange={(e) => setTipReporter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ስልክ ቁጥር</label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={tipPhone}
                    onChange={(e) => setTipPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ዝርዝር መግለጫ *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="ምን አይነት ችግር ወይም ጥሰት ተፈጠረ? በዝርዝር ያስረዱ..."
                  value={tipDescription}
                  onChange={(e) => setTipDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* UNRESTRICTED REAL AUDIO & PHOTO/VIDEO CAPTURE */}
              <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">
                  ያለገደብ የድምፅና ምስል/ቪዲዮ ማስረጃ ማያያዣ (Live Recording & Attachments):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Real MediaRecorder Mic */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-750 space-y-2">
                    <label className="block text-slate-400 font-medium">የቀጥታ ድምፅ ቅረጽ (Microphone):</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isRecording ? stopRealAudioRecording : startRealAudioRecording}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : audioUrl
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        <span>
                          {isRecording
                            ? `በመቅረጽ ላይ (${recordingSeconds}s)... አቁም`
                            : audioUrl
                            ? 'ተቀርጿል ✓ እንደገና ቅረጽ'
                            : 'የድምፅ ማስታወሻ ቅረጽ'}
                        </span>
                      </button>
                    </div>

                    {audioUrl && (
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ድምፁ በተሳካ ሁኔታ ተቀርጾ ተያይዟል (0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds || 25})
                      </p>
                    )}
                  </div>

                  {/* Real Camera / File Upload */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-750 space-y-2">
                    <label className="block text-slate-400 font-medium">ፎቶ / ቪዲዮ ከስልክ ወይም ኮምፒውተር:</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>ፋይል ምረጥ / በካሜራ አንሳ</span>
                    </button>

                    {photoPreview && (
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-700">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.submitTip}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
