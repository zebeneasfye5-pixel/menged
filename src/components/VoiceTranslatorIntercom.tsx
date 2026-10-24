import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  ArrowRightLeft, 
  Sparkles, 
  MessageSquare, 
  CheckCheck, 
  Headphones,
  RotateCcw
} from 'lucide-react';
import { Language, VoiceMessage } from '../types';
import { translations } from '../data/translations';
import { speakText, playStationChime } from '../utils/audio';
import { translateMessage, TRANSPORT_PHRASES } from '../utils/translator';

interface VoiceTranslatorIntercomProps {
  currentLang: Language;
  audioAlertsEnabled: boolean;
}

export const VoiceTranslatorIntercom: React.FC<VoiceTranslatorIntercomProps> = ({
  currentLang,
  audioAlertsEnabled,
}) => {
  const t = translations[currentLang];

  // Speaker configurations
  const [speaker1Lang, setSpeaker1Lang] = useState<Language>('am');
  const [speaker2Lang, setSpeaker2Lang] = useState<Language>('om');
  const [speaker1Role, setSpeaker1Role] = useState<'dispatcher' | 'driver' | 'traffic_officer'>('dispatcher');
  const [speaker2Role, setSpeaker2Role] = useState<'passenger' | 'driver' | 'dispatcher'>('driver');

  // Input states
  const [inputText1, setInputText1] = useState<string>('');
  const [isRecording1, setIsRecording1] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);

  // Message log
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'msg_01',
      senderRole: 'dispatcher',
      senderName: 'ተቆጣጣሪ (Terminal Dispatcher)',
      sourceLang: 'am',
      targetLang: 'om',
      sourceText: 'ተራዎ ደርሷል! እባክዎ ተሽከርካሪዎን ወደ መጫኛ መድረክ ያስገቡ።',
      translatedText: 'Dabareen keessan ga\'eera! Maaloo konkolaataa keessan gara bakka fe\'iinsaatti galchaa.',
      timestamp: '10:14 ጧት',
    },
    {
      id: 'msg_02',
      senderRole: 'driver',
      senderName: 'አሽከርካሪ ተስፋዬ (Driver)',
      sourceLang: 'om',
      targetLang: 'am',
      sourceText: 'Tole, daqiiqaa 3 keessatti seenaa jira.',
      translatedText: 'እሺ፣ በ3 ደቂቃ ውስጥ እየገባሁ ነው።',
      timestamp: '10:15 ጧት',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition setup (Web Speech API)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        const bcpMap: Record<Language, string> = {
          am: 'am-ET',
          om: 'om-ET',
          ti: 'ti-ET',
          so: 'so-SO',
          en: 'en-US',
          ar: 'ar-SA',
          fr: 'fr-FR',
          zh: 'zh-CN',
        };
        recognition.lang = bcpMap[speaker1Lang] || 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSend(transcript, 1);
          }
          setIsRecording1(false);
        };

        recognition.onerror = () => {
          setIsRecording1(false);
        };

        recognition.onend = () => {
          setIsRecording1(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [speaker1Lang]);

  const toggleRecording = () => {
    if (isRecording1) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording1(false);
    } else {
      if (recognitionRef.current) {
        try {
          const bcpMap: Record<Language, string> = {
            am: 'am-ET',
            om: 'om-ET',
            ti: 'ti-ET',
            so: 'so-SO',
            en: 'en-US',
            ar: 'ar-SA',
            fr: 'fr-FR',
            zh: 'zh-CN',
          };
          recognitionRef.current.lang = bcpMap[speaker1Lang] || 'en-US';
          recognitionRef.current.start();
          setIsRecording1(true);
        } catch {
          // If already started or blocked
          setIsRecording1(true);
          // Simulate voice speech transcription if mic hardware is blocked in iframe
          setTimeout(() => {
            const sample = TRANSPORT_PHRASES[0].translations[speaker1Lang];
            handleSend(sample, 1);
            setIsRecording1(false);
          }, 3000);
        }
      } else {
        // Fallback simulation for unsupported browsers
        setIsRecording1(true);
        setTimeout(() => {
          const sample = TRANSPORT_PHRASES[0].translations[speaker1Lang];
          handleSend(sample, 1);
          setIsRecording1(false);
        }, 2500);
      }
    }
  };

  const handleSend = (text: string, speakerNum: 1 | 2 = 1) => {
    const rawText = text.trim();
    if (!rawText) return;

    const srcLang = speakerNum === 1 ? speaker1Lang : speaker2Lang;
    const tgtLang = speakerNum === 1 ? speaker2Lang : speaker1Lang;
    const role = speakerNum === 1 ? speaker1Role : speaker2Role;

    const roleNames: Record<string, string> = {
      dispatcher: 'የጣቢያ ተቆጣጣሪ (Dispatcher)',
      driver: 'አሽከርካሪ (Driver)',
      traffic_officer: 'የትራፊክ ፖሊስ (Traffic Police)',
      passenger: 'ተሳፋሪ / መንገደኛ (Passenger)',
    };

    const translated = translateMessage(rawText, srcLang, tgtLang);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newMsg: VoiceMessage = {
      id: `msg_${Date.now()}`,
      senderRole: role,
      senderName: roleNames[role] || 'ተጠቃሚ',
      sourceLang: srcLang,
      targetLang: tgtLang,
      sourceText: rawText,
      translatedText: translated,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText1('');

    // Play station chime and automatically speak the translated audio!
    if (audioAlertsEnabled) {
      playStationChime();
    }

    if (autoSpeak) {
      setTimeout(() => {
        speakText(translated, tgtLang);
      }, 400);
    }
  };

  const handleReplayAudio = (msg: VoiceMessage) => {
    speakText(msg.translatedText, msg.targetLang);
  };

  const handleSwapLanguages = () => {
    const temp = speaker1Lang;
    setSpeaker1Lang(speaker2Lang);
    setSpeaker2Lang(temp);
  };

  const languagesList: { code: Language; label: string }[] = [
    { code: 'am', label: 'አማርኛ (Amharic)' },
    { code: 'om', label: 'Afaan Oromoo (Oromo)' },
    { code: 'ti', label: 'ትግርኛ (Tigrinya)' },
    { code: 'so', label: 'Soomaali (Somali)' },
    { code: 'en', label: 'English (ዓለም አቀፍ)' },
    { code: 'ar', label: 'العربية (Arabic)' },
    { code: 'fr', label: 'Français (French)' },
    { code: 'zh', label: '中文 (Chinese - 汉语)' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Introduction Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl border border-emerald-800/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.voiceIntercomTitle}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Auto Speech-To-Speech
                </span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                {t.voiceIntercomDesc}
              </p>
            </div>
          </div>

          {/* Auto Speak Audio Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs">
            <input
              type="checkbox"
              id="autoSpeakCheck"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label htmlFor="autoSpeakCheck" className="text-slate-200 font-medium cursor-pointer flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.autoSpeakTranslation}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Language & Role Dispatch Console Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
        {/* Speaker 1 Settings */}
        <div className="md:col-span-5 bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.speaker1}</span>
            </span>
            <select
              value={speaker1Role}
              onChange={(e) => setSpeaker1Role(e.target.value as any)}
              className="bg-slate-800 text-[11px] text-slate-200 border border-slate-700 rounded px-2 py-0.5"
            >
              <option value="dispatcher">የጣቢያ ተቆጣጣሪ (Dispatcher)</option>
              <option value="driver">አሽከርካሪ (Driver)</option>
              <option value="traffic_officer">የትራፊክ ፖሊስ (Police)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">ቋንቋ:</label>
            <select
              value={speaker1Lang}
              onChange={(e) => setSpeaker1Lang(e.target.value as Language)}
              className="w-full bg-slate-800 border border-emerald-500/50 text-white font-semibold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {languagesList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-2 flex items-center justify-center">
          <button
            onClick={handleSwapLanguages}
            title="ቋንቋዎችን ቀያይር (Swap Languages)"
            className="p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Speaker 2 Settings */}
        <div className="md:col-span-5 bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{t.speaker2}</span>
            </span>
            <select
              value={speaker2Role}
              onChange={(e) => setSpeaker2Role(e.target.value as any)}
              className="bg-slate-800 text-[11px] text-slate-200 border border-slate-700 rounded px-2 py-0.5"
            >
              <option value="driver">አሽከርካሪ (Driver)</option>
              <option value="passenger">መንገደኛ / ተሳፋሪ (Passenger)</option>
              <option value="dispatcher">የመናኸሪያ ኦፕሬተር (Operator)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">ቋንቋ:</label>
            <select
              value={speaker2Lang}
              onChange={(e) => setSpeaker2Lang(e.target.value as Language)}
              className="w-full bg-slate-800 border border-cyan-500/50 text-white font-semibold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {languagesList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Intercom Window */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col h-[460px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((msg) => {
            const isSpeaker1 = msg.sourceLang === speaker1Lang;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSpeaker1 ? 'items-start' : 'items-end'}`}
              >
                {/* Sender badge */}
                <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                  <span className="font-semibold text-slate-300">{msg.senderName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg border relative ${
                    isSpeaker1
                      ? 'bg-gradient-to-br from-slate-800 to-slate-800/90 border-emerald-500/40 text-slate-100 rounded-tl-none'
                      : 'bg-gradient-to-br from-teal-950 to-slate-900 border-cyan-500/40 text-slate-100 rounded-tr-none'
                  }`}
                >
                  {/* Original Spoken Text */}
                  <div className="border-b border-slate-700/60 pb-2 mb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">
                      የተነገረው / Original ({msg.sourceLang.toUpperCase()}):
                    </span>
                    <p className="text-sm font-medium text-slate-200 italic">
                      "{msg.sourceText}"
                    </p>
                  </div>

                  {/* Translated Audio & Text Block */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block mb-0.5">
                        የተተረጎመው / Translated ({msg.targetLang.toUpperCase()}):
                      </span>
                      <p className="text-base font-bold text-white leading-relaxed">
                        {msg.translatedText}
                      </p>
                    </div>

                    {/* Audio Replay Button */}
                    <button
                      onClick={() => handleReplayAudio(msg)}
                      title="ድምፁን እንደገና አሰማ (Replay Voice)"
                      className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition-colors shrink-0 active:scale-95 shadow"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Live Audio Waveform when recording */}
        {isRecording1 && (
          <div className="py-2 px-3 bg-red-950/40 border border-red-500/50 rounded-xl my-2 flex items-center justify-between text-xs text-red-300 animate-pulse">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>{t.listening} (የድምፅ ቅኝት እየተካሄደ ነው...)</span>
            </div>
            {/* Visualizer bars */}
            <div className="flex items-center gap-1">
              {[4, 12, 8, 16, 6, 14, 10, 18, 5].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-bounce"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-xl border font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-1.5 shrink-0 ${
              isRecording1
                ? 'bg-red-600 border-red-400 animate-pulse shadow-red-900/50'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border-emerald-500 shadow-emerald-950/50'
            }`}
            title={isRecording1 ? 'ቅጂውን አቁም' : t.pressToSpeak}
          >
            {isRecording1 ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs">
              {isRecording1 ? 'እያዳመጠ ነው...' : t.pressToSpeak}
            </span>
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText1}
              onChange={(e) => setInputText1(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputText1, 1);
              }}
              placeholder={`በ${speaker1Lang.toUpperCase()} ይፃፉ ወይም በድምፅ ይናገሩ... (Write or speak)`}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Send / Translate Button */}
          <button
            onClick={() => handleSend(inputText1, 1)}
            disabled={!inputText1.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
            title={t.instantTranslate}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Transport Presets Phrases (Click to instantly translate & voice-speak!) */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>{t.samplePhrases} (በአንድ ጠቅታ ተርጉመህ በድምፅ አሰማ)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {TRANSPORT_PHRASES.length} አገራዊ የትራንስፖርት ንግግሮች
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TRANSPORT_PHRASES.map((phrase) => {
            const currentSourceText = phrase.translations[speaker1Lang] || phrase.translations.am;
            const currentTargetText = phrase.translations[speaker2Lang] || phrase.translations.en;

            return (
              <button
                key={phrase.id}
                onClick={() => handleSend(currentSourceText, 1)}
                className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/70 transition-all group shadow"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono mb-1">
                  <span className="text-emerald-400 font-semibold">{phrase.category}</span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs font-medium text-slate-200 line-clamp-2 mb-1">
                  {currentSourceText}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                  ➔ {currentTargetText}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
