// src/services/arrowEngine.js (Cupid English Engine)
// Cupid English AI Studio - Gemini API 전용 변환 엔진
import { PREPOSITION_LIST } from './prepositionData.js';

export const PREPOSITION_DICTIONARY = PREPOSITION_LIST;

/**
 * Generates an educational Google Image Search URL for an English word.
 * Strips Korean characters and parentheses to produce a clean search query.
 * GUARANTEES no Korean characters are sent in the image search URL query string.
 */
export function getEducationalGoogleImageSearchUrl(englishWord) {
  if (!englishWord) return 'https://www.google.com/search?safe=active&q=English&udm=2';

  // Extract clean English letters/phrases
  let cleanEnglish = englishWord
    .replace(/[\u3131-\u318E\uAC00-\uD7A3]/g, '') // remove Korean chars
    .replace(/[()]/g, '')
    .trim();

  // If only Korean was passed and nothing remains, use a fallback
  if (!cleanEnglish || cleanEnglish.length === 0) {
    cleanEnglish = 'item';
  }

  return `https://www.google.com/search?safe=active&q=${encodeURIComponent(cleanEnglish)}&udm=2`;
}

/**
 * Pre-loaded Arrow English dataset containing preset examples (3 curated examples)
 * These provide instant demo results without requiring an API key.
 */
