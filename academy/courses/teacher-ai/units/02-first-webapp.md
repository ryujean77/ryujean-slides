# 2강. 무료 제미나이에게 웹앱 주문하고 배포하기

유정근 · 마이웨이 아카데미 | T1 교사 연수 · 기본

## 오늘의 목표

무료 제미나이에게 주문서를 건네 "사업계획서 자판기" 코드를 받고, 구글 시트의 Apps Script에 붙여 넣어 배포합니다. 마지막에 내 휴대폰에서 그 앱을 열어 첫 초안을 만들어 봅니다. 이번 강의에서는 AI 키 없이, 4대 뼈대만 채운 초안을 만듭니다.

## 오늘 손에 남는 것

- <strong>내 웹앱 URL</strong> 하나(`https://script.google.com/macros/s/…/exec` 모양). 휴대폰에서 열립니다.
- 구글 드라이브에 생긴 <strong>첫 사업계획서 초안 문서</strong>
- 시트 '기록' 탭에 쌓인 <strong>첫 기록 한 줄</strong>

## 준비물

- PC와 크롬, 개인 구글 계정(1강에서 로그인해 둔 계정)
- 1강에서 열어 둔 제미나이 탭
- 휴대폰(카카오톡 또는 Gmail 앱, 크롬)

## 먼저 이해하기

오늘 만드는 앱은 파일 두 개로 이루어집니다.

> **Code.gs** — 부엌. 보이지 않는 곳에서 문서를 만들고 시트에 기록합니다. 구글 서버에서 돌아갑니다.

> **index.html** — 가게 앞 진열대. 입력칸과 단추가 있는 화면입니다. 휴대폰에 보이는 부분입니다.

주문서에서 가장 중요한 한 줄은 "파일을 딱 두 개, Code.gs와 index.html로 나눠 달라"입니다. 제미나이의 답은 물을 때마다 조금씩 다릅니다. 그래서 오늘은 두 가지만 확인합니다. 코드가 두 개로 나뉘었는가, 그리고 붙여 넣고 배포했을 때 화면이 뜨는가. 안 되면 이 카드 아래쪽의 <strong>기준 코드</strong>로 바꿔 붙입니다. 실패해도 진도는 멈추지 않습니다.

4대 뼈대는 학교 사업계획서의 기본 틀입니다. Ⅰ. 추진 목적 Ⅱ. 기본 방침 Ⅲ. 세부 추진 계획 Ⅳ. 기대 효과. 오늘 앱은 이 틀에 입력값을 채우고, 모르는 칸은 `[ ]` 로 비워 둡니다. 백지보다 빈칸이 있는 틀이 훨씬 빨리 채워집니다.

## 따라 하기

**가. 개인 계정 확인하고 시트 만들기** (약 5분)

1. PC 크롬에서 새 탭을 열고 주소창에 `https://sheets.google.com` 을 입력해 `Enter` 를 누릅니다.
2. 화면 오른쪽 위 동그란 프로필 사진을 눌러 개인 gmail 계정인지 확인합니다.
   ✖ 이렇게 보이면: 학교 계정이면 같은 자리에서 개인 계정으로 바꿉니다. 학교 계정은 관리자 설정 때문에 뒤에서 배포나 권한 승인이 막힐 수 있습니다.
3. 화면 위쪽 '새 스프레드시트 시작하기' 줄에서 '빈 스프레드시트'(큰 + 모양 칸)를 누릅니다.
   → 이렇게 보이면 됩니다: 빈 칸이 가득한 새 시트가 열리고, 왼쪽 위에 '제목 없는 스프레드시트'라고 적혀 있습니다.
4. 왼쪽 위 '제목 없는 스프레드시트' 글자를 누르고 `사업계획서 자판기` 라고 고친 뒤 `Enter` 를 누릅니다.
5. 시트 위쪽 메뉴에서 '확장 프로그램'을 누르고, 펼쳐진 목록에서 'Apps Script'를 누릅니다.
   → 이렇게 보이면 됩니다: 새 탭에 Apps Script 편집기가 열립니다. 왼쪽 '파일' 아래에 `Code.gs` 가 있고, 가운데에 `function myFunction() {` 으로 시작하는 짧은 글이 보입니다.
6. 편집기 맨 위의 프로젝트 이름(처음에는 '제목 없는 프로젝트')을 누르고 `사업계획서 자판기` 로 바꾼 뒤 '이름 바꾸기'를 누릅니다. 이 이름은 뒤의 권한 승인 화면에 나타납니다. (화면의 글자는 버전에 따라 조금 다를 수 있습니다.)

