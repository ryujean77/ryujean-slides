# 3강. 내 앱에 AI 달기: 무료 API 키와 '새 버전' 배포

유정근 · 마이웨이 아카데미 | T1 교사 연수 · 기본

## 오늘의 목표

2강의 사업계획서 자판기에 AI를 넣습니다. Google AI Studio에서 무료 API 키를 받아 앱의 '스크립트 속성'에 넣고, URL을 바꾸지 않은 채 '새 버전'으로 배포합니다. 마지막으로 무료 제미나이에게 기능 하나를 더 붙여 달라고 해서, 바이브 코딩의 수정 한 바퀴를 직접 돌려 봅니다.

## 오늘 손에 남는 것

- 같은 URL에서 <strong>AI 초안</strong>이 구글 문서로 생기는 앱
- 제미나이에게 수정을 요청해 <strong>'담당 부서' 칸이 늘어난 앱</strong>(수정 1회 성공)
- "한 번에 하나만 고치고, 고칠 때마다 새 버전과 확인" 이라는 습관 하나

## 준비물

- 2강에서 만든 시트와 Apps Script 편집기, 내 웹앱 URL
- PC 크롬, 개인 구글 계정
- 휴대폰

## 먼저 이해하기

<strong>API 키</strong>(Application Programming Interface key)는 내 앱이 구글의 AI를 불러 쓸 때 내미는 출입증입니다. 이 출입증으로 쓴 만큼이 내 계정에 기록됩니다. 그래서 두 가지를 지킵니다.

> **키는 코드에 쓰지 않습니다.** Apps Script의 '스크립트 속성'(프로젝트 안의 잠긴 서랍)에 넣습니다. 코드는 동료와 나누거나 제미나이에게 보여 줄 일이 많습니다. 키가 서랍에 있으면 코드를 통째로 보여 줘도 출입증은 새지 않습니다. 기준 코드가 `GEMINI_API_KEY` 라는 이름의 서랍을 열어 보고, 키가 있으면 AI 초안, 없으면 뼈대 초안을 만드는 것도 이 때문입니다.

> **무료 등급에 넣은 글은 Google 제품 개선에 쓰입니다.** 그래서 학생 이름·번호·상담 내용 같은 개인정보는 앱에 넣지 않습니다. 사업명·대상 인원·기간처럼 공개해도 되는 정보만 넣습니다.

<strong>재배포</strong>도 미리 알아 둡니다. 코드를 고친 뒤 화면에 반영하려면 다시 배포해야 합니다. 이때 길이 둘입니다.

| 누르는 곳 | 결과 |
|---|---|
| '배포' → '배포 관리' → 연필 → 버전 '새 버전' → '배포' | <strong>URL이 그대로</strong>입니다. 이미 나눠 준 링크·QR이 계속 맞습니다. |
| '배포' → '새 배포' | 새 URL이 생깁니다. 나눠 준 링크는 옛날 앱을 계속 보여 줍니다. |

자판기에 비유하면, '새 버전'은 같은 자리의 자판기 속 상품을 바꾸는 일이고, '새 배포'는 다른 골목에 자판기를 하나 더 세우는 일입니다. 오늘부터 고칠 때는 '새 버전'만 씁니다.

## 따라 하기

**가. AI Studio에서 무료 API 키 받기** (약 8분)

1. PC 크롬 새 탭 주소창에 `https://aistudio.google.com` 을 입력하고 `Enter` 를 누릅니다.
2. 오른쪽 위 프로필 사진을 눌러 2강과 같은 <strong>개인 gmail 계정</strong>인지 확인합니다.
   ✖ 이렇게 보이면: 학교 계정이면 관리자 정책으로 AI Studio가 막혀 있을 수 있습니다. 개인 계정으로 바꿉니다.
3. 처음 들어가면 이용 약관이나 안내 창이 나올 수 있습니다. 읽고 동의한 뒤 진행합니다.
4. 화면 왼쪽 아래 또는 위쪽의 'Get API key'를 누릅니다.
5. 'Create API key'를 누릅니다. 프로젝트를 고르라는 칸이 나오면 새 프로젝트를 만들거나 보이는 기본값을 고릅니다.
   → 이렇게 보이면 됩니다: 영어와 숫자가 섞인 긴 문자열(API 키)이 나타나고 옆에 복사 단추가 있습니다.
6. 복사 단추를 눌러 키를 복사합니다. 바로 다음 단계에서 붙여 넣을 것이므로 다른 것을 복사하지 마세요.

