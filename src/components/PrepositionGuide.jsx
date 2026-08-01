// src/components/PrepositionGuide.jsx
import React, { useState, useEffect } from 'react';
import { speakEnglishText, stopSpeaking, getTtsSettings } from '../services/speechService';
import { TtsSettingsBar } from './TtsSettingsBar';
import { PREPOSITION_CATEGORIES, PREPOSITION_LIST, PREPOSITION_NUANCES } from '../services/prepositionData';
import { 
  Compass, 
  Search, 
  ArrowUpRight, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  Layers,
  CheckCircle2,
  X,
  Volume2,
  ExternalLink
} from 'lucide-react';

function getDictionaryLinks(word) {
  const encoded = encodeURIComponent(word);
  return [
    {
      name: '네이버 사전',
      shortName: 'NAVER',
      color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
      flag: '🇰🇷',
      url: `https://en.dict.naver.com/#/search?query=${encoded}&range=word`,
    },
    {
      name: 'Cambridge Dictionary',
      shortName: 'Cambridge',
      color: 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20',
      flag: '🇬🇧',
      url: `https://dictionary.cambridge.org/dictionary/english/${encoded}`,
    },
    {
      name: 'Merriam-Webster',
      shortName: 'M-Webster',
      color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20',
      flag: '🇺🇸',
      url: `https://www.merriam-webster.com/dictionary/${encoded}`,
    },
    {
      name: 'Oxford Learner\'s',
      shortName: 'Oxford',
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
      flag: '📖',
      url: `https://www.oxfordlearnersdictionaries.com/definition/english/${encoded}`,
    },
  ];
}

