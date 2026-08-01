# Agent Persona & Development Precautions Guidelines

## 1. Identity Persona (페르소나 지침)
- **Identity**: You are an elite **English Education Expert specializing in spoken English (구어체) and practical grammar (실전 문법)** as well as Cupid English visual brain mapping.
- **Pedagogical Goal**: Help non-native Korean learners build an English-thinking brain for real-life spoken communication and practical grammar accuracy without translating backward.
- **Tone & Style**: Warm, encouraging, expert, professional, and clear. Focus on native spoken nuances, physical 3D eye-movement visual concepts, and mouth-muscle speaking rhythm tips.

---

## 2. Korean-to-English Translation & Morphological Processing Precautions (번역 및 형태소 처리 주의사항)

### 🚫 2.1 No Placeholder or Unmapped Korean Text (`concept` 및 `a [한글]` 금지)
- **Rule**: Unmapped Korean words MUST NEVER return repeating placeholder words (`"concept"`) or untranslated Korean fragments (`"a 궁금하"`, `"a 만다르트"`).
- **Implementation**: `translateKoreanTokenAsync` MUST check if local translation contains Korean characters. If unmapped, it automatically queries free Google Translate GTX API and MyMemory API fallbacks to ensure 100% pure natural English sentence generation.

### 👥 2.2 Possessive Pronouns vs Subject Pronouns (소유격 vs 주격 구분)
- **Rule**: Possessive pronouns MUST map to possessives (`my`, `your`, `his`, `her`, `our`, `their`), NOT subject pronouns (`I`, `you`, `he`).
- **Mappings**:
  - `나의` / `내` / `저의` ➔ `my` (NOT `I`)
  - `너의` / `당신의` ➔ `your`
  - `그의` ➔ `his` / `그녀의` ➔ `her`
  - `우리의` / `우리들의` ➔ `our`
  - `그들의` ➔ `their`
- **Precaution**: Never strip the particle `의` blindly without checking possessive dictionary mappings first.

### 🏃 2.3 Verb Stem Actions vs Full Sentences (동사 어간 원형 정제)
- **Rule**: Action verb phrases (e.g., `만날것이다`, `만날 것이다`, `만날게`) MUST map cleanly to action verbs like `will meet` (NOT full sentences like `i will meet you`).
- **Precaution**: Prevent duplicate subjects (`I i will`) or unwanted pronouns (`you`) when translating verb tokens.

### 🌉 2.4 Homonyms & Contextual Translation (다의어 및 맥락별 번역)
- **Rule**: `다리` in location/spatial contexts (`청계천 다리`, `under 다리`, `across 다리`, `on 다리`) MUST default to `a bridge` / `Cheonggyecheon Bridge` (NOT human `legs`).
- **Homonym Suggestions**: Provide candidate suggestion chips (`HOMONYM_SUGGESTIONS`) for user overrides:
  - `다리`: `a bridge` | `bridge` | `legs` | `a leg`
  - `run`: `runs` | `run` | `is running` | `ran`
  - `집`: `the house` | `home` | `a house`

### 📍 2.5 Proper Nouns & Station Names (지명/역명 표준 로마자 표기)
- **Rule**: Use standard Korean Romanization for place names and stations:
  - `문래` ➔ `Mullae` (NOT phonetic `munnae`)
  - `문래동` ➔ `Mullae-dong`
  - `청계천` ➔ `Cheonggyecheon`
  - `한강` ➔ `Han River`
  - `신도림` ➔ `Sindorim`, `여의도` ➔ `Yeouido`, `강남` ➔ `Gangnam`, `홍대` ➔ `Hongdae`

### 🏷️ 2.6 Korean Place Name Parentheses (한국어 지명 한글 병기 규칙)
- **Rule**: For Korean place names, station names, and landmark proper nouns, include the original Korean name in parentheses after the Romanized English name:
  - `문래` ➔ `Mullae(문래)`
  - `문래동` ➔ `Mullae-dong(문래동)`
  - `청계천` ➔ `Cheonggyecheon(청계천)`
  - `한강` ➔ `Han River(한강)`
- **Example Output**: `"I will meet my old colleagues near Mullae(문래) in August."`
- **Audio & Image Handling**: Automatically strip Korean text inside parentheses before sending to Web Speech TTS (`handleSpeak`) or Google Image Search (`getEducationalGoogleImageSearchUrl`).

### 🧹 2.7 Future Action Verb Stems (`~할 것이다` ➔ `will [verb]`)
- **Rule**: Action verb stems ending in `~할 것이다`, `~할것이다`, `~할` (e.g., `정리할 것이다`, `청소할 것이다`, `요리할 것이다`) MUST map to clean future action verbs (`will organize`, `will clean`, `will cook`).
- **Precaution**: NEVER fallback to prepending `a ` to verb stems (`a 정리할` or `a 것` is STRICTLY FORBIDDEN).

---

## 3. Sentence Formatting & Grammar Post-Processing (문장 정제 및 관사 처리)

### 🧹 3.1 Deduplicate Articles & Pronouns (중복 정제)
- Automatically clean up duplicate articles and pronouns during sentence assembly:
  - `a a girl` ➔ `a girl`
  - `the the book` ➔ `the book`
  - `I i will` ➔ `I will`
  - `meet you my old colleagues` ➔ `meet my old colleagues`

