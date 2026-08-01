// src/components/ApiSettingsModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Key, Check, ShieldCheck } from 'lucide-react';
import { clearStoredApiKey, saveStoredApiKey } from '../services/apiKeyStorage';

export function ApiSettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey || '');
      setSavedSuccess(false);
    }
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey.trim());
    saveStoredApiKey(tempKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    clearStoredApiKey();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 space-y-6 relative bg-white dark:bg-slate-900 border border-pink-300 dark:border-slate-800 rounded-3xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white p-1 rounded-lg hover:bg-pink-100 dark:hover:bg-slate-800 transition-colors font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-300 dark:border-amber-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Gemini AI API 키 설정</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">자유로운 실시간 AI 어순 변환 및 분석</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-300">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-pink-500/30 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 font-medium shadow-inner"
          />
          <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>로컬 디스크 파일(`_api_key.json`) 이중 백업 보관</span>
            </div>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              ✨ 브라우저 캐시/방문 기록을 삭제하더라도 API 키가 삭제되지 않고 영구 보존됩니다!
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {apiKey ? (
            <button onClick={handleClear} className="text-xs text-rose-400 hover:underline">
              키 삭제 (기본 엔진 사용)
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">미입력 시 내장 스마트 엔진으로 동작</span>
          )}

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary text-xs">
              취소
            </button>
            <button onClick={handleSave} className="btn-primary text-xs">
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>저장됨!</span>
                </>
              ) : (
                <span>설정 저장</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
