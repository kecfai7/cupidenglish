import React, { useEffect, useState } from 'react';
import { downloadMarkdown, exportToPDF } from '../services/exportService';
import { Heart, BookOpen, Key, Sparkles, Sun, Moon, HelpCircle, FileText, Printer, FolderOpen, HardDrive, Mail, Cloud } from 'lucide-react';
import { getVaultItems, subscribeToVaultChanges, getDirectoryStatus, selectLocalDirectory } from '../services/vaultService';

export function Navbar({ activeTab, setActiveTab, onOpenSettings, onOpenGuide, theme, toggleTheme, currentResult, onOpenEmailModal, onOpenSyncModal }) {
  const [vaultCount, setVaultCount] = useState(() => getVaultItems().length);
  const [dirStatus, setDirStatus] = useState(() => getDirectoryStatus());
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setVaultCount(getVaultItems().length);
    setDirStatus(getDirectoryStatus());

    return subscribeToVaultChanges((snapshot) => {
      setVaultCount(snapshot.items.length);
      setDirStatus(getDirectoryStatus());
    });
  }, []);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-4 z-40 mx-4 my-4 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border border-pink-300/80 dark:border-slate-800/80 shadow-lg rounded-3xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-pink-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-pink-300">
          <Sparkles className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cupid English Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('translator')}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-400 to-rose-400 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/25 transition-transform hover:scale-105">
          <div className="w-full h-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center">
            <span className="text-xl heart-pulse">💘</span>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight gradient-text flex items-center gap-1.5">
            Cupid English AI
          </h1>
          <p className="text-xs text-pink-600 dark:text-pink-300 font-medium">
            영어를 들으면서 바로 이해하는 💘 파스텔 큐피드 어순 체득
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 bg-pink-100/70 dark:bg-pink-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-pink-300/80 dark:border-pink-500/30 shadow-inner">
        <button
          onClick={() => setActiveTab('translator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
            activeTab === 'translator'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/40'
              : 'bg-white/90 dark:bg-slate-900/80 text-slate-950 dark:text-slate-100 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 border border-pink-300/70 dark:border-slate-700 shadow-sm'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'translator' ? 'text-white' : 'text-pink-600 dark:text-pink-400'}`} />
          <span>어순 변환 & AI 해설</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
            activeTab === 'practice'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/40'
              : 'bg-white/90 dark:bg-slate-900/80 text-slate-950 dark:text-slate-100 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-pink-50 border border-pink-300/70 dark:border-slate-700 shadow-sm'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'practice' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
          <span>어순 연습실</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
            activeTab === 'dictionary'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/40'
              : 'bg-white/90 dark:bg-slate-900/80 text-slate-950 dark:text-slate-100 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-pink-50 border border-pink-300/70 dark:border-slate-700 shadow-sm'
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${activeTab === 'dictionary' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
          <span>전치사 지도</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all relative ${
            activeTab === 'vault'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/40'
              : 'bg-white/90 dark:bg-slate-900/80 text-slate-950 dark:text-slate-100 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 border border-pink-300/70 dark:border-slate-700 shadow-sm'
          }`}
        >
          <FolderOpen className={`w-4 h-4 ${activeTab === 'vault' ? 'text-white' : 'text-pink-600 dark:text-pink-400'}`} />
          <span>📚 학습보관함</span>
          {vaultCount > 0 && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white ml-0.5 shadow-sm">
              {vaultCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right Controls: PC Directory & Cloud Sync + Export Buttons + Settings & Theme */}
      <div className="flex items-center gap-2.5">
        {/* PC / Google Drive Cloud Sync Button */}
        {dirStatus.isConnected ? (
          <button
            onClick={() => onOpenSyncModal && onOpenSyncModal()}
            className={`btn-secondary text-xs flex items-center gap-1.5 shadow-sm transition-all font-bold ${
              dirStatus.isCloudSync
                ? 'bg-pink-100/90 dark:bg-pink-500/10 border-pink-400 dark:border-pink-500/40 text-pink-950 dark:text-pink-300 hover:bg-pink-200'
                : 'bg-purple-100/90 dark:bg-purple-500/10 border-purple-400 dark:border-purple-500/40 text-purple-950 dark:text-purple-300 hover:bg-purple-200'
            }`}
            title={`${dirStatus.isCloudSync ? '구글 드라이브' : 'PC 폴더'} [${dirStatus.folderName}] 연동 중 (클릭하여 동기화 관리)`}
          >
            {dirStatus.isCloudSync ? (
              <Cloud className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
            ) : (
              <HardDrive className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            )}
            <span className="hidden sm:inline">
              {dirStatus.isCloudSync ? '☁️ Google Drive' : '💻 PC 폴더'}: [{dirStatus.folderName}]
            </span>
            <span className="sm:hidden">[{dirStatus.folderName}]</span>
          </button>
        ) : dirStatus.needsPermissionGrant ? (
          <button
            onClick={async () => {
              try {
                await selectLocalDirectory({ forceNewPicker: false });
                setDirStatus(getDirectoryStatus());
                if (onShowToast) setToastMessage(`⚡ 구글드라이브/폴더 [${getDirectoryStatus().folderName}] 연동이 다시 활성화되었습니다!`);
              } catch {
                if (onOpenSyncModal) onOpenSyncModal();
              }
            }}
            className="btn-secondary text-xs bg-amber-100/90 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500/40 text-amber-950 dark:text-amber-300 hover:bg-amber-200 flex items-center gap-1.5 shadow-sm animate-pulse font-bold"
            title={`기존 연동 폴더 [${dirStatus.folderName}] 기억됨 (클릭하여 1-클릭 권한 승인)`}
          >
            <Cloud className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span className="hidden sm:inline">⚡ 폴더 [{dirStatus.folderName}] 1-클릭 승인</span>
            <span className="sm:hidden">⚡ [{dirStatus.folderName}] 승인</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenSyncModal && onOpenSyncModal()}
            className="btn-secondary text-xs bg-white/90 dark:bg-slate-900 border-pink-400 dark:border-pink-500/40 text-pink-950 dark:text-pink-300 hover:bg-pink-100 flex items-center gap-1.5 shadow-sm font-bold"
            title="구글 드라이브 또는 PC 로컬 폴더를 연동하여 PC 교체 시에도 자동 동기화"
          >
            <Cloud className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 animate-pulse" />
            <span className="hidden sm:inline">☁️ 구글드라이브/폴더 연동</span>
            <span className="sm:hidden">☁️ 폴더 연동</span>
          </button>
        )}

        {/* Top Line Export Buttons */}
        {currentResult && activeTab === 'translator' && (
          <div className="flex items-center gap-2 mr-1 bg-pink-100/70 dark:bg-slate-900/80 p-1 rounded-2xl border border-pink-300/80 dark:border-pink-500/20 shadow-inner">
            <button
              onClick={() => downloadMarkdown(currentResult)}
              className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-pink-500/20 border border-pink-300 dark:border-pink-500/40 text-pink-950 dark:text-pink-300 hover:bg-pink-50 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
              title="디자인 없는 텍스트 마크다운(.md) 저장"
            >
              <FileText className="w-3.5 h-3.5 text-pink-600" />
              <span>MD 저장</span>
            </button>

            <button
              onClick={() => exportToPDF(currentResult)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/30"
              title="디자인 적용 PDF 리포트 저장"
            >
              <Printer className="w-3.5 h-3.5 text-pink-100" />
              <span>PDF 저장</span>
            </button>

            <button
              onClick={() => onOpenEmailModal && onOpenEmailModal(currentResult)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/30"
              title="변환 화면 그대로 E-mail 전송"
            >
              <Mail className="w-3.5 h-3.5 text-rose-100" />
              <span>이메일 보내기</span>
            </button>
          </div>
        )}

        <button
          onClick={onOpenGuide}
          className="btn-secondary text-xs bg-pink-100/90 dark:bg-pink-500/10 border-pink-300 dark:border-pink-500/30 text-pink-950 dark:text-pink-300 hover:bg-pink-200 font-extrabold shadow-sm"
          title="이용 가이드 & 필독 안내"
        >
          <HelpCircle className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
          <span className="hidden sm:inline">이용 가이드</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="btn-secondary text-xs bg-purple-100/90 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-950 dark:text-purple-300 hover:bg-purple-200 font-extrabold shadow-sm"
          title="Gemini API 키 설정"
        >
          <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">AI 키 설정</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-pink-400 dark:border-pink-500/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 transition-all shadow-sm font-bold"
          title="테마 전환"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-pink-500" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>
    </header>
  );
}