이 편집기 탭은 열어 두고, 제미나이 탭으로 갑니다.

**나. 무료 제미나이에 주문서 넣기** (약 8분)

> **어디에 입력하나요:** PC에서 크롬을 열고 주소창에 `https://gemini.google.com` 을 입력해 들어갑니다. 구글 계정으로 로그인돼 있으면 화면 아래쪽에 글을 쓰는 입력칸이 보입니다. 그 칸을 한 번 누르고, 아래 글을 복사(`Ctrl + C`)해 붙여 넣은(`Ctrl + V`) 뒤 `Enter` 를 누르거나 오른쪽의 보내기(제출) 버튼을 누르세요. (여러 줄을 쓸 때는 `Enter` 대신 `Shift + Enter` 로 줄을 바꿉니다 — `Enter` 만 누르면 바로 보내집니다.) 답이 위쪽에 나타나면 끝까지 읽고, 모르는 말이 있으면 "○○가 무슨 뜻이야?" 라고 이어서 물으면 됩니다.

1. 제미나이 화면 왼쪽 위의 '새 채팅'을 눌러 깨끗한 대화에서 시작합니다(1강의 시험 대화와 섞이지 않게).
2. 아래 주문서 전체를 복사해 입력칸에 붙여 넣고 보냅니다. 붙여 넣기는 여러 줄이어도 바로 보내지지 않으니 안심하세요.

```text
너는 코딩을 전혀 모르는 중학교 교사를 돕는 Google Apps Script 개발자야.
구글 시트에 연결된 Apps Script 웹앱 '사업계획서 자판기'를 만들어 줘.

[파일] 딱 두 개만 만들어 줘: Code.gs 와 index.html.
각 파일 전체를 따로따로 코드 블록 하나씩으로 보여 줘. 줄이거나 생략하지 마.
다른 파일, 외부 라이브러리, 유료 서비스는 쓰지 마.

[화면 index.html]
- 입력칸 5개: 사업명, 대상, 기간, 예산, 메모(여러 줄)
- 그 아래 '초안 만들기' 단추 하나
- 휴대폰에서 보기 좋게: 한 줄에 칸 하나, 큰 글씨, 화면 폭에 맞는 큰 단추
- 단추를 누르면 '만드는 중' 표시, 끝나면 '완성' 메시지와 구글 문서 링크
- 화면 맨 아래에 '최근 기록' 5건(시각, 사업명, 문서 링크)

[동작 Code.gs]
1. AI는 쓰지 마. 입력값으로 사업계획서 초안 글을 만든다.
   틀은 'Ⅰ. 추진 목적 / Ⅱ. 기본 방침 / Ⅲ. 세부 추진 계획 / Ⅳ. 기대 효과' 4대 뼈대이고,
   입력값을 알맞은 자리에 채우고 모르는 칸은 [ ] 로 비워 둔다.
2. 그 글로 새 구글 문서를 만든다. 문서 이름은 '[초안] 사업명_사업계획서'.
3. 이 스프레드시트의 '기록' 시트(없으면 새로 만들고 첫 줄에 제목)에
   시각, 사업명, 대상, 기간, 예산, 문서 링크를 한 줄 추가한다.
4. 사업명이 비어 있으면 '사업명을 입력해 주세요.' 를 화면에 보여 준다.
5. 웹앱 진입 함수 doGet 은 index.html 파일을 보여 준다.

[설명] 코드 뒤에, 초보자가 시트의 Apps Script에 붙여 넣고 웹 앱으로 배포하는 순서를 다섯 줄 이내로 알려 줘.
```

3. 답이 다 나올 때까지 기다립니다(수십 초 걸릴 수 있습니다).
   → 이렇게 보이면 됩니다: 회색이나 검은 바탕의 코드 상자가 두 개 나옵니다. 상자 위나 바로 앞 문장에 `Code.gs`, `index.html` 이라는 이름이 붙어 있습니다.
4. 답을 읽는 법: 코드 내용을 이해할 필요는 없습니다. 아래 세 가지만 봅니다.
   - 코드 상자가 <strong>두 개</strong>인가
   - 하나는 `function doGet` 이 들어 있는 `Code.gs`, 하나는 `<html` 로 시작하는 `index.html` 인가
   - 상자 오른쪽 위(또는 아래)에 복사 모양 아이콘(겹친 네모 두 개)이 있는가 — 이 아이콘을 누르면 상자 안 코드 전체가 한 번에 복사됩니다
   ✖ 이렇게 보이면: 코드가 한 상자에 섞여 있거나 중간에 "...생략..." 이 있으면, 입력칸에 "Code.gs 와 index.html 을 각각 전체 코드로, 생략 없이 다시 보여 줘" 라고 보냅니다.
   ✖ 화면 오른쪽에 넓은 창(Canvas, 캔버스: 코드를 옆 창에 펼쳐 보여 주는 기능)이 열리면, 그 창 안에서 파일을 하나씩 열어 복사합니다.

