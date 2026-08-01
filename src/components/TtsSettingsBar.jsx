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
    <div className={`flex flex-wrap items-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-pink-500/30 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold shadow-sm ${className}`}>
      {/* Title/Header icon */}
      <div className="flex items-center gap-2 pr-2 border-r border-pink-500/30 dark:border-slate-800/80 shrink-0">
        <Volume2 className="w-4 h-4 text-pink-600 dark:text-indigo-400" />
        <span className="font-extrabold text-slate-950 dark:text-slate-100">🔊 발음 설정</span>
      </div>

      {/* 1. 성별 선택 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <User className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-slate-100 font-extrabold">목소리:</span>
        <select
          value={settings.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="bg-white dark:bg-slate-900 border border-pink-500 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-950 dark:text-slate-100 focus:outline-none focus:border-pink-500 cursor-pointer shadow-sm transition-all"
        >
          <option value="female" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">여성 (Female) 👩</option>
          <option value="male" className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">남성 (Male) 👨</option>
        </select>
      </div>

      {/* 2. 반복 재생 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <RotateCw className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-slate-100 font-extrabold">연속 반복:</span>
        <select
          value={settings.repetitions}
          onChange={(e) => handleChange('repetitions', parseInt(e.target.value, 10))}
          className="bg-white dark:bg-slate-900 border border-pink-500 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-950 dark:text-slate-100 focus:outline-none focus:border-pink-500 cursor-pointer shadow-sm transition-all"
        >
          <option value={1} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1회 듣기</option>
          <option value={2} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">2회 연속</option>
          <option value={3} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">3회 연속</option>
          <option value={4} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">4회 연속</option>
          <option value={5} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">5회 연속</option>
        </select>
      </div>

      {/* 3. 재생 속도 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Gauge className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
        <span className="text-slate-950 dark:text-slate-100 font-extrabold">속도:</span>
        <select
          value={settings.speed}
          onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
          className="bg-white dark:bg-slate-900 border border-pink-500 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-950 dark:text-slate-100 focus:outline-none focus:border-pink-500 cursor-pointer shadow-sm transition-all"
        >
          <option value={0.6} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">0.6x (시니어/어린이) 🐌</option>
          <option value={0.8} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">0.8x 조금 느리게</option>
          <option value={1.0} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1.0x 보통 속도 ⚡</option>
          <option value={1.2} className="bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 font-bold">1.2x 빠르게</option>
        </select>
      </div>

      <div className="text-xs text-slate-800 dark:text-slate-200 font-bold ml-auto hidden md:block">
        * 브라우저 로컬 디스크에 영구 보관됩니다.
      </div>
    </div>
  );
}
