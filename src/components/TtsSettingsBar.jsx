// src/components/TtsSettingsBar.jsx
import React, { useEffect, useState } from 'react';
import { Volume2, User, RotateCw, Gauge } from 'lucide-react';
import { getTtsSettings, saveTtsSettings } from '../services/speechService';

export function TtsSettingsBar({ className = '' }) {
  const [settings, setSettings] = useState(() => getTtsSettings());

  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getTtsSettings());
    };
    window.addEventListener('cupid_tts_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('cupid_tts_settings_changed', handleSettingsChange);
    };
  }, []);

  const handleChange = (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    saveTtsSettings(nextSettings);
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-pink-300/80 dark:border-slate-800/80 text-xs text-slate-950 dark:text-slate-100 font-extrabold shadow-lg transition-all ${className}`}>
      {/* Title/Header icon */}
      <div className="flex items-center gap-2 pr-3 border-r border-pink-300 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-500/20 border border-pink-300 dark:border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
          <Volume2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
        </div>
        <span className="font-black text-slate-950 dark:text-white text-sm">🔊 발음 설정</span>
      </div>

      {/* 1. 성별 선택 */}
      <div className="flex items-center gap-2 shrink-0">
        <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-white font-black">목소리:</span>
        <select
          value={settings.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="bg-pink-50 dark:bg-slate-950 border border-pink-400 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-pink-950 dark:text-white cursor-pointer shadow-sm transition-all hover:border-pink-600 focus:outline-none"
        >
          <option value="female" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">여성 (Female) 👩</option>
          <option value="male" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">남성 (Male) 👨</option>
        </select>
      </div>

      {/* 2. 반복 재생 */}
      <div className="flex items-center gap-2 shrink-0">
        <RotateCw className="w-4 h-4 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-white font-black">연속 반복:</span>
        <select
          value={settings.repetitions}
          onChange={(e) => handleChange('repetitions', parseInt(e.target.value, 10))}
          className="bg-pink-50 dark:bg-slate-950 border border-pink-400 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-pink-950 dark:text-white cursor-pointer shadow-sm transition-all hover:border-pink-600 focus:outline-none"
        >
          <option value={1} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1회 듣기</option>
          <option value={2} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">2회 연속</option>
          <option value={3} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">3회 연속</option>
          <option value={4} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">4회 연속</option>
          <option value={5} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">5회 연속</option>
        </select>
      </div>

      {/* 3. 재생 속도 */}
      <div className="flex items-center gap-2 shrink-0">
        <Gauge className="w-4 h-4 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-white font-black">속도:</span>
        <select
          value={settings.speed}
          onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
          className="bg-pink-50 dark:bg-slate-950 border border-pink-400 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-pink-950 dark:text-white cursor-pointer shadow-sm transition-all hover:border-pink-600 focus:outline-none"
        >
          <option value={0.6} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">0.6x (시니어/어린이) 🐌</option>
          <option value={0.8} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">0.8x 조금 느리게</option>
          <option value={1.0} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1.0x 보통 속도 ⚡</option>
          <option value={1.2} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1.2x 빠르게</option>
        </select>
      </div>

      <div className="text-xs text-slate-800 dark:text-slate-300 font-bold hidden lg:block">
        * 브라우저 로컬 디스크에 영구 보관됩니다.
      </div>
    </div>
  );
}
