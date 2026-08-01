// src/services/emailService.js
import { getEducationalGoogleImageSearchUrl } from './imageSearchService';
import { getNativeRecommendations, getVocabNuances } from './recommendationService';

const SENDER_EMAIL_KEY = 'arrow_english_sender_email';
const RECIPIENT_PRESETS_KEY = 'arrow_english_recipient_presets';
const EMAILJS_CONFIG_KEY = 'arrow_english_emailjs_config';

/**
 * Get stored sender email from localStorage
 */
export function getStoredSenderEmail() {
  try {
    return localStorage.getItem(SENDER_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save sender email to localStorage
 */
export function saveStoredSenderEmail(email) {
  try {
    localStorage.setItem(SENDER_EMAIL_KEY, (email || '').trim());
  } catch {
    // Ignore storage errors
  }
}

const RAW_RECIPIENT_KEY = 'arrow_english_raw_recipients';

/**
 * Get stored raw recipient emails text from localStorage
 */
export function getStoredRawRecipients() {
  try {
    return localStorage.getItem(RAW_RECIPIENT_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save raw recipient emails text to localStorage
 */
export function saveStoredRawRecipients(text) {
  try {
    localStorage.setItem(RAW_RECIPIENT_KEY, text || '');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get stored recipient email presets
 */
export function getStoredRecipientPresets() {
  try {
    const raw = localStorage.getItem(RECIPIENT_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save recipient email presets
 */
export function saveRecipientPresets(emails) {
  try {
    const cleanList = Array.from(new Set((emails || []).map(e => e.trim()).filter(Boolean)));
    localStorage.setItem(RECIPIENT_PRESETS_KEY, JSON.stringify(cleanList));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get EmailJS configuration (Service ID, Template ID, Public Key)
 */
export function getEmailJSConfig() {
  try {
    const raw = localStorage.getItem(EMAILJS_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { serviceId: '', templateId: '', publicKey: '' };
  } catch {
    return { serviceId: '', templateId: '', publicKey: '' };
  }
}

/**
 * Save EmailJS configuration
 */
export function saveEmailJSConfig(config) {
  try {
    localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config || {}));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Parses raw input string (separated by commas, semicolons, line breaks, spaces) into valid email array
 */
export function parseRecipientEmails(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return [];
  
  // Split by comma, semicolon, space, line break, or tab
  const tokens = rawInput.split(/[\s,;\n\r\t]+/);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const validEmails = [];
  const seen = new Set();

  tokens.forEach((token) => {
    const clean = token.trim().replace(/^<|>$|^"|"$/g, '');
    if (clean && emailRegex.test(clean) && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      validEmails.push(clean);
    }
  });

  return validEmails;
}

/**
 * Generates an inline-styled Rich HTML document for email clients.
 * Full un-abbreviated version matching the exact visual screen format of the converted result view.
 */
export function generateEmailHTML(result, senderEmail = '') {
  if (!result) return '<div>변환 결과 데이터가 없습니다.</div>';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subjectText = result.english || result.arrowKorean || 'Cupid English Result';

  // Recommendations and Vocab Nuances
  const recommendations = getNativeRecommendations(result) || [];
  const vocabNuances = getVocabNuances(result) || [];

  // 1:1 Vocabulary Cards HTML
  const vocabList = result.vocabCards || result.chunks?.map(c => ({
    korean: c.text,
    english: c.english,
    role: c.role,
    searchUrl: getEducationalGoogleImageSearchUrl(c.english)
  })) || [];

  const vocabCardsHTML = vocabList.map((card, idx) => `
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <span style="font-size: 10px; background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-right: 6px;">
          ${card.role || `Step ${idx + 1}`}
        </span>
        <span style="font-size: 12px; color: #475569; font-weight: 600; margin-right: 8px;">
          한글: ${card.korean}
        </span>
        <span style="font-size: 13px; color: #0f172a; font-weight: 800;">
          영어: ${card.english}
        </span>
      </div>
      <a href="${card.searchUrl || getEducationalGoogleImageSearchUrl(card.english)}" target="_blank" style="font-size: 11px; color: #0284c7; background-color: #e0f2fe; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        📷 이미지 ↗
      </a>
    </div>
  `).join('');

  // 6-step arrow order flow sequence cards HTML
  const chunksHTML = (result.chunks || []).map((c, i) => `
    <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 14px; min-width: 120px; display: inline-block; margin: 4px; vertical-align: top;">
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-weight: 600;">
        ${c.role || `Step ${i + 1}`}
      </div>
      <div style="font-size: 14px; color: #f8fafc; font-weight: 700; margin-bottom: 4px;">
        ${c.text}
      </div>
      <div style="font-size: 13px; color: #38bdf8; font-weight: 700;">
        ➔ ${c.english}
      </div>
    </div>
  `).join('');

  // Sentence Breakdown HTML
  const sentenceBreakdownHTML = (result.chunks || []).map((c) => `
    <div style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin: 3px; font-size: 12px;">
      <strong style="color: #0284c7;">${c.english}</strong> : <span style="color: #475569;">${c.text}</span>
    </div>
  `).join('');

  // Recommendations HTML
  const recommendationsHTML = recommendations.length > 0 ? `
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 14px; font-weight: bold; color: #0369a1; margin-bottom: 10px;">
        💡 상황별 원어민 추천 표현 (Native Speaker Recommendations)
      </div>
      ${recommendations.map((rec) => `
        <div style="background-color: #ffffff; border: 1px solid #e0f2fe; border-radius: 10px; padding: 12px; margin-bottom: 8px;">
          <div style="font-size: 11px; background-color: #e0f2fe; color: #0369a1; display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: bold; margin-bottom: 6px;">
            ${rec.label}
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            "${rec.english}"
          </div>
          <div style="font-size: 12px; color: #475569; font-weight: 600;">
            (${rec.korean})
          </div>
          ${rec.keyChange ? `<div style="font-size: 11px; color: #b45309; background-color: #fffbeb; padding: 4px 8px; border-radius: 4px; margin-top: 6px; display: inline-block;">${rec.keyChange}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  // Vocab & Nuances HTML
  const vocabNuancesHTML = vocabNuances.length > 0 ? `
    <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 14px; font-weight: bold; color: #a16207; margin-bottom: 10px;">
        🔍 주요 어휘 & 뉘앙스 정리 (Phrasal Verbs & Nuances)
      </div>
      ${vocabNuances.map((v) => `
        <div style="background-color: #ffffff; border: 1px solid #fef9c3; border-radius: 10px; padding: 12px; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: 800; color: #854d0e; margin-bottom: 4px;">
            📌 ${v.word || v.term || v.original || ''}
          </div>
          <div style="font-size: 12px; color: #334155; line-height: 1.5;">
            ${v.desc || v.explanation || v.reason || ''}
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Explanation list HTML
  const explanationHTML = (result.explanation || []).map((step) => {
    const formattedStep = step.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0284c7;">$1</strong>');
    return `<li style="margin-bottom: 8px; line-height: 1.6; font-size: 13px; color: #334155;">${formattedStep}</li>`;
  }).join('');

  // Prepositions HTML
  const prepositionsHTML = (result.prepositions && result.prepositions.length > 0)
    ? result.prepositions.map((p) => `
      <div style="background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 10px; padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 15px; font-weight: 800; color: #d46b08;">${p.word}</span>
          <a href="${getEducationalGoogleImageSearchUrl(`preposition ${p.word}`)}" target="_blank" style="font-size: 11px; background-color: #fff1b8; color: #873800; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-decoration: none;">
            ${p.meaning} (🖼️ 그림 검색)
          </a>
        </div>
        <p style="font-size: 12px; color: #595959; margin: 0; line-height: 1.4;">${p.desc}</p>
      </div>
    `).join('')
    : '<p style="font-size: 12px; color: #8c8c8c;">해당 문장에 사용된 주요 전치사가 없습니다.</p>';

  // Correction / Masterclass HTML
  const correctionHTML = (result.correction && result.correction.points && result.correction.points.length > 0)
    ? `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: bold; color: #166534; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #dcfce7;">
          📝 작성 초안: "${result.correction.userDraft}" ➔ ✨ 다듬어진 영문: "${result.correction.refinedEnglish}"
        </div>
        ${result.correction.points.map((pt) => `
          <div style="background-color: #ffffff; border: 1px solid #dcfce7; border-radius: 10px; padding: 12px; margin-bottom: 10px; font-size: 12px;">
            <div style="font-weight: 800; color: #b45309; margin-bottom: 6px; font-size: 13px;">📌 [${pt.category}] ${pt.original} ➔ ${pt.corrected}</div>
            ${pt.imageDifference ? `<div style="background-color: #eef2ff; color: #312e81; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 11px;">${pt.imageDifference}</div>` : ''}
            ${pt.listeningTip ? `<div style="background-color: #faf5ff; color: #581c87; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 11px;">${pt.listeningTip}</div>` : ''}
            ${pt.speakingTip ? `<div style="background-color: #f0f9ff; color: #075985; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 11px;">${pt.speakingTip}</div>` : ''}
            ${pt.misconception ? `<div style="background-color: #fffbeb; color: #78350f; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 11px;">${pt.misconception}</div>` : ''}
            ${pt.practiceExamples && pt.practiceExamples.length > 0 ? `
              <div style="background-color: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 4px; font-size: 11px; color: #047857;">
                <strong>💬 실전 입소리 응용 예문:</strong><br/>
                ${pt.practiceExamples.map((ex) => `• ${ex}`).join('<br/>')}
              </div>
            ` : ''}
            <div style="color: #475569; line-height: 1.5; margin-top: 4px;"><strong>📖 해설:</strong> ${pt.reason}</div>
          </div>
        `).join('')}
        ${result.correction.teacherAdvice ? `
          <div style="font-size: 12px; color: #854d0e; background-color: #fef9c3; padding: 8px 10px; border-radius: 6px; margin-top: 8px;">
            ${result.correction.teacherAdvice}
          </div>
        ` : ''}
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subjectText}</title>
    </head>
    <body style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #ec4899; letter-spacing: -0.5px;">💘 Cupid English AI Studio</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">뇌 구조에 맞춘 직관 영어 어순 분석 & 이미지 단어 학습 완전 원문 리포트</div>
          </div>
          <div style="font-size: 11px; color: #64748b; text-align: right;">
            ${senderEmail ? `발신자: ${senderEmail}<br/>` : ''}
            발급일자: ${dateStr}
          </div>
        </div>

        <!-- 6-step Banner -->
        <div style="background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; color: #3730a3; text-align: center;">
          <strong>💘 원어민 뇌속 큐피드 순서 (6단계):</strong>
          1. 주인공(주어) ➔ 2. 동작 ➔ 3. 가까운 대상 ➔ 4. 전치사 ➔ 5. 장소 ➔ 6. 시간
        </div>

        <!-- Main Result Card (Exact Natural Standard English) -->
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); color: #ffffff; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; margin-bottom: 10px;">
            Exact Natural Standard English
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 10px; line-height: 1.3;">
            "${result.english}"
          </div>
          <div style="font-size: 12px; color: #cbd5e1;">
            학습자 입력 어순: "${result.arrowKorean}"
          </div>
        </div>

        <!-- Native Recommendations (Full Section) -->
        ${recommendationsHTML}

        <!-- Vocab Nuances (Full Section) -->
        ${vocabNuancesHTML}

        <!-- Section 1: Order comparison -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          1. 🔄 학습자 입력 어순 ➔ 올바른 영어식 사고 순서 재배열
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 18px;">
          <div style="font-size: 12px; color: #b45309; font-weight: bold; margin-bottom: 4px;">
            📝 입력 단어 배열: "${result.arrowKorean}"
          </div>
          <div style="font-size: 12px; color: #15803d; font-weight: bold; margin-bottom: 8px;">
            ✨ 영어식 사고 순서: ${(result.chunks || []).map(c => `${c.text}(${c.english})`).join(' ➔ ')}
          </div>
          <div style="font-size: 11px; color: #475569; background-color: #ffffff; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
            💡 <strong>초등 눈높이 어순 가이드:</strong> 한국어는 장소나 방법이 먼저 나오기 쉽지만, 영어식 뇌는 주인공이 출발해서 손과 시선이 닿는 동작과 가까운 대상부터 순서대로 말합니다!
          </div>
        </div>

        <!-- Section 2: 1:1 Vocab Cards -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          2. 🎨 1:1 한글-영어 실생활 이미지 단어장 (Google SafeSearch)
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 18px;">
          ${vocabCardsHTML}
        </div>

        <!-- Section 3: 6-step arrow order flow -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          3. 🎯 6단계 화살표 어순 매핑 (Arrow Flow Sequence)
        </div>
        <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 18px;">
          ${chunksHTML}
        </div>

        <!-- Sentence Breakdown -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          4. 🧩 Sentence Breakdown (문장 의미 조각 상세 분석)
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 18px;">
          ${sentenceBreakdownHTML}
        </div>

        <!-- Section 5: Eye movement explanation -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          5. 🧠 애로우 잉글리시 시선 이동 원리 해설
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 18px;">
          <ol style="padding-left: 20px; margin: 0;">
            ${explanationHTML}
          </ol>
        </div>

        <!-- Section 6: Preposition Visual Concepts -->
        <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
          6. 🧭 문장 속 핵심 전치사 그림 개념
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 18px;">
          ${prepositionsHTML}
        </div>

        <!-- Section 7: Masterclass Coaching (If present) -->
        ${correctionHTML ? `
          <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">
            7. ✨ 학습자 표현 다듬기 & 원어민 표준 표현 (5D Masterclass)
          </div>
          ${correctionHTML}
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          © 2026 Cupid English AI Studio. All rights reserved. Full Analysis Report.
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Copies Rich HTML content to clipboard so user can paste directly into Naver/Gmail/Outlook/Kakao email editor.
 */
export async function copyEmailHtmlToClipboard(result, senderEmail = '') {
  const htmlContent = generateEmailHTML(result, senderEmail);
  const textFallback = `[Cupid English AI Report]\nExact Natural Standard English: "${result.english}"\nInput: "${result.arrowKorean}"`;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([textFallback], { type: 'text/plain' });
      const clipboardItem = new window.ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } else {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy HTML to clipboard:', err);
    try {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Downloads a formatted `.eml` (email file format) or `.html` file that opens natively in Outlook, Thunderbird, or Apple Mail.
 */
export function downloadEmlFile(result, senderEmail = '', recipientEmails = []) {
  const subject = result.english || result.arrowKorean || 'Cupid English Report';
  const htmlBody = generateEmailHTML(result, senderEmail);
  const now = new Date().toUTCString();

  const toLine = recipientEmails.length > 0 ? recipientEmails.join(', ') : 'recipients@cupidenglish.com';
  const fromLine = senderEmail || 'sender@cupidenglish.com';

  const emlContent = [
    `From: <${fromLine}>`,
    `To: ${toLine}`,
    `Subject: ${subject}`,
    `Date: ${now}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    htmlBody
  ].join('\r\n');

  const blob = new Blob([emlContent], { type: 'message/rfc822;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanTitle = (subject)
    .replace(/[^a-zA-Z0-9\u3131-\u318E\uAC00-\uD7A3]/g, '_')
    .substring(0, 30)
    .replace(/_+/g, '_');

  link.href = url;
  link.setAttribute('download', `CupidEnglish_Email_${cleanTitle || 'Report'}.eml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers mailto link with recipients and subject = exact natural standard English
 */
export function sendEmailViaMailClient(result, senderEmail = '', recipientEmails = []) {
  const subject = encodeURIComponent(result.english || result.arrowKorean || 'Cupid English Report');
  const recipients = recipientEmails.map(e => e.trim()).filter(Boolean).join(',');

  const bodySummary = encodeURIComponent(
    `💘 Cupid English AI Studio - 어순 변환 리포트\n\n` +
    `Exact Natural Standard English:\n"${result.english}"\n\n` +
    `학습자 입력 어순: "${result.arrowKorean}"\n\n` +
    `영어식 사고 순서:\n${(result.chunks || []).map(c => `${c.text}(${c.english})`).join(' ➔ ')}\n\n` +
    `* 전체 리포트 렌더링 화면은 웹 사이트 또는 첨부된 이메일 본문/PDF를 확인해 주세요.`
  );

  const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${bodySummary}`;
  window.open(mailtoUrl, '_blank');
}

/**
 * Sends email directly using EmailJS REST API if configured
 */
export function sendEmailViaEmailJS(result, senderEmail, recipientEmails, emailJSConfig) {
  const { serviceId, templateId, publicKey } = emailJSConfig || {};

  if (!serviceId || !templateId || !publicKey) {
    return Promise.reject(new Error('EmailJS 연동 설정(Service ID, Template ID, Public Key)이 지정되지 않았습니다.'));
  }

  const subject = result.english || result.arrowKorean || 'Cupid English Report';
  const htmlContent = generateEmailHTML(result, senderEmail);

  // Send requests to EmailJS API
  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      from_email: senderEmail,
      to_email: recipientEmails.join(', '),
      subject: subject,
      message_html: htmlContent,
      english_sentence: result.english,
      arrow_korean: result.arrowKorean
    }
  };

  return fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).then((res) => {
    if (!res.ok) {
      return res.text().then(txt => {
        throw new Error(`EmailJS 발송 실패 (${res.status}): ${txt}`);
      });
    }
    return true;
  });
}

const EMAIL_HISTORY_KEY = 'cupid_english_email_history';

/**
 * Get stored email dispatch history
 */
export function getEmailDispatchHistory() {
  try {
    const raw = localStorage.getItem(EMAIL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save an email dispatch record into history
 */
export function saveEmailDispatchRecord({ result, senderEmail, recipientEmails, deliveryMethod, status = 'success' }) {
  try {
    const history = getEmailDispatchHistory();
    const newRecord = {
      id: `email_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      english: result?.english || result?.arrowKorean || 'Cupid English Report',
      arrowKorean: result?.arrowKorean || '',
      senderEmail: senderEmail || '(미지정)',
      recipientEmails: recipientEmails || [],
      recipientCount: recipientEmails?.length || 0,
      deliveryMethod, // 'EmailJS API', '기본 메일 앱(mailto)', 'Rich HTML 복사', '.eml 파일 저장'
      status
    };

    // Keep up to 50 recent records
    const updated = [newRecord, ...history].slice(0, 50);
    localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.error('Failed to save email history record:', err);
    return null;
  }
}

/**
 * Clear stored email history
 */
export function clearEmailDispatchHistory() {
  try {
    localStorage.removeItem(EMAIL_HISTORY_KEY);
  } catch {
    // Ignore storage errors
  }
}

