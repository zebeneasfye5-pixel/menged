import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Award, 
  Printer, 
  PenTool, 
  Building2, 
  CheckCircle, 
  Download, 
  X,
  Lock
} from 'lucide-react';
import { playSuccessTone, speakText } from '../utils/audio';

interface SmartContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioAlertsEnabled: boolean;
}

export const SmartContractModal: React.FC<SmartContractModalProps> = ({
  isOpen,
  onClose,
  audioAlertsEnabled,
}) => {
  const [developerName, setDeveloperName] = useState('Senior Software Engineering Architect');
  const [authorityOfficial, setAuthorityOfficial] = useState('አቶ ዘበነ አስፋው (የባለስልጣኑ ዋና ዳይሬክተር)');
  const [contractDate, setContractDate] = useState('2026-10-24');
  const [contractValueBirr, setContractValueBirr] = useState(3850000);
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [isSigned, setIsSigned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('transport_et_contract_signed') === 'true';
    }
    return true;
  });

  const handleSignContract = () => {
    setIsSigned(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('transport_et_contract_signed', 'true');
    }
    if (audioAlertsEnabled) {
      playSuccessTone();
    }
    speakText('ስማርት የውል ስምምነቱ በሁለቱም ወገኖች በዲጂታል ፊርማ ጸድቆ ተረጋግጧል!', 'am');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 text-white shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                ስማርት የሶፍትዌር ግንባታና ርክክብ የውል ስምምነት
              </h3>
              <p className="text-xs text-slate-400">
                Official Technology Engineering, License & Service Level Agreement (SLA)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Document Preview */}
        <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-2xl border-4 border-slate-800 font-sans shadow-inner space-y-5 text-xs">
          {/* Header Seal */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
              የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
            </span>
            <h2 className="text-lg font-extrabold uppercase mt-1">
              የቴክኖሎጂ አቅርቦት፣ የሶፍትዌር ግንባታና የርክክብ ውል ሰነድ
            </h2>
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-600 mt-1">
              <span>የውል ቁጥር: <strong>CNT-TECH-2026-0048</strong></span>
              <span>•</span>
              <span>ቀን: <strong>{contractDate}</strong></span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">ወገን 1: የሶፍትዌር አበልጻጊ (ገንቢው አካል)</span>
              <p className="font-bold text-sm text-slate-900">{developerName}</p>
              <p className="text-slate-600 text-[11px]">Senior Full-Stack & AI Systems Architect</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">ወገን 2: አሰሪው ተቋም (ደንበኛ)</span>
              <p className="font-bold text-sm text-emerald-800">{authorityOfficial}</p>
              <p className="text-slate-600 text-[11px]">የመንገድ እና ትራንስፖርት ባለስልጣን</p>
            </div>
          </div>

          {/* Terms & Articles */}
          <div className="space-y-3 leading-relaxed text-slate-700">
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-1">
                አንቀጽ 1: የስራው ወሰንና የስርዓቱ ዝርዝር አቅርቦት (Scope of Deliverables)
              </h4>
              <p>
                ገንቢው ለተቋሙ ሙሉ በሙሉ የሚሰራ፣ በሳተላይት ጂፒኤስ (GPS Telemetry) የታገዘ፣ የተሽከርካሪዎችን (ከባጃጅ ጀምሮ እስከ ትላልቅ አውቶቡሶች)፣ የአሽከርካሪዎችን፣ የባለቤቶችን ማህበር፣ የተራ ስምሪትን፣ ባለ 8 ቋንቋ የድምፅና ጽሁፍ ተርጓሚን፣ የተሳፋሪ ዲጂታል ትኬት ክፍያና ለባለተሽከርካሪው የተሰበሰበውን ብር የርክክብ ስርዓት (Settlement) የያዘ እና ያለኢንተርኔት የሚሰራ PWA አዘጋጅቶ አስረክቧል።
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-1">
                አንቀጽ 2: የባለቤትነትና የፍቃድ መብት (Ownership & IP Rights)
              </h4>
              <p>
                የተገነባው ድህረገፅና አፕሊኬሽን ሙሉ የኮድ ባለቤትነትና የመረጃ ቁጥጥር መብት ያለምንም ቅድመ ሁኔታ ለባለስልጣኑ ተቋም የተላለፈ ሲሆን ተቋሙ እንደአስፈላጊነቱ ለዜጎችና ለአሽከርካሪዎች አገልግሎት የመስጠት ሙሉ መብት አለው።
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-1">
                አንቀጽ 3: የጥገናና የድጋፍ ዋስትና (SLA & 24/7 Technical Warranty)
              </h4>
              <p>
                ገንቢው ለተከታታይ <strong>{warrantyMonths} ወራት</strong> ነፃ የቴክኒክ ክትትል፣ የስርዓት ማሻሻያ (Updates) እና 99.9% የስራ ላይ ዝግጁነት ዋስትና (Service Level Agreement) ሰጥቷል።
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-1">
                አንቀጽ 4: የውል ዋጋና የርክክብ ማረጋገጫ (Contract Value & Acceptance)
              </h4>
              <p>
                ይህንን አጠቃላይ ስራ በተሟላ መልኩ ገንብቶ ለተቋሙ ለማስረከብ የውል ዋጋው <strong>{contractValueBirr.toLocaleString()} (ሶስት ሚሊዮን ስምንት መቶ ሃምሳ ሺህ የኢትዮጵያ ብር)</strong> ሆኖ በሁለቱም ወገኖች የጋራ ስምምነት ጸድቋል።
              </p>
            </div>
          </div>

          {/* Signatures & Seal Box */}
          <div className="grid grid-cols-3 gap-3 border-t-2 border-slate-900 pt-4 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">የገንቢው ዲጂታል ፊርማ</span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2 flex items-center justify-center font-mono font-bold text-emerald-700 italic">
                {isSigned ? 'Digitally Signed ✓' : 'ፊርማ በመጠባበቅ ላይ...'}
              </div>
              <span className="text-[10px] text-slate-700 block mt-1">{developerName}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-800 flex items-center justify-center text-[9px] font-extrabold text-emerald-900 uppercase rotate-6">
                ህጋዊ ማህተም<br />OFFICIAL SEAL
              </div>
              <span className="text-[9px] text-emerald-700 font-bold mt-1">VERIFIED CONTRACT</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">የባለስልጣኑ ተወካይ ፊርማ</span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2 flex items-center justify-center font-mono font-bold text-emerald-700 italic">
                {isSigned ? 'Approved & Sealed ✓' : 'ፊርማ በመጠባበቅ ላይ...'}
              </div>
              <span className="text-[10px] text-slate-700 block mt-1">{authorityOfficial}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            {isSigned ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>ውሉ በሁለቱም ወገኖች በይፋ ጸድቋል</span>
              </span>
            ) : (
              <span className="text-amber-400 text-xs">ፊርማዎን በማኖር ውሉን ያጽድቁ</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSigned && (
              <button
                onClick={handleSignContract}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
              >
                <PenTool className="w-4 h-4" />
                <span>ውሉን አጽድቅና ፈርም (Sign Contract)</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>የውል ሰነድ አትም (Print Contract)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
