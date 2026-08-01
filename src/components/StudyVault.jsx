import React, { useState, useEffect } from 'react';
import { getVaultItems, removeFromVault, getMasteredCount, loadVaultSnapshot, subscribeToVaultChanges } from '../services/vaultService';
import { exportToPDF } from '../services/exportService';
import { getNativeRecommendations } from '../services/recommendationService';
import { speakEnglishText, stopSpeaking, getTtsSettings } from '../services/speechService';
import { TtsSettingsBar } from './TtsSettingsBar';
import {
  Bookmark,
  CheckCircle2,
  Volume2,
  Search,
  Sparkles,
  BookOpen,
  Printer,
  Eye,
  EyeOff,
  Award,
  Calendar,
  FolderOpen,
  Mail,
  Cloud,
  FileJson
} from 'lucide-react';

export function StudyVault({ onNavigateToTranslator, onOpenEmailModal, onOpenSyncModal }) {
  const [items, setItems] = useState([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenAnswers, setHiddenAnswers] = useState({});
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'ai'
  const [toastMessage, setToastMessage] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [currentRepIndex, setCurrentRepIndex] = useState(0);
  const [totalReps, setTotalReps] = useState(1);

  // Load items & stats
  useEffect(() => {
    loadData();

    return subscribeToVaultChanges((snapshot) => {
      setItems(snapshot.items);
      setMasteredCount(snapshot.masteredCount);
      setStoragePath(snapshot.storagePath || '');
    });
  }, []);

  const loadData = async () => {
    const snapshot = await loadVaultSnapshot();
    setItems(snapshot.items || getVaultItems());
    setMasteredCount(snapshot.masteredCount ?? getMasteredCount());
    setStoragePath(snapshot.storagePath || '');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Text-to-Speech (Audio)
  const handleSpeak = (text) => {
    if (!text) return;

    if (speaking && speakingText === text) {
      stopSpeaking();
      setSpeaking(false);
      setSpeakingText('');
      setCurrentRepIndex(0);
      return;
    }

    const settings = getTtsSettings();
    const reps = settings.repetitions || 1;
    setTotalReps(reps);
    setSpeakingText(text);

    const didSpeak = speakEnglishText(text, {
      onStart: () => {
        setSpeaking(true);
      },
      onLoopStart: (currentLoop) => {
        setCurrentRepIndex(currentLoop);
      },
      onEnd: () => {
        setSpeaking(false);
        setSpeakingText('');
        setCurrentRepIndex(0);
      },
      onError: () => {
        setSpeaking(false);
        setSpeakingText('');
        setCurrentRepIndex(0);
      }
    });

    if (!didSpeak) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  // Mark as Mastered & Remove
  const handleMarkAsMastered = async (item) => {
    const snapshot = await removeFromVault(item.id);
    setItems(snapshot.items);
    setMasteredCount(snapshot.masteredCount);
    showToast(`🎉 축하합니다! "${item.english || item.arrowKorean}" 문장을 완전 마스터하여 보관함에서 지웠습니다.`);
  };

  // Toggle Self-Quiz Answer Masking (Default is MASKED for self-quiz mode!)
  const toggleAnswerMask = (id) => {
    setHiddenAnswers(prev => ({
      ...prev,
      [id]: prev[id] === false ? true : false
    }));
  };

  const toggleAllAnswers = (show) => {
    const nextState = {};
    items.forEach(item => {
      nextState[item.id] = !show;
    });
    setHiddenAnswers(nextState);
  };

  // Filtered items logic
  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.arrowKorean || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.english || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return (item.savedAt || '').startsWith(todayStr);
    }
    if (activeFilter === 'ai') {
      return item.id && item.id.startsWith('gemini-');
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-300">
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <section className="glass-panel p-6 sm:p-8 space-y-6 border-indigo-500/30 bg-slate-900/90 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Personal Learning Archive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight gradient-text">
              📚 나만의 Cupid English 학습보관함
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
              저장해 둔 문장의 6단계 큐피드 어순과 3색 원어민 뉘앙스를 언제든지 복습하고, 완전 학습 후 지워보세요!
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-2 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>💡 PC 교체 시 학습자료 자동 동기화 팁:</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenSyncModal && onOpenSyncModal()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>☁️ 구글 드라이브 연동</span>
                  </button>
                  <button
                    onClick={() => onOpenSyncModal && onOpenSyncModal()}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <FileJson className="w-3 h-3 text-amber-400" />
                    <span>📦 백업 & 복원</span>
                  </button>
                </div>
              </div>
              <p className="text-slate-200 leading-relaxed font-medium">
                PC를 바꿔도 학습 자료를 복사/붙여넣기 할 필요 없이 <strong className="text-emerald-300">[구글 드라이브]</strong> 폴더를 연동해 두면 모든 PC에서 자동 동기화됩니다. 또는 <strong className="text-amber-300">[백업 & 복원]</strong>으로 <code className="text-amber-200">.json</code> 파일을 다운받아 손쉽게 백업할 수도 있습니다.
              </p>
            </div>
            {storagePath && (
              <p className="text-xs text-slate-800 dark:text-slate-200 pt-1 font-bold">
                로컬 저장소 위치: <span className="text-emerald-600 dark:text-emerald-300">{storagePath}</span>
              </p>
            )}
          </div>

          {/* Stat Counter Widgets */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 min-w-[130px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block font-extrabold">보관된 카드</span>
                <span className="text-xl font-extrabold text-white">{items.length}개</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 min-w-[130px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block font-extrabold">마스터 달성</span>
                <span className="text-xl font-extrabold text-emerald-300">{masteredCount}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filter Tabs & Batch Export */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-pink-600 dark:text-pink-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="보관함 내 문장 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 dark:bg-slate-950/90 border border-pink-500/30 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
            />
          </div>

          {/* Filter Tabs & Export */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950/80 p-1 rounded-xl border border-pink-300 dark:border-slate-800 text-xs shadow-sm">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                전체 ({items.length})
              </button>
              <button
                onClick={() => setActiveFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                  activeFilter === 'today'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                오늘 저장
              </button>
              <button
                onClick={() => setActiveFilter('ai')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all ${
                  activeFilter === 'ai'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                AI 마스터클래스
              </button>
            </div>

            {/* Global Masking Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllAnswers(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 hover:border-amber-500/40 transition-colors"
                title="전체 정답 한눈에 보기"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>👁️ 전체 정답 공개</span>
              </button>
              <button
                onClick={() => toggleAllAnswers(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 hover:border-indigo-500/40 transition-colors"
                title="전체 영문 답안 덮기 (셀프 암기 테스트)"
              >
                <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>🙈 전체 암기 테스트 덮기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🔊 원어민 발음 설정 바 */}
      <TtsSettingsBar className="glass-panel border-indigo-500/20" />

      {/* Main Saved Cards List */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-5 border-slate-800 bg-slate-900/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">보관된 학습 카드가 없습니다</h3>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? '검색어와 일치하는 학습 카드가 없습니다.'
                : "'어순 변환' 탭에서 학습한 문장을 '⭐ 학습자료실에 보관' 버튼을 눌러 언제든지 복습할 수 있도록 추가해 보세요!"}
            </p>
          </div>
          {onNavigateToTranslator && (
            <button
              onClick={onNavigateToTranslator}
              className="btn-primary text-xs px-5 py-2.5 mx-auto gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>어순 변환하러 가기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item, index) => {
            const isMasked = hiddenAnswers[item.id] !== false; // Default is TRUE (Masked for self-quiz)
            const recs = getNativeRecommendations(item);
            const savedDateTime = item.savedAt
              ? new Date(item.savedAt).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              : '';

            return (
              <div
                key={item.id || index}
                className="p-6 sm:p-8 space-y-6 border border-pink-300 dark:border-slate-800 hover:border-indigo-500/40 transition-all bg-white dark:bg-slate-900/90 rounded-3xl shadow-xl relative group"
              >
                {/* Card Top Action Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-pink-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white flex items-center gap-1.5 shadow-sm">
                      <Bookmark className="w-3.5 h-3.5 fill-white" />
                      <span>CARD #{items.length - index}</span>
                    </span>
                    {savedDateTime && (
                      <span className="text-xs text-slate-900 dark:text-slate-100 font-extrabold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{savedDateTime} 저장</span>
                      </span>
                    )}
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Self-Quiz Mask Toggle Button */}
                    <button
                      onClick={() => toggleAnswerMask(item.id)}
                      className={`btn-secondary text-xs gap-1.5 ${
                        isMasked ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold' : ''
                      }`}
                      title={isMasked ? '영문 정답 공개하기' : '영문 정답 가리기 (셀프 암기 테스트)'}
                    >
                      {isMasked ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isMasked ? '👁️ 영문 정답 확인' : '🙈 암기 테스트 가리기'}</span>
                    </button>

                    {/* Audio TTS Button */}
                    <button
                      onClick={() => handleSpeak(item.english)}
                      className={`btn-secondary text-xs gap-1.5 transition-all ${speaking && speakingText === item.english ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' : ''}`}
                      title={speaking && speakingText === item.english ? '발음 중단하기' : '원어민 발음 들려주기'}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speaking && speakingText === item.english ? 'animate-bounce text-indigo-400' : 'text-sky-400'}`} />
                      <span>
                        {speaking && speakingText === item.english
                          ? `중단 (${currentRepIndex}/${totalReps}회)`
                          : '발음 듣기'}
                      </span>
                    </button>

                    {/* Export PDF Button */}
                    <button
                      onClick={() => exportToPDF(item)}
                      className="btn-secondary text-xs p-2 text-slate-900 dark:text-slate-100 font-bold"
                      title="이 카드 PDF 출력"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Email Button */}
                    <button
                      onClick={() => onOpenEmailModal && onOpenEmailModal(item)}
                      className="btn-secondary text-xs p-2 text-sky-400 hover:text-sky-300"
                      title="이 카드 E-mail 전송"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete / Mark as Mastered Button */}
                    <button
                      onClick={() => handleMarkAsMastered(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 ml-2"
                      title="이 문장을 완전히 마스터함 (보관함에서 삭제)"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>완전 학습 완료 (지우기)</span>
                    </button>
                  </div>
                </div>

                {/* Korean Draft & English Refined Sentences */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-pink-800 dark:text-pink-300 uppercase tracking-wider block">
                      [학습자 입력 원본 시순서]
                    </span>
                    <div className="p-4 rounded-xl bg-pink-100/80 dark:bg-slate-950 border border-pink-300 dark:border-slate-800 shadow-sm">
                      <p className="text-base sm:text-lg font-black text-pink-950 dark:text-pink-100 select-all leading-relaxed">
                        "{item.arrowKorean}"
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative overflow-hidden">
                    <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider block">
                      [정통 원어민 표준 영문]
                    </span>
                    {isMasked ? (
                      <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-amber-500/40 text-center space-y-1">
                        <p className="text-xs text-amber-300 font-bold">🙈 셀프 암기 테스트 중 (답안이 가려져 있습니다)</p>
                        <p className="text-xs text-slate-200 font-bold">위 한국어 어순을 보고 입으로 영문 전체를 먼저 뱉어보세요!</p>
                      </div>
                    ) : (
                      <p className="text-lg sm:text-xl font-extrabold text-white font-brand select-all leading-relaxed">
                        "{item.english}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Arrow 6-Step Sequence Flow Cards */}
                {item.chunks && item.chunks.length > 0 && !isMasked && (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-950 dark:text-white block">
                      📸 Cupid English 6단계 시순서 분해 청크:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {item.chunks.map((chunk, cIdx) => (
                        <div
                          key={cIdx}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-xs space-y-1 shadow-sm"
                        >
                          <span className="text-xs text-amber-300 font-black block">
                            {chunk.role?.split(' ')[1] || chunk.role}
                          </span>
                          <span className="text-sky-300 font-extrabold font-brand block text-sm">
                            {chunk.english}
                          </span>
                          <span className="text-emerald-300 text-xs block font-extrabold">
                            ({chunk.text})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3-Tier Native Recommendations */}
                {recs && recs.length > 0 && !isMasked && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>💡 상황별 3색 원어민 보이스 & 뉘앙스</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {recs.map((rec, rIdx) => {
                        const badgeColors = [
                          'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                          'bg-sky-500/10 text-sky-300 border-sky-500/30',
                          'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        ];

                        return (
                          <div
                            key={rIdx}
                            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs flex flex-col justify-between hover:border-sky-500/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${badgeColors[rIdx % 3]}`}>
                                  {rec.label}
                                </span>
                                <button
                                  onClick={() => handleSpeak(rec.english)}
                                  className={`btn-secondary text-[10px] px-2 py-0.5 gap-1 transition-all ${speaking && speakingText === rec.english ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' : ''}`}
                                  title="발음 듣기"
                                >
                                  <Volume2 className={`w-3 h-3 ${speaking && speakingText === rec.english ? 'animate-bounce text-indigo-400' : 'text-sky-400'}`} />
                                  <span>
                                    {speaking && speakingText === rec.english ? `${currentRepIndex}/${totalReps}` : '듣기'}
                                  </span>
                                </button>
                              </div>
                              <p className="font-extrabold text-white font-brand pt-1 text-sm select-all">
                                "{rec.english}"
                              </p>
                              <p className="text-amber-200 text-xs font-extrabold pt-1">({rec.korean})</p>
                            </div>
                            {rec.keyChange && (
                              <p className="text-[10px] text-amber-300/90 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 mt-1">
                                {rec.keyChange}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5D Masterclass Correction Points */}
                {item.correction && item.correction.points && item.correction.points.length > 0 && !isMasked && (
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>1:1 튜터링 교정 포인트 ({item.correction.points.length}개)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.correction.points.map((pt, pIdx) => (
                        <div key={pIdx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                          <span className="font-bold text-amber-300 block">📌 {pt.category}</span>
                          <p className="text-sky-300 font-extrabold font-brand">{pt.corrected}</p>
                          <p className="text-slate-200 text-xs leading-relaxed pt-1 font-medium">{pt.reason || pt.imageDifference}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
