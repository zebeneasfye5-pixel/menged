/**
 * Audio Synthesizer and Voice Alert Engine
 * Uses Web Audio API for offline zero-latency chimes and alerts,
 * server-side Gemini TTS (/api/tts) for accurate multilingual speech (am, om, ti, so, en, ar, fr, zh),
 * and Web Speech API fallback when offline.
 */

let audioCtx: AudioContext | null = null;
let activeAudioElement: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function stopAllSpeech() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore audio cleanup errors
    }
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play a two-tone terminal chime ("Ding-Dong") for queue call
 */
export function playStationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(587.33, now);
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.8);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(440, now + 0.35);
  gain2.gain.setValueAtTime(0.35, now + 0.35);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.35);
  osc2.stop(now + 1.2);
}

/**
 * Play a police/traffic emergency warning siren
 */
export function playEmergencySiren() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';

  osc.frequency.setValueAtTime(700, now);
  osc.frequency.linearRampToValueAtTime(1100, now + 0.25);
  osc.frequency.linearRampToValueAtTime(700, now + 0.5);
  osc.frequency.linearRampToValueAtTime(1100, now + 0.75);
  osc.frequency.linearRampToValueAtTime(700, now + 1.0);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.1);
}

/**
 * Play success / dispatch tone
 */
export function playSuccessTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';

  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.setValueAtTime(659.25, now + 0.1);
  osc.frequency.setValueAtTime(783.99, now + 0.2);
  osc.frequency.setValueAtTime(1046.5, now + 0.3);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

/**
 * Speak text in a specified language via browser Web Speech Synthesis (offline / local)
 */
export function speakText(text: string, langCode: string = 'am', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const bcpMap: Record<string, string> = {
    am: 'am-ET',
    om: 'om-ET',
    ti: 'ti-ET',
    so: 'so-SO',
    en: 'en-US',
    ar: 'ar-SA',
    fr: 'fr-FR',
    zh: 'zh-CN',
  };

  const targetBcp = bcpMap[langCode] || 'en-US';
  utterance.lang = targetBcp;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetBcp.substring(0, 2).toLowerCase()));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text aloud using server-side Gemini TTS (all 8 languages including am, om, ti, so)
 * when online, with clean offline Web Speech Synthesis fallback.
 */
export async function speakTextSmart(
  text: string,
  langCode: string = 'am',
  onEnd?: () => void
): Promise<{ provider: 'gemini-tts' | 'browser'; error?: string }> {
  const cleanText = text.trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return { provider: 'browser' };
  }

  stopAllSpeech();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    speakText(cleanText, langCode, onEnd);
    return { provider: 'browser' };
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, langCode }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      audioBase64?: string;
      mimeType?: string;
      error?: string;
    };

    if (!res.ok || !data.audioBase64) {
      // Fallback to native browser voice if available while reporting TTS API error
      speakText(cleanText, langCode, onEnd);
      return {
        provider: 'browser',
        error: data.error || `Speech synthesis error (HTTP ${res.status})`,
      };
    }

    const mime = data.mimeType || 'audio/wav';
    const audio = new Audio(`data:${mime};base64,${data.audioBase64}`);
    activeAudioElement = audio;

    audio.onended = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      speakText(cleanText, langCode, onEnd);
    };

    await audio.play();
    return { provider: 'gemini-tts' };
  } catch (err) {
    speakText(cleanText, langCode, onEnd);
    return {
      provider: 'browser',
      error: err instanceof Error ? err.message : 'TTS playback error',
    };
  }
}