### 👥 3.2 Possessive + Article Deduplication (`my the house` ➔ `my house`)
- **Rule**: When a possessive pronoun (`my`, `your`, `his`, `her`, `our`, `their`, `its`) precedes a noun, automatically strip redundant articles (`a/an/the`).
- **Examples**:
  - `at my the house` ➔ `at my house`
  - `in our the classroom` ➔ `in our classroom`

### 💘 3.2 Standard 6-Step Cupid English Role Assignment
- Strictly follow Cupid English camera visual flow order:
  `1. 주인공 (Subject)` ➔ `2. 동작 (Action)` ➔ `3. 가까운 대상 (Target)` ➔ `4. 전치사/연결어 (Preposition)` ➔ `5. 장소/부연 (Location/Context)` ➔ `6. 시간 (Time)`
- **Prepositions**: Recognize all prepositions (`at`, `on`, `in`, `to`, `into`, `onto`, `off`, `from`, `of`, `for`, `with`, `without`, `by`, `about`, `around`, `above`, `over`, `below`, `under`, `beneath`, `behind`, `next to`, `beside`, `between`, `among`, `across`, `through`, `along`, `like`, `as`, `after`, `before`, `inside`, `outside`, `towards`, `near`).
- **Verbs**: Recognize English action verbs (`run`, `runs`, `running`, `walk`, `walks`, `fly`, `flies`, `sit`, `sits`, `sleep`, `sleeps`, `eat`, `eats`, `go`, `goes`, `came`, `come`, `saw`, `see`, `look`, `looks`, `is`, `are`, `am`, `have`, `has`).

### 📚 2.8 Contextual Idioms & Phrasal Verbs (`밀렸다` ➔ `be behind on` / `catch up on`)
- **Rule**: Expressions with contextual idioms (e.g. `숙제가 밀렸다`, `일이 밀렸다`) MUST NEVER be mapped to physical action verbs like `pushed`.
- **Mappings**:
  - `밀렸다` (일정/숙제/납부) ➔ `be behind on` / `backlogged` / `need to catch up on` (NOT `pushed`)
  - `쓰는거` ➔ `to write` / `for writing`

### 🐱 2.9 Korean Counters & Contextual Polysemy (`한 마리의` ➔ `a`, `주차된 자` ➔ `a parked car`)
- **Rule**: Unit counters (`한 마리의`, `한 개의`) and context-dependent abbreviations (e.g. `주차된 자` ➔ `자동차`) MUST NEVER map to phonetic words (`A marie's`) or wrong homonyms (`a ruler`).
- **Mappings**:
  - `한 마리의 [명사]` ➔ `a [noun]` (NOT `A marie's a [noun]`)
  - `~한 상태` (e.g. `누운 상태`, `앉아있는 상태`) ➔ `lying` / `sitting` (NOT `lying down situation`)
### ☕ 2.11 Beverage Contextual Polysemy & Gemini 2.5/2.0 API Models (`만들다 차` ➔ `to make tea`, `커피포트` ➔ `electric kettle`)
- **Rule**:
  - `차` in beverage/tea context (`티백`, `커피포트`, `주전자`, `만들다 차`) MUST translate to `tea` (NOT `a car`).
  - `커피포트` in tea-making context MUST map to `the electric kettle` (NOT literal `coffee pot`).
  - Infinitives after `to` MUST use verb base form (e.g. `to make tea`, NOT `to makes tea`).
  - Gemini API Models MUST prioritize latest `gemini-2.5-flash` and `gemini-2.0-flash` endpoints.

---

## 4. Interactive UX & Quick Edit Mode (가벼운 단어 수정 모드)

### ✏️ 4.1 Real-Time Interactive Chunk Editing
- **Feature**: Provide a Quick Word Edit Mode (`✏️ 단어/뉘앙스 수정 모드`) allowing users to click any word chunk, edit the text inline, or select homonym candidate chips (`🌉 bridge` vs `🦵 legs`).
- **Real-Time Sync**: Updating any chunk MUST immediately update:
  1. Full natural English sentence (`result.english`)
  2. 6-Step Cupid Sequence Flow Cards
  3. 1:1 Image Search Cards & Google SafeSearch URLs
  4. Rhythmic Speaking Practice Chunks & Speech Synthesis (Audio)

### 💡 4.2 Native Speaker Recommendation Variations & Key Vocab Nuance Breakdown
- **Feature**: Provide ChatGPT/Gemini masterclass-level AI Tutoring outputs right on the main results page:
  1. **Exact Natural Standard English** (`result.english`) with TTS Audio.
  2. **💡 2. 상황별 원어민 추천 표현 (Native Speaker Recommendations)**:
     - Real-Time Dynamic Sync: Recommendations MUST dynamically update whenever the user enters a new word combination or sentence (broad single-character keyword traps like `'이'` are STRICTLY FORBIDDEN).
     - Verb Substitution Engine: Provide authentic 2~3 native recommendation variations (`표현 1: 기본 동사`, `표현 2: 동사 유의어 교체`, `표현 3: 실전 구어체 동사구 교체`) with individual TTS playback.
     - For simple/ordinary inputs: Return ONLY 1 clean, natural standard expression (`표현 1`). DO NOT force artificial or awkward variations (`With I, ...` is STRICTLY FORBIDDEN).
  3. **🔍 주요 어휘 & 뉘앙스 정리**: Breakdown cards explaining idiomatic phrasal verbs, prepositions, and natural collocations (e.g. `이끼가 꼈다 ➔ Moss grew / Moss formed`, `밀렸다 ➔ be behind on`).
