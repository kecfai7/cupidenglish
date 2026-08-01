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
    <div className={`flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl text-xs font-black text-white shadow-xl transition-all ${className}`}>
      {/* Title/Header icon */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
          <Volume2 className="w-4 h-4 text-pink-400" />
        </div>
        <span className="font-black text-white text-sm">🔊 발음 설정</span>
      </div>

      {/* 1. 성별 선택 */}
      <div className="flex items-center gap-2 shrink-0">
        <User className="w-4 h-4 text-pink-400" />
        <span className="text-white font-black text-xs sm:text-sm">목소리:</span>
        <select
          value={settings.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="bg-slate-950 border border-pink-500/40 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-sm hover:border-pink-400 focus:outline-none transition-all"
        >
          <option value="female" className="bg-slate-900 text-white font-bold">여성 (Female) 👩</option>
          <option value="male" className="bg-slate-900 text-white font-bold">남성 (Male) 👨</option>
        </select>
      </div>

      {/* 2. 반복 재생 */}
      <div className="flex items-center gap-2 shrink-0">
        <RotateCw className="w-4 h-4 text-pink-400" />
        <span className="text-white font-black text-xs sm:text-sm">연속 반복:</span>
        <select
          value={settings.repetitions}
          onChange={(e) => handleChange('repetitions', parseInt(e.target.value, 10))}
          className="bg-slate-950 border border-pink-500/40 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-sm hover:border-pink-400 focus:outline-none transition-all"
        >
          <option value={1} className="bg-slate-900 text-white font-bold">1회 듣기</option>
          <option value={2} className="bg-slate-900 text-white font-bold">2회 연속</option>
          <option value={3} className="bg-slate-900 text-white font-bold">3회 연속</option>
          <option value={4} className="bg-slate-900 text-white font-bold">4회 연속</option>
          <option value={5} className="bg-slate-900 text-white font-bold">5회 연속</option>
        </select>
      </div>

      {/* 3. 재생 속도 */}
      <div className="flex items-center gap-2 shrink-0">
        <Gauge className="w-4 h-4 text-pink-400" />
        <span className="text-white font-black text-xs sm:text-sm">속도:</span>
        <select
          value={settings.speed}
          onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
          className="bg-slate-950 border border-pink-500/40 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black text-white cursor-pointer shadow-sm hover:border-pink-400 focus:outline-none transition-all"
        >
          <option value={0.6} className="bg-slate-900 text-white font-bold">0.6x (시니어/어린이) 🐌</option>
          <option value={0.8} className="bg-slate-900 text-white font-bold">0.8x 조금 느리게</option>
          <option value={1.0} className="bg-slate-900 text-white font-bold">1.0x 보통 속도 ⚡</option>
          <option value={1.2} className="bg-slate-900 text-white font-bold">1.2x 빠르게</option>
        </select>
      </div>

      <div className="text-xs text-slate-300 font-bold hidden lg:block">
        * 브라우저 로컬 디스크에 영구 보관됩니다.
      </div>
    </div>
  );
}