(화면의 글자는 버전에 따라 조금 다를 수 있습니다.)

> **키를 두면 안 되는 곳:** 카카오톡, 메일, 제미나이 대화창, 코드 안, 공유 문서. 키가 남에게 보였다면 AI Studio의 같은 화면에서 그 키를 지우고 새로 만듭니다.

**나. 스크립트 속성에 `GEMINI_API_KEY` 넣기** (약 6분)

1. 2강의 Apps Script 편집기 탭으로 갑니다. (닫았다면 시트에서 '확장 프로그램' → 'Apps Script'.)
2. 편집기 맨 왼쪽 세로 아이콘 줄에서 톱니바퀴 모양 '프로젝트 설정'을 누릅니다.
3. 화면을 맨 아래까지 내립니다. '스크립트 속성' 제목이 보입니다.
4. '스크립트 속성 추가'를 누릅니다.
5. 왼쪽 '속성' 칸에 `GEMINI_API_KEY` 를 정확히 적습니다. 대문자, 밑줄(_) 두 개, 띄어쓰기 없음.
6. 오른쪽 '값' 칸을 누르고 `Ctrl + V` 로 키를 붙여 넣습니다. 키 앞뒤에 빈칸이 들어가지 않게 합니다.
7. '스크립트 속성 저장'을 누릅니다.
   → 이렇게 보이면 됩니다: '스크립트 속성' 아래에 `GEMINI_API_KEY` 한 줄이 남아 있습니다.
8. 왼쪽 세로 아이콘 줄에서 `< >` 모양 '편집기'를 눌러 코드 화면으로 돌아옵니다.

**다. 코드 확인하고 '새 버전'으로 배포하기** (약 8분)

먼저 내 코드가 AI를 부를 수 있는 코드인지 봅니다.

1. 왼쪽에서 `Code.gs` 를 누르고 `Ctrl + F` 를 눌러 `GEMINI_API_KEY` 를 찾습니다.
   → 찾아지면: 2강에서 기준 코드를 쓴 경우입니다. 그대로 둡니다.
   → 찾아지지 않으면: 2강에서 제미나이가 만든 코드(AI 없는 판)를 쓴 경우입니다. 이 카드 아래 '기준 코드'로 `Code.gs` 와 `index.html` 을 바꿔 붙이고 `Ctrl + S` 로 저장합니다.

이제 같은 URL로 재배포합니다.

2. 오른쪽 위 파란 '배포'를 누릅니다.
3. 목록에서 '배포 관리'를 누릅니다. ('새 배포'가 아닙니다.)
   → 이렇게 보이면 됩니다: 왼쪽에 2강의 '첫 배포'가 보이는 창이 열립니다.
4. 오른쪽 위 연필 모양(수정)을 누릅니다.
5. '버전' 칸을 누르고 '새 버전'을 고릅니다.
6. '설명' 칸에 `AI 연결` 이라고 적습니다.
7. '배포'를 누릅니다.
   → 이렇게 보이면 됩니다: 완료 창의 웹 앱 URL이 2강에서 복사한 주소와 같습니다.
   ✖ 권한 승인 화면이 다시 나오면: 코드가 바뀌어 새 권한(외부 AI 서버에 연결)이 필요해진 것입니다. 2강 '라'의 9~13번처럼 내 계정 → '고급' → '…(으)로 이동(안전하지 않음)' → '허용'.

> **알아 두기:** '새 버전'은 그 순간의 <strong>코드</strong>를 사진처럼 찍어 두는 일입니다. 스크립트 속성(서랍)은 그 사진에 들어가지 않고, 기준 코드는 앱이 실행될 때마다 서랍에서 키를 꺼내 읽습니다. 그래서 코드를 바꾸지 않고 키만 넣었다면 새 버전 없이도 AI 초안이 나옵니다. 그래도 오늘은 '새 버전' 순서를 손에 익히려고 한 번 해 봅니다. 코드를 바꿨다면 새 버전은 필수입니다.

**라. AI 초안 시험하기** (약 5분)

1. 휴대폰에서 2강에 저장해 둔 같은 링크를 엽니다. 이미 열려 있었다면 새로고침합니다.
2. 2강과 다른 사업 하나를 넣어 봅니다. 예:
   - 사업명: `학급 독서 릴레이`
   - 대상: `2학년 전체`
   - 기간: `2027년 4월~6월`
   - 예산: `800,000원`
   - 메모: `아침 10분 독서, 학급별 추천 도서 게시`
