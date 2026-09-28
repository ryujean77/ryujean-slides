# 5강. 시스템 구축 ①: 프로젝트 구조와 AI 협업

유정근 · 마이웨이 아카데미 | C4 단일 강좌

## 오늘의 목표

AI 페어 프로그래밍으로 Inbox·지식저장소·산출물 폴더를 만들고 로컬 실행 확인

## 왜 이 단계가 필요한가

화면보다 폴더와 데이터의 경계를 먼저 만듭니다. 이 뼈대가 뒤의 16차시를 지탱합니다.

## 따라 하기

1. `my-automation` 폴더에 `index.html`, `app.js`, `style.css`, `README.md`를 만들도록 AI 코딩 도구에 요청합니다.
2. 브라우저에서 `index.html`을 열어 빈 Inbox·지식·업무·산출물 영역이 보이는지 확인합니다.
3. README에 `실제 개인정보 입력 금지`, `개인 작업용`을 적습니다.

## 첫 화면 최소 예시

아래 코드는 완성 앱이 아니라 네 영역이 열리는지 확인하는 시작점입니다. AI 코딩 도구를 쓰기 어려우면 `index.html`에 붙여 저장하고 더블클릭합니다.

```html
<!doctype html>
<html lang="ko">
<meta charset="utf-8">
<title>나의 자동화 실습</title>
<link rel="stylesheet" href="style.css">
<h1>나의 자동화 실습</h1>
<nav><a href="#inbox">Inbox</a> · <a href="#knowledge">지식</a> · <a href="#workflow">업무</a> · <a href="#outputs">산출물</a></nav>
<section id="inbox"><h2>Inbox</h2></section>
<section id="knowledge"><h2>지식</h2></section>
<section id="workflow"><h2>업무</h2></section>
<section id="outputs"><h2>산출물</h2></section>
<script src="app.js"></script>
</html>
```

`app.js`와 `style.css`는 빈 파일로 만들어도 됩니다. 다음 강에서 Inbox 기능을 붙입니다.


## AI에게 건네는 말

> 빈 로컬 웹앱의 뼈대만 만들어 줘. HTML/CSS/JavaScript만 사용하고 서버·외부 API·토큰은 쓰지 마. Inbox·지식·업무·산출물 네 영역의 제목만 만들고, 파일을 열면 바로 보이게 해 줘. 기존 파일을 덮기 전 변경 목록을 보여 줘.

AI의 완료 보고만 믿지 말고 화면·파일·저장 결과를 직접 확인합니다.

## 완료 확인

- [ ] 네 영역이 보이는 첫 화면이 열린다
- [ ] 사용한 파일과 실행 방법이 README에 있다

이 과정의 예시 자료는 모두 학습용 가상 자료입니다. 실제 고객 기록·연락처·비밀번호를 공개 AI나 시연본에 넣지 않습니다.
