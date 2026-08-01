import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArrowTranslator } from './components/ArrowTranslator';
import { ArrowPractice } from './components/ArrowPractice';
import { PrepositionGuide } from './components/PrepositionGuide';
import { StudyVault } from './components/StudyVault';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GuideModal } from './components/GuideModal';
import { EmailModal } from './components/EmailModal';
import { FolderSyncModal } from './components/FolderSyncModal';
import { getStoredApiKey, fetchStoredApiKeyAsync } from './services/apiKeyStorage';
import { initVaultStorage } from './services/vaultService';

export default function App() {
  const [activeTab, setActiveTab] = useState('translator');
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [emailTargetResult, setEmailTargetResult] = useState(null);
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());

  const [currentResult, setCurrentResult] = useState(null);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleOpenEmailModal = (targetResult) => {
    setEmailTargetResult(targetResult || currentResult);
    setIsEmailModalOpen(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    initVaultStorage();

    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }

    fetchStoredApiKeyAsync().then((storedKey) => {
      if (storedKey) {
        setApiKey(storedKey);
      }
    });
  }, []);

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      {/* Header Navbar */}
      <Navbar
        key={currentResult?.id || currentResult?.english || 'nav-default'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenEmailModal={handleOpenEmailModal}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentResult={currentResult}
      />

      {/* Main Content Area */}
      <main className="container mx-auto">
        {activeTab === 'translator' && (
          <ArrowTranslator apiKey={apiKey} onResultChange={setCurrentResult} onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'practice' && <ArrowPractice />}
        {activeTab === 'dictionary' && <PrepositionGuide />}
        {activeTab === 'vault' && (
          <StudyVault
            onNavigateToTranslator={() => setActiveTab('translator')}
            onOpenEmailModal={handleOpenEmailModal}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 py-6 border-t border-slate-800/60 flex flex-col items-center gap-2">
        <p>© 2026 Cupid English AI Studio - 뇌 구조에 맞춘 직관 파스텔 큐피드 영어 학습 파트너 💘</p>
        <button
          onClick={() => setIsGuideOpen(true)}
          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium"
        >
          💡 서비스 이용 가이드 및 데이터 보관 안내 다시보기
        </button>
      </footer>

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* API Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        result={emailTargetResult || currentResult}
      />

      {/* Folder & Cloud Sync Modal */}
      <FolderSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