3. '초안 만들기'를 누르고 10~20초 기다립니다.
   → 이렇게 보이면 됩니다: 메시지가 "<strong>AI 초안</strong> 완성 · 구글 문서 열기"로 나옵니다(2강에서는 "뼈대 초안"이었습니다). 아래 초안이 "~함, ~임" 공문서체 문장으로 채워져 있습니다.
4. '구글 문서 열기'를 눌러 문서를 확인합니다. 모르는 숫자나 날짜는 `[ ]` 로 비어 있어야 정상입니다. AI가 지어내지 않도록 시켜 두었기 때문입니다.
5. PC의 시트 '기록' 탭을 봅니다. 새 줄의 '방식' 칸에 `AI` 라고 적혀 있습니다(2강 줄은 `뼈대`).

> **최종 판단은 교사입니다.** AI 초안은 초안입니다. 예산 숫자, 일정, 학교 실정에 맞는 표현은 반드시 내가 읽고 고칩니다.

**마. 바이브 수정 한 바퀴: '담당 부서' 칸 붙이기** (약 13분)

이제 앱을 직접 키워 봅니다. 고칠 것은 딱 하나, 입력칸 '담당 부서'를 추가하는 것입니다.

> **규칙: 한 번에 하나만 고친다. 고칠 때마다 새 버전으로 배포하고, 눈으로 확인한다.**
> 두세 가지를 한꺼번에 고치면, 고장 났을 때 무엇 때문인지 찾을 수 없습니다.

1. Apps Script 편집기에서 `Code.gs` 를 열고 `Ctrl + A` → `Ctrl + C` 로 전체를 복사합니다. 메모장이 필요 없습니다. 바로 다음 단계에서 붙여 넣습니다.
2. 제미나이 탭에서 '새 채팅'을 누릅니다.

> **어디에 입력하나요:** PC에서 크롬을 열고 주소창에 `https://gemini.google.com` 을 입력해 들어갑니다. 구글 계정으로 로그인돼 있으면 화면 아래쪽에 글을 쓰는 입력칸이 보입니다. 그 칸을 한 번 누르고, 아래 글을 복사(`Ctrl + C`)해 붙여 넣은(`Ctrl + V`) 뒤 `Enter` 를 누르거나 오른쪽의 보내기(제출) 버튼을 누르세요. (여러 줄을 쓸 때는 `Enter` 대신 `Shift + Enter` 로 줄을 바꿉니다 — `Enter` 만 누르면 바로 보내집니다.) 답이 위쪽에 나타나면 끝까지 읽고, 모르는 말이 있으면 "○○가 무슨 뜻이야?" 라고 이어서 물으면 됩니다.

3. 아래 요청문을 먼저 입력칸에 붙여 넣습니다. 아직 보내지 않습니다.

```text
아래는 내 Google Apps Script 웹앱 '사업계획서 자판기'의 지금 코드야.
기능 하나만 추가해 줘: 입력칸 '담당 부서'(예: 정보부)를 '예산' 칸 아래에 넣어 줘.

- 담당 부서 값은 초안 글의 'Ⅲ. 세부 추진 계획' 안에 '담당: ○○부'로 들어가게 해 줘.
  AI 초안을 만드는 부분(askGemini)과 AI 없는 뼈대(skeleton) 둘 다.
- '기록' 시트에도 담당 부서를 맨 오른쪽 새 칸에 저장해 줘.
- 그 밖의 기능, 디자인, 함수 이름, 모델 이름은 바꾸지 마.
- 바뀐 파일은 Code.gs 와 index.html 각각 전체 코드로, 생략 없이 보여 줘.
- 마지막에 무엇을 바꿨는지 세 줄로 알려 줘.

[Code.gs]
(여기에 붙여 넣기)

[index.html]
(여기에 붙여 넣기)
```

4. 입력칸 안에서 `(여기에 붙여 넣기)` 첫 번째 줄을 마우스로 드래그해 선택하고 `Ctrl + V` 로 Code.gs 코드를 붙여 넣습니다.
5. 편집기로 가서 `index.html` 을 열고 `Ctrl + A` → `Ctrl + C` 로 복사합니다.
6. 제미나이 입력칸의 두 번째 `(여기에 붙여 넣기)` 를 선택하고 `Ctrl + V` 로 붙여 넣습니다.
7. 보내기 전에 한 번 봅니다. 키가 코드 안에 없으니 코드를 통째로 보내도 괜찮습니다. 이것이 키를 스크립트 속성에 둔 이유입니다.
8. 보냅니다.
   → 이렇게 보이면 됩니다: `Code.gs` 와 `index.html` 코드 상자 두 개와 "바꾼 점" 세 줄.
