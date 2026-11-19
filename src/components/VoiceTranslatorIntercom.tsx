import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  ArrowRightLeft,
  Sparkles,
  MessageSquare,
  Headphones,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Language, VoiceMessage } from '../types';
import { translations } from '../data/translations';
import { speakTextSmart, playStationChime, stopAllSpeech } from '../utils/audio';
import {
  translateMessageLive,
  transcribeAudioLive,
  TRANSPORT_PHRASES,
} from '../utils/translator';

interface VoiceTranslatorIntercomProps {
  currentLang: Language;
  audioAlertsEnabled: boolean;
}

interface IntercomEntry extends VoiceMessage {
  speakerSlot: 1 | 2;
  translationMode?: 'ai' | 'preset' | 'offline';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
    reader.readAsDataURL(blob);
  });
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

  // Input & recording states for BOTH speakers
  const [inputText1, setInputText1] = useState<string>('');
  const [inputText2, setInputText2] = useState<string>('');
  const [recordingSpeaker, setRecordingSpeaker] = useState<1 | 2 | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingLabel, setProcessingLabel] = useState<string>('');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Message log
  const [messages, setMessages] = useState<IntercomEntry[]>([
    {
      id: 'msg_01',
      speakerSlot: 1,
      senderRole: 'dispatcher',
      senderName: 'ተቆጣጣሪ (Terminal Dispatcher)',
      sourceLang: 'am',
      targetLang: 'om',
      sourceText: 'ተራዎ ደርሷል! እባክዎ ተሽከርካሪዎን ወደ መጫኛ መድረክ ያስገቡ።',
      translatedText: 'Dabareen keessan ga\'eera! Maaloo konkolaataa keessan gara bakka fe\'iinsaatti galchaa.',
      timestamp: '10:14 ጧት',
      translationMode: 'preset',
    },
    {
      id: 'msg_02',
      speakerSlot: 2,
      senderRole: 'driver',
      senderName: 'አሽከርካሪ ተስፋዬ (Driver)',
      sourceLang: 'om',
      targetLang: 'am',
      sourceText: 'Tole, daqiiqaa 3 keessatti seenaa jira.',
      translatedText: 'እሺ፣ በ3 ደቂቃ ውስጥ እየገባሁ ነው።',
      timestamp: '10:15 ጧት',
      translationMode: 'preset',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopAllSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

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

  const handleSend = async (text: string, speakerNum: 1 | 2 = 1) => {
    const rawText = text.trim();
    if (!rawText || isProcessing) return;

    setErrorBanner(null);
    const srcLang = speakerNum === 1 ? speaker1Lang : speaker2Lang;
    const tgtLang = speakerNum === 1 ? speaker2Lang : speaker1Lang;
    const role = speakerNum === 1 ? speaker1Role : speaker2Role;

    const roleNames: Record<string, string> = {
      dispatcher: 'የጣቢያ ተቆጣጣሪ (Dispatcher)',
      driver: 'አሽከርካሪ (Driver)',
      traffic_officer: 'የትራፊክ ፖሊስ (Traffic Police)',
      passenger: 'ተሳፋሪ / መንገደኛ (Passenger)',
    };

    setIsProcessing(true);
    setProcessingLabel(
      `ከ${srcLang.toUpperCase()} ወደ ${tgtLang.toUpperCase()} በመተርጎም ላይ... (Translating)`
    );

    try {
      const { translatedText, mode } = await translateMessageLive(rawText, srcLang, tgtLang);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const msgId = `msg_${Date.now()}`;

      const newMsg: IntercomEntry = {
        id: msgId,
        speakerSlot: speakerNum,
        senderRole: role,
        senderName: roleNames[role] || 'ተጠቃሚ',
        sourceLang: srcLang,
        targetLang: tgtLang,
        sourceText: rawText,
        translatedText,
        timestamp: timeStr,
        translationMode: mode,
      };

      setMessages((prev) => [...prev, newMsg]);
      if (speakerNum === 1) {
        setInputText1('');
      } else {
        setInputText2('');
      }

      if (audioAlertsEnabled) {
        playStationChime();
      }

      if (autoSpeak) {
        setSpeakingMsgId(msgId);
        const ttsResult = await speakTextSmart(translatedText, tgtLang, () => {
          setSpeakingMsgId((cur) => (cur === msgId ? null : cur));
        });
        if (ttsResult.error) {
          setErrorBanner(`የድምፅ ማሰሚያ ማስጠንቀቂያ: ${ttsResult.error}`);
        }
      }
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'መልዕክቱን መተርጎም አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
      );
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  const stopMicCapture = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
  };

  const toggleRecordingForSpeaker = async (speakerNum: 1 | 2) => {
    setErrorBanner(null);

    if (recordingSpeaker === speakerNum) {
      stopMicCapture();
      return;
    }

    if (recordingSpeaker !== null) {
      stopMicCapture();
    }

    const srcLang = speakerNum === 1 ? speaker1Lang : speaker2Lang;

    // Offline fallback using browser Web Speech API when offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setErrorBanner('ከኔትወርክ ውጪ ድምፅ ለመቅዳት በዚህ ብሮውዘር አልተደገፈም፤ እባክዎ በጽሁፍ ይፃፉ።');
        return;
      }
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = bcpMap[srcLang] || 'en-US';
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          setRecordingSpeaker(null);
          if (transcript) {
            void handleSend(transcript, speakerNum);
          }
        };
        recognition.onerror = () => {
          setRecordingSpeaker(null);
          setErrorBanner('የድምፅ መቅጃ ችግር ተፈጥሯል፤ እባክዎ የማይክሮፎን ፍቃድ ያረጋግጡ ወይም በጽሁፍ ይላኩ።');
        };
        recognition.onend = () => {
          setRecordingSpeaker(null);
        };
        recognitionRef.current = recognition;
        recognition.start();
        setRecordingSpeaker(speakerNum);
      } catch {
        setRecordingSpeaker(null);
        setErrorBanner('ማይክሮፎን መጀመር አልተቻለም።');
      }
      return;
    }

    // Online mode: real MediaRecorder capture -> Gemini speech transcription (/api/transcribe)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorBanner('ይህ ብሮውዘር የቀጥታ ማይክሮፎን ቀረጻ አይደግፍም፤ እባክዎ ከታች ባለው መጻፊያ ይላኩ።');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const supportedMime = preferredTypes.find((mt) =>
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mt)
      );

      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const mime = recorder.mimeType || 'audio/webm';
        stream.getTracks().forEach((tr) => tr.stop());
        mediaStreamRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingSpeaker(null);
        setRecordingSeconds(0);

        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        if (audioBlob.size < 400) {
          setErrorBanner('በቂ ድምፅ አልተቀዳም፤ እባክዎ ማይክሮፎኑን ተጭነው በግልፅ ይናገሩ።');
          return;
        }

        setIsProcessing(true);
        setProcessingLabel(`የተቀዳውን ድምፅ በ${srcLang.toUpperCase()} ወደ ጽሁፍ በመቀየር ላይ...`);
        try {
          const base64 = await blobToBase64(audioBlob);
          const transcript = await transcribeAudioLive(base64, mime, srcLang);
          setIsProcessing(false);
          setProcessingLabel('');
          if (!transcript) {
            setErrorBanner('የተናገሩትን ድምፅ መለየት አልተቻለም፤ እባክዎ ድምፅዎን ከፍ አድርገው እንደገና ይሞክሩ።');
            return;
          }
          await handleSend(transcript, speakerNum);
        } catch (err) {
          setIsProcessing(false);
          setProcessingLabel('');
          setErrorBanner(
            err instanceof Error ? err.message : 'የድምፅ ትንተና አልተሳካም።'
          );
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingSpeaker(speakerNum);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setRecordingSpeaker(null);
      setErrorBanner(
        err instanceof Error
          ? `የማይክሮፎን ፍቃድ አልተገኘም (${err.message})። እባክዎ የማይክሮፎን ፍቃድ ይስጡ ወይም በጽሁፍ ይላኩ።`
          : 'የማይክሮፎን ፍቃድ አልተገኘም፤ እባክዎ በጽሁፍ ይላኩ።'
      );
    }
  };

  const handleReplayAudio = async (msg: IntercomEntry) => {
    setErrorBanner(null);
    setSpeakingMsgId(msg.id);
    const res = await speakTextSmart(msg.translatedText, msg.targetLang, () => {
      setSpeakingMsgId((cur) => (cur === msg.id ? null : cur));
    });
    if (res.error) {
      setErrorBanner(`የድምፅ ማሰሚያ ማስጠንቀቂያ: ${res.error}`);
    }
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
                {t.voiceIntercomTitle}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Live AI Two-Way Speech & Text
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

      {/* Error Alert Banner */}
      {errorBanner && (
        <div className="bg-red-950/70 border border-red-500/60 text-red-100 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-red-300 hover:text-white p-1"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              onChange={(e) => setSpeaker1Role(e.target.value as 'dispatcher' | 'driver' | 'traffic_officer')}
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
              onChange={(e) => setSpeaker2Role(e.target.value as 'passenger' | 'driver' | 'dispatcher')}
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
        {/* Messages Scroll Area */}
        <div className="h-[360px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((msg) => {
            const isSpeaker1 = msg.speakerSlot === 1;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSpeaker1 ? 'items-start' : 'items-end'}`}
              >
                {/* Sender badge */}
                <div className="flex items-center gap-2 mb-1 px-1 text-xs">
                  <span className={`font-semibold ${isSpeaker1 ? 'text-emerald-300' : 'text-cyan-300'}`}>
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  {msg.translationMode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                      {msg.translationMode === 'ai'
                        ? 'AI Live'
                        : msg.translationMode === 'offline'
                        ? 'Offline'
                        : 'Verified'}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-4 shadow-lg border relative ${
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
                      className={`p-2 rounded-xl border transition-colors shrink-0 active:scale-95 shadow ${
                        speakingMsgId === msg.id
                          ? 'bg-emerald-500 border-emerald-300 text-white animate-pulse'
                          : 'bg-emerald-600/30 hover:bg-emerald-600 border-emerald-500/40 text-emerald-300 hover:text-white'
                      }`}
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

        {/* Live Recording or AI Processing Bar */}
        {recordingSpeaker !== null && (
          <div className="py-2 px-3 bg-red-950/50 border border-red-500/50 rounded-xl flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>
                ተናጋሪ {recordingSpeaker} እየተቀዳ ነው ({recordingSeconds}s) — ሲጨርሱ "አቁም" የሚለውን ይጫኑ
              </span>
            </div>
            <button
              onClick={stopMicCapture}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[11px]"
            >
              አቁምና ተርጉም
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="py-2 px-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{processingLabel || 'በመተርጎም ላይ...'}</span>
          </div>
        )}

        {/* Dual Two-Way Input Consoles (Speaker 1 & Speaker 2) */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Speaker 1 Input */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 px-1">
              <span>ተናጋሪ 1 ({speaker1Lang.toUpperCase()} ➔ {speaker2Lang.toUpperCase()})</span>
              <span className="text-slate-400 font-normal">የድምፅ / ጽሁፍ መላኪያ</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleRecordingForSpeaker(1)}
                disabled={isProcessing}
                className={`p-2.5 rounded-xl border font-bold text-white transition-all shadow active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-40 ${
                  recordingSpeaker === 1
                    ? 'bg-red-600 border-red-400 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500'
                }`}
                title={recordingSpeaker === 1 ? 'ቅጂውን አቁም' : t.pressToSpeak}
              >
                {recordingSpeaker === 1 ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText1}
                onChange={(e) => setInputText1(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSend(inputText1, 1);
                }}
                placeholder={`በ${speaker1Lang.toUpperCase()} ይፃፉ ወይም ይናገሩ...`}
                className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                onClick={() => void handleSend(inputText1, 1)}
                disabled={!inputText1.trim() || isProcessing}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl shadow transition-all active:scale-95 shrink-0"
                title={t.instantTranslate}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speaker 2 Input */}
          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 px-1">
              <span>ተናጋሪ 2 ({speaker2Lang.toUpperCase()} ➔ {speaker1Lang.toUpperCase()})</span>
              <span className="text-slate-400 font-normal">መልስ መስጫ (Reply)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleRecordingForSpeaker(2)}
                disabled={isProcessing}
                className={`p-2.5 rounded-xl border font-bold text-white transition-all shadow active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-40 ${
                  recordingSpeaker === 2
                    ? 'bg-red-600 border-red-400 animate-pulse'
                    : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500'
                }`}
                title={recordingSpeaker === 2 ? 'ቅጂውን አቁም' : t.pressToSpeak}
              >
                {recordingSpeaker === 2 ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText2}
                onChange={(e) => setInputText2(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSend(inputText2, 2);
                }}
                placeholder={`በ${speaker2Lang.toUpperCase()} መልስ ይፃፉ ወይም ይናገሩ...`}
                className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <button
                onClick={() => void handleSend(inputText2, 2)}
                disabled={!inputText2.trim() || isProcessing}
                className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl shadow transition-all active:scale-95 shrink-0"
                title={t.instantTranslate}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Transport Presets Phrases */}
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
                onClick={() => void handleSend(currentSourceText, 1)}
                disabled={isProcessing}
                className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/70 transition-all group shadow disabled:opacity-50"
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
