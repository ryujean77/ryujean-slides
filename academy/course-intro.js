/* 강의 화면 확장. app.js가 #main을 그린 뒤 실행한다.
   작업자 B 연결: #tab-reviews, #tab-community가 생성되면
   academy:course-ready(detail.courseId)를 받거나 DOM을 확인한다.
   탭을 열 때 academy:course-tab(detail.panelId, detail.courseId)가 발생한다. */
(function () {
  "use strict";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
  const getJSON = async (path) => {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  };
  const lessonURL = (id, unitId) => `lesson.html?c=${encodeURIComponent(id)}&u=${encodeURIComponent(unitId)}`;
  const list = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
  const dateText = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? esc(date) : "기록되지 않음";

  function renderIntroduction(panel, course, intro, catalog, totalLessons) {
    const sections = course.sections || [];
    const count = sections.reduce((sum, section) => sum + (section.units || []).length, 0);
    const teacherCount = catalog.courses.length;
    panel.innerHTML = `
      <section><h2>수강 후 이런 걸 할 수 있어요</h2>${list(intro.outcomes || [])}</section>
      <div class="intro-grid">
        <section><h2>이런 분께 추천합니다</h2><p>${esc(intro.audience)}</p></section>
        <section><h2>강의 형식</h2><p>${esc(intro.formatNote)}</p><p class="muted">${esc(course.format || "텍스트 수업")}</p></section>
      </div>
      <section><h2>이 강의에서 배우는 것</h2>
        <ol>${sections.map((section, index) => `<li><strong>${esc(section.title)}</strong><p>${esc((intro.sections || [])[index] || "")}</p></li>`).join("")}</ol>
      </section>
      <section class="intro-curriculum"><h2>전체 커리큘럼 · ${count}수업</h2>
        <div class="intro-controls"><button type="button" class="btn ghost small" id="intro-expand" aria-expanded="false">모두 펼치기</button></div>
        ${sections.map((section, index) => `<details><summary>${index + 1}. ${esc(section.title)} · ${(section.units || []).length}수업</summary>
          <ol>${(section.units || []).map((unit) => `<li><a href="${lessonURL(course.id, unit.id)}">${esc(unit.title)}</a></li>`).join("")}</ol></details>`).join("")}
      </section>
      <section class="teacher-card"><h2>강사 소개</h2>
        <p><strong>유정근 · Ryu JeongKun</strong> — 마이웨이 아카데미 대표 강사. 강사·컨설턴트·1인 사업자, 기관의 시니어·청소년 과정에서 AI 활용과 자료관리를 가르칩니다. 이 아카데미의 교안은 강의 현장에서 실제로 막힌 곳과, 강사가 자기 워크스페이스에서 직접 해 온 작업을 정제해 만들었습니다.</p>
        <div class="teacher-stats"><span>운영 강의 <strong>${teacherCount}개</strong></span><span>전체 수업 <strong>${totalLessons == null ? "집계 불가" : `${totalLessons}개`}</strong></span></div>
      </section>
      <section class="intro-dates"><p>게시일: ${dateText(intro.publishedAt)} · 업데이트일: ${dateText(intro.updatedAt)}</p></section>`;

    const expand = panel.querySelector("#intro-expand");
    expand.addEventListener("click", () => {
      const details = [...panel.querySelectorAll(".intro-curriculum details")];
      const open = details.some((detail) => !detail.open);
      details.forEach((detail) => { detail.open = open; });
      expand.setAttribute("aria-expanded", String(open));
      expand.textContent = open ? "모두 접기" : "모두 펼치기";
    });
  }

  function addHeader(course, entry) {
    const hero = document.querySelector(".course-hero .wrap");
    if (!hero) return;
    const crumb = document.createElement("nav");
    crumb.className = "course-crumb";
    crumb.setAttribute("aria-label", "강의 위치");
    const parentHref = entry.standalone ? "index.html#courses" : "index.html#roadmap-sec";
    const parentLabel = entry.standalone ? "강의" : "로드맵";
    const placeLabel = entry.standalone ? "독립 강좌" : `${entry.code} 단계`;
    crumb.innerHTML = `<a href="${parentHref}">${parentLabel}</a> <span aria-hidden="true">›</span> <span>${esc(placeLabel)}</span> <span aria-hidden="true">›</span> <span aria-current="page">${esc(course.title)}</span>`;
    hero.prepend(crumb);

    const badges = document.createElement("div");
    badges.className = "course-meta";
    const count = (course.sections || []).reduce((sum, section) => sum + (section.units || []).length, 0);
    badges.innerHTML = `<span>난이도 · ${esc(course.level || "미기록")}</span><span>형식 · ${esc(course.format || "텍스트")}</span><span>${count}수업</span>`;
    hero.append(badges);

    const share = document.createElement("div");
    share.className = "course-share";
    share.innerHTML = '<button type="button" class="btn ghost small">강의 공유</button><span role="status" aria-live="polite"></span>';
    hero.append(share);
    share.querySelector("button").addEventListener("click", async () => {
      const status = share.querySelector('[role="status"]');
      const url = location.href;
      if (typeof navigator.share === "function") {
        try { await navigator.share({ title: course.title, url }); status.textContent = "공유했습니다."; return; }
        catch (error) { if (error && error.name === "AbortError") return; }
      }
      try { await navigator.clipboard.writeText(url); status.textContent = "강의 링크를 복사했습니다."; }
      catch (_error) { status.textContent = "주소창에서 강의 링크를 복사해 주세요."; }
    });
  }

  function makeTabs(courseId, course) {
    const oldList = document.querySelector("#main .tablist");
    const dash = document.querySelector("#p-dash");
    const intro = document.querySelector("#p-intro");
    if (!oldList || !dash || !intro) return;

    const names = [
      ["t-dash", "p-dash", "대시보드"],
      ["t-intro", "p-intro", "강의 소개"],
      ["t-reviews", "tab-reviews", "수강평"],
      ["t-community", "tab-community", "커뮤니티"],
      ["t-news", "tab-news", "새소식"]
    ];
    const tablist = document.createElement("div");
    tablist.className = "tablist course-tabs";
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "강의 화면");
    tablist.innerHTML = names.map(([id, panelId, label], index) => `<button type="button" class="tab" role="tab" id="${id}" aria-controls="${panelId}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${label}</button>`).join("");
    oldList.replaceWith(tablist);

    const reviews = document.createElement("div");
    reviews.id = "tab-reviews"; reviews.setAttribute("role", "tabpanel");
    reviews.setAttribute("aria-labelledby", "t-reviews"); reviews.hidden = true;
    const community = document.createElement("div");
    community.id = "tab-community"; community.setAttribute("role", "tabpanel");
    community.setAttribute("aria-labelledby", "t-community"); community.hidden = true;
    const news = document.createElement("div");
    news.id = "tab-news"; news.className = "course-news";
    news.setAttribute("role", "tabpanel"); news.setAttribute("aria-labelledby", "t-news"); news.hidden = true;
    const items = [...(course.news || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const newsItems = (entries) => entries.map((item) => `<li><time datetime="${esc(item.date)}">${esc(item.date)}</time><span>${esc(item.title)}</span></li>`).join("");
    news.innerHTML = `<h2>새소식</h2>${items.length ? `<ol class="news">${newsItems(items)}</ol>` : '<p class="muted">새소식이 없습니다.</p>'}`;
    intro.after(reviews, community, news);
    const dashNews = dash.querySelector(".news");
    if (dashNews) dashNews.innerHTML = newsItems(items.slice(0, 2));

    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    function show(index, focus) {
      tabs.forEach((tab, position) => {
        const selected = position === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
      });
      if (focus) tabs[index].focus();
      tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      document.dispatchEvent(new CustomEvent("academy:course-tab", { detail: { courseId, panelId: tabs[index].getAttribute("aria-controls") } }));
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => show(index, false));
      tab.addEventListener("keydown", (event) => {
        const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault(); show(next, true);
      });
    });
    document.dispatchEvent(new CustomEvent("academy:course-ready", { detail: { courseId } }));
    const hashTab = () => ({ "#reviews": 2, "#community": 3, "#news": 4, "#intro": 1 })[location.hash];
    const initial = hashTab();
    if (initial !== undefined) show(initial, false);
    addEventListener("hashchange", () => {
      const index = hashTab();
      if (index !== undefined) show(index, false);
    });
  }

  async function start() {
    const courseId = new URLSearchParams(location.search).get("c");
    if (!courseId) return;
    const catalog = await getJSON("catalog.json");
    const entry = catalog.courses.find((item) => item.id === courseId);
    if (!entry) return;
    const [course, introductions, counts] = await Promise.all([
      getJSON(`courses/${encodeURIComponent(courseId)}/course.json`),
      getJSON("data/intro.json"),
      Promise.all(catalog.courses.map(async (item) => {
        try {
          const itemCourse = await getJSON(`courses/${encodeURIComponent(item.id)}/course.json`);
          return (itemCourse.sections || []).reduce((sum, section) => sum + (section.units || []).length, 0);
        } catch (_error) { return null; }
      }))
    ]);
    const intro = introductions[courseId];
    if (!intro) return;
    const totalLessons = counts.every((count) => count != null) ? counts.reduce((sum, count) => sum + count, 0) : null;
    course.id = courseId;

    const main = document.getElementById("main");
    const enhance = () => {
      const panel = document.getElementById("p-intro");
      if (!panel || !document.getElementById("p-dash")) return false;
      renderIntroduction(panel, course, intro, catalog, totalLessons);
      addHeader(course, entry);
      makeTabs(courseId, course);
      return true;
    };
    if (enhance()) return;
    const observer = new MutationObserver(() => { if (enhance()) observer.disconnect(); });
    observer.observe(main, { childList: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    start().catch((error) => { console.error("강의 소개를 불러오지 못했습니다.", error); });
  });
})();
