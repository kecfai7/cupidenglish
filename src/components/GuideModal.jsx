// src/components/GuideModal.jsx
import React from 'react';
import { X, Sparkles, Key, HardDrive, ShieldCheck, Download, CheckCircle2, HelpCircle } from 'lucide-react';

export function GuideModal({ isOpen, onClose, onOpenSettings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl p-6 sm:p-8 space-y-6 relative bg-white dark:bg-slate-900 border border-pink-300 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow background accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white p-2 rounded-xl hover:bg-pink-100 dark:hover:bg-slate-800 transition-colors font-bold"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-pink-300 dark:border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>Cupid English AI 이용 가이드</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-950 dark:text-pink-300 font-black border border-pink-300 dark:border-pink-500/30">
                필독 안내
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-1">
              뇌 구조에 맞춘 직관 영어 학습 파트너를 200% 활용하는 안내서입니다.
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Card 1: Default Mode */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-black text-emerald-950 dark:text-emerald-300 text-sm sm:text-base">
                1. 기본 무료 모드 (API 키 미입력 상태)
              </h4>
            </div>
            <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-bold">
              API 키를 넣지 않아도 <strong className="text-pink-700 dark:text-white font-black">내장 스마트 애로우 엔진</strong>이 기본 작동합니다. 대표 예문 9가지와 주요 어순 변환, 1:1 이미지 연동, 6단계 어순 시각화, TTS 원어민 발음 듣기 등이 <strong className="text-emerald-700 dark:text-emerald-400 font-black">100% 무료로 즉시 동작</strong>합니다.
            </p>
          </div>

          {/* Card 2: AI Key Mode & Security */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/30 space-y-2 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-black text-amber-950 dark:text-amber-300 text-sm sm:text-base">
                  2. 실시간 AI 초정밀 모드 (Google Gemini Key)
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-colors flex items-center gap-1"
              >
                <span>🔑 API 키 설정하기</span>
              </button>
            </div>
            <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-bold">
              임의의 복잡한 문장을 AI로 자유롭게 분석하고 싶다면 상단 메뉴의 <strong className="text-amber-900 dark:text-amber-300 font-black">[🔑 AI 키 설정]</strong> 버튼을 누르세요. 본인의 Google Gemini API Key를 입력하시면 정밀 어순 분석 모드로 전환됩니다.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-950 dark:text-emerald-300 font-bold bg-emerald-100/90 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>입력하신 API 키는 Vercel 서버로 전송되지 않으며, 오직 사용자 개인 브라우저에만 암호화 보관됩니다.</span>
            </div>
          </div>

          {/* Card 3: Storage & Backup */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/90 dark:bg-slate-950 border border-sky-300 dark:border-sky-500/30 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400" />
              <h4 className="font-black text-sky-950 dark:text-sky-300 text-sm sm:text-base">
                3. 학습자료실 저장 & 안전 백업 안내
              </h4>
            </div>
            <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-bold">
              <strong className="text-pink-700 dark:text-amber-300 font-black">💾 학습자료실</strong>에 저장된 문장은 이 브라우저의 전용 공간(localStorage/IndexedDB)에만 안전하게 보관됩니다.
            </p>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-pink-300 dark:border-slate-800 space-y-1.5 text-xs text-slate-900 dark:text-slate-200 shadow-sm font-bold">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-black">
                <Download className="w-4 h-4" />
                <span>데이터 보호 팁 (백업 기능 권장):</span>
              </div>
              <p className="text-slate-800 dark:text-slate-300 leading-relaxed">
                브라우저 쿠키 삭제나 기기 변경 시 자료를 보호하려면, 상단 <strong className="text-pink-700 dark:text-pink-300">[☁️ 폴더 연동]</strong> 메뉴에서 구글 드라이브 동기화를 켜시거나 <strong className="text-indigo-700 dark:text-indigo-300">[.json 백업 백업 파일 다운로드]</strong>를 정기적으로 진행하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold justify-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>이해했습니다. 학습 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