9. 2강 '다'처럼 두 파일을 각각 `Ctrl + A` → `Ctrl + V` 로 바꿔 붙이고 `Ctrl + S` 로 저장합니다.
10. '배포' → '배포 관리' → 연필 → 버전 '새 버전' → 설명 `담당 부서 추가` → '배포'.
11. 휴대폰에서 앱을 새로고침합니다.
    → 이렇게 보이면 됩니다: '예산' 아래에 '담당 부서' 칸이 생겼습니다. 값을 넣고 '초안 만들기'를 누르면 문서의 Ⅲ 안에 "담당: ○○부"가 보입니다.
12. 시트 '기록' 탭을 봅니다. 새 줄 맨 오른쪽에 담당 부서가 들어 있습니다. 그 칸의 1행 제목이 비어 있으면 1행 빈칸을 눌러 `담당 부서` 라고 직접 적습니다. (이미 만들어진 '기록' 시트의 제목 줄은 코드가 다시 쓰지 않기 때문입니다.)

✖ 고친 뒤 앱이 고장 났다면: 제미나이에게 화면의 오류 문구를 그대로 붙여 넣고 "이 오류가 났어, 고쳐 줘"라고 보냅니다. 두 번 해도 안 되면 아래 기준 코드로 되돌리고 새 버전으로 배포합니다. 기준 코드는 언제든 돌아갈 수 있는 저장 지점입니다.

## 막히면

| 화면에 보이는 것 | 뜻 | 이렇게 하세요 |
|---|---|---|
| "AI 응답 오류(404)" | 모델 이름을 찾을 수 없습니다. 예전 모델(1.5 Flash 등)은 종료됐습니다. | `Code.gs` 맨 위 `const MODEL = 'gemini-flash-lite-latest';` 가 그대로인지 봅니다. 제미나이가 다른 이름으로 바꿨다면 이 줄로 되돌리고 새 버전 배포. |
| "무료 사용량을 잠시 넘었습니다" (429) | 짧은 시간에 너무 많이 눌렀습니다. | 1분 뒤 다시 누릅니다. 연수장처럼 여럿이 한 키를 쓰지 않습니다. 키는 한 사람당 하나. |
| "AI 응답 오류(402)" 또는 credits(사용 크레딧) 관련 문구 | 키를 만든 구글 클라우드 프로젝트가 선불 결제형입니다. | AI Studio에서 <strong>새 프로젝트</strong>로 키를 다시 만듭니다. '프로젝트 설정' → '스크립트 속성 수정'을 눌러 값을 새 키로 바꾸고 '스크립트 속성 저장'. |
| "AI 응답 오류(400)" 또는 (403) | 키가 틀렸거나 잘렸습니다. 403은 키가 막혔을 때(예: 유출 신고된 키)도 나옵니다. | 스크립트 속성 이름이 `GEMINI_API_KEY` 인지, 값 앞뒤에 빈칸이 없는지 봅니다. 키를 다시 복사해 '스크립트 속성 수정'으로 바꿔 넣습니다. 그래도 403이면 AI Studio에서 새 키를 만듭니다. |
| 여전히 "뼈대 초안 완성" | 앱이 키를 못 찾았습니다. | 속성 이름 철자, '스크립트 속성 저장'을 눌렀는지 확인합니다. 제미나이 코드를 쓴다면 기준 코드로 바꾸고 새 버전 배포. |
| 권한 승인 화면이 다시 나온다 | 코드가 새 권한을 씁니다. | 2강 '라' 9~13번처럼 허용합니다. 내가 만든 앱일 때만. |
| 앱 화면이 하얗다 | `index.html` 이 비었거나 저장되지 않았습니다. | `index.html` 내용 확인 → `Ctrl + S` → 새 버전 배포. |
| 고쳤는데 휴대폰 화면이 그대로 | 저장만 하고 새 버전 배포를 안 했습니다. | '배포 관리' → 연필 → '새 버전' → '배포' 후 새로고침. |
| URL이 바뀌었다 | '새 배포'를 눌렀습니다. | 새 URL을 쓰거나, '배포 관리'에서 원래 배포를 새 버전으로 고칩니다. 앞으로는 '배포 관리'만. |

