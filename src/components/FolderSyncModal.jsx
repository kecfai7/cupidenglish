// src/components/FolderSyncModal.jsx
import React, { useState, useRef } from 'react';
import {
  X,
  Cloud,
  HardDrive,
  Download,
  Upload,
  FolderOpen,
  Sparkles,
  FileJson
} from 'lucide-react';
import {
  selectLocalDirectory,
  disconnectLocalDirectory,
  getDirectoryStatus,
  exportVaultBackup,
  importVaultBackup
} from '../services/vaultService';

export function FolderSyncModal({ isOpen, onClose, onShowToast }) {
  const [activeTab, setActiveTab] = useState('cloud'); // 'cloud', 'local', 'backup'
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'overwrite'
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const dirStatus = getDirectoryStatus();

  // Connect Directory (Google Drive or Local)
  const handleConnectDirectory = async (isGoogleDriveGuide = false, forceNewPicker = false) => {
    setIsProcessing(true);
    try {
      await selectLocalDirectory({ forceNewPicker });
      const newStatus = getDirectoryStatus();
      setIsProcessing(false);

      if (newStatus.isCloudSync || isGoogleDriveGuide) {
        if (onShowToast) onShowToast(`☁️ Google Drive / 클라우드 폴더 [${newStatus.folderName}]와 자동 동기화되었습니다!`);
      } else {
        if (onShowToast) onShowToast(`✨ PC 폴더 [${newStatus.folderName}]와 연결되었습니다!`);
      }
    } catch (err) {
      setIsProcessing(false);
      if (err.name !== 'AbortError') {
        alert(err.message || '폴더 선택 중 오류가 발생했습니다.');
      }
    }
  };

  // Disconnect Directory
  const handleDisconnect = async () => {
    if (window.confirm('현재 연결된 폴더 연동을 해제하시겠습니까?\n(해제 후에는 브라우저 내부 기본 저장소로 전환됩니다.)')) {
      setIsProcessing(true);
      await disconnectLocalDirectory();
      setIsProcessing(false);
      if (onShowToast) onShowToast('PC 폴더 연동이 해제되었습니다.');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    try {
      const result = exportVaultBackup();
      if (onShowToast) onShowToast(`📦 학습자료 백업 파일(${result.fileName}) 다운로드가 시작되었습니다.`);
    } catch (err) {
      alert(`백업 생성 실패: ${err.message}`);
    }
  };

  // Import JSON Backup File Handler
  const processImportFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      alert('.json 형식의 학습자료 백업 파일만 불러올 수 있습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      const text = await file.text();
      const result = await importVaultBackup(text, importMode);
      setIsProcessing(false);

      if (onShowToast) onShowToast(`🎉 총 ${result.totalCount}개의 학습 카드가 성공적으로 복원/병합되었습니다!`);
    } catch (err) {
      setIsProcessing(false);
      alert(err.message || '백업 파일을 복원하는 중 오류가 발생했습니다.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImportFile(file);
      e.target.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 border-pink-500/30 dark:border-slate-700/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-pink-500/20 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Cloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>학습자료실 폴더 연동 & 구글 드라이브 동기화</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                PC를 바꿔도 학습 자료가 사라지지 않도록 구글 드라이브 및 자동 동기화를 설정하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-pink-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Banner */}
        <div className="px-6 py-3 bg-white/90 dark:bg-slate-950/90 border-b border-pink-500/20 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 dark:text-slate-400 font-bold">현재 연결 상태:</span>
            {dirStatus.isConnected ? (
              <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                dirStatus.isCloudSync
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40'
              }`}>
                {dirStatus.isCloudSync ? <Cloud className="w-3.5 h-3.5 text-emerald-500" /> : <HardDrive className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{dirStatus.isCloudSync ? '☁️ 구글 드라이브' : '💻 로컬 PC 폴더'}: [{dirStatus.folderName}]</span>
              </span>
            ) : dirStatus.needsPermissionGrant ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 animate-pulse">
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span>기존 지정 폴더: [{dirStatus.folderName}] (원클릭 권한 승인 필요)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-bold">
                ⚠️ 연동 안 됨 (브라우저 내 임시 저장)
              </span>
            )}
          </div>

          {(dirStatus.isConnected || dirStatus.hasStoredDirectory) && (
            <button
              onClick={handleDisconnect}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 underline underline-offset-2 transition-colors font-bold"
            >
              연동 해제
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-pink-500/20 dark:border-slate-800 bg-white/80 dark:bg-slate-950/30 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>☁️ 구글 드라이브 (추천)</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'local'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border-indigo-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>💻 PC 지정 폴더</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'backup'
                ? 'bg-slate-900 text-amber-400 border-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>📦 백업 & 복원 (.json)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* TAB 1: Google Drive */}
          {activeTab === 'cloud' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>PC 이동 시 복사/붙여넣기가 필요 없는 구글 드라이브 동기화</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Google Drive PC용 앱이 설치되어 있으면, 내 드라이브 안의 특정 폴더(예: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300">Google Drive\CupidEnglish</code>)를 한 번 지정해두면, 다시 접속해도 폴더를 새로 선택할 필요 없이 클릭 한 번으로 자동 유지됩니다!
                </p>
              </div>

              {/* Step By Step Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  🚀 구글 드라이브 3단계 설정 방법
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">1</span>
                    <p className="font-bold text-white">Google Drive 앱 설치</p>
                    <p className="text-slate-400 text-[11px]">PC용 Google Drive가 탐색기에 드라이브로 마운트되어 있어야 합니다.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                    <p className="font-bold text-white">아래 버튼 클릭</p>
                    <p className="text-slate-400 text-[11px]">[구글 드라이브 폴더 지정]을 누르고 내 드라이브 내 폴더를 지정합니다.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">3</span>
                    <p className="font-bold text-white">자동 동기화 완료!</p>
                    <p className="text-slate-400 text-[11px]">한 번 지정된 폴더는 저장소에 기억되어 다시 지정하지 않아도 됩니다.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleConnectDirectory(true, false)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Cloud className="w-5 h-5 text-slate-950 animate-bounce" />
                  <span>
                    {dirStatus.needsPermissionGrant
                      ? `⚡ 기존 폴더 [${dirStatus.folderName}] 연동 승인하기`
                      : dirStatus.isConnected
                      ? `☁️ 폴더 [${dirStatus.folderName}] 연동 중`
                      : '☁️ 구글 드라이브 / 클라우드 폴더 지정하기'}
                  </span>
                </button>

                {dirStatus.hasStoredDirectory && (
                  <button
                    onClick={() => handleConnectDirectory(true, true)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    📁 다른 새 폴더 선택
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Local PC Folder */}
          {activeTab === 'local' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-base">
                  <HardDrive className="w-5 h-5 text-indigo-400" />
                  <span>내 PC 로컬 폴더 직접 연동</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  내 컴퓨터의 원하는 일반 폴더(예: <code className="bg-slate-900 px-1 text-indigo-300">C:\CupidEnglishData</code>)를 지정하면, 웹 저장소 대신 내 PC 폴더에 <code className="text-slate-300">.json</code> 파일 형식으로 실시간 보관됩니다.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleConnectDirectory(false)}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <FolderOpen className="w-5 h-5 text-indigo-200" />
                  <span>💻 내 PC 로컬 폴더 선택</span>
                </button>

                {dirStatus.isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    연동 해제
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Backup & Restore (.json) */}
          {activeTab === 'backup' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                  <FileJson className="w-5 h-5 text-amber-400" />
                  <span>학습자료실 전체 백업 파일 내보내기 & 복원</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PC를 바꾸거나 다른 기기로 학습 자료를 한 번에 이동하고 싶을 때, 백업 파일(<code className="bg-slate-950 px-1 text-amber-300">.json</code>)을 다운로드한 후 새 PC에서 불러오세요.
                </p>
              </div>

              {/* Export Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>전체 학습자료 백업 내보내기</span>
                  </h4>
                  <p className="text-xs text-slate-400">현재 보관함의 모든 단어 및 마스터 달성 기록을 파일로 저장합니다.</p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>백업 파일 내보내기</span>
                </button>
              </div>

              {/* Import Section with Drag & Drop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>백업 파일 불러오기 & 복원</span>
                  </h4>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setImportMode('merge')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        importMode === 'merge' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                      title="기존 데이터에 새로 불러온 백업 자료를 합칩니다."
                    >
                      기존 자료와 합치기
                    </button>
                    <button
                      onClick={() => setImportMode('overwrite')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        importMode === 'overwrite' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                      title="기존 자료를 삭제하고 백업 파일 내용으로 덮어씁니다."
                    >
                      덮어쓰기
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <FileJson className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-white">
                    여기 백업 파일(<code className="text-amber-300">.json</code>)을 끌어다 놓거나 클릭하여 선택하세요
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    선택한 모드: <strong className="text-slate-300">{importMode === 'merge' ? '기존 자료와 합치기' : '전체 덮어쓰기'}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
