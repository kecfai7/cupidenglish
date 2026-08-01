// src/components/EmailModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Mail, Send, Copy, Download, Check, AlertCircle, Users, Settings, Sparkles, Eye, ChevronDown, ChevronUp, CheckCircle2, History, Trash2, ArrowLeft, RotateCcw, ExternalLink, HelpCircle, Key, ShieldCheck, LogIn } from 'lucide-react';
import {
  getStoredSenderEmail,
  saveStoredSenderEmail,
  getStoredRawRecipients,
  saveStoredRawRecipients,
  parseRecipientEmails,
  generateEmailHTML,
  copyEmailHtmlToClipboard,
  downloadEmlFile,
  sendEmailViaMailClient,
  sendEmailViaEmailJS,
  getEmailJSConfig,
  saveEmailJSConfig,
  saveEmailDispatchRecord,
  getEmailDispatchHistory,
  clearEmailDispatchHistory
} from '../services/emailService';
import {
  getStoredGmailToken,
  saveStoredGmailToken,
  getStoredGoogleClientId,
  saveStoredGoogleClientId,
  sendEmailViaGmailAPI,
  requestGoogleGmailToken
} from '../services/gmailService';

export function EmailModal({ isOpen, onClose, result }) {
  const [senderEmail, setSenderEmail] = useState('');
  const [rawRecipients, setRawRecipients] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailJSConfig, setShowEmailJSConfig] = useState(false);
  const [showGmailConfig, setShowGmailConfig] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // EmailJS Settings
  const [emailJSConfig, setEmailJSConfig] = useState({ serviceId: '', templateId: '', publicKey: '' });

  // Gmail API & OAuth Settings
  const [gmailToken, setGmailToken] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');

  // Mode: 'form' | 'confirmation' | 'history'
  const [viewMode, setViewMode] = useState('form');
  const [lastDispatchRecord, setLastDispatchRecord] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // Status indicators
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedSender = getStoredSenderEmail();
      const storedRecipients = getStoredRawRecipients();
      setSenderEmail(storedSender || '');
      setRawRecipients(storedRecipients || '');
      setEmailJSConfig(getEmailJSConfig());
      setGmailToken(getStoredGmailToken());
      setGoogleClientId(getStoredGoogleClientId() || '');
      setCopySuccess(false);
      setSendSuccessMsg('');
      setErrorMsg('');
      setIsSending(false);
      setViewMode('form');
      setLastDispatchRecord(null);
      setHistoryList(getEmailDispatchHistory());
    }
  }, [isOpen]);

  useEffect(() => {
    const list = parseRecipientEmails(rawRecipients);
    setParsedRecipients(list);
  }, [rawRecipients]);

  if (!isOpen || !result) return null;

  const subjectText = result.english || result.arrowKorean || 'Cupid English Report';
  const hasEmailJS = Boolean(emailJSConfig.serviceId && emailJSConfig.templateId && emailJSConfig.publicKey);
  const hasGmailToken = Boolean(gmailToken);

  const handleSenderChange = (e) => {
    const val = e.target.value;
    setSenderEmail(val);
    saveStoredSenderEmail(val);
  };

  const handleRawRecipientsChange = (e) => {
    const val = e.target.value;
    setRawRecipients(val);
    saveStoredRawRecipients(val);
  };

  const handleRemoveRecipient = (emailToRemove) => {
    const tokens = rawRecipients.split(/[\s,;\n\r\t]+/);
    const filtered = tokens.filter(t => t.trim().replace(/^<|>$|^"|"$/g, '').toLowerCase() !== emailToRemove.toLowerCase());
    const newRaw = filtered.join(', ');
    setRawRecipients(newRaw);
    saveStoredRawRecipients(newRaw);
  };

  const handleReuseRecipients = (recipientList) => {
    if (Array.isArray(recipientList) && recipientList.length > 0) {
      const newRawText = recipientList.join(', ');
      setRawRecipients(newRawText);
      saveStoredRawRecipients(newRawText);
      setViewMode('form');
      setSendSuccessMsg(`✨ 수신자 목록(${recipientList.length}명)이 복원되었습니다. 바로 메일을 전송하실 수 있습니다!`);
      setTimeout(() => setSendSuccessMsg(''), 3500);
    }
  };

  const handleCopyHTML = async (openWebmailUrl = null) => {
    setErrorMsg('');
    saveStoredRawRecipients(rawRecipients);
    const success = await copyEmailHtmlToClipboard(result, senderEmail);
    if (success) {
      setCopySuccess(true);
      const record = saveEmailDispatchRecord({
        result,
        senderEmail,
        recipientEmails: parsedRecipients.length > 0 ? parsedRecipients : [senderEmail || '클립보드 복사'],
        deliveryMethod: 'Rich HTML 클립보드 복사',
        status: 'copied'
      });
      setLastDispatchRecord(record);
      setHistoryList(getEmailDispatchHistory());

      if (openWebmailUrl) {
        window.open(openWebmailUrl, '_blank');
      }
      setTimeout(() => setCopySuccess(false), 2500);
    } else {
      setErrorMsg('클립보드 복사에 실패했습니다.');
    }
  };

  const handleDownloadEml = () => {
    setErrorMsg('');
    saveStoredRawRecipients(rawRecipients);
    downloadEmlFile(result, senderEmail, parsedRecipients);
    const record = saveEmailDispatchRecord({
      result,
      senderEmail,
      recipientEmails: parsedRecipients.length > 0 ? parsedRecipients : ['EML 다운로드'],
      deliveryMethod: '.eml 메일 파일 저장',
      status: 'downloaded'
    });
    setLastDispatchRecord(record);
    setHistoryList(getEmailDispatchHistory());
    setViewMode('confirmation');
  };

  const handleSaveGmailToken = (tokenVal) => {
    saveStoredGmailToken(tokenVal);
    setGmailToken(tokenVal.trim());
    if (tokenVal.trim()) {
      setSendSuccessMsg('✨ Gmail API 인증 토큰이 저장되었습니다! 이제 [❤️ Gmail 1초 자동 직발송] 버튼으로 배달됩니다.');
    } else {
      setSendSuccessMsg('Gmail 토큰이 해제되었습니다.');
    }
    setTimeout(() => setSendSuccessMsg(''), 3500);
  };

  const handleSaveGoogleClientId = () => {
    saveStoredGoogleClientId(googleClientId);
    setSendSuccessMsg('Google OAuth Client ID가 저장되었습니다.');
    setTimeout(() => setSendSuccessMsg(''), 2000);
  };

  const handleConnectGoogleOAuth = () => {
    setErrorMsg('');
    if (!googleClientId) {
      setErrorMsg('Google Client ID를 입력해 주세요.');
      return;
    }
    saveStoredGoogleClientId(googleClientId);

    requestGoogleGmailToken(
      googleClientId,
      (token) => {
        setGmailToken(token);
        setSendSuccessMsg('✨ Google Gmail 계정이 성공적으로 연동되었습니다! 이제 버튼 1번으로 자동 직발송됩니다.');
        setTimeout(() => setSendSuccessMsg(''), 3500);
      },
      (err) => {
        setErrorMsg(err.message || 'Google Gmail 로그인 연동 중 오류가 발생했습니다.');
      }
    );
  };

  const handleSaveEmailJSConfig = () => {
    saveEmailJSConfig(emailJSConfig);
    setSendSuccessMsg('EmailJS 설정이 저장되었습니다.');
    setTimeout(() => setSendSuccessMsg(''), 2000);
  };

  // Dispatch via Official Gmail API
  const handleSendViaGmail = async () => {
    setErrorMsg('');
    setSendSuccessMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (senderEmail && !emailRegex.test(senderEmail)) {
      setErrorMsg('올바른 보내는 사람 이메일 주소를 입력해 주세요.');
      return;
    }

    if (parsedRecipients.length === 0) {
      setErrorMsg('받는 사람 이메일 주소를 1개 이상 입력해 주세요 (수십 명 입력 가능).');
      return;
    }

    if (!gmailToken) {
      setShowGmailConfig(true);
      setErrorMsg('💡 Gmail로 1초 자동 직발송을 하려면 아래 [Gmail API 연동 키 설정]에서 인증 토큰(Access Token) 또는 Google 연동을 완료해 주세요!');
      return;
    }

    saveStoredSenderEmail(senderEmail);
    saveStoredRawRecipients(rawRecipients);

    setIsSending(true);
    try {
      await sendEmailViaGmailAPI(result, senderEmail, parsedRecipients, gmailToken);
      setIsSending(false);
      const record = saveEmailDispatchRecord({
        result,
        senderEmail: senderEmail || 'me (Gmail Account)',
        recipientEmails: parsedRecipients,
        deliveryMethod: 'Google Gmail API 공식 직접 발송',
        status: 'success'
      });
      setLastDispatchRecord(record);
      setHistoryList(getEmailDispatchHistory());
      setViewMode('confirmation');
    } catch (err) {
      setIsSending(false);
      setErrorMsg(err.message || 'Gmail API 발송 실패. 토큰이 만료되었을 수 있습니다.');
    }
  };

  // Dispatch via EmailJS API
  const handleSendViaEmailJS = async () => {
    setErrorMsg('');
    setSendSuccessMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (senderEmail && !emailRegex.test(senderEmail)) {
      setErrorMsg('올바른 보내는 사람 이메일 주소를 입력해 주세요.');
      return;
    }

    if (parsedRecipients.length === 0) {
      setErrorMsg('받는 사람 이메일 주소를 1개 이상 입력해 주세요.');
      return;
    }

    saveStoredSenderEmail(senderEmail);
    saveStoredRawRecipients(rawRecipients);

    if (!hasEmailJS) {
      setShowEmailJSConfig(true);
      setErrorMsg('💡 EmailJS로 자동 직발송하려면 아래 [EmailJS API 키 설정]에 Service ID, Template ID, Public Key를 입력 후 [저장]을 눌러주세요!');
      return;
    }

    setIsSending(true);
    try {
      await sendEmailViaEmailJS(result, senderEmail, parsedRecipients, emailJSConfig);
      setIsSending(false);
      const record = saveEmailDispatchRecord({
        result,
        senderEmail,
        recipientEmails: parsedRecipients,
        deliveryMethod: 'EmailJS 백그라운드 자동 전송',
        status: 'success'
      });
      setLastDispatchRecord(record);
      setHistoryList(getEmailDispatchHistory());
      setViewMode('confirmation');
    } catch (err) {
      setIsSending(false);
      setErrorMsg(`EmailJS 발송 실패: ${err.message}`);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('발송 이력 전체를 삭제하시겠습니까?')) {
      clearEmailDispatchHistory();
      setHistoryList([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 space-y-5 relative border-indigo-500/30 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs: Form / Confirmation / History */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Gmail API & E-mail 자동 직발송</span>
                {hasGmailToken && (
                  <span className="text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-rose-400" />
                    Gmail 연동됨
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                공식 Google Gmail API 연동으로 메일 앱/붙여넣기 없이 상대방 메일함에 1초 자동 직발송합니다.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === 'form' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              메일 작성
            </button>
            {lastDispatchRecord && (
              <button
                onClick={() => setViewMode('confirmation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  viewMode === 'confirmation' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                전송 결과
              </button>
            )}
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                viewMode === 'history' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>발송 이력 ({historyList.length})</span>
            </button>
          </div>
        </div>

        {/* Status Alerts (Only in Form view) */}
        {viewMode === 'form' && errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {viewMode === 'form' && sendSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sendSuccessMsg}</span>
          </div>
        )}

        {/* VIEW MODE 1: FORM */}
        {viewMode === 'form' && (
          <div className="space-y-4">

            {/* 1. Subject Line Display */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>이메일 제목 (Exact Natural Standard English)</span>
                </label>
                <span className="text-[10px] text-slate-400">자동 지정됨</span>
              </div>
              <div className="text-sm font-extrabold text-white bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800/80">
                "{subjectText}"
              </div>
            </div>

            {/* 2. Sender Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                보내는 사람 email <span className="text-slate-400 font-normal">(내 지메일 계정)</span>
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={handleSenderChange}
                placeholder="myname@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                💡 입력 시 다음 접속에도 자동으로 저장됩니다.
              </p>
            </div>

            {/* 3. Multiple Recipient Emails Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>받는 사람 email <span className="text-sky-400 font-extrabold">(수십 명 입력 / 자동 보존)</span></span>
                </label>
                {parsedRecipients.length > 0 && (
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    총 {parsedRecipients.length}명 저장됨
                  </span>
                )}
              </div>

              <textarea
                value={rawRecipients}
                onChange={handleRawRecipientsChange}
                rows={3}
                placeholder="수신자 이메일을 쉼표(,), 세미콜론(;), 줄바꿈으로 수십 명 자유롭게 입력하세요.&#10;예: user1@naver.com, user2@gmail.com&#10;user3@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />

              <p className="text-[11px] text-emerald-400/90 font-medium">
                ✨ 입력된 받는 사람 이메일 주소는 영구 보존되므로 동일한 수신자 그룹에게 또 바로 보내실 수 있습니다!
              </p>

              {/* Parsed Email Tag Chips */}
              {parsedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  {parsedRecipients.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-slate-400 hover:text-rose-400 ml-0.5"
                        title="수신자 제거"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 🌟 4. Google Gmail API Settings Panel (Official Google Gmail Direct Dispatch) */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-rose-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>❤️ Google Gmail API 1초 자동 직발송 연동 설정</span>
                  {hasGmailToken ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Gmail 연동 성공 (1초 자동 직발송 가능)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                      Gmail 인증 필요
                    </span>
                  )}
                </label>
                <button
                  onClick={() => setShowGmailConfig(!showGmailConfig)}
                  className="text-[11px] text-slate-400 hover:text-white underline font-semibold"
                >
                  {showGmailConfig ? '설정 닫기' : '설정 열기'}
                </button>
              </div>

              {showGmailConfig && (
                <div className="space-y-3 pt-1 border-t border-slate-800 text-xs text-slate-300">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    구글 공식 <strong>Gmail API (`users.messages.send`)</strong> 연동을 통해 내 Gmail 계정에서 상대방 이메일함으로 붙여넣기 없이 버튼 1번으로 직접 전송합니다.
                  </p>

                  {/* How-to-get Guide Box */}
                  <div className="p-3.5 bg-slate-950/90 rounded-xl border border-amber-500/30 text-[11px] text-slate-300 space-y-2 leading-relaxed">
                    <div className="font-extrabold text-amber-300 flex items-center justify-between">
                      <span>💡 Gmail API 토큰 발급받는 2가지 방법:</span>
                      <a
                        href="https://developers.google.com/oauthplayground/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline font-bold flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30"
                      >
                        <span>⚡ 30초 즉시 발급 (Playground) ↗</span>
                      </a>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <div>
                        <strong className="text-emerald-300">방법 1. Google OAuth Playground (가장 빠른 30초 발급)</strong><br/>
                        1. <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">Google OAuth Playground ↗</a> 접속<br/>
                        2. 왼쪽 목록에서 <strong>Gmail API v1</strong> ➔ <code className="bg-slate-900 px-1 text-amber-300">https://www.googleapis.com/auth/gmail.send</code> 체크<br/>
                        3. <strong>Authorize APIs</strong> 파란 버튼 클릭 후 본인 Gmail 로그인<br/>
                        4. <strong>Exchange authorization code for tokens</strong> 클릭 ➔ 생성된 <code className="bg-slate-900 px-1 text-emerald-300">Access Token (ya29.a0A...)</code> 복사 후 아래 붙여넣기!
                      </div>
                      <div className="pt-1 border-t border-slate-800">
                        <strong className="text-sky-300">방법 2. Google Cloud Console (공식 OAuth Client ID)</strong><br/>
                        1. <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">Google Cloud Console ↗</a> ➔ Gmail API 사용 설정<br/>
                        2. OAuth 2.0 클라이언트 ID (웹 애플리케이션) 생성 ➔ Client ID 복사 후 아래 연동!
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Gmail Access Token (ya29.a0A... 로 시작하는 인증 키)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="ya29.a0A..."
                        value={gmailToken}
                        onChange={(e) => handleSaveGmailToken(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                      {gmailToken && (
                        <button
                          onClick={() => handleSaveGmailToken('')}
                          className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold shrink-0"
                        >
                          토큰 해제
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-300/90 font-medium pt-0.5">
                      ⚠️ <strong>토큰 유효기간 안내:</strong> Access Token은 구글 보안 표준에 따라 <strong>1시간(60분) 시한부</strong>입니다. 1시간 뒤 만료되면 30초 만에 재발급 받으시거나, 만료 없이 영구 자동 발송을 원하시면 아래 EmailJS 키 연동을 추천합니다!
                    </p>
                  </div>

                  {/* Google OAuth Login Launcher */}
                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Google OAuth Client ID (1클릭 구글 로그인 연동용)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="xxxxxx.apps.googleusercontent.com"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                      <button
                        onClick={handleConnectGoogleOAuth}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1 shadow-md"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Google 로그인 연동</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-sky-300/90 font-medium pt-0.5">
                      💡 <strong>origin_mismatch 오류가 뜨는 경우:</strong> Google Cloud Console의 클라이언트 ID 편집 ➔ <strong>[승인된 자바스크립트 출처]</strong>에 현재 접속 주소(<code className="bg-slate-900 px-1 text-amber-300">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>)를 추가해 주시면 30초 만에 해결됩니다!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Option: EmailJS & Webmail Shortcuts */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>기타 보조 전송 옵션 (EmailJS & 메일창 붙여넣기)</span>
                </span>
                <button
                  onClick={() => setShowEmailJSConfig(!showEmailJSConfig)}
                  className="text-[11px] text-indigo-400 hover:underline font-semibold"
                >
                  EmailJS 연동 설정 {showEmailJSConfig ? '닫기' : '열기'}
                </button>
              </div>

              {showEmailJSConfig && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Service ID"
                      value={emailJSConfig.serviceId}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, serviceId: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Template ID"
                      value={emailJSConfig.templateId}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, templateId: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Public Key"
                      value={emailJSConfig.publicKey}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, publicKey: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <button
                    onClick={handleSaveEmailJSConfig}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold"
                  >
                    EmailJS 키 저장
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const gmailComposeUrl = parsedRecipients.length > 0
                      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(parsedRecipients.join(','))}&su=${encodeURIComponent(subjectText)}`
                      : `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subjectText)}`;
                    handleCopyHTML(gmailComposeUrl);
                    setSendSuccessMsg('✨ Gmail 편지쓰기 창이 열렸습니다! (수신자/제목 자동 입력됨 ➔ 본문에 Ctrl+V 후 보내기)');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  title="Gmail 편지 쓰기 열기"
                >
                  <span>Gmail 편지쓰기 창 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleSendViaEmailJS}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-bold transition-all"
                >
                  <span>⚡ EmailJS 자동 발송</span>
                </button>
              </div>
            </div>

            {/* Toggle Screen Body Preview */}
            <div className="pt-1">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between text-xs text-slate-300 font-bold bg-slate-900/60 hover:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>변환 화면 이메일 본문 실시간 미리보기</span>
                </span>
                {showPreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showPreview && (
                <div className="mt-3 p-3 bg-white rounded-xl text-slate-950 max-h-72 overflow-y-auto border border-slate-300 shadow-inner">
                  <div dangerouslySetInnerHTML={{ __html: generateEmailHTML(result, senderEmail) }} />
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW MODE 2: CONFIRMATION SCREEN */}
        {viewMode === 'confirmation' && lastDispatchRecord && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Success Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 text-center space-y-2 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-lg font-extrabold text-white">
                🎉 이메일이 수신자 이메일함으로 직접 전송되었습니다!
              </h4>
              <p className="text-xs text-emerald-300/90 font-medium">
                Google Gmail API 백그라운드 자동 직발송이 완료되었습니다.
              </p>
            </div>

            {/* Confirmation Details Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 text-xs">
              
              {/* 1. Subject */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>발송된 이메일 제목 (Exact Natural Standard English)</span>
                </div>
                <div className="text-sm font-extrabold text-white bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  "{lastDispatchRecord.english}"
                </div>
              </div>

              {/* 2. Sender & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">보내는 사람 (Sender)</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {lastDispatchRecord.senderEmail}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold">발송 시각 (Timestamp)</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {new Date(lastDispatchRecord.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">발송 처리 방식</div>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">
                    {lastDispatchRecord.deliveryMethod}
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  전송 성공 (SUCCESS)
                </span>
              </div>

              {/* 4. Recipient List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>받는 사람 수신자 목록 (자동 보존됨)</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    총 {lastDispatchRecord.recipientCount || lastDispatchRecord.recipientEmails.length}명
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  {lastDispatchRecord.recipientEmails.map((email, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>

              {/* Re-send Action Notice */}
              <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between">
                <div className="text-[11px] text-sky-300 font-medium">
                  🔄 동일 수신자 그룹({lastDispatchRecord.recipientEmails.length}명)에게 다른 문장도 바로 발송할 수 있습니다.
                </div>
                <button
                  onClick={() => handleReuseRecipients(lastDispatchRecord.recipientEmails)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 ml-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>수신자 재사용</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW MODE 3: HISTORY VIEW */}
        {viewMode === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-sky-400" />
                <span>최근 이메일 발송 전체 기록 ({historyList.length}건)</span>
              </h4>
              {historyList.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>이력 전체 지우기</span>
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                발송 이력이 없습니다. 메일을 전송하시면 이곳에 기록이 남습니다.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {historyList.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                        {record.deliveryMethod}
                      </span>
                      <span className="text-slate-400">
                        {new Date(record.timestamp).toLocaleString('ko-KR')}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white">
                      제목: "{record.english}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <span>보낸 사람: {record.senderEmail}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold">
                          수신자 {record.recipientCount}명
                        </span>
                        {record.recipientEmails && record.recipientEmails.length > 0 && (
                          <button
                            onClick={() => handleReuseRecipients(record.recipientEmails)}
                            className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                            title="이 발송 이력의 수신자 목록을 메일 작성 창으로 불러오기"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>수신자 재전송 불러오기</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {viewMode === 'form' && (
            <>
              <div className="flex items-center gap-2">
                {/* Rich HTML Copy Button */}
                <button
                  onClick={() => handleCopyHTML()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="네이버/구글 메일 작성창에 직접 붙여넣을 수 있는 Rich HTML 본문 복사"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-400" />
                      <span>이메일 HTML 복사</span>
                    </>
                  )}
                </button>

                {/* .eml File Download Button */}
                <button
                  onClick={handleDownloadEml}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="아웃룩/썬더버드용 .eml 이메일 파일 저장"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>.eml 메일 파일 저장</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="btn-secondary text-xs"
                >
                  취소
                </button>
                <button
                  onClick={handleSendViaGmail}
                  disabled={isSending}
                  className="btn-primary text-xs bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-md shadow-rose-600/30 flex items-center gap-2 px-5 py-2.5 font-extrabold text-white"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gmail 1초 자동 직발송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>❤️ Gmail 1초 자동 직발송</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {viewMode === 'confirmation' && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setViewMode('form')}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>동일 수신자에게 새 메일 작성</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('history')}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <History className="w-4 h-4 text-sky-400" />
                  <span>전체 발송 이력</span>
                </button>

                <button
                  onClick={onClose}
                  className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5"
                >
                  <span>확인 (닫기)</span>
                </button>
              </div>
            </div>
          )}

          {viewMode === 'history' && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setViewMode('form')}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>메일 작성으로 돌아가기</span>
              </button>

              <button
                onClick={onClose}
                className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5"
              >
                <span>닫기</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