**다. Apps Script에 붙여 넣고 저장하기** (약 8분)

Code.gs부터 붙입니다.

1. 제미나이 답에서 `Code.gs` 상자의 복사 아이콘을 누릅니다.
2. Apps Script 편집기 탭으로 갑니다. 왼쪽 '파일' 아래 `Code.gs` 가 선택돼 있는지 봅니다.
3. 가운데 글쓰기 영역을 한 번 누르고 `Ctrl + A`(전체 선택)를 누릅니다. `function myFunction()` 이 파랗게 선택됩니다.
4. `Ctrl + V` 로 붙여 넣습니다. 원래 있던 글은 지워지고 제미나이의 코드로 바뀝니다.
   → 이렇게 보이면 됩니다: 가운데가 제미나이 코드로 가득 차고, 맨 위에 `myFunction` 이 더 이상 없습니다.

이제 index.html 파일을 새로 만듭니다.

5. 편집기 왼쪽 '파일' 글자 오른쪽의 '+' 를 누릅니다.
6. 펼쳐진 목록에서 'HTML'을 누릅니다.
7. 이름 칸이 나타나면 `index` 라고만 적고 `Enter` 를 누릅니다. `.html` 은 자동으로 붙습니다.
   → 이렇게 보이면 됩니다: 왼쪽 목록에 `index.html` 이 생기고, 가운데에 `<!DOCTYPE html>` 로 시작하는 기본 글이 보입니다.
   ✖ 이렇게 보이면: `index.html.html` 이나 `Index.html` 처럼 이름이 다르면, 파일 이름 옆 점 세 개 → '이름 바꾸기'로 `index` 로 고칩니다. 이름이 한 글자라도 다르면 앱 화면이 뜨지 않습니다.
8. 제미나이 탭으로 돌아가 `index.html` 상자의 복사 아이콘을 누릅니다.
9. 편집기에서 `index.html` 이 선택된 상태로, 가운데를 누르고 `Ctrl + A` → `Ctrl + V` 로 바꿔 붙입니다.
10. 저장합니다. `Ctrl + S` 를 누르거나, 편집기 위쪽 줄의 디스크 모양 아이콘('프로젝트 저장')을 누릅니다.
    → 이렇게 보이면 됩니다: 파일 이름 옆의 저장 안 됨 표시(작은 점)가 사라집니다. 표시가 원래 없었다면 오류 문구가 없는지만 봅니다.
11. 왼쪽에서 `Code.gs` 를 눌러 같은 방법으로 한 번 더 저장되었는지 확인합니다.

**라. 웹 앱으로 배포하고 권한 승인하기** (약 10분)

배포는 "자판기를 거리에 내놓는 일"입니다. 배포하면 누구에게 보낼 수 있는 주소가 생깁니다.

1. 편집기 오른쪽 위의 파란 '배포' 단추를 누릅니다.
2. 펼쳐진 목록에서 '새 배포'를 누릅니다.
3. 새 창 왼쪽 위 '유형 선택' 옆의 톱니바퀴 모양을 누르고, '웹 앱'을 고릅니다.
   → 이렇게 보이면 됩니다: 오른쪽에 '설명', '다음 사용자 인증 정보로 실행', '액세스 권한이 있는 사용자' 칸이 나타납니다.
4. '설명' 칸에 `첫 배포` 라고 적습니다.
5. '다음 사용자 인증 정보로 실행'은 '나'(내 gmail 주소)로 둡니다. 앱이 내 이름으로 문서를 만들고 내 시트에 적는다는 뜻입니다.
6. '액세스 권한이 있는 사용자'를 고릅니다.
   - 연수에서는 'Google 계정이 있는 모든 사용자'를 권장합니다. 휴대폰 크롬이 다른 구글 계정으로 로그인돼 있어도 열 수 있습니다.
   - 나 혼자 쓰는 앱이면 '나만'을 고릅니다.
   - '모든 사용자'(로그인 없이 누구나)는 고르지 않습니다. 학교 계정에서는 아예 보이지 않을 수도 있습니다.
