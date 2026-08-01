// src/services/exportService.js
import { getEducationalGoogleImageSearchUrl } from './imageSearchService';

/**
 * ============================================================================
 * SOLID ARCHITECTURE DOCUMENTATION & EXPORT SERVICE CONTRACT
 * ============================================================================
 * 
 * 1. Single Responsibility Principle (SRP):
 *    This module is exclusively responsible for converting a standard `TranslationResult`
 *    domain object into portable Markdown (.md) documents and printable PDF HTML views.
 * 
 * 2. Open/Closed Principle (OCP):
 *    Document formatters accept unified result schemas and can be extended with new
 *    render blocks without modifying core UI components or engine parsers.
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    Both rule-parsed local results (`parseArrowKoreanLocal`) and remote AI results
 *    (`translateWithGemini`) fulfill the exact same result contract and are 100%
 *    substitutable when passed into export functions.
 * 
 * 4. Interface Segregation Principle (ISP):
 *    Exposes focused, stateless functions (`downloadMarkdown`, `exportToPDF`) that accept
 *    only the necessary `result` data contract.
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    UI views (`Navbar`, `ArrowTranslator`) depend on export abstractions rather than
 *    implementing low-level document creation or window management internally.
 * ============================================================================
 */

/**
 * Helper: Sanitizes English/Korean titles to generate clean, cross-platform filenames
 */
export function generateSafeFilename(result, prefix = 'CupidEnglish', extension = '') {
  if (!result) return `${prefix}_Report${extension}`;
  
  const baseTitle = result.english || result.arrowKorean || 'Result';
  const cleanTitle = baseTitle
    .replace(/[^a-zA-Z0-9\u3131-\u318E\uAC00-\uD7A3]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30)
    .replace(/^_|_$/g, '');

  const ext = extension ? (extension.startsWith('.') ? extension : `.${extension}`) : '';
  return `${prefix}_${cleanTitle || 'Report'}${ext}`;
}

/**
 * Downloads enriched UTF-8 Markdown (.md) file of the translation & ordering analysis.
 * Includes UTF-8 Byte Order Mark (\uFEFF) for flawless cross-platform encoding in MS Word/Notepad.
 */
