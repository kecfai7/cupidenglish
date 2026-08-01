const KOREAN_PARENTHESIS_PATTERN = /\([\u3131-\u318E\uAC00-\uD7A3\s]+\)/g;
const LOCAL_STORAGE_KEY = 'cupid_english_tts_settings';

export function toSpeakableEnglish(text) {
  return (text || '')
    .replace(KOREAN_PARENTHESIS_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTtsSettings() {
  if (typeof window === 'undefined') {
    return { gender: 'female', repetitions: 1, speed: 1.0 };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse TTS settings:', e);
  }
  return { gender: 'female', repetitions: 1, speed: 1.0 };
}

export function saveTtsSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('cupid_tts_settings_changed'));
  } catch (e) {
    console.error('Failed to save TTS settings:', e);
  }
}

let currentTimerId = null;
let currentOnEndCallback = null;

export function stopSpeaking() {
  if (currentTimerId) {
    clearTimeout(currentTimerId);
    currentTimerId = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentOnEndCallback) {
    currentOnEndCallback();
    currentOnEndCallback = null;
  }
}

export function speakEnglishText(text, callbacks = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopSpeaking();

  const cleanText = toSpeakableEnglish(text);
  if (!cleanText) return false;

  const settings = getTtsSettings();
  const gender = settings.gender || 'female';
  const repetitions = settings.repetitions || 1;
  const speed = settings.speed || 1.0;

  const { onStart, onLoopStart, onEnd, onError } = callbacks;

  const voices = window.speechSynthesis.getVoices();
  let voice = null;
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  if (englishVoices.length > 0) {
    if (gender === 'male') {
      voice = englishVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('david') || name.includes('male') || name.includes('guy') || name.includes('mark') || name.includes('george') || name.includes('fred') || name.includes('standard-b') || name.includes('standard-d') || name.includes('wavenet-b') || name.includes('wavenet-d');
      });
    } else if (gender === 'female') {
      voice = englishVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('zira') || name.includes('female') || name.includes('samantha') || name.includes('hazel') || name.includes('susan') || name.includes('haruka') || name.includes('standard-a') || name.includes('standard-c') || name.includes('wavenet-a') || name.includes('wavenet-c') || name.includes('jenny') || name.includes('aria');
      });
    }
    if (!voice) {
      voice = englishVoices[0];
    }
  }

  let currentLoop = 0;
  currentOnEndCallback = () => {
    onEnd?.();
  };

  const playOneUtterance = () => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = speed;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (currentLoop === 0) {
        onStart?.();
      }
      onLoopStart?.(currentLoop + 1);
    };

    utterance.onend = () => {
      currentLoop++;
      if (currentLoop < repetitions) {
        currentTimerId = setTimeout(playOneUtterance, 600);
      } else {
        currentTimerId = null;
        currentOnEndCallback = null;
        onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      currentTimerId = null;
      currentOnEndCallback = null;
      onError?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  playOneUtterance();
  return true;
}