export const PRESET_SENTENCES = [
  {
    id: "ex_office_water",
    arrowKorean: "나 가다 바깥 of 나의 사무실 to 얻다 약간의 물 from 정수기",
    english: "I am going outside my office to get some water from the water purifier.",
    chunks: [
      { text: "나", role: "1. 주인공 (Subject)", english: "I", color: "indigo" },
      { text: "가다", role: "2. 동작 (Action)", english: "am going", color: "blue" },
      { text: "바깥 of 나의 사무실", role: "5. 장소 (Location)", english: "outside my office", color: "rose" },
      { text: "to", role: "4. 전치사/연결 (Preposition)", english: "to", color: "amber" },
      { text: "얻다 약간의 물", role: "3. 가까운 대상 (Target)", english: "get some water", color: "emerald" },
      { text: "from 정수기", role: "4. 전치사/연결 (Preposition)", english: "from the water purifier", color: "purple" }
    ],
    vocabCards: [
      { korean: "나 (주인공)", english: "I", role: "주인공", searchUrl: getEducationalGoogleImageSearchUrl("I") },
      { korean: "가다 (동작)", english: "am going", role: "동작", searchUrl: getEducationalGoogleImageSearchUrl("going") },
      { korean: "사무실 바깥", english: "outside my office", role: "장소", searchUrl: getEducationalGoogleImageSearchUrl("outside office") },
      { korean: "물 얻다", english: "get some water", role: "대상", searchUrl: getEducationalGoogleImageSearchUrl("drink water") },
      { korean: "정수기", english: "the water purifier", role: "출처", searchUrl: getEducationalGoogleImageSearchUrl("water purifier") }
    ],
    kidSummary: "나 → 가다(am going) → 바깥(outside my office) → to get(얻기 위해) → 약간의 물(some water) → from 정수기(the water purifier)",
    explanation: [
      "1. **주인공(I)** 1인칭 단수와 be동사 **'am'**이 이끄는 동작 **'going'**을 합니다 (I are ❌ → I am ✅).",
      "2. 이동하는 장소는 사무실 바깥 **'outside my office'**입니다. (outside는 전치사 of 없이 바로 목적어가 바로 붙습니다).",
      "3. 물 얻기 위한 목적의 **'to get'**입니다.",
      "4. 얻는 대상은 자연스럽게 **'some water'**입니다.",
      "5. 물의 출처인 특정 장소에는 the를 쓰며 **'from the water purifier(정수기에서)'**입니다."
    ],
    prepositions: [
      { word: "outside", meaning: "3D 공간 외부로의 위치 (outside of ❌)", desc: "사무실의 밖이라는 바깥 공간의 이동" },
      { word: "from", meaning: "출처/기원을 나타내는 화살표", desc: "물을 제공하는 특정 출처 장소를 의미" }
    ],
    correction: {
      isRefined: true,
      coachGreeting: "🎓 선생님의 1:1 맞춤 원어민 코칭: 오늘도 일상 속에서 영어 문장을 참 멋지게 만드셨습니다!",
      userDraft: "나 가다 바깥 of 나의 사무실 to 얻다 약간의 물 from 정수기",
      refinedEnglish: "I am going outside my office to get some water from the water purifier.",
      rhythmChunks: [
        { en: "I am going outside my office", kr: "나 사무실 밖으로 가고 있습니다" },
        { en: "to get some water", kr: "물 좀 얻기 위해" },
        { en: "from the water purifier", kr: "정수기에서" }
      ],
      points: [
        {
          category: "주어-동사 인칭 일치 규칙 (Subject-Verb Agreement 'I am' vs 'I are')",
          original: "I are going to",
          corrected: "I am going to",
          imageDifference: "👁️ 눈에 보이는 3D 시각 이미지: 주어 1인칭 단수 'I'와 함께 be동사 'am'이 한 쌍입니다. 'are'와 함께 쓰면(I are ❌)은 맞지 않습니다.",
          listeningTip: "👂 듣기(Listening) 직청직해 훈련: 'I am going'을 들을 때 [아이앰 고잉] 또는 [아임고잉]의 흐름을 체감하세요.",
          speakingTip: "🗣️ 말하기(Speaking) 입근육 결합 패턴: 'I am going outside' 한 덩어리로 연결 훈련!",
          misconception: "⚡ 한 vs 영 인칭 일치: ❌ 'I are'는 흔한 불일치 실수입니다. ✅ 'I am' 또는 'I'm'이 올바릅니다.",
          practiceExamples: [
            "I am going to the breakroom. (나 휴게실로 갈 겁니다.)"
          ],
          reason: "주어 I를 만나면 1인칭 be동사 am을 사용하여 문장을 정확히 확인했습니다."
        },
        {
          category: "전치사 중복 제거 규칙 ('outside of' → 'outside', 'from water purifier' → 'from the water purifier')",
          original: "outside of my office / from water purifier",
          corrected: "outside my office / from the water purifier",
          imageDifference: "👁️ 눈에 보이는 3D 시각 이미지: 일상 영어에서 'outside'는 전치사 of 없이 쓰는 것이 자연스러우며, 특정 장치인 정수기 앞에는 'the'를 꼭 붙입니다.",
          listeningTip: "👂 듣기(Listening) 직청직해 훈련: 'from the water purifier' 소리를 통째로 받아들이세요.",
          speakingTip: "🗣️ 말하기(Speaking) 입근육 결합 패턴: 'from the water purifier' 한 묶음으로 연습!",
          misconception: "⚡ 한 vs 영 관사 사용: 특정한 기기를 가리킬 때는 the를 함께 사용하여 3D 이미지를 정확히 전달합니다.",
          practiceExamples: [
            "He got a cup of cold water from the dispenser. (그는 디스펜서에서 찬 물 한 잔을 받았습니다.)"
          ],
          reason: "불필요한 of를 빼고 특정 장치 앞에는 the를 사용하여 문법을 수정했습니다."
        }
      ],
      teacherTip: "🎯 영어의 가이드: [I am going outside my office] → [to get some water] → [from the water purifier] 의 카메라 시선 이동을 그대로 따라 말하세요!"
    }
  },
  {
    id: "ex_sons_train",
    arrowKorean: "나의 아들들 가다 할머니집 by 기차 because 그들의 방학 시작했다 오늘",
    english: "My sons are going to grandma's house by train because their vacation started today.",
    chunks: [
      { text: "나의 아들들", role: "1. 주인공 (Subject)", english: "My sons", color: "indigo" },
      { text: "가다", role: "2. 동작 (Action)", english: "are going to", color: "blue" },
      { text: "할머니집", role: "3. 가까운 대상 (Target)", english: "grandma's house", color: "emerald" },
      { text: "by 기차", role: "4. 전치사/연결 (Preposition)", english: "by train", color: "amber" },
      { text: "because", role: "4. 전치사/연결 (Preposition)", english: "because", color: "amber" },
      { text: "그들의 방학 시작했다", role: "5. 장소/부연 (Location/Context)", english: "their vacation started", color: "rose" },
      { text: "오늘", role: "6. 시간 (Time)", english: "today", color: "purple" }
    ],
    vocabCards: [
      { korean: "나의 아들들 (주인공)", english: "My sons", role: "주인공", searchUrl: getEducationalGoogleImageSearchUrl("sons") },
      { korean: "가다 (동작)", english: "are going to", role: "동작", searchUrl: getEducationalGoogleImageSearchUrl("going to") },
      { korean: "할머니집 (대상)", english: "grandma's house", role: "가까운 대상", searchUrl: getEducationalGoogleImageSearchUrl("grandma house") },
      { korean: "by 기차 (수단)", english: "by train", role: "전치사", searchUrl: getEducationalGoogleImageSearchUrl("train") },
      { korean: "because (이유 연결)", english: "because", role: "전치사", searchUrl: getEducationalGoogleImageSearchUrl("because") },
      { korean: "그들의 방학 시작했다", english: "their vacation started", role: "부연", searchUrl: getEducationalGoogleImageSearchUrl("vacation") },
      { korean: "오늘 (시간)", english: "today", role: "시간", searchUrl: getEducationalGoogleImageSearchUrl("today") }
    ],
    kidSummary: "나의 아들들 → 가다 → 할머니집 → by train(기차 타고) → because → 그들의 방학 시작했다 → 오늘",
    explanation: [
      "1. **주인공(My sons)**이 둘이상이라 복수 동사를 합니다.",
      "2. 주인공 아들들이 움직이는 이동 동작 **'are going to'**를 합니다.",
      "3. 시선을 따라 1차 목적지인 가까운 대상은 **'grandma's house(할머니집)'**입니다.",
      "4. 이동하는 수단 전치사 **'by train(기차)'**입니다. (참고: by 뒤에는 관사 a 없이 train 단독으로 합니다).",
      "5. 이유를 알려주는 연결어 **'because'**입니다.",
      "6. 시선을 따라 상황과 시간인 **'their vacation started today(오늘 방학 시작됐다)'**입니다."
    ],
    prepositions: [
      { word: "to", meaning: "목적지 향하여 나아가는 화살표(→)", desc: "할머니집이라는 목적지로 향하는 방향 의미" },
      { word: "by", meaning: "수단/도구를 옆에 두고 이용하는 느낌", desc: "기차(train)를 이용해 이동하는 수단 표현. 참고로 'by train'처럼 관사 없이 표현" }
    ],
    correction: {
      isRefined: true,
      coachGreeting: "🎓 선생님의 1:1 맞춤 원어민 코칭: 방학 맞아 할머니집 가는 기차 타는 가족 이야기를 참 자연스럽게 만드셨습니다!",
      userDraft: "나의 아들들 가다 할머니집 by 기차 because 그들의 방학 시작했다 오늘",
      refinedEnglish: "My sons are going to grandma's house by train because their vacation started today.",
      rhythmChunks: [
        { en: "My sons are going to", kr: "나의 아들들이 가고 있습니다" },
        { en: "grandma's house", kr: "할머니 집" },
        { en: "by train", kr: "기차 타고" },
        { en: "because their vacation", kr: "그들의 방학" },
        { en: "started today", kr: "오늘 시작해서 때문에" }
      ],
      points: [
        {
          category: "교통 전치사 무관사 규칙 (Preposition 'by' + Means of Transit)",
          original: "by a train",
          corrected: "by train",
          imageDifference: "👁️ 눈에 보이는 3D 시각 이미지: 교통 수단 'by' 뒤에 'a train'이 아닌 그냥 'train' 만 쓰는데, 이는 특정 열차가 아니라 '기차라는 이동 수단 자체'를 의미하기 때문입니다.",
          listeningTip: "👂 듣기(Listening) 직청직해 훈련: 원어민이 'by train'을 말할 때 [바이 트레인]처럼 관사 없이 바로 'a' 소리가 다르게 들려도 받아들이세요.",
          speakingTip: "🗣️ 말하기(Speaking) 입근육 결합 패턴: 'by train' (기차), 'by bus' (버스), 'by car' (차) → 교통 수단은 바로 붙여서 하는 것을 훈련!",
          misconception: "⚡ 한 vs 영 관사 사용: ❌ 'by a train'도 바로 앞에 있는 특정 기차 표현이라면 쓸 수 있습니다. ✅ 이동 수단은 'by train'이 표준 표현입니다.",
          practiceExamples: [
            "We travel by train every weekend. (우리는 주말마다 기차 탑니다.)",
            "They went to the beach by bus. (그들은 버스 타고 해변에 갔습니다.)"
          ],
          reason: "교통 수단 전치사 by 뒤에 관사(a/an/the)를 빼는 것이 영어 표준 규칙입니다."
        },
        {
          category: "이동 동사 목적지 전치사 필수 규칙 (Verb 'go' + Destination 'to')",
          original: "going grandma's house",
          corrected: "going to grandma's house",
          imageDifference: "👁️ 눈에 보이는 3D 시각 이미지: 'going' 뒤에 목적지 표지판(grandma's house)까지 화살표 길(to)이 한 줄로 반드시 연결 됩니다. 다만 'home'은 그 자체가 일반 부사이므로 목적지 앞에 'to'가 불필요합니다.",
          listeningTip: "👂 듣기(Listening) 직청직해 훈련: 'going to'는 자연스럽게 [고나] 또는 [거나]로 빠르게 들리는 흐름 체감을 하세요.",
          speakingTip: "🗣️ 말하기(Speaking) 입근육 결합 패턴: 'are going to grandma's house' 한 호흡에 부드럽게 연결 말하기.",
          misconception: "⚡ 한 vs 영 'home'의 예외: 'go home'에서 home 자체가 부사라 to가 필요 없지만, 'grandma's house'는 명사이므로 'to'가 필수입니다.",
          practiceExamples: [
            "The kids are going to school right now. (아이들이 지금 학교로 가고 있습니다.)"
          ],
          reason: "목적지 명사 앞에는 반드시 목적지를 나타내는 전치사 to를 함께 짝을 이루어 넣어야 완벽한 문장이 완성됩니다."
        }
      ],
      teacherTip: "🎯 영어의 가이드: [My sons are going to] → [grandma's house] → [by train] → [because their vacation] → [started today] 한 조각씩 달려가며 연결해서 리듬감 있게 말하세요!"
    }
  },
  {
    id: "ex2",
    arrowKorean: "나 바라보다 나무 about 아파트 단지",
    english: "I am looking at the trees around the apartment complex.",
    chunks: [
      { text: "나", role: "1. 주인공 (Subject)", english: "I", color: "indigo" },
      { text: "바라보다", role: "2. 동작/시선이동 (Action)", english: "am looking at", color: "blue" },
      { text: "나무", role: "3. 가까운 대상 (Target)", english: "the trees", color: "emerald" },
      { text: "about 아파트 단지", role: "4. 전치사/연결 (Preposition/Location)", english: "around the apartment complex", color: "amber" }
    ],
    vocabCards: [
      { korean: "나", english: "I", role: "주인공", searchUrl: getEducationalGoogleImageSearchUrl("I") },
      { korean: "바라보다 (시선이동 동작)", english: "am looking at", role: "동작", searchUrl: getEducationalGoogleImageSearchUrl("am looking at") },
      { korean: "나무", english: "the trees", role: "가까운 대상", searchUrl: getEducationalGoogleImageSearchUrl("the trees") },
      { korean: "아파트 단지 주변의", english: "around the apartment complex", role: "장소 부연", searchUrl: getEducationalGoogleImageSearchUrl("around the apartment complex") }
    ],
    kidSummary: "주인공(나) → 시선 동작(바라보다) → 나무(대상) → 아파트 단지 주변의 둘레의 둘러보는(장소)",
    explanation: [
      "1. **주인공(I)**가 시선 이동 동작을 합니다.",
      "2. 시선을 표현하는 동작인 **'바라보다(am looking at)'**를 합니다.",
      "3. 시선의 초점이 되는 대상은 **'나무(the trees)'**입니다.",
      "4. 그 나무의 위치 배경 주변은 **'around 아파트 단지(around the apartment complex)'** 주변의 둘레이고 있는 의미입니다."
    ],
    prepositions: [
      { word: "around", meaning: "둘러싼 공간 느낌", desc: "아파트 단지라는 중심의 주변을 둘러보는 입체적 의미" }
    ],
    correction: {
      isRefined: true,
      coachGreeting: "🎓 선생님의 1:1 맞춤 원어민 코칭: 'about'과 'around'의 뉘앙스 차이를 느끼는 것은 참 중요한 획기적 포인트입니다! 시선의 카메라 시선 화살표를 잘 따라가셨어요!",
      userDraft: "나 바라보다 나무 about 아파트 단지",
      refinedEnglish: "I am looking at the trees around the apartment complex.",
      rhythmChunks: [
        { en: "I am looking at", kr: "나 바라보다 있습니다" },
        { en: "the trees", kr: "그 나무들" },
        { en: "around the apartment complex", kr: "아파트 단지 주변의 둘레의 주변" }
      ],
      points: [
        {
          category: "전치사 공간 배치 그레이드 (Preposition Spatial Layout)",
          original: "about 아파트 단지",
          corrected: "around the apartment complex",
          imageDifference: "👁️ 눈에 보이는 3D 시각 이미지: 'about'은 대략적 주제인 추상적인 느낌이고, 'around'는 중심을 둘러싸고 있는 원형의 느낌입니다.",
          listeningTip: "👂 듣기(Listening) 직청직해 훈련: 'around ~'가 들리면 '아, 중심 주변을 둘러싸고 있구나!'하고 공간 위치를 머리속에 그려보세요.",
          speakingTip: "🗣️ 말하기(Speaking) 입근육 결합 패턴: 'around the ~' (~의 둘러 싼 주변의) 한 호흡으로 준비합니다.",
          misconception: "⚡ 한 vs 영 뉘앙스 차이: ❌ 한국어 '주변/부근'을 하고 'about'을 쓰기 쉽습니다. ✅ 물리적 공간 주변이 둘러 싸여 있으면 'around'가 맞습니다.",
          practiceExamples: [
            "People gathered around the fountain. (사람들이 분수대 주변에 둘러싸고 모였습니다.)",
            "There are fence walls around the garden. (정원 둘러싸고 있는 울타리 벽이 있습니다.)"
          ],
          reason: "아파트 단지 둘레에 나무가 있는 3D 배치 이미지이므로 'around'를 써야 정확한 표현입니다."
        }
      ],
      teacherTip: "🎯 영어의 가이드: 시선을 따라 [look at]으로 대상을 보고, 그 주변의 둘레를 [around]으로 공간 그림을 그리며 입력하세요!"
    }
  }
];