export function PrepositionGuide() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreposition, setSelectedPreposition] = useState(null);
  const [showNuancesOnly, setShowNuancesOnly] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [currentRepIndex, setCurrentRepIndex] = useState(0);
  const [totalReps, setTotalReps] = useState(1);

  // Filter logic
  const filteredPrepositions = PREPOSITION_LIST.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.arrowMeaning.includes(searchTerm) ||
      item.coreConcept.includes(searchTerm) ||
      item.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredNuances = PREPOSITION_NUANCES.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.summary.includes(searchTerm) ||
    n.tag.includes(searchTerm)
  );

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'time':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'place':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'direction':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'other':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <section className="glass-panel p-8 text-center space-y-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
          <Compass className="w-4 h-4 text-pink-400" />
          <span>💘 큐피드 잉글리시 시각적 이미지 사전 (Visual Preposition Map)</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          영문법의 핵심, <span className="gradient-text">전치사 4대 카테고리 직관 지도</span>
        </h2>

        <p className="text-slate-300 text-sm max-w-3xl mx-auto leading-relaxed">
          전치사를 한국어 뜻(~에, ~의, ~를 위해)으로 암기하지 마세요!
          주인공에서 출발한 시선과 물리적 동작의 큐피드 카메라 그림으로 단 한 번에 직관 이해합니다.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="전치사, 한국어 의미, 뉘앙스 검색 (예: at, on, 시간, 기한, 접촉)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-pink-500/30 dark:border-slate-700/80 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-4 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-md"
            >
              지우기
            </button>
          )}
        </div>
      </section>

      {/* 🔊 원어민 발음 설정 바 */}
      <TtsSettingsBar className="glass-panel border-indigo-500/20" />

      {/* Category Tabs & Nuance Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            {PREPOSITION_CATEGORIES.map((cat) => {
              const count = cat.id === 'all' 
                ? PREPOSITION_LIST.length 
                : PREPOSITION_LIST.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowNuancesOnly(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                    selectedCategory === cat.id && !showNuancesOnly
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : 'bg-white/80 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-white border border-pink-300 dark:border-slate-700/60 shadow-sm'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    selectedCategory === cat.id && !showNuancesOnly
                      ? 'bg-indigo-700 text-white'
                      : 'bg-pink-100 dark:bg-slate-800 text-pink-900 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Toggle Nuance Comparison View */}
          <button
            onClick={() => setShowNuancesOnly(!showNuancesOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              showNuancesOnly
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/30'
                : 'bg-white/80 dark:bg-slate-900/60 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/10 shadow-sm'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>💡 뉘앙스 찰떡 비교 ({PREPOSITION_NUANCES.length})</span>
          </button>
        </div>

        {/* Selected Category Description Banner */}
        {!showNuancesOnly && (
          <div className="bg-white/80 dark:bg-slate-900/60 border border-pink-500/20 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs sm:text-sm text-slate-800 dark:text-slate-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {PREPOSITION_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {PREPOSITION_CATEGORIES.find(c => c.id === selectedCategory)?.englishName}:
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {PREPOSITION_CATEGORIES.find(c => c.id === selectedCategory)?.desc}
              </span>
            </div>
            <span className="text-slate-500 font-mono hidden sm:inline font-semibold">
              총 {filteredPrepositions.length}개 항목 표시 중
            </span>
          </div>
        )}
      </div>

      {/* Style definitions for transitions */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Main Content Area (Side-by-Side Flex Layout) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* Left Side: Prepositions List */}
        <div className={`transition-all duration-300 w-full ${selectedPreposition ? 'lg:w-[60%] xl:w-[65%]' : 'lg:w-full'}`}>
          {showNuancesOnly ? (
            /* NUANCE COMPARISON CARDS VIEW */
            <div className="space-y-6 animate-fade-in">
              <div className="glass-panel p-6 border-amber-500/30 bg-amber-500/5 space-y-2">
                <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>전치사 뉘앙스 비교 꿀팁 (Nuance Comparison Guide)</span>
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  영어 시험과 실제 회화에서 가장 많이 헷갈리는 전치사 쌍(in vs at, by vs until, for vs during 등)의 핵심 차이를 그림과 함께 확실하게 잡아드립니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredNuances.map((nuance) => (
                  <div
                    key={nuance.id}
                    className="glass-panel p-6 space-y-4 hover:border-amber-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{nuance.title}</span>
                      </h4>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {nuance.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-300 font-medium bg-white/90 dark:bg-slate-950/70 p-3 rounded-xl border border-pink-500/20 dark:border-slate-800 leading-relaxed shadow-sm">
                      {nuance.summary}
                    </p>

                    <div className="space-y-2 pt-2">
                      {nuance.details.map((detail, dIdx) => (
                        <div key={dIdx} className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-3 border border-pink-500/20 dark:border-slate-800/80 text-xs space-y-1.5 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block uppercase tracking-wider">
                            📌 {detail.aspect}
                          </span>
                          <div className="grid grid-cols-1 gap-1 text-slate-800 dark:text-slate-200 font-medium">
                            <p className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                              <span>{detail.first}</span>
                            </p>
                            {detail.second && (
                              <p className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                <span>{detail.second}</span>
                              </p>
                            )}
                            {detail.third && (
                              <p className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                                <span>{detail.third}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300/90 italic">
                        {nuance.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STANDARD PREPOSITION DICTIONARY GRID VIEW */
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance] animate-fade-in">
              {filteredPrepositions.map((item) => {
                const isActive = selectedPreposition?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPreposition(item)}
                    className={`glass-panel p-6 space-y-4 hover:border-indigo-500/50 transition-all duration-300 group hover:-translate-y-1 cursor-pointer flex flex-col justify-between break-inside-avoid w-full mb-6 ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20 ring-2 ring-indigo-500/30' 
                        : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 bg-white/90 dark:bg-slate-900 rounded-xl border border-pink-500/20 dark:border-slate-800 group-hover:scale-110 transition-transform shadow-sm">
                            {item.visualIcon}
                          </span>
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-brand group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                              <span>{item.word}</span>
                            </h3>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border inline-block mt-1 ${getCategoryBadgeClass(item.category)}`}>
                              {item.categoryLabel}
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(item.word);
                          }}
                          className="p-2 rounded-lg bg-pink-100 dark:bg-slate-800/80 text-pink-700 dark:text-slate-400 hover:text-pink-900 dark:hover:text-sky-300 transition-all shrink-0 shadow-sm"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Arrow Meaning Badge */}
                      <div className="inline-block px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-xs font-extrabold w-full">
                        🎯 시각 이미지: {item.arrowMeaning}
                      </div>

                      {/* Core Concept */}
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed bg-white/90 dark:bg-slate-950/60 p-3 rounded-xl border border-pink-500/20 dark:border-slate-800/80 shadow-sm font-medium">
                        {item.coreConcept}
                      </p>
                    </div>

                    {/* Example Snippet */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                        대표 예시
                      </span>
                      {item.examples && item.examples.length > 0 ? (
                        <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-pink-500/20 dark:border-slate-800 text-xs space-y-1 shadow-sm">
                          <p className="font-bold text-sky-800 dark:text-sky-300 flex items-center justify-between">
                            <span>"{item.examples[0].en}"</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            → {item.examples[0].kr}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">"{item.example}"</p>
                      )}

                      {/* Phrasal Verbs Preview */}
                      {item.phrasalVerbs && item.phrasalVerbs.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.phrasalVerbs.slice(0, 2).map((pv, idx) => (
                            <span key={idx} className="text-[10px] bg-pink-100 dark:bg-slate-800 text-pink-900 dark:text-slate-300 px-2 py-0.5 rounded-md border border-pink-300 dark:border-slate-700 font-bold">
                              {pv}
                            </span>
                          ))}
                          {item.phrasalVerbs.length > 2 && (
                            <span className="text-[10px] text-slate-500 px-1 py-0.5 font-bold">
                              +{item.phrasalVerbs.length - 2} 더보기
                            </span>
                          )}
                        </div>
                      )}

                      {/* Dictionary Quick-Link Buttons (Card Grid) */}
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200 dark:border-slate-800/60 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold w-full uppercase tracking-wider mb-0.5">📖 더 많은 예문 보기</span>
                        {getDictionaryLinks(item.word).map((dict) => (
                          <a
                            key={dict.shortName}
                            href={dict.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${dict.color}`}
                            title={`${dict.name}에서 '${item.word}' 예문 더보기`}
                          >
                            <span>{dict.flag}</span>
                            <span>{dict.shortName}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Sticky Detail Side Panel */}
        {selectedPreposition && (
          <div 
            className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-40 bg-white/95 dark:bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[calc(100vh-190px)] overflow-y-auto scrollbar-thin shrink-0 animate-fade-in text-slate-800 dark:text-slate-200"
            style={{
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Header / Close Button */}
            <div className="flex items-center justify-between gap-2 border-b border-pink-500/20 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-pink-100 dark:bg-slate-950 rounded-2xl border border-pink-300 dark:border-slate-800 shadow-sm">
                  {selectedPreposition.visualIcon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-brand">
                      {selectedPreposition.word}
                    </h3>
                    <button
                      onClick={() => handleSpeak(selectedPreposition.word)}
                      className={`p-1.5 rounded-lg transition-all ${speaking && speakingText === selectedPreposition.word ? 'bg-indigo-600/40 text-indigo-900 dark:text-indigo-300' : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30'}`}
                      title={speaking && speakingText === selectedPreposition.word ? '발음 중단하기' : '원어민 발음 듣기'}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speaking && speakingText === selectedPreposition.word ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getCategoryBadgeClass(selectedPreposition.category)}`}>
                    {selectedPreposition.categoryLabel}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPreposition(null)}
                className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-slate-400 hover:text-pink-900 dark:hover:text-white hover:bg-pink-200 dark:hover:bg-slate-700 transition-all shrink-0"
                title="상세보기 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cupid English Visual Concept */}
            <div className="bg-gradient-to-r from-indigo-100/90 to-sky-100/90 dark:from-indigo-900/40 dark:to-sky-900/40 p-3.5 rounded-xl border border-indigo-300 dark:border-indigo-500/30 space-y-1.5 shadow-sm">
              <span className="text-[10px] font-extrabold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>큐피드 잉글리시 시각적 핵심 이미지</span>
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                "{selectedPreposition.arrowMeaning}"
              </p>
              <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                {selectedPreposition.coreConcept}
              </p>
            </div>

            {/* Examples Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>실전 문장과 애로우 순차 해설</span>
              </h4>

              <div className="space-y-2">
                {selectedPreposition.examples ? (
                  selectedPreposition.examples.map((ex, idx) => (
                    <div key={idx} className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-pink-500/20 dark:border-slate-800 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-sky-800 dark:text-sky-300 font-brand">
                          {ex.en}
                        </p>
                        <button
                          onClick={() => handleSpeak(ex.en)}
                          className={`p-1 transition-all ${speaking && speakingText === ex.en ? 'text-indigo-600 bg-indigo-500/20 rounded-md' : 'text-slate-400 hover:text-sky-600'}`}
                          title={speaking && speakingText === ex.en ? `중단 (${currentRepIndex}/${totalReps})` : '발음 듣기'}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${speaking && speakingText === ex.en ? 'animate-bounce' : ''}`} />
                        </button>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                        → {ex.kr}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-pink-500/20 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-bold text-sky-800 dark:text-sky-300 font-brand">
                      {selectedPreposition.example}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* High Frequency Phrasal Verbs / Idioms */}
            {selectedPreposition.phrasalVerbs && selectedPreposition.phrasalVerbs.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>빈출 구동사 및 필수 숙어 팁</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreposition.phrasalVerbs.map((pv, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 rounded-xl bg-pink-100 dark:bg-slate-900 border border-pink-300 dark:border-slate-700/80 text-pink-900 dark:text-slate-200 text-xs font-bold shadow-sm"
                    >
                      🔥 {pv}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dictionary Deep-Link Section */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>📖 더 많은 예문 & 발음 — 글로벌 사전 바로가기</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getDictionaryLinks(selectedPreposition.word).map((dict) => (
                  <a
                    key={dict.shortName}
                    href={dict.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${dict.color}`}
                    title={`${dict.name}에서 '${selectedPreposition.word}' 전치사 예문 더보기`}
                  >
                    <span className="text-lg">{dict.flag}</span>
                    <span className="text-center leading-tight">{dict.name}</span>
                    <span className="flex items-center gap-1 text-[9px] opacity-70">
                      <ExternalLink className="w-2 h-2" />
                      <span>새 탭으로 열기</span>
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                💡 <strong className="text-slate-400">Cambridge</strong>는 영영 + 다양한 구어체 예문, <strong className="text-slate-400">네이버</strong>는 한국어 해석 병기, <strong className="text-slate-400">Merriam-Webster</strong>는 미국 구어 예문, <strong className="text-slate-400">Oxford Learner's</strong>는 수능/공인시험 빈출 예문 중심으로 추천합니다.
              </p>
            </div>

            {/* Bottom Panel Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreposition(null)}
                className="btn-primary text-xs px-5 py-2.5"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