export function downloadMarkdown(result) {
  if (!result) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // UTF-8 BOM for Windows / MS Word encoding compatibility
  let mdContent = `\uFEFF# 💘 Cupid English 어순 변환 & 시각화 분석 리포트\n\n`;
  mdContent += `* **분석 일시**: ${dateStr}\n`;
  mdContent += `* **학습자 입력 어순**: \`${result.arrowKorean}\`\n`;
  mdContent += `* **완성 표준 영문**: \`${result.english}\`\n\n`;
  mdContent += `> **💘 원어민 뇌속 큐피드 카메라 뻗어나가기 순서 (6단계)**:\n`;
  mdContent += `> \`1. 주인공(주어)\` ➔ \`2. 동작\` ➔ \`3. 가까운 대상\` ➔ \`4. 전치사\` ➔ \`5. 장소\` ➔ \`6. 시간\`\n\n`;
  mdContent += `----\n\n`;

  // 1. 어순 재배열 및 교정 비교
  mdContent += `## 1. 🔄 [학습자 입력 어순 ➔ 영어식 사고 순서 재배열]\n\n`;
  mdContent += `* **📝 내가 입력한 단어 배열**: \`${result.arrowKorean}\`\n`;
  mdContent += `* **✨ 올바른 영어식 사고 순서**: \`${result.chunks.map(c => `${c.text}(${c.english})`).join(' ➔ ')}\`\n\n`;
  mdContent += `### 👶 초등 눈높이 어순 이해 가이드:\n`;
  mdContent += `> 한국어는 장소나 방법이 먼저 나오기 쉽지만, 영어식 뇌는 주인공에서 출발해서 **손과 시선이 닿는 동작과 가까운 대상부터** 순서대로 말합니다!\n\n`;
  mdContent += `----\n\n`;

  // 2. 한글-영어 1:1 실생활 이미지 단어장
  mdContent += `## 2. 🎨 [1:1 한글-영어 실생활 이미지 단어장]\n\n`;
  mdContent += `| 순서/역할 | 한글 어휘 | 영문 단어 | 📷 영단어 실사 이미지 검색 (Google SafeSearch) |\n`;
  mdContent += `| :--- | :--- | :--- | :--- |\n`;

  const vocabList = result.vocabCards || result.chunks.map(c => ({
    korean: c.text,
    english: c.english,
    role: c.role,
    searchUrl: getEducationalGoogleImageSearchUrl(c.english)
  }));

  vocabList.forEach((card, idx) => {
    const searchUrl = card.searchUrl || getEducationalGoogleImageSearchUrl(card.english);
    mdContent += `| ${card.role || `Step ${idx + 1}`} | ${card.korean} | **${card.english}** | [🖼️ 구글 이미지 보기](${searchUrl}) |\n`;
  });
  mdContent += `\n----\n\n`;

  // 3. 6단계 큐피드 어순 매핑 표
  mdContent += `## 3. 💘 6단계 큐피드 어순 매핑 (Cupid Flow Sequence)\n\n`;
  mdContent += `| 단계 | 역할 | 한글 표기 | 영문 표현 |\n`;
  mdContent += `| :---: | :--- | :--- | :--- |\n`;

  if (result.chunks && result.chunks.length > 0) {
    result.chunks.forEach((chunk, idx) => {
      mdContent += `| ${idx + 1} | ${chunk.role} | ${chunk.text} | **${chunk.english}** |\n`;
    });
  }
  mdContent += `\n----\n\n`;

  // 4. 큐피드 잉글리시 시선 이동 원리 해설
  mdContent += `## 4. 🧠 큐피드 잉글리시 시선 이동 원리 해설\n\n`;
  if (result.explanation && result.explanation.length > 0) {
    result.explanation.forEach((step) => {
      const cleanStep = step.replace(/<[^>]*>?/gm, '').replace(/\*\*(.*?)\*\*/g, '**$1**');
      mdContent += `- ${cleanStep}\n`;
    });
  }
  mdContent += `\n----\n\n`;

  // 5. 문장 속 핵심 전치사 그림 개념
  if (result.prepositions && result.prepositions.length > 0) {
    mdContent += `## 5. 🧭 문장 속 핵심 전치사 그림 개념\n\n`;
    result.prepositions.forEach((prep) => {
      const prepSearchUrl = getEducationalGoogleImageSearchUrl(`preposition ${prep.word}`);
      mdContent += `### 📌 ${prep.word} - ${prep.meaning}\n`;
      mdContent += `${prep.desc}\n`;
      mdContent += `👉 [🖼️ 전치사 이미지 그림 보기](${prepSearchUrl})\n\n`;
    });
    mdContent += `----\n\n`;
  }

  // 6. 학습자 표현 다듬기 코칭
  if (result.correction && result.correction.points && result.correction.points.length > 0) {
    mdContent += `## 6. ✨ 학습자 표현 다듬기 & 원어민 표준 코칭 (5D Masterclass)\n\n`;
    if (result.correction.coachGreeting) {
      mdContent += `> ${result.correction.coachGreeting}\n\n`;
    }
    mdContent += `- **학습자 작성 어순 초안**: \`${result.correction.userDraft}\` \n`;
    mdContent += `- **다듬어진 원어민 표준 영문**: \`${result.correction.refinedEnglish}\` \n\n`;
    
    result.correction.points.forEach((pt, idx) => {
      mdContent += `### 📌 ${idx + 1}. [${pt.category}] \`${pt.original}\` ➔ \`${pt.corrected}\` \n`;
      if (pt.imageDifference) mdContent += `- **🧠 1. 원어민 뇌속 3D 이미지**: ${pt.imageDifference}\n`;
      if (pt.listeningTip) mdContent += `- **🎧 2. 듣기 직청직해 훈련**: ${pt.listeningTip}\n`;
      if (pt.speakingTip) mdContent += `- **🗣️ 3. 말하기 입근육 결합 패턴**: ${pt.speakingTip}\n`;
      if (pt.misconception) mdContent += `- **🔄 4. ❌ vs ⭕ 한국어 직역 오해 vs 뉘앙스**: ${pt.misconception}\n`;
      if (pt.practiceExamples && pt.practiceExamples.length > 0) {
        mdContent += `- **💬 5. 실전 입소리 응용 예문**:\n`;
        pt.practiceExamples.forEach(ex => {
          mdContent += `  * ${ex}\n`;
        });
      }
      mdContent += `- **📖 마스터클래스 해설**: ${pt.reason}\n\n`;
    });
    if (result.correction.teacherAdvice) {
      mdContent += `> ${result.correction.teacherAdvice}\n\n`;
    }
    mdContent += `----\n\n`;
  }

  mdContent += `*© 2026 Cupid English AI Studio - Markdown Export Document*\n`;

  // Trigger file download in browser
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = generateSafeFilename(result, 'CupidEnglish', '.md');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print Dialog PDF Exporter (window.print()):
 * Generates styled A4 document with 6-step arrow order, order comparison,
 * educational Google Image links, and page-break rules for printing.
 */
export function exportToPDF(result) {
  if (!result) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const docTitle = generateSafeFilename(result, 'CupidEnglish', '');

  const vocabList = result.vocabCards || result.chunks.map(c => ({
    korean: c.text,
    english: c.english,
    role: c.role,
    searchUrl: getEducationalGoogleImageSearchUrl(c.english)
  }));

  const vocabCardsHTML = vocabList
    .map(
      (card, idx) => `
      <div style="
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        page-break-inside: avoid;
      ">
        <div>
          <span style="font-size: 10px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-right: 6px;">
            ${card.role || `Step ${idx + 1}`}
          </span>
          <span style="font-size: 12px; color: #475569; font-weight: 600; margin-right: 8px;">
            한글: ${card.korean}
          </span>
          <span style="font-size: 13px; color: #0f172a; font-weight: 800;">
            영어: ${card.english}
          </span>
        </div>
        <a href="${card.searchUrl || getEducationalGoogleImageSearchUrl(card.english)}" target="_blank" style="
          font-size: 11px;
          color: #0284c7;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 4px 10px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
        ">
          📷 영단어 실사 이미지 ↗
        </a>
      </div>
    `
    )
    .join('');

  const chunksHTML = result.chunks
    .map(
      (c, i) => `
      <div style="
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 12px 16px;
        min-width: 130px;
        display: inline-block;
        margin: 4px;
        vertical-align: top;
        page-break-inside: avoid;
      ">
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
    `
    )
    .join('');

  const explanationHTML = result.explanation
    .map((step) => {
      const formattedStep = step.replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color: #0284c7; font-weight: 700;">$1</strong>'
      );
      return `
        <li style="margin-bottom: 10px; line-height: 1.6; font-size: 13px; color: #334155; page-break-inside: avoid;">
          ${formattedStep}
        </li>
      `;
    })
    .join('');

  const prepositionsHTML =
    result.prepositions && result.prepositions.length > 0
      ? result.prepositions
        .map(
          (p) => `
        <div style="
          background: #fffbe6;
          border: 1px solid #ffe58f;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 10px;
          page-break-inside: avoid;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 16px; font-weight: 800; color: #d46b08;">${p.word}</span>
            <a href="${getEducationalGoogleImageSearchUrl(`preposition ${p.word}`)}" target="_blank" style="font-size: 11px; background: #fff1b8; color: #873800; padding: 3px 10px; border-radius: 20px; font-weight: 700; text-decoration: none;">
              ${p.meaning} (🖼️ 그림 검색)
            </a>
          </div>
          <p style="font-size: 12px; color: #595959; margin: 0; line-height: 1.5;">${p.desc}</p>
        </div>
      `
        )
        .join('')
      : '<p style="font-size: 12px; color: #8c8c8c;">해당 문장에 사용된 주요 전치사가 없습니다.</p>';

  const correctionHTML =
    result.correction && result.correction.points && result.correction.points.length > 0
      ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #dcfce7;">
            📝 작성 초안: "${result.correction.userDraft}" ➔ ✨ 다듬어진 영문: "${result.correction.refinedEnglish}"
          </div>
          ${result.correction.points
        .map(
          (pt) => `
            <div style="background: #ffffff; border: 1px solid #dcfce7; border-radius: 12px; padding: 14px; margin-bottom: 12px; font-size: 12px; page-break-inside: avoid;">
              <div style="font-weight: 800; color: #b45309; margin-bottom: 8px; font-size: 13px;">📌 [${pt.category}] ${pt.original} ➔ ${pt.corrected}</div>
              
              ${pt.imageDifference ? `<div style="background: #eef2ff; color: #312e81; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">${pt.imageDifference}</div>` : ''}
              ${pt.listeningTip ? `<div style="background: #faf5ff; color: #581c87; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">${pt.listeningTip}</div>` : ''}
              ${pt.speakingTip ? `<div style="background: #f0f9ff; color: #075985; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">${pt.speakingTip}</div>` : ''}
              ${pt.misconception ? `<div style="background: #fffbeb; color: #78350f; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">${pt.misconception}</div>` : ''}
              
              ${pt.practiceExamples && pt.practiceExamples.length > 0
              ? `<div style="background: #f8fafc; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; font-size: 11px; color: #047857;">
                      <strong>💬 실전 입소리 응용 예문:</strong><br/>
                      ${pt.practiceExamples.map((ex) => `• ${ex}`).join('<br/>')}
                    </div>`
              : ''
            }

              <div style="color: #475569; line-height: 1.5; margin-top: 6px;"><strong>📖 해설:</strong> ${pt.reason}</div>
            </div>
          `
        )
        .join('')}
          ${result.correction.teacherAdvice
        ? `<div style="font-size: 12px; color: #854d0e; background: #fef9c3; padding: 10px; border-radius: 8px; margin-top: 10px;">${result.correction.teacherAdvice}</div>`
        : ''
      }
        </div>
      `
      : '';

  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${docTitle}</title>
      <style>
        @page { size: A4; margin: 12mm; }
        body {
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 20px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-btn-bar {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar no-print">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">
          🖨️ 미리보기 모드입니다. 인쇄 창이 나타나지 않으면 오른쪽 버튼을 눌러주세요.
        </span>
        <button onclick="window.print()" style="
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        ">
          🖨️ PDF 인쇄하기
        </button>
      </div>

      <div style="border-bottom: 2px solid #fbcfe8; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #ec4899; letter-spacing: -0.5px;">💘 Cupid English AI Studio</div>
          <div style="font-size: 12px; color: #86198f; margin-top: 2px;">뇌 구조에 맞춘 직관 파스텔 큐피드 어순 분석 & 이미지 단어 학습 리포트</div>
        </div>
        <div style="font-size: 11px; color: #9d4edd; text-align: right;">
          발급일자: ${dateStr}
        </div>
      </div>

      <!-- 6-step Banner -->
      <div style="background: #fce7f3; border: 1px solid #fbcfe8; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; color: #9d174d; text-align: center;">
        <strong>💘 원어민 뇌속 큐피드 순서 (6단계):</strong>
        1. 주인공(주어) ➔ 2. 동작 ➔ 3. 가까운 대상 ➔ 4. 전치사 ➔ 5. 장소 ➔ 6. 시간
      </div>

      <!-- Main Result Box -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); color: #ffffff; border-radius: 16px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: inline-block; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px;">
          Exact Natural Standard English
        </div>
        <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 10px; line-height: 1.3;">
          "${result.english}"
        </div>
        <div style="font-size: 12px; color: #cbd5e1;">
          학습자 입력 어순: "${result.arrowKorean}"
        </div>
      </div>

      <!-- 어순 교정 비교 카드 -->
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        1. 🔄 학습자 입력 어순 ➔ 올바른 영어식 사고 순서 재배열
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="font-size: 12px; color: #b45309; font-weight: 700; margin-bottom: 6px;">
          📝 학습자 입력 단어 배열: "${result.arrowKorean}"
        </div>
        <div style="font-size: 12px; color: #15803d; font-weight: 700; margin-bottom: 10px;">
          ✨ 올바른 영어식 사고 순서: ${result.chunks.map(c => `${c.text}(${c.english})`).join(' ➔ ')}
        </div>
        <div style="font-size: 11px; color: #475569; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
          💡 <strong>초등 눈높이 어순 이해 가이드:</strong> 한국어는 장소나 방법이 먼저 나오기 쉽지만, 영어식 뇌는 주인공이 출발해서 손과 시선이 닿는 동작과 가까운 대상부터 순서대로 말합니다!
        </div>
      </div>

      <!-- 1:1 한글-영어 실생활 이미지 단어장 -->
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        2. 🎨 1:1 한글-영어 실생활 이미지 단어장 (Google SafeSearch Active)
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        ${vocabCardsHTML}
      </div>

      <!-- 6단계 화살표 어순 매핑 -->
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        3. 🎯 6단계 화살표 어순 매핑 (Arrow Flow Sequence)
      </div>
      <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 20px;">
        ${chunksHTML}
      </div>

      <!-- 시선 이동 원리 해설 -->
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        4. 🧠 애로우 잉글리시 시선 이동 원리 해설
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 20px;">
        <ol style="padding-left: 20px; margin: 0;">
          ${explanationHTML}
        </ol>
      </div>

      <!-- 핵심 전치사 그림 개념 -->
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
        5. 🧭 문장 속 핵심 전치사 그림 개념
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 20px;">
        ${prepositionsHTML}
      </div>

      ${correctionHTML
        ? `
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
          6. ✨ 학습자 표현 다듬기 & 원어민 표준 표현 (5D Masterclass)
        </div>
        ${correctionHTML}
        `
        : ''
      }

      <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px;">
        © 2026 Cupid English AI Studio. All rights reserved. Printable PDF Document.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  } else {
    alert('팝업 차단이 활성화되어 있습니다. 브라우저 주소창 우측에서 팝업 허용을 설정해 주세요.');
  }
}
