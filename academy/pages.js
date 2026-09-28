/* F6–F9 pages. Read-only compatibility with app.js: myway:<course id>.
   This file writes only myway:profile for the certificate display name. */
(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const courseUrl = (id) => `course.html?c=${encodeURIComponent(id)}`;
  const lessonUrl = (id, unit) => `lesson.html?c=${encodeURIComponent(id)}&u=${encodeURIComponent(unit)}`;
  const certUrl = (id) => `certificate.html?c=${encodeURIComponent(id)}`;
  let storageAvailable = true;
  try { localStorage.getItem("myway:profile"); } catch (_) { storageAvailable = false; }

  function readStored(key) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? null : JSON.parse(value);
    } catch (_) {
      storageAvailable = false;
      return null;
    }
  }

  function state(id) {
    const raw = readStored(`myway:${id}`);
    const data = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    return {
      done: data.done && typeof data.done === "object" ? data.done : {},
      time: data.time && typeof data.time === "object" ? data.time : {},
      notes: data.notes && typeof data.notes === "object" ? data.notes : {},
      log: Array.isArray(data.log) ? data.log : [],
      last: typeof data.last === "string" ? data.last : null,
      lastAt: Number(data.lastAt) || 0,
    };
  }

  async function getJson(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  }

  async function loadCatalog() {
    const catalog = await getJson("catalog.json");
    if (!Array.isArray(catalog.courses)) throw new Error("강의 목록 형식 오류");
    const courses = await Promise.all(catalog.courses.map(async (entry) => {
      const course = await getJson(`courses/${encodeURIComponent(entry.id)}/course.json`);
      const units = (course.sections || []).flatMap((section) => section.units || []);
      return { ...course, entry, id: entry.id, units };
    }));
    return { catalog, courses, byId: Object.fromEntries(courses.map((course) => [course.id, course])) };
  }

  function progress(course) {
    const saved = state(course.id);
    const total = course.units.length;
    const completed = course.units.filter((unit) => !!saved.done[unit.id]).length;
    return { ...saved, total, completed, percent: total ? Math.round(completed * 100 / total) : 0 };
  }

  function progressBar(percent, label) {
    return `<div class="bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></div>`;
  }

  function noticeStorage() {
    if (storageAvailable) return;
    const notice = document.createElement("div");
    notice.className = "notice";
    notice.setAttribute("role", "status");
    notice.innerHTML = '<div class="wrap">이 브라우저는 저장을 허용하지 않습니다. 기존 학습 기록과 수료증 이름을 불러오거나 저장할 수 없습니다.</div>';
    $(".site-head").after(notice);
  }

  function setContent(markup) {
    const root = $("#page-content");
    root.removeAttribute("role");
    root.removeAttribute("aria-live");
    root.innerHTML = markup;
  }

  function errorPage(error) {
    console.error(error);
    setContent('<div class="panel-msg" role="alert"><h1>내용을 불러오지 못했습니다</h1><p class="muted">연결을 확인한 뒤 새로고침해 주세요.</p><button type="button" class="btn" id="retry-page">다시 시도</button></div>');
    $("#retry-page").addEventListener("click", () => location.reload());
  }

  function roadmapsPage(data) {
    const { catalog, byId } = data;
    const cards = (catalog.roadmaps || []).map((roadmap, index) => {
      const steps = (roadmap.steps || []).map((id) => byId[id]).filter(Boolean);
      const count = steps.reduce((sum, course) => sum + course.units.length, 0);
      const completed = steps.reduce((sum, course) => sum + progress(course).completed, 0);
      const percent = count ? Math.round(completed * 100 / count) : 0;
      return `<article class="pages-card roadmap-card">
        <p class="eyebrow">로드맵 ${index + 1}</p><h2>${esc(roadmap.title)}</h2>
        <p class="muted">${steps.length}개 강의 · ${count}개 수업</p>
        <div class="pages-progress">${progressBar(percent, `${roadmap.title} 진도`)}<span class="num">내 진도 ${completed}/${count} · ${percent}%</span></div>
        <ol class="pages-steps">${steps.map((course, stepIndex) => {
          const p = progress(course);
          return `<li><span class="pages-step-code">${esc(course.entry.code || stepIndex + 1)}</span><div><h3><a href="${courseUrl(course.id)}">${esc(course.title)}</a></h3><p>${esc(course.entry.promise || course.tagline || "")}</p><small class="num">${p.completed}/${p.total} 수업 완료 · ${p.percent}%</small></div></li>`;
        }).join("")}</ol>
      </article>`;
    }).join("");
    const tracks = (catalog.tracks || []).map((track) => `<article class="pages-card track-card"><p class="eyebrow">기관 과정</p><h3>${esc(track.title)}</h3><p class="track-path">${esc(track.path)}</p><p class="muted">${esc(track.note)}</p></article>`).join("");
    setContent(`${cards || '<p class="pages-empty">등록된 로드맵이 없습니다.</p>'}<section class="pages-section" aria-labelledby="tracks-heading"><div class="pages-section-head"><div><p class="eyebrow">대상에 맞춘 경로</p><h2 id="tracks-heading">기관 과정</h2></div><p>교육 대상에 따라 수업의 순서와 실습을 조정합니다.</p></div><div class="track-grid">${tracks || '<p class="pages-empty">등록된 기관 과정이 없습니다.</p>'}</div></section>`);
  }

  const challengeFilters = ["전체", "모집 중", "진행 중", "종료", "무료", "라이브"];
  function safeApplicationUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch (_) { return ""; }
  }

  function challengeAction(challenge) {
    const url = safeApplicationUrl(challenge.applicationUrl);
    if (url && !["종료", "진행 중"].includes(challenge.status)) return `<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener noreferrer">신청하기 <span class="visually-hidden">(새 창)</span></a>`;
    if (challenge.application && challenge.application.includes("비공개 초대")) return '<span class="muted">비공개 초대 · 신청 링크 없음</span>';
    if (challenge.status === "종료") return '<span class="muted">종료된 과정</span>';
    return '<span class="pages-alert-label">오픈 알림</span>';
  }

  function challengesPage() {
    getJson("data/challenges.json").then((challenges) => {
      if (!Array.isArray(challenges)) throw new Error("챌린지 목록 형식 오류");
      const featured = challenges.find((item) => ["모집 중", "모집 예정"].includes(item.status) &&!String(item.application || "").includes("비공개 초대"));
      setContent(`${featured ? `<aside class="pages-feature" aria-label="곧 열리는 과정"><p class="eyebrow">곧 열립니다</p><h2>${esc(featured.title)}</h2><p>${esc(featured.date)} · ${esc(featured.fee)}</p><button type="button" class="btn ghost small" data-challenge="${esc(featured.id)}">자세히 보기</button></aside>` : ""}
        <div class="pages-section-head"><div><p class="eyebrow">라이브 과정</p><h2>모든 챌린지</h2></div><p>신청 링크와 남은 자리는 운영자가 확인해 올립니다.</p></div>
        <div class="filters" id="challenge-filters" role="group" aria-label="챌린지 필터">${challengeFilters.map((name, index) => `<button type="button" class="chip" data-filter="${esc(name)}" aria-pressed="${index === 0}">${esc(name)}</button>`).join("")}</div>
        <div id="challenge-list" class="challenge-grid" aria-live="polite"></div>`);
      let selected = "전체";
      function render() {
        const filtered = challenges.filter((item) => selected === "전체" || (selected === "무료" && item.fee === "무료") || (selected === "라이브" && /실시간|라이브/.test(item.format || "")) || item.status === selected);
        $("#challenge-list").innerHTML = filtered.length ? filtered.map((item) => `<article class="pages-card challenge-card"><div class="pages-card-top"><span class="badge">${esc(item.status)}</span>${item.remaining ? `<span class="muted">${esc(item.remaining)}</span>` : ""}</div><h3>${esc(item.title)}</h3><p>${esc(item.summary || "")}</p><dl class="pages-facts"><dt>일시</dt><dd>${esc(item.date)}</dd><dt>방식</dt><dd>${esc(item.format)}</dd><dt>정원</dt><dd>${esc(item.capacity)}</dd><dt>수강료</dt><dd>${esc(item.fee)}</dd></dl><div class="pages-card-actions"><button type="button" class="btn ghost small" data-challenge="${esc(item.id)}">상세 보기</button>${challengeAction(item)}</div></article>`).join("") : `<p class="pages-empty">${esc(selected)} 조건에 맞는 과정이 없습니다.</p>`;
      }
      $("#challenge-filters").addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");
        if (!button) return;
        selected = button.dataset.filter;
        $$("[data-filter]", $("#challenge-filters")).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        render();
      });
      render();
      setupChallengeDialog(challenges);
    }).catch(errorPage);
  }

  function setupChallengeDialog(challenges) {
    const backdrop = $("#challenge-modal");
    const dialog = $(".pages-modal", backdrop);
    const close = $("#challenge-close");
    let returnFocus = null;
    function hide() {
      backdrop.hidden = true;
      document.body.classList.remove("modal-open");
      $("#main").inert = false;
      $(".site-head").inert = false;
      $(".site-foot").inert = false;
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    }
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-challenge]");
      if (!button) return;
      const item = challenges.find((challenge) => challenge.id === button.dataset.challenge);
      if (!item) return;
      returnFocus = button;
      $("#challenge-detail").innerHTML = `<p class="eyebrow">${esc(item.status)}</p><h2 id="challenge-modal-title">${esc(item.title)}</h2><p>${esc(item.summary || "")}</p><dl class="pages-facts"><dt>일시</dt><dd>${esc(item.date)}</dd><dt>방식</dt><dd>${esc(item.format)}</dd><dt>정원</dt><dd>${esc(item.capacity)}</dd><dt>수강료</dt><dd>${esc(item.fee)}</dd>${item.remaining ? `<dt>남은 자리</dt><dd>${esc(item.remaining)}</dd>` : ""}</dl><h3>과정 내용</h3><ul>${(item.details || []).map((detail) => `<li>${esc(detail)}</li>`).join("")}</ul><div class="pages-modal-action">${challengeAction(item)}${!safeApplicationUrl(item.applicationUrl) && !String(item.application || "").includes("비공개 초대") ? '<p class="muted">아직 알림 신청을 받지 않습니다. 신청 링크가 열리면 이 페이지에 안내합니다.</p>' : ""}</div>`;
      backdrop.hidden = false;
      document.body.classList.add("modal-open");
      $("#main").inert = true;
      $(".site-head").inert = true;
      $(".site-foot").inert = true;
      close.focus();
    });
    close.addEventListener("click", hide);
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) hide(); });
    backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { hide(); return; }
      if (event.key !== "Tab") return;
      const focusable = $$('button:not([disabled]),a[href],input:not([disabled])', dialog);
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function setupTabs(list) {
    const tabs = $$('[role="tab"]', list);
    function show(tab, moveFocus) {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        panel.hidden = !active;
      });
      if (moveFocus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => show(tab, false));
      tab.addEventListener("keydown", (event) => {
        const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        show(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
  }

  function allNotes(courses) {
    return courses.flatMap((course) => {
      const notes = state(course.id).notes;
      return course.units.filter((unit) => typeof notes[unit.id] === "string" && notes[unit.id].trim()).map((unit) => ({ course, unit, text: notes[unit.id].trim() }));
    });
  }

  function exportNotes(notes) {
    const markdown = `# 나의 강의 노트\n\n${notes.map(({ course, unit, text }) => `## ${course.title}\n\n### ${unit.title}\n\n${text}\n`).join("\n")}`;
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "myway-notes.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function myPage(data) {
    const { catalog, courses, byId } = data;
    const courseCards = courses.map((course) => {
      const p = progress(course);
      const target = course.units.find((unit) => unit.id === p.last) || course.units.find((unit) => !p.done[unit.id]) || course.units[0];
      return `<article class="pages-card my-course"><div><p class="eyebrow">${esc(course.entry.code)}</p><h3><a href="${courseUrl(course.id)}">${esc(course.title)}</a></h3><p class="muted">${esc(course.tagline || "")}</p></div><div class="pages-progress">${progressBar(p.percent, `${course.title} 진도`)}<span class="num">${p.completed}/${p.total} 수업 · ${p.percent}%</span></div><div class="pages-card-actions">${target ? `<a class="btn small" href="${lessonUrl(course.id, target.id)}">${p.last ? "이어 하기" : "학습하기"}</a>` : ""}${p.total && p.completed === p.total ? `<a class="btn ghost small" href="${certUrl(course.id)}">수료증 보기</a>` : ""}</div></article>`;
    }).join("");
    const noteItems = allNotes(courses);
    const activeRoadmaps = (catalog.roadmaps || []).map((roadmap) => {
      const steps = (roadmap.steps || []).map((id) => byId[id]).filter(Boolean);
      const total = steps.reduce((sum, course) => sum + course.units.length, 0);
      const completed = steps.reduce((sum, course) => sum + progress(course).completed, 0);
      return { roadmap, total, completed, percent: total ? Math.round(completed * 100 / total) : 0 };
    }).filter((item) => item.completed > 0);
    const certificates = courses.filter((course) => { const p = progress(course); return p.total > 0 && p.completed === p.total; });
    setContent(`<div class="tablist pages-tabs" role="tablist" aria-label="내 학습 항목">
      <button type="button" class="tab" role="tab" id="my-tab-courses" aria-controls="my-panel-courses" aria-selected="true">강의</button>
      <button type="button" class="tab" role="tab" id="my-tab-notes" aria-controls="my-panel-notes" aria-selected="false" tabindex="-1">강의 노트</button>
      <button type="button" class="tab" role="tab" id="my-tab-roadmaps" aria-controls="my-panel-roadmaps" aria-selected="false" tabindex="-1">참여 중 로드맵</button>
      <button type="button" class="tab" role="tab" id="my-tab-certificates" aria-controls="my-panel-certificates" aria-selected="false" tabindex="-1">수료증</button>
    </div>
    <section id="my-panel-courses" class="pages-tabpanel" role="tabpanel" aria-labelledby="my-tab-courses"><h2 class="visually-hidden">강의</h2><div class="my-grid">${courseCards || '<p class="pages-empty">등록된 강의가 없습니다.</p>'}</div></section>
    <section id="my-panel-notes" class="pages-tabpanel" role="tabpanel" aria-labelledby="my-tab-notes" hidden><div class="pages-section-head"><h2>강의 노트</h2><button type="button" class="btn ghost small" id="export-notes" ${noteItems.length ? "" : "disabled"}>전체 .md 내보내기</button></div><label class="pages-search-label" for="notes-search">노트 검색</label><input type="search" id="notes-search" class="pages-search" placeholder="강의명·수업명·노트 내용 검색"><div id="notes-results" class="notes-list" aria-live="polite"></div></section>
    <section id="my-panel-roadmaps" class="pages-tabpanel" role="tabpanel" aria-labelledby="my-tab-roadmaps" hidden><h2>참여 중 로드맵</h2><div class="my-grid">${activeRoadmaps.length ? activeRoadmaps.map(({ roadmap, total, completed, percent }) => `<article class="pages-card"><h3>${esc(roadmap.title)}</h3><div class="pages-progress">${progressBar(percent, `${roadmap.title} 진도`)}<span class="num">${completed}/${total} 수업 · ${percent}%</span></div><a class="btn ghost small" href="roadmaps.html">로드맵 보기</a></article>`).join("") : '<p class="pages-empty">아직 시작한 로드맵이 없습니다. <a href="roadmaps.html">로드맵 살펴보기</a></p>'}</div></section>
    <section id="my-panel-certificates" class="pages-tabpanel" role="tabpanel" aria-labelledby="my-tab-certificates" hidden><h2>수료증</h2><div class="my-grid">${certificates.length ? certificates.map((course) => `<article class="pages-card"><p class="eyebrow">수료 완료</p><h3>${esc(course.title)}</h3><p class="muted num">${course.units.length}개 수업 완료</p><a class="btn ghost small" href="${certUrl(course.id)}">수료증 보기</a></article>`).join("") : '<p class="pages-empty">아직 수료한 강의가 없습니다. 모든 수업을 완료하면 이곳에서 수료증을 볼 수 있습니다.</p>'}</div></section>`);
    setupTabs($(".pages-tabs"));
    function renderNotes(query) {
      const words = query.trim().toLocaleLowerCase();
      const found = noteItems.filter(({ course, unit, text }) => `${course.title} ${unit.title} ${text}`.toLocaleLowerCase().includes(words));
      $("#notes-results").innerHTML = found.length ? found.map(({ course, unit, text }) => `<article class="pages-card note-card"><p class="eyebrow">${esc(course.entry.code)} · ${esc(course.title)}</p><h3><a href="${lessonUrl(course.id, unit.id)}">${esc(unit.title)}</a></h3><p class="note-text">${esc(text)}</p></article>`).join("") : `<p class="pages-empty">${noteItems.length ? "검색 결과가 없습니다." : "아직 작성한 노트가 없습니다. 수업의 ‘노트’ 탭에서 적어 보세요."}</p>`;
    }
    $("#notes-search").addEventListener("input", (event) => renderNotes(event.target.value));
    $("#export-notes").addEventListener("click", () => exportNotes(noteItems));
    renderNotes("");
  }

  function certificatePage(data) {
    const id = new URLSearchParams(location.search).get("c");
    const course = id && Object.hasOwn(data.byId, id) ? data.byId[id] : null;
    if (!course) { setContent('<div class="panel-msg"><h1>찾는 강의가 없습니다</h1><a class="btn" href="my.html">내 학습으로</a></div>'); return; }
    const p = progress(course);
    document.title = `${course.title} 수료증 · 마이웨이 아카데미`;
    if (!p.total || p.completed < p.total) {
      setContent(`<div class="panel-msg"><p class="eyebrow">수료 전</p><h1>아직 ${p.total - p.completed}개 수업이 남았습니다</h1><p class="muted num">${esc(course.title)} · ${p.completed}/${p.total} 수업 완료</p>${progressBar(p.percent, "수료 진도")}<a class="btn" href="${courseUrl(course.id)}">강의로 돌아가기</a></div>`);
      return;
    }
    const profile = readStored("myway:profile");
    const savedName = profile && typeof profile.name === "string" ? profile.name : "";
    const date = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    setContent(`<div class="page-hero certificate-controls"><p class="eyebrow">모든 수업 완료</p><h1>수료증</h1><p class="page-lead">이 브라우저의 학습 기록으로 만든 수료 확인서입니다. 이름을 입력하면 인쇄할 수 있습니다.</p><form id="certificate-form" class="certificate-form"><label for="certificate-name">수료증에 표시할 이름</label><div><input id="certificate-name" name="name" type="text" autocomplete="name" maxlength="80" required value="${esc(savedName)}" placeholder="이름을 입력하세요"><button type="submit" class="btn">이름 적용</button><button type="button" class="btn ghost" id="certificate-print">인쇄</button></div><p id="certificate-status" class="muted" role="status">${storageAvailable ? "이름은 이 브라우저에만 저장됩니다." : "저장이 막혀 있습니다. 이름은 이 화면에만 적용됩니다."}</p></form></div>
      <article class="certificate-sheet" aria-labelledby="certificate-title"><div class="certificate-ornament" aria-hidden="true">M</div><p class="certificate-brand">마이웨이 아카데미</p><p class="eyebrow">학습 수료 확인</p><h2 id="certificate-title">수료증</h2><p class="certificate-name" id="certificate-display-name">${esc(savedName || "이름을 입력해 주세요")}</p><p class="certificate-statement">위 학습자는 아래 강의의 모든 수업을 완료하였습니다.</p><h3>${esc(course.title)}</h3><p class="certificate-meta num">${p.total}개 수업 완료</p><p class="certificate-date">발급일 ${esc(date)}</p><p class="certificate-issuer">마이웨이 아카데미</p></article>`);
    const form = $("#certificate-form");
    const input = $("#certificate-name");
    const display = $("#certificate-display-name");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name) { input.setCustomValidity("이름을 입력해 주세요."); input.reportValidity(); return; }
      input.setCustomValidity("");
      display.textContent = name;
      try { localStorage.setItem("myway:profile", JSON.stringify({ name })); $("#certificate-status").textContent = "이름을 이 브라우저에 저장했습니다."; }
      catch (_) { $("#certificate-status").textContent = "저장이 막혀 있어 이 화면에만 이름을 적용했습니다."; }
    });
    input.addEventListener("input", () => input.setCustomValidity(""));
    $("#certificate-print").addEventListener("click", () => {
      if (!input.value.trim()) { input.focus(); input.reportValidity(); return; }
      if (display.textContent !== input.value.trim()) form.requestSubmit();
      window.print();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    noticeStorage();
    const page = document.body.dataset.page;
    if (page === "challenges") { challengesPage(); return; }
    loadCatalog().then((data) => {
      if (page === "roadmaps") roadmapsPage(data);
      if (page === "my") myPage(data);
      if (page === "certificate") certificatePage(data);
    }).catch(errorPage);
  });
})();