7. 오른쪽 아래 '배포'를 누릅니다.
8. 승인이 필요하다는 안내와 함께 '액세스 승인' 단추가 나오면 누릅니다.

이제 권한 승인 화면이 이어집니다. 처음 한 번만 나옵니다.

9. 계정을 고르는 창이 뜨면 내 개인 gmail 계정을 누릅니다.
10. "Google에서 확인하지 않은 앱" 이라는 경고 화면이 나옵니다. 놀라지 마세요. 내가 방금 만든 앱이라 구글이 아직 심사하지 않았다는 뜻입니다.
11. 화면 왼쪽 아래의 '고급'을 누릅니다.
12. 아래에 나타난 '사업계획서 자판기(으)로 이동(안전하지 않음)'을 누릅니다.
13. 이 앱이 내 스프레드시트·문서에 접근하겠다는 목록이 나오면 맨 아래 '허용'을 누릅니다.
    ✖ 영어 화면이면: 'Review permissions' → 'Advanced' → 'Go to 사업계획서 자판기 (unsafe)' → 'Allow' 순서입니다.

> **이 경고, 눌러도 되나요?** 이 질문은 "내가 만든 앱이 내 시트와 내 문서를 만들고 고쳐도 되느냐"입니다. 내가 만들고 내가 배포한 앱이므로 허용합니다. 반대로 <strong>남이 보낸 앱</strong>에서 이 화면이 나오면 누르지 않습니다. 권한은 그 앱을 만든 사람에게 내 계정을 여는 일이기 때문입니다.

14. 승인이 끝나면 배포 완료 창이 나옵니다. '웹 앱' 아래에 `https://script.google.com/macros/s/` 로 시작해 `/exec` 로 끝나는 긴 주소가 있습니다.
15. 그 주소 옆 '복사'를 누릅니다. 이것이 오늘의 <strong>내 웹앱 URL</strong>입니다.
16. 이 URL을 크롬 새 탭 주소창에 붙여 넣고 `Enter` 를 눌러 PC에서 먼저 열어 봅니다.
    → 이렇게 보이면 됩니다: 위쪽에 "📄 사업계획서 자판기" 같은 제목, 입력칸 5개, '초안 만들기' 단추가 보입니다.
    ✖ 하얀 화면만 보이면: '막히면' 표를 봅니다.

**마. 휴대폰에서 열고 첫 초안 만들기** (약 9분)

URL을 휴대폰으로 보냅니다. 편한 방법 하나를 고르세요.

- <strong>카카오톡</strong>: PC 카카오톡에서 '나와의 채팅'을 열고 URL을 붙여 넣어 보냅니다. 휴대폰 카카오톡의 '나와의 채팅'에서 그 링크를 누릅니다.
- <strong>QR 코드</strong>: PC 크롬에서 앱을 연 탭의 주소창 오른쪽 공유 아이콘 → 'QR 코드 만들기'를 누릅니다. 휴대폰 카메라로 화면의 QR 코드를 비추고, 뜨는 링크를 누릅니다.
- <strong>메일</strong>: 내 gmail로 URL을 보내고 휴대폰 Gmail 앱에서 엽니다.

1. 휴대폰에서 링크를 엽니다.
   ✖ 구글 로그인 화면이 나오면: 아무 구글 계정으로 로그인합니다('Google 계정이 있는 모든 사용자'로 배포했기 때문입니다).
   ✖ 카카오톡 안의 브라우저에서 화면이 이상하면: 오른쪽 위 점 세 개 → 다른 브라우저(크롬)로 열기.
2. 입력칸을 채웁니다. 예시:
   - 사업명: `사제동행 텃밭 가꾸기`
   - 대상: `희망 학생 40명`
   - 기간: `2027년 1학기, 매주 수요일`
   - 예산: `1,500,000원`
   - 메모: `생태 감수성, 수확물 나눔`
3. '초안 만들기'를 누르고 10초쯤 기다립니다.
   → 이렇게 보이면 됩니다: "뼈대 초안 완성 · 구글 문서 열기" 메시지와 그 아래 초안 글이 나타납니다. 맨 아래 '최근 기록'에 방금 만든 사업명이 한 줄 생깁니다. (제미나이가 만든 코드라면 문구는 조금 다를 수 있습니다.)
4. '구글 문서 열기'를 누릅니다. "[초안] 사제동행 텃밭 가꾸기_사업계획서" 문서가 열리고 Ⅰ~Ⅳ 뼈대가 보입니다.
5. PC로 돌아가 시트 탭을 봅니다. 화면 맨 아래 탭 줄에 '기록' 탭이 생겼습니다. 눌러 보면 2행에 시각·사업명·대상·기간·예산과 문서 링크가 적혀 있습니다.
   → 이렇게 보이면 됩니다: '기록' 탭 2행에 방금 입력한 내용이 한 줄.

