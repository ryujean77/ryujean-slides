/* 마이웨이 아카데미 공통 내비게이션 */
(function () {
  "use strict";

  const header = document.querySelector(".site-head");
  if (!header) return;
  const page = document.body.dataset.page;
  const links = [
    ["courses", "강의", "index.html#courses"],
    ["roadmaps", "로드맵", "roadmaps.html"],
    ["challenges", "챌린지", "challenges.html"],
    ["community", "커뮤니티", "course.html?c=computer-basics#community"],
    ["my", "내 학습", "my.html"],
  ];
  header.innerHTML = `<div class="wrap nav-wrap">
    <a class="brand" href="index.html" aria-label="마이웨이 아카데미 홈">
      <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><path d="M2 29V13a11 11 0 0 1 22 0v16" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 29V16a5 5 0 0 1 10 0v13" fill="var(--gold)"/></svg>
      <span>마이웨이 아카데미</span>
    </a>
    <button class="nav-toggle" type="button" aria-controls="site-menu" aria-expanded="false">메뉴</button>
    <nav class="site-nav" id="site-menu" aria-label="주 메뉴">${links.map(([key, label, href]) => `<a data-nav="${key}" href="${href}">${label}</a>`).join("")}</nav>
  </div>${page === "lesson" ? '<div class="wrap lesson-context"><p class="crumb" id="crumb"></p><p class="prog"><span id="prog-bar"></span><span class="num" id="prog-text"></span></p></div>' : ""}`;

  const menu = header.querySelector("#site-menu");
  const toggle = header.querySelector(".nav-toggle");
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
  }
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("open", open);
  });
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(); toggle.focus();
    }
  });
  document.addEventListener("click", (event) => { if (!header.contains(event.target)) closeMenu(); });

  function markCurrent(panelId) {
    const active = page === "roadmaps" || page === "challenges" ? page
      : page === "my" || page === "certificate" ? "my"
      : page === "course" && (panelId === "tab-community" || (!panelId && location.hash === "#community")) ? "community" : "courses";
    menu.querySelectorAll("a").forEach((link) => {
      if (link.dataset.nav === active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }
  markCurrent();
  addEventListener("hashchange", () => markCurrent());
  document.addEventListener("academy:course-tab", (event) => markCurrent(event.detail && event.detail.panelId));

  fetch("catalog.json", { cache: "no-cache" }).then((response) => {
    if (!response.ok) throw new Error("catalog unavailable");
    return response.json();
  }).then((catalog) => {
    let mostRecent = { id: "computer-basics", lastAt: 0 };
    for (const course of catalog.courses || []) {
      try {
        const saved = JSON.parse(localStorage.getItem("myway:" + course.id) || "{}");
        const lastAt = Number(saved && saved.lastAt) || 0;
        if (lastAt > mostRecent.lastAt) mostRecent = { id: course.id, lastAt };
      } catch (_) { /* 저장 차단 또는 손상: 기본 강의 사용 */ }
    }
    menu.querySelector('[data-nav="community"]').href = `course.html?c=${encodeURIComponent(mostRecent.id)}#community`;
  }).catch(() => { /* 목록을 읽지 못하면 기본 강의 링크 유지 */ });
})();