### 기준 코드 (2강과 같습니다 — 되돌릴 때 쓰세요)

**`Code.gs`**

```javascript
/**
 * 사업계획서 자판기 — 교사 연수 기본과정 기준 코드
 * 구글 시트 > 확장 프로그램 > Apps Script 에 붙여 넣고 [배포 > 새 배포 > 웹 앱]
 * AI 키가 없어도 동작한다(뼈대만 채운 초안). 키는 코드가 아니라 [프로젝트 설정 > 스크립트 속성]에 GEMINI_API_KEY 로 넣는다.
 */
const MODEL = 'gemini-flash-lite-latest'; // 특정 버전 대신 최신 별칭: 모델이 종료돼도 코드가 멈추지 않는다
const SHEET = '기록';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('사업계획서 자판기')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 화면의 [초안 만들기] 단추가 부르는 함수
function makeDraft(f) {
  if (!f.title) throw new Error('사업명을 입력해 주세요.');
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const text = key ? askGemini(key, f) : skeleton(f);
  const doc = DocumentApp.create('[초안] ' + f.title + '_사업계획서');
  doc.getBody().setText(text);
  doc.saveAndClose();
  sheet().appendRow([new Date(), f.title, f.target, f.period, f.budget, key ? 'AI' : '뼈대', doc.getUrl()]);
  return { text: text, url: doc.getUrl(), ai: !!key };
}

// 화면 아래 '최근 기록' 목록
function recent() {
  const s = sheet();
  const n = Math.min(5, s.getLastRow() - 1);
  if (n < 1) return [];
  return s.getRange(s.getLastRow() - n + 1, 1, n, 7).getValues().reverse()
    .map(r => ({ when: Utilities.formatDate(r[0], 'Asia/Seoul', 'MM-dd HH:mm'), title: r[1], mode: r[5], url: r[6] }));
}

function askGemini(key, f) {
  const prompt = [
    '당신은 공립 중학교의 경험 많은 교무 기획 담당자입니다.',
    '아래 정보로 학교 사업계획서 초안을 공문서체(~함, ~임)로 쓰십시오.',
    '구성: Ⅰ. 추진 목적  Ⅱ. 기본 방침  Ⅲ. 세부 추진 계획(일정·프로그램·예산)  Ⅳ. 기대 효과',
    '모르는 숫자·날짜는 지어내지 말고 [ ] 로 비워 두십시오. 학생 개인정보는 쓰지 마십시오.',
    '', '사업명: ' + f.title, '대상: ' + f.target, '기간: ' + f.period, '예산: ' + f.budget, '메모: ' + f.memo
  ].join('\n');
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code === 429) throw new Error('무료 사용량을 잠시 넘었습니다. 1분 뒤 다시 눌러 주세요.');
  if (code !== 200) throw new Error('AI 응답 오류(' + code + '). 스크립트 속성의 키를 확인해 주세요.');
  return JSON.parse(res.getContentText()).candidates[0].content.parts[0].text;
}

// 키가 없을 때: 4대 뼈대에 입력값만 채운 초안
function skeleton(f) {
  return [
    f.title + ' 운영 계획(안)', '',
    'Ⅰ. 추진 목적', '  1. [교육적 필요성]', '  2. 메모: ' + (f.memo || '[ ]'), '',
    'Ⅱ. 기본 방침', '  1. [ ]', '  2. [ ]', '',
    'Ⅲ. 세부 추진 계획', '  가. 대상: ' + (f.target || '[ ]'), '  나. 기간: ' + (f.period || '[ ]'),
    '  다. 예산: ' + (f.budget || '[ ]'), '  라. 프로그램: [ ]', '',
    'Ⅳ. 기대 효과', '  1. [ ]'
  ].join('\n');
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) {
    s = ss.insertSheet(SHEET);
    s.appendRow(['시각', '사업명', '대상', '기간', '예산', '방식', '문서 링크']);
  }
  return s;
}
```

**`index.html`**