여기까지 왔다면 오늘의 와우 포인트를 이미 손에 쥐었습니다. 휴대폰 홈 화면에 이 링크를 바로가기로 추가해 두면 앱처럼 쓸 수 있습니다.

## 막히면 — 이 기준 코드로 바꿔 붙이세요

제미나이 코드로 오류가 나거나 화면이 안 뜨면, 고치느라 시간을 쓰지 말고 아래 기준 코드로 바꿉니다. 실제 구글 계정에서 배포와 동작을 확인한 코드입니다. AI 키가 없으면 뼈대 초안을, 3강에서 키를 넣으면 AI 초안을 만듭니다.

1. 편집기에서 `Code.gs` 를 누르고 `Ctrl + A` → 아래 첫 번째 코드 붙여 넣기.
2. `index.html` 을 누르고 `Ctrl + A` → 아래 두 번째 코드 붙여 넣기.
3. `Ctrl + S` 로 저장.
4. 이미 한 번 배포했다면 '배포' → '배포 관리' → 연필 모양 → 버전 '새 버전' → '배포'(URL이 그대로 유지됩니다. 자세한 것은 3강). 아직 배포 전이면 위 '라' 단계를 그대로 합니다.
5. 권한 화면이 다시 나오면 '라'의 9~13번처럼 허용합니다.

**기준 코드 1 — `Code.gs`**

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

**기준 코드 2 — `index.html`**

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

### 증상별 대처

| 증상 | 원인과 해결 |
|---|---|
| 앱 주소를 열면 화면이 하얗다 | `index.html` 에 코드를 붙여 넣지 않았거나 저장하지 않았습니다. `index.html` 을 열어 내용이 있는지 보고 `Ctrl + S` 후 새 버전으로 배포합니다. |
| "함수를 찾을 수 없음" 또는 파일을 찾을 수 없다는 오류 | HTML 파일 이름이 `index` 가 아닙니다. 왼쪽 목록에서 이름을 `index` 로 고칩니다. |
| '초안 만들기'를 눌러도 아무 일이 없다 | 제미나이 코드의 함수 이름이 화면과 맞지 않을 수 있습니다. 기준 코드로 바꿔 붙입니다. |
| "사업명을 입력해 주세요." | 정상입니다. 사업명 칸을 채웁니다. |
| 배포 창에 '웹 앱'이 없다 | '유형 선택' 옆 톱니바퀴를 눌렀는지 확인합니다. |
| 권한 승인 중 "관리자가 차단" 같은 문구 | 학교 계정입니다. 개인 계정으로 시트를 새로 만들어 처음부터 합니다. |
| 휴대폰에서 "권한이 없습니다" | 배포할 때 '나만'을 골랐는데 휴대폰이 다른 계정입니다. 휴대폰에서 같은 계정으로 로그인하거나, '배포 관리'에서 접근 권한을 'Google 계정이 있는 모든 사용자'로 바꿉니다. |
| 코드를 고쳤는데 휴대폰 화면이 그대로다 | 저장만 하고 새 버전으로 배포하지 않았습니다. 3강 '다'를 봅니다. |

## 오늘의 확인

- [ ] Apps Script 왼쪽 목록에 `Code.gs` 와 `index.html` 두 파일이 있다
- [ ] `https://script.google.com/macros/s/…/exec` 모양의 내 웹앱 URL을 복사해 두었다
- [ ] 내 휴대폰에서 그 URL을 열어 '초안 만들기'를 눌렀고 "뼈대 초안 완성" 메시지를 보았다
- [ ] 구글 드라이브에 "[초안] …_사업계획서" 문서가 생겼다
- [ ] 시트 '기록' 탭 2행에 방금 입력한 내용이 한 줄 쌓였다

## 정리

윤서진 선생님이 한 일은 세 가지입니다. 주문서를 썼고, 받은 코드를 두 파일에 붙였고, '배포'를 눌렀습니다. 코드는 한 줄도 직접 쓰지 않았습니다. 주문서가 정확하면 코드는 따라옵니다. 그리고 제미나이의 답이 흔들릴 때를 대비해 기준 코드라는 안전망을 늘 옆에 둡니다.

3강에서는 이 자판기 안에 AI를 넣습니다. 같은 URL을 그대로 쓰면서, 뼈대만 있던 초안이 문장으로 채워진 초안으로 바뀝니다.