/**
 * Translates an Arrow Korean input into structured English using Google Gemini API.
 * This is the primary (and only) translation engine.
 *
 * Returns a result object with: english, chunks, vocabCards, explanation,
 * prepositions, nativeRecommendations, correction, etc.
 */
export async function translateWithGemini(arrowKoreanInput, apiKey) {
  if (apiKey && apiKey.trim().length > 10) {
    const prompt = `
You are an elite English Education Expert specializing in spoken English (구어체) and practical grammar (실전 문법).
The user typed a Korean/English sentence draft: "${arrowKoreanInput}"

YOUR HIGHEST PRIORITY:
Translate the input into 100% PERFECT, NATURAL, NATIVE SPOKEN ENGLISH for the "english" field.
- DO NOT translate literally word-by-word if it creates awkward English! (e.g., "일 잘하고 있는 요즘 일" -> "I am doing well at work" or "I'm doing a good job", NOT "I do is day well"!).
- Fix any Korean homonyms or polysemy in context (e.g. "일" near work/job -> "work/job", "다리" -> "bridge").
- For Korean place names, include the original Korean in parentheses: e.g. "문래" -> "Mullae(문래)", "청계천" -> "Cheonggyecheon(청계천)".
- Strip Korean parenthetical text before generating the "english" field (pure English only in "english").

Respond ONLY with a JSON object in this exact schema:
{
  "english": "The exact natural standard native spoken English sentence ONLY (No Korean text inside this field!)",
  "chunks": [
    { "text": "Korean chunk", "role": "1. 주인공 (Subject) / 2. 동작 (Action) / 3. 가까운 대상 (Target) / 4. 전치사/연결 (Preposition) / 5. 장소/부연 (Location/Context) / 6. 시간 (Time)", "english": "Exact English phrase equivalent", "color": "indigo/blue/emerald/amber/rose/purple" }
  ],
  "explanation": [
    "Step 1 explanation in Korean according to Arrow English principles",
    "Step 2 explanation...",
    "Step 3 explanation..."
  ],
  "prepositions": [
    { "word": "preposition used", "meaning": "Arrow English visual meaning", "desc": "Detailed visual explanation" }
  ],
  "nativeRecommendations": [
    {
      "label": "표현 1 (자연 기본 표현 - Natural Standard)",
      "english": "Natural vivid everyday standard English sentence",
      "korean": "자연스러운 일상 한국어 뜻",
      "keyChange": "🔑 핵심 포인트 & 뉘앙스 한마디 노트"
    },
    {
      "label": "표현 2 (동사 유의어 교체 표현 - Synonym Substitution)",
      "english": "Refined English sentence with verb or phrase substitution",
      "korean": "반드시 동사가 달라진 한국어 뜻",
      "keyChange": "🔑 동사 교체 노트"
    },
    {
      "label": "표현 3 (실전 구어체 - Casual Native Vibe)",
      "english": "Lively idiomatic native expression as seen in TV shows",
      "korean": "실전 구어체 뜻",
      "keyChange": "🔑 이디엄 또는 구어 관용구 뜻"
    }
  ],
  "correction": {
    "isRefined": true,
    "coachGreeting": "🎓 선생님의 1:1 맞춤 원어민 코칭: ...",
    "userDraft": "${arrowKoreanInput}",
    "refinedEnglish": "Perfect native standard English sentence",
    "rhythmChunks": [
      { "en": "English chunk", "kr": "Korean meaning chunk" }
    ],
    "points": [
      {
        "category": "Preposition / Grammar / Word Choice in Korean",
        "original": "Learner's mistaken phrase",
        "corrected": "Corrected native English phrase",
        "imageDifference": "👁️ 눈에 보이는 3D 시각 이미지: ...",
        "listeningTip": "👂 듣기(Listening) 직청직해 훈련: ...",
        "speakingTip": "🗣️ 말하기(Speaking) 입근육 결합 패턴: ...",
        "misconception": "⚡ 한 vs 영 한국어 직역 오해 vs 영어의 뉘앙스: ...",
        "practiceExamples": [
          "Example 1 in English with Korean translation"
        ],
        "reason": "Detailed warm masterclass explanation in Korean"
      }
    ],
    "teacherAdvice": "Warm, encouraging pedagogical advice in Korean"
  }
}
`;

    const modelEndpoints = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest'
    ];

    let lastErrorDetails = '';

    for (const model of modelEndpoints) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) {
          try {
            const errData = await response.json();
            const apiMsg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
            lastErrorDetails = `[${model}] ${apiMsg}`;
          } catch {
            lastErrorDetails = `[${model}] HTTP ${response.status}`;
          }
          continue;
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const parsedData = JSON.parse(rawText);

        // Build vocab cards from chunks
        const vocabCards = (parsedData.chunks || []).map(c => {
          const cleanEn = (c.english || '').replace(/[\u3131-\u318E\uAC00-\uD7A3]/g, '').trim() || c.english;
          return {
            korean: c.text,
            english: cleanEn,
            role: c.role,
            searchUrl: getEducationalGoogleImageSearchUrl(cleanEn)
          };
        });

        return {
          id: `gemini-${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          arrowKorean: arrowKoreanInput,
          english: parsedData.english,
          chunks: parsedData.chunks,
          vocabCards: vocabCards,
          kidSummary: (parsedData.chunks || []).map(c => `${c.text}(${c.english})`).join(' → '),
          explanation: parsedData.explanation,
          prepositions: parsedData.prepositions || [],
          nativeRecommendations: parsedData.nativeRecommendations || [],
          correction: parsedData.correction || {
            isRefined: true,
            coachGreeting: "🎓 선생님의 1:1 맞춤 원어민 코칭: 멋진 도전입니다!",
            userDraft: arrowKoreanInput,
            refinedEnglish: parsedData.english,
            rhythmChunks: (parsedData.chunks || []).map(c => ({ en: c.english, kr: c.text })),
            points: [],
            teacherTip: "🎯 영어의 가이드: 글을 읽을 때 말할 때 거꾸로 뒤집지 말고 앞에서부터 영어의 어순대로 생각하세요!"
          }
        };
      } catch (err) {
        lastErrorDetails = `[${model}] ${err?.message || '네트워크 오류'}`;
      }
    }

    if (lastErrorDetails) {
      if (lastErrorDetails.includes('API key not valid') || lastErrorDetails.includes('API_KEY_INVALID') || lastErrorDetails.includes('400') || lastErrorDetails.includes('403')) {
        throw new Error(`GEMINI_API_ERROR: Google Gemini API 키가 올바르지 않거나 권한이 없습니다.\n(상세 확인: ${lastErrorDetails})\n\n🔑 Google AI Studio (https://aistudio.google.com/)에서 'AIzaSy...'로 시작하는 Gemini API Key를 새로 발급받아 [⚙️ API 키 설정]에 입력해 주세요.`);
      }
      if (lastErrorDetails.includes('429') || lastErrorDetails.includes('RESOURCE_EXHAUSTED')) {
        throw new Error(`GEMINI_API_ERROR: Google Gemini API 무료 분당 호출 한도(15회/분)에 도달했습니다.\n(상세 확인: ${lastErrorDetails})\n\n⏳ 30~60초 후 다시 시도해 주세요.`);
      }
      throw new Error(`GEMINI_API_ERROR: Google Gemini API 호출 중 오류가 발생했습니다.\n(상세 확인: ${lastErrorDetails})`);
    }

    throw new Error("GEMINI_API_ERROR: Google Gemini API 응답 생성에 실패했습니다. API 키를 확인하시거나 잠시 후 다시 시도해 주세요.");
  }

  throw new Error("API_KEY_REQUIRED: Gemini API 키가 설정되지 않았습니다. 상단 [⚙️ API 키 설정]에서 API 키를 입력해 주세요.");
}

/**
 * Returns native speaker recommendation variations from the result object.
 * Gemini API responses include nativeRecommendations directly.
 */
export function getNativeRecommendations(result) {
  if (!result) return [];
  if (result.nativeRecommendations && result.nativeRecommendations.length > 0) {
    return result.nativeRecommendations;
  }
  return [];
}

/**
 * Returns vocab nuance breakdown cards from the result object.
 * Gemini API responses include correction.points which serve as nuance data.
 */
export function getVocabNuances(result) {
  if (!result) return [];

  // Use correction points as vocab nuance data
  if (result.correction && result.correction.points && result.correction.points.length > 0) {
    return result.correction.points.map(pt => ({
      korean: pt.original || pt.category || '',
      english: pt.corrected || '',
      desc: pt.reason || pt.imageDifference || ''
    }));
  }

  return [];
}
