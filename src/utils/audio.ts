/**
 * Audio Synthesizer and Voice Alert Engine
 * Uses Web Audio API for offline zero-latency chimes and alerts,
 * and Web Speech API for automated spoken announcements.
 */

// Web Audio Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a two-tone terminal chime ("Ding-Dong") for queue call
 */
export function playStationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Tone 1: High bell (587.33 Hz - D5)
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

  // Tone 2: Lower bell (440 Hz - A4)
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

  // Siren modulation
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

  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
  osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

/**
 * Speak text in a specified language via Web Speech Synthesis
 */
export function speakText(text: string, langCode: string = 'am', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map our language keys to standard BCP 47 language tags
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

  // Try to match an available voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(targetBcp.substring(0, 2)));
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
