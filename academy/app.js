/* 마이웨이 아카데미 — 공용 스크립트.
   화면 코드는 catalog.json · courses/<id>/course.json · units/*.md 만 읽는다.
   강의·수업을 추가해도 이 파일은 고치지 않는다. */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);

  /* ---------- 저장: localStorage, 막히면 메모리로 (새로고침 시 사라짐) ---------- */
  const mem = {};
  let storageOK = true;
  try { localStorage.setItem("myway:probe", "1"); localStorage.removeItem("myway:probe"); } catch (e) { storageOK = false; }
  const store = {
    get(k) { try { const v = localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) { /* 막힘·손상 */ } return mem[k]; },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { storageOK = false; } },
  };
  // 강의 id 별 한 덩어리: 완료, 수업별 시간, 노트, 성장 로그, 마지막 수업
  function state(cid) {
    const s = store.get("myway:" + cid) || {};
    return { done: s.done || {}, time: s.time || {}, notes: s.notes || {}, log: Array.isArray(s.log) ? s.log : [], last: s.last || null, lastAt: s.lastAt || 0 };
  }
  const save = (cid, st) => store.set("myway:" + cid, st);
  function addLog(st, type, u) {
    st.log.unshift({ t: new Date().toISOString(), type, uid: u.id, title: u.title });
    st.log = st.log.slice(0, 200);
  }

  /* ---------- 데이터 ---------- */
  async function getJSON(url) {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) throw new Error(url + " " + r.status);
    return r.json();
  }
  async function loadCourse(entry) {
    let c;
    try { c = await getJSON(`courses/${encodeURIComponent(entry.id)}/course.json`); } catch (e) { c = { title: entry.id, sections: [] }; }
    c.id = entry.id; c.entry = entry;
    c.units = [];
    (c.sections || []).forEach((sec, si) => (sec.units || []).forEach((u) => c.units.push(Object.assign({ si, section: sec.title }, u))));
    return c;
  }
  function progress(c) {
    const st = state(c.id);
    const n = c.units.filter((u) => st.done[u.id]).length;
    const N = c.units.length;
    const sec = c.units.reduce((a, u) => a + (st.time[u.id] || 0), 0);
    return { st, n, N, pct: N ? Math.round((n / N) * 100) : 0, sec };
  }
  const isOpen = (entry) => entry.status !== "준비 중";

  /* ---------- 표시 도우미 ---------- */
  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    if (m < 1) return sec > 0 ? "1분 미만" : "0분";
    const h = Math.floor(m / 60);
    return h ? `${h}시간 ${m % 60}분` : `${m}분`;
  }
  const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const bar = (pct, label) => `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(label)}"><i style="width:${pct}%"></i></div>`;
  const lessonURL = (cid, uid) => `lesson.html?c=${encodeURIComponent(cid)}&u=${encodeURIComponent(uid)}`;
  const courseURL = (cid) => `course.html?c=${encodeURIComponent(cid)}`;

  function storageNotice() {
    if (storageOK) return;
    const n = document.createElement("div");
    n.className = "notice"; n.setAttribute("role", "status");
    n.innerHTML = '<div class="wrap">이 브라우저는 저장이 막혀 있어, 진도와 노트가 이 창을 닫으면 사라집니다. 일반 창에서 열면 기록이 남습니다.</div>';
    $(".site-head").after(n);
  }

  function friendly(title, body, href, label) {
    $("#main").innerHTML = `<div class="panel-msg"><h1>${esc(title)}</h1><p class="muted">${esc(body)}</p><a class="btn" href="${href}">${esc(label)}</a></div>`;
    document.title = title + " · 마이웨이 아카데미";
    setTimeout(() => location.replace(href), 5000);
  }

  // ARIA 탭: 클릭 + 좌우 화살표/Home/End
  function setupTabs(list, onShow) {
    const tabs = $$('[role="tab"]', list);
    function show(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
      onShow && onShow(tab);
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault(); show(tabs[(k + tabs.length) % tabs.length], true);
      });
    });
    return show;
  }

  /* ---------- 홈 ---------- */
  async function home() {
    const cat = await getJSON("catalog.json");
    const courses = await Promise.all(cat.courses.map(loadCourse));
    const byId = Object.fromEntries(courses.map((c) => [c.id, c]));

    // 이어 하기 (가장 최근 연 강의)
    const recent = courses.map((c) => ({ c, st: state(c.id) })).filter((x) => x.st.last).sort((a, b) => b.st.lastAt - a.st.lastAt)[0];
    if (recent) {
      const u = recent.c.units.find((x) => x.id === recent.st.last);
      if (u) $("#resume").innerHTML = `이어 하기 — <a href="${lessonURL(recent.c.id, u.id)}">${esc(recent.c.entry.code)} · ${esc(u.title)}</a>`;
    }

    // 로드맵
    const rm = (cat.roadmaps || [])[0];
    if (rm) {
      $("#roadmap-title").textContent = `「${rm.title}」`;
      $("#roadmap").innerHTML = rm.steps.map((id) => byId[id]).filter(Boolean).map((c) => {
        const p = progress(c), e = c.entry;
        const title = isOpen(e) ? `<a href="${courseURL(c.id)}">${esc(c.title.split(" — ")[0])}</a>` : esc(c.title.split(" — ")[0]);
        return `<li class="step${p.N && p.n === p.N ? " complete" : ""}">
          <span class="code">${esc(e.code)}</span><h3>${title}</h3>
          <p class="promise">${esc(e.promise || "")}</p>
          ${isOpen(e) ? `${bar(p.pct, c.title + " 진도")}<p class="meta num">${p.n}/${p.N} 수업 완료 · ${p.pct}%</p>` : `<span class="badge">준비 중</span>`}
        </li>`;
      }).join("");
    }

    // 강의 목록 + 주제 필터
    const topics = cat.topics || [];
    let active = "전체";
    $("#filters").innerHTML = ["전체", ...topics].map((t) => `<button type="button" class="chip" aria-pressed="${t === active}">${esc(t)}</button>`).join("");
    function renderList() {
      const list = courses.filter((c) => active === "전체" || (c.entry.topics || []).includes(active));
      $("#course-list").innerHTML = list.length ? list.map((c) => {
        const p = progress(c), e = c.entry, open = isOpen(e);
        const statusBadge = e.status && e.status !== "공개" ? `<span class="badge">${esc(e.status)}</span>` : "";
        return `<li class="course-row${open ? "" : " soon"}">
          <span class="code" aria-hidden="true">${esc(e.code)}</span>
          <div><h3>${open ? `<a href="${courseURL(c.id)}">${esc(c.title)}</a>` : esc(c.title)}</h3><p class="tagline">${esc(c.tagline || "")}</p></div>
          <div class="side">${statusBadge}
            <span>${esc(c.level || "")} · <span class="num">${p.N}</span>수업</span>
            ${open ? `${bar(p.pct, c.title + " 진도")}<span class="num">내 진도 ${p.n}/${p.N} (${p.pct}%)</span>` : `<span>공개되면 이곳에서 알려 드립니다</span>`}
          </div></li>`;
      }).join("") : `<li class="empty">이 주제의 강의는 준비 중입니다.</li>`;
    }
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      active = b.textContent;
      $$(".chip", $("#filters")).forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderList();
    });
    renderList();

    // 클립 · 기관 교육
    $("#clips").innerHTML = (cat.clips || []).map((k) => `<li class="clip"><span class="len">3분 팁${k.status && k.status !== "공개" ? ` · ${esc(k.status)}` : ""}</span><div><h3>${esc(k.title)}</h3><p>${esc(k.summary)}</p></div></li>`).join("");
    $("#tracks tbody").innerHTML = (cat.tracks || []).map((t) => `<tr><th scope="row">${esc(t.title)}</th><td class="path">${esc(t.path)}</td><td>${esc(t.note)}</td></tr>`).join("");
  }

  /* ---------- 강의 대시보드 ---------- */
  function curriculumHTML(c, st, currentId) {
    return c.sections.map((sec, si) => {
      const us = c.units.filter((u) => u.si === si);
      const n = us.filter((u) => st.done[u.id]).length;
      const open = currentId ? us.some((u) => u.id === currentId) : si === 0;
      return `<div class="acc-sec"><h3><button type="button" class="acc-btn" aria-expanded="${open}" aria-controls="sec-${si}" id="sec-b-${si}">
          <span>${si + 1}. ${esc(sec.title)}</span><span class="count num">${n}/${us.length}</span></button></h3>
        <ul class="units" id="sec-${si}" role="region" aria-labelledby="sec-b-${si}" ${open ? "" : "hidden"}>${us.map((u) => unitLi(c, st, u, currentId)).join("")}</ul></div>`;
    }).join("");
  }
  function unitLi(c, st, u, currentId) {
    const d = !!st.done[u.id];
    return `<li class="unit${d ? " done" : ""}"><a href="${lessonURL(c.id, u.id)}"${u.id === currentId ? ' aria-current="page"' : ""}>
      <span class="mark" aria-hidden="true">${d ? "✓" : ""}</span><span class="t">${esc(u.title)}${d ? '<span class="visually-hidden"> (완료)</span>' : ""}</span><span class="no num">${esc(u.id.replace(/^u0?/, ""))}</span></a></li>`;
  }
  function bindAccordion(root) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest(".acc-btn"); if (!b) return;
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open);
      document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
    });
  }
  const logLabel = { done: "수강 완료", undo: "완료 취소", start: "학습 시작" };
  const logHTML = (log, n) => log.length ? `<ol class="log">${log.slice(0, n).map((l) => `<li><time datetime="${esc(l.t)}">${fmtDate(l.t)}</time><span><b>${esc(logLabel[l.type] || l.type)}</b> · ${esc(l.title)}</span></li>`).join("")}</ol>` : `<p class="muted">아직 기록이 없습니다. 첫 수업을 열면 이곳에 쌓입니다.</p>`;

  async function coursePage() {
    const cat = await getJSON("catalog.json");
    const entry = cat.courses.find((x) => x.id === params.get("c"));
    if (!entry) return friendly("찾는 강의가 없습니다", "주소가 바뀌었거나 아직 열리지 않은 강의입니다. 잠시 후 강의 목록으로 이동합니다.", "index.html#courses", "강의 목록으로");
    const c = await loadCourse(entry);
    document.title = `${c.title} · 마이웨이 아카데미`;
    const p = progress(c), st = p.st, about = c.about || entry.about || {};
    const target = st.last && c.units.some((u) => u.id === st.last) ? st.last : c.units[0] && c.units[0].id;
    const news = (c.news || []).map((x) => `<li><time datetime="${esc(x.date)}">${esc(x.date)}</time><span>${esc(x.title)}</span></li>`).join("");
    const list = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="muted">준비 중입니다.</p>`);

    $("#main").innerHTML = `
      <section class="course-hero"><div class="wrap">
        <p class="eyebrow">${esc(entry.code)} · ${esc(c.level || "")}${entry.status && entry.status !== "공개" ? " · " + esc(entry.status) : ""}</p>
        <h1>${esc(c.title)}</h1><p class="tagline">${esc(c.tagline || "")}</p>
        <ul class="tags" aria-label="태그">${(c.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div></section>
      <div class="wrap">
        <div class="tablist" role="tablist" aria-label="강의 화면">
          <button class="tab" role="tab" id="t-dash" aria-controls="p-dash" aria-selected="true">대시보드</button>
          <button class="tab" role="tab" id="t-intro" aria-controls="p-intro" aria-selected="false" tabindex="-1">강의 소개</button>
        </div>
        <div id="p-dash" role="tabpanel" aria-labelledby="t-dash" class="dash">
          <div>
            <div class="status">
              <p class="big num">${p.n}/${p.N}<small>${p.pct}% 완료</small></p>
              ${target ? `<a class="btn" href="${lessonURL(c.id, target)}">${st.last ? "이어 하기" : "학습하기"}</a>` : ""}
              ${bar(p.pct, "강의 진도")}
              <p class="stats"><span>완료 수업 <b class="num">${p.n}개</b></span><span>누적 학습 시간 <b class="num">${fmtTime(p.sec)}</b></span><span>남은 수업 <b class="num">${p.N - p.n}개</b></span></p>
            </div>
            <h2 class="h-side">커리큘럼</h2>
            <div class="acc" id="acc">${curriculumHTML(c, st, st.last)}</div>
          </div>
          <aside aria-label="새소식과 나의 기록">
            <section><h2 class="h-side">새소식</h2>${news ? `<ul class="news">${news}</ul>` : '<p class="muted">새소식이 없습니다.</p>'}</section>
            <section><h2 class="h-side">나의 성장 로그</h2>${logHTML(st.log, 5)}</section>
          </aside>
        </div>
        <div id="p-intro" role="tabpanel" aria-labelledby="t-intro" class="intro" hidden>
          <section><h2>이런 분께</h2><p>${esc(about.target || "준비 중입니다.")}</p></section>
          <section><h2>마치면 손에 남는 것</h2>${list(about.outcomes)}</section>
          <section><h2>준비물</h2>${list(about.prep)}</section>
          <section><h2>강의 정보</h2><dl>
            <dt>강사</dt><dd>${esc(c.instructor || "")}</dd>
            <dt>형식</dt><dd>${esc(c.format || "")}</dd>
            <dt>구성</dt><dd class="num">${c.sections.length}섹션 ${c.units.length}수업</dd>
            <dt>난이도</dt><dd>${esc(c.level || "")}</dd></dl></section>
        </div>
      </div>`;
    setupTabs($(".tablist"));
    bindAccordion($("#acc"));
  }

  /* ---------- 학습 페이지 ---------- */
  async function lessonPage() {
    const cat = await getJSON("catalog.json");
    const entry = cat.courses.find((x) => x.id === params.get("c"));
    if (!entry) return friendly("찾는 강의가 없습니다", "잠시 후 강의 목록으로 이동합니다.", "index.html#courses", "강의 목록으로");
    const c = await loadCourse(entry);
    const i = c.units.findIndex((x) => x.id === params.get("u"));
    if (i < 0) return friendly("찾는 수업이 없습니다", "수업 목록이 바뀌었을 수 있습니다. 잠시 후 강의 대시보드로 이동합니다.", courseURL(c.id), "강의 대시보드로");
    const u = c.units[i], prev = c.units[i - 1], next = c.units[i + 1];
    document.title = `${u.title} · ${c.title.split(" — ")[0]}`;

    const st = state(c.id);
    if (!st.time[u.id] && !st.log.some((l) => l.uid === u.id)) addLog(st, "start", u);
    st.last = u.id; st.lastAt = Date.now();
    save(c.id, st);

    $("#crumb").innerHTML = `<a href="${courseURL(c.id)}">${esc(entry.code)} ${esc(c.title.split(" — ")[0])}</a> <span class="muted">/ ${esc(u.section)}</span>`;

    // 본문
    let body;
    try {
      const r = await fetch(`courses/${encodeURIComponent(c.id)}/${u.file}`, { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      const md = await r.text();
      // 원고는 공개 전 sync_academy.py 가드를 통과한 1차 자료 (신뢰 원천)
      body = window.marked ? window.marked.parse(md) : `<pre style="white-space:pre-wrap">${esc(md)}</pre>`;
      if (!/^\s*<h1/.test(body)) body = `<h1>${esc(u.title)}</h1>` + body;
    } catch (e) {
      body = `<h1>${esc(u.title)}</h1><div class="soon-box" role="status"><strong>준비 중인 수업입니다</strong>원고를 다듬고 있습니다. 먼저 다른 수업을 둘러보시거나, 강의 대시보드의 새소식을 확인해 주세요.</div>`;
    }
    $("#lesson-body").innerHTML = body;

    // 완료 토글 · 이전/다음
    const btn = $("#done-btn");
    function paint() {
      const s = state(c.id), d = !!s.done[u.id];
      btn.setAttribute("aria-pressed", d);
      btn.textContent = d ? "✓ 수강 완료 (다시 누르면 취소)" : "수강 완료";
      const p = progress(c);
      $("#prog-text").textContent = `${p.n}/${p.N}`;
      $("#prog-bar").innerHTML = bar(p.pct, "강의 진도");
      $("#p-cur").innerHTML = railCurriculum();
      $("#p-log").innerHTML = `<h2 class="h-side">나의 성장 로그</h2>${logHTML(s.log, 30)}`;
    }
    btn.addEventListener("click", () => {
      const s = state(c.id);
      if (s.done[u.id]) { delete s.done[u.id]; addLog(s, "undo", u); } else { s.done[u.id] = new Date().toISOString(); addLog(s, "done", u); }
      save(c.id, s); paint();
      $("#done-status").textContent = s.done[u.id] ? "완료로 기록했습니다." : "완료를 취소했습니다.";
    });
    $("#pager").innerHTML = (prev ? `<a class="prev" href="${lessonURL(c.id, prev.id)}" rel="prev"><small>← 이전 수업</small><span>${esc(prev.title)}</span></a>` : "") +
      (next ? `<a class="next" href="${lessonURL(c.id, next.id)}" rel="next"><small>다음 수업 →</small><span>${esc(next.title)}</span></a>` : `<a class="next" href="${courseURL(c.id)}"><small>마지막 수업입니다</small><span>강의 대시보드로</span></a>`);

    function railCurriculum() {
      const s = state(c.id);
      return c.sections.map((sec, si) => `<p class="sec-t">${si + 1}. ${esc(sec.title)}</p><ul class="units">${c.units.filter((x) => x.si === si).map((x) => unitLi(c, s, x, u.id)).join("")}</ul>`).join("");
    }

    // 노트: 자동 저장 + .md 내보내기
    const ta = $("#note");
    ta.value = st.notes[u.id] || "";
    let t;
    ta.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const s = state(c.id);
        if (ta.value.trim()) s.notes[u.id] = ta.value; else delete s.notes[u.id];
        save(c.id, s);
        const now = new Date();
        $("#note-status").textContent = (storageOK ? "저장됨 " : "임시 저장됨 (창을 닫으면 사라짐) ") + `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      }, 500);
    });
    $("#note-export").addEventListener("click", () => {
      const s = state(c.id);
      if (ta.value.trim()) s.notes[u.id] = ta.value;
      const parts = c.units.filter((x) => s.notes[x.id]).map((x) => `## ${x.title}\n\n${s.notes[x.id].trim()}\n`);
      const md = `# ${c.title} — 나의 노트\n\n${parts.length ? parts.join("\n") : "(아직 노트가 없습니다)\n"}`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
      a.download = `${c.id}-notes.md`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });

    // Q&A: catalog.giscus 가 있을 때만 giscus, 없으면 안내
    let qaLoaded = false;
    function loadQA() {
      if (qaLoaded) return; qaLoaded = true;
      const g = cat.giscus;
      const box = $("#p-qa");
      if (!(g && g.repo && g.repoId && g.category && g.categoryId)) {
        box.innerHTML = `<div class="qa-soon"><strong>Q&amp;A 준비 중</strong><p>수업별 질문 게시판을 곧 엽니다. 그전까지는 막힌 화면을 캡처해 AI에게 “지금 보이는 화면 / 하려는 것 / 이미 해 본 것”을 붙여 물어보세요.</p></div>`;
        return;
      }
      box.innerHTML = '<h2 class="h-side">이 수업의 질문</h2><div class="giscus"></div>';
      const s = document.createElement("script");
      s.src = "https://giscus.app/client.js"; s.async = true; s.crossOrigin = "anonymous";
      Object.entries({ repo: g.repo, "repo-id": g.repoId, category: g.category, "category-id": g.categoryId, mapping: "specific", term: `${c.id}/${u.id}`, strict: "1", "reactions-enabled": "0", "emit-metadata": "0", "input-position": "top", theme: "preferred_color_scheme", lang: "ko", loading: "lazy" })
        .forEach(([k, v]) => s.setAttribute("data-" + k, v));
      box.appendChild(s);
    }
    setupTabs($(".rail .tablist"), (tab) => { if (tab.id === "rt-qa") loadQA(); });

    // 모바일 하단 시트
    const rail = $(".rail"), toggle = $(".rail-toggle");
    toggle.addEventListener("click", () => { const o = rail.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && rail.classList.contains("open")) { rail.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); } });

    paint();

    // 체류 시간: 화면이 보이는 동안 1초씩, 10초마다·떠날 때 저장
    let pending = 0;
    function flush() { if (!pending) return; const s = state(c.id); s.time[u.id] = (s.time[u.id] || 0) + pending; pending = 0; save(c.id, s); }
    setInterval(() => { if (document.visibilityState === "visible") { pending++; if (pending >= 10) flush(); } }, 1000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    addEventListener("pagehide", flush);
  }

  /* ---------- 시작 ---------- */
  const pages = { home, course: coursePage, lesson: lessonPage };
  document.addEventListener("DOMContentLoaded", () => {
    storageNotice();
    const run = pages[document.body.dataset.page];
    run && run().catch((e) => {
      console.error(e);
      const m = $("#main");
      if (m) m.insertAdjacentHTML("afterbegin", `<div class="panel-msg" role="alert"><h1>불러오지 못했습니다</h1><p class="muted">잠시 후 새로고침해 주세요. 인터넷 연결을 확인하거나, 파일을 직접 열었다면 로컬 서버로 열어 주세요.</p><a class="btn" href="index.html">처음으로</a></div>`);
    });
  });
})();