```html
<!DOCTYPE html>
<html>
<head>
<base target="_top">
<style>
  body { font-family: 'Malgun Gothic', sans-serif; max-width: 560px; margin: 0 auto; padding: 16px; background: #faf8f4; color: #1f2a44; }
  h1 { font-size: 22px; }
  label { display: block; margin-top: 10px; font-weight: bold; font-size: 14px; }
  input, textarea { width: 100%; box-sizing: border-box; padding: 9px; font-size: 15px; border: 1px solid #ccc; border-radius: 6px; }
  button { margin-top: 14px; width: 100%; padding: 13px; font-size: 16px; background: #1f2a44; color: #fff; border: 0; border-radius: 8px; }
  button:disabled { background: #999; }
  pre { white-space: pre-wrap; background: #fff; border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
  .muted { color: #666; font-size: 13px; }
</style>
</head>
<body>
  <h1>📄 사업계획서 자판기</h1>
  <p class="muted">몇 줄만 적으면 4대 뼈대 초안이 구글 문서로 만들어집니다. 학생 이름 등 개인정보는 적지 마세요.</p>

  <label>사업명</label><input id="title" placeholder="사제동행 텃밭 가꾸기">
  <label>대상</label><input id="target" placeholder="희망 학생 40명">
  <label>기간</label><input id="period" placeholder="2027년 1학기, 매주 수요일">
  <label>예산</label><input id="budget" placeholder="1,500,000원">
  <label>메모(아이디어)</label><textarea id="memo" rows="3" placeholder="생태 감수성, 수확물 나눔"></textarea>

  <button id="go" onclick="make()">초안 만들기</button>
  <p id="msg" class="muted"></p>
  <pre id="out" hidden></pre>

  <h3>최근 기록</h3>
  <ul id="list" class="muted"></ul>

<script>
  const ids = ['title', 'target', 'period', 'budget', 'memo'];

  function make() {
    const f = {};
    ids.forEach(id => f[id] = document.getElementById(id).value.trim());
    const btn = document.getElementById('go');
    btn.disabled = true;
    say('만드는 중입니다… (10초쯤)');
    google.script.run
      .withSuccessHandler(r => {
        btn.disabled = false;
        say((r.ai ? 'AI 초안' : '뼈대 초안') + ' 완성 · <a href="' + r.url + '">구글 문서 열기</a>');
        const out = document.getElementById('out');
        out.textContent = r.text;
        out.hidden = false;
        load();
      })
      .withFailureHandler(e => { btn.disabled = false; say('⚠ ' + e.message); })
      .makeDraft(f);
  }

  function say(h) { document.getElementById('msg').innerHTML = h; }

  // 입력한 글자는 textContent 로만 넣는다(글자 속 꺾쇠가 코드로 실행되지 않게)
  function load() {
    google.script.run.withSuccessHandler(rows => {
      const list = document.getElementById('list');
      list.textContent = rows.length ? '' : '아직 없음';
      rows.forEach(r => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = r.url;
        a.textContent = r.title;
        li.append(r.when + ' · ', a, ' (' + r.mode + ')');
        list.appendChild(li);
      });
    }).recent();
  }

  load();
</script>
</body>
</html>
```

## 오늘의 확인

- [ ] 프로젝트 설정의 '스크립트 속성'에 `GEMINI_API_KEY` 한 줄이 보인다(코드 안에는 키가 없다)
- [ ] '배포 관리' → '새 버전'으로 배포한 뒤에도 웹앱 URL이 2강과 같다
- [ ] 휴대폰에서 "AI 초안 완성" 메시지를 보았고, 문서가 공문서체 문장으로 채워져 있다
- [ ] 시트 '기록' 탭 '방식' 칸에 `AI` 가 적힌 줄이 있다
- [ ] 앱 화면에 '담당 부서' 칸이 생겼고, 그 값이 문서와 시트에 들어갔다

## 정리

오늘 윤서진 선생님의 자판기는 두 번 바뀌었습니다. 한 번은 서랍에 열쇠를 넣어서, 한 번은 말로 주문해서. 그동안 학생과 동료가 가진 URL은 한 번도 바뀌지 않았습니다.

바이브 코딩의 한 바퀴는 이렇습니다. 지금 코드를 보여 준다 → 하나만 고쳐 달라고 한다 → 붙여 넣고 저장한다 → 새 버전으로 배포한다 → 눈으로 확인한다. 이 바퀴를 작게, 자주 돌리는 사람이 앱을 키웁니다.

## 더 해 보기

- 같은 방법으로 하나만 더 고쳐 봅니다. 예: "초안 만들기 단추 색을 초록으로 바꿔 줘", "최근 기록을 5건에서 10건으로 늘려 줘". 고칠 때마다 새 버전과 확인.
- 동료 선생님에게 URL을 보내 써 보게 합니다. 동료가 만든 문서와 기록은 '나'로 실행되므로 <strong>내</strong> 드라이브와 시트에 쌓인다는 점을 함께 알려 줍니다(4강 안전 수칙 3).
