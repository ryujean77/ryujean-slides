/* 강의 수강평·커뮤니티 모듈 — course.html 연결 지점 (통합 작업자용)
   <head>에 <link rel="stylesheet" href="community.css">,
   <script src="community.js" defer></script>를 추가한다.
   A의 course-intro.js가 보내는 academy:course-ready/course-tab 이벤트로 자동 연결된다.
   다른 화면에서 직접 연결할 때는 다음처럼 호출한다:
     const community = window.MywayCommunity.mount({ course: c, catalog: cat });
     community.activate("reviews" 또는 "community"); // 다른 탭이면 deactivate()
   course는 { id, units } 또는 { id, sections: [{ units }] },
   catalog는 catalog.json 객체이다. 두 패널 ID는 #tab-reviews, #tab-community.
   이 모듈은 새 저장 키를 만들지 않고 기존 myway:<강의id> 진도만 읽는다. */
(function () {
  "use strict";

  const categories = [
    { key: "question", label: "질문" },
    { key: "worry", label: "고민있어요" },
    { key: "study", label: "스터디" },
  ];
  let currentController = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readProgress(course) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("myway:" + course.id) || "{}") || {}; }
    catch (error) { /* 저장 차단 또는 손상: 빈 진도로 표시한다. */ }
    const units = Array.isArray(course.units) ? course.units
      : (Array.isArray(course.sections) ? course.sections.flatMap((section) => section.units || []) : []);
    const done = saved.done && typeof saved.done === "object" ? saved.done : {};
    const count = units.filter((unit) => Boolean(done[unit.id])).length;
    return { count, total: units.length, percent: units.length ? Math.round(count / units.length * 100) : 0 };
  }

  async function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (error) { /* 권한이 막히면 선택 복사로 재시도한다. */ }
    }
    const field = element("textarea");
    field.value = value;
    field.setAttribute("aria-hidden", "true");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy unavailable");
    } finally {
      field.remove();
    }
  }

  function renderReviews(panel, course) {
    panel.replaceChildren();
    const root = element("section", "myway-community myway-community--reviews");
    root.appendChild(element("h2", "myway-community__title", "수강평"));
    root.appendChild(element("p", "myway-community__lead", "별점 대신 한 줄: 무엇이 달라졌나 + 몇 강까지 들었나"));

    const copyRow = element("div", "myway-community__copy-row");
    const copyButton = element("button", "myway-community__copy", "내 진도율 문구 복사");
    copyButton.type = "button";
    const copyStatus = element("span", "myway-community__status");
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    copyButton.addEventListener("click", async () => {
      const { count, total, percent } = readProgress(course);
      const phrase = `현재 ${count}/${total}강 수강 (${percent}%)`;
      try {
        await copyText(phrase);
        copyStatus.textContent = `복사했습니다: ${phrase}`;
      } catch (error) {
        copyStatus.textContent = "복사할 수 없습니다. 브라우저의 클립보드 권한을 확인해 주세요.";
      }
    });
    copyRow.append(copyButton, copyStatus);
    root.appendChild(copyRow);
    const slot = element("div", "myway-community__embed");
    root.appendChild(slot);
    panel.appendChild(root);
    return slot;
  }

  function renderCommunity(panel, onSelect) {
    panel.replaceChildren();
    const root = element("section", "myway-community myway-community--discussion");
    root.appendChild(element("h2", "myway-community__title", "커뮤니티"));
    root.appendChild(element("p", "myway-community__lead", "강의에 관한 질문을 나누고, 막힌 지점을 함께 풀어 보세요."));

    const list = element("div", "myway-community__tabs");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "커뮤니티 글 분류");
    const panes = element("div", "myway-community__panes");
    const slots = {};
    const tabs = categories.map(({ key, label }, index) => {
      const tab = element("button", "myway-community__tab", label);
      tab.type = "button";
      tab.id = `myway-community-tab-${key}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `myway-community-panel-${key}`);
      tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tab.tabIndex = index === 0 ? 0 : -1;
      list.appendChild(tab);

      const pane = element("div", "myway-community__pane");
      pane.id = `myway-community-panel-${key}`;
      pane.setAttribute("role", "tabpanel");
      pane.setAttribute("aria-labelledby", tab.id);
      pane.tabIndex = 0;
      pane.hidden = index !== 0;
      const slot = element("div", "myway-community__embed");
      pane.appendChild(slot);
      panes.appendChild(pane);
      slots[key] = slot;
      return tab;
    });

    function select(key, focus) {
      const index = categories.findIndex((item) => item.key === key);
      if (index < 0) return;
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panes.children[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
      onSelect(key);
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(categories[index].key, false));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        select(categories[next].key, true);
      });
    });
    root.append(list, panes);
    panel.appendChild(root);
    return { slots, selected: () => categories[tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")].key };
  }

  function mount({ course, catalog } = {}) {
    const reviews = document.getElementById("tab-reviews");
    const community = document.getElementById("tab-community");
    if (!reviews || !community || !course || typeof course.id !== "string" || !catalog) {
      throw new Error("MywayCommunity.mount: #tab-reviews, #tab-community, course, catalog가 필요합니다.");
    }
    if (currentController) currentController.destroy();

    const reviewSlot = renderReviews(reviews, course);
    let active = null;
    const allSlots = [reviewSlot];
    let discussion;

    function clearEmbeds() {
      allSlots.forEach((slot) => slot.replaceChildren());
    }

    function loadEmbed(slot, term) {
      clearEmbeds();
      // 글 종류별 카테고리(catalog.giscus.categories)가 있으면 그것을, 없으면 기본 카테고리를 쓴다
      const base = catalog.giscus || {};
      const kind = /\/reviews$/.test(term) ? "reviews" : (term.split("/community/")[1] || "");
      const g = Object.assign({}, base, (base.categories || {})[kind] || {});
      if (!(g && g.repo && g.repoId && g.category && g.categoryId)) {
        const note = element("p", "myway-community__pending", "게시판을 준비 중입니다. 설정이 완료되면 이곳에서 글을 남길 수 있습니다.");
        note.setAttribute("role", "status");
        slot.appendChild(note);
        return;
      }
      const host = element("div", "giscus");
      slot.appendChild(host);
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      Object.entries({
        repo: g.repo, "repo-id": g.repoId, category: g.category, "category-id": g.categoryId,
        mapping: "specific", term, strict: "1", "reactions-enabled": "0",
        "emit-metadata": "0", "input-position": "top", theme: "preferred_color_scheme",
        lang: "ko", loading: "lazy",
      }).forEach(([key, value]) => script.setAttribute("data-" + key, value));
      script.onerror = () => {
        if (!slot.contains(script)) return;
        slot.replaceChildren(element("p", "myway-community__pending", "게시판을 불러오지 못했습니다. 연결 상태를 확인한 뒤 탭을 다시 열어 주세요."));
      };
      slot.appendChild(script);
    }

    discussion = renderCommunity(community, (key) => {
      if (active === "community") loadEmbed(discussion.slots[key], `${course.id}/community/${key}`);
    });
    allSlots.push(...Object.values(discussion.slots));

    const controller = {
      courseId: course.id,
      activate(which) {
        if (which === "reviews") {
          active = which;
          loadEmbed(reviewSlot, `${course.id}/reviews`);
        } else if (which === "community") {
          active = which;
          const key = discussion.selected();
          loadEmbed(discussion.slots[key], `${course.id}/community/${key}`);
        } else {
          this.deactivate();
        }
      },
      deactivate() {
        active = null;
        clearEmbeds();
      },
      destroy() {
        this.deactivate();
        reviews.replaceChildren();
        community.replaceChildren();
        if (currentController === this) currentController = null;
      },
    };
    currentController = controller;
    return controller;
  }

  window.MywayCommunity = { mount };

  // course-intro.js는 패널을 만든 다음 준비 이벤트를 보낸다.
  // 준비 전에 탭을 눌러도 마지막 선택 상태를 읽어 올바른 스레드를 표시한다.
  document.addEventListener("academy:course-ready", async (event) => {
    const courseId = event.detail && event.detail.courseId;
    if (!courseId || !document.getElementById("tab-reviews") || !document.getElementById("tab-community")) return;
    try {
      const [catalogResponse, courseResponse] = await Promise.all([
        fetch("catalog.json", { cache: "no-cache" }),
        fetch(`courses/${encodeURIComponent(courseId)}/course.json`, { cache: "no-cache" }),
      ]);
      if (!catalogResponse.ok || !courseResponse.ok) throw new Error("community data unavailable");
      const [catalog, course] = await Promise.all([catalogResponse.json(), courseResponse.json()]);
      course.id = courseId;
      const controller = mount({ course, catalog });
      const selected = document.querySelector('#main [role="tab"][aria-selected="true"]');
      const panelId = selected && selected.getAttribute("aria-controls");
      if (panelId === "tab-reviews") controller.activate("reviews");
      else if (panelId === "tab-community") controller.activate("community");
    } catch (error) {
      for (const id of ["tab-reviews", "tab-community"]) {
        const panel = document.getElementById(id);
        if (panel) {
          const message = element("p", "myway-community__pending", "게시판 정보를 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
          message.setAttribute("role", "status");
          panel.replaceChildren(message);
        }
      }
    }
  });

  document.addEventListener("academy:course-tab", (event) => {
    if (!currentController || !event.detail || event.detail.courseId !== currentController.courseId) return;
    if (event.detail.panelId === "tab-reviews") currentController.activate("reviews");
    else if (event.detail.panelId === "tab-community") currentController.activate("community");
    else currentController.deactivate();
  });
})();
