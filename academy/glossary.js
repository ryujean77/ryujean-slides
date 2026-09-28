/* 용어 사전: 원본 데이터는 읽기만 합니다. */
(function () {
  "use strict";

  const initials = [..."ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ"];
  const hangulInitials = [..."ㄱㄱㄴㄷㄷㄹㅁㅂㅂㅅㅅㅇㅈㅈㅊㅋㅌㅍㅎ"];
  const groupOrder = [...initials, "영문 A–Z", "기호"];
  const search = document.querySelector("#glossary-search");
  const filters = document.querySelector("#glossary-filters");
  const count = document.querySelector("#glossary-count");
  const jump = document.querySelector("#glossary-jump");
  const results = document.querySelector("#glossary-results");
  const params = new URLSearchParams(location.search);
  search.value = params.get("q") || "";
  let selected = "all";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function groupOf(term) {
    const first = String(term).trim().charAt(0);
    const code = first.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return hangulInitials[Math.floor((code - 0xac00) / 588)];
    if (/^[a-z]$/i.test(first)) return "영문 A–Z";
    return "기호";
  }

  function getJson(path) {
    return fetch(path, { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    });
  }

  Promise.all([getJson("data/glossary.json"), getJson("catalog.json")]).then(async ([glossary, catalog]) => {
    if (!Array.isArray(glossary.terms) || !Array.isArray(catalog.courses)) throw new Error("용어 또는 강의 목록 형식 오류");
    const courses = await Promise.all(catalog.courses.map(async (entry) => {
      const detail = await getJson(`courses/${encodeURIComponent(entry.id)}/course.json`);
      return { id: entry.id, code: entry.code, title: detail.title };
    }));
    const byCode = Object.fromEntries(courses.map((course) => [course.code, course.id]));
    const byId = Object.fromEntries(courses.map((course) => [course.id, course]));
    const collator = new Intl.Collator("ko", { numeric: true, sensitivity: "base" });

    function render() {
      const query = search.value.trim().toLocaleLowerCase();
      const courseId = byCode[selected];
      const matched = glossary.terms.filter((item) =>
        (!courseId || item.courses.includes(courseId)) &&
        (!query || `${item.term} ${item.definition}`.toLocaleLowerCase().includes(query))
      );
      count.textContent = `용어 ${matched.length}개 / 전체 ${glossary.terms.length}개`;
      const groups = new Map(groupOrder.map((name) => [name, []]));
      matched.forEach((item) => groups.get(groupOf(item.term)).push(item));
      const present = groupOrder.filter((name) => groups.get(name).length);
      jump.hidden = !present.length;
      jump.innerHTML = present.map((name) => `<a href="#glossary-group-${groupOrder.indexOf(name)}">${esc(name)}</a>`).join("");
      results.innerHTML = present.map((name) => {
        const terms = groups.get(name).sort((a, b) => collator.compare(a.term, b.term));
        return `<section class="glossary-group" id="glossary-group-${groupOrder.indexOf(name)}" aria-labelledby="glossary-title-${groupOrder.indexOf(name)}">
          <h2 id="glossary-title-${groupOrder.indexOf(name)}">${esc(name)} <small class="num">${terms.length}</small></h2>
          <div class="glossary-grid">${terms.map((item) => {
            const first = courses.find((course) => item.courses.includes(course.id));
            return `<article class="pages-card glossary-card"><h3>${esc(item.term)}</h3><p>${esc(item.definition)}</p>${first ? `<a class="badge glossary-course" href="course.html?c=${encodeURIComponent(first.id)}" aria-label="처음 나오는 과정: ${esc(first.code)} ${esc(first.title)}">처음 나오는 과정 · ${esc(first.code)} ${esc(first.title)}</a>` : ""}</article>`;
          }).join("")}</div>
        </section>`;
      }).join("") || '<p class="pages-empty">검색 조건에 맞는 용어가 없습니다. 다른 검색어나 과정을 선택해 보세요.</p>';
      results.setAttribute("aria-busy", "false");
    }

    search.addEventListener("input", () => {
      const url = new URL(location.href);
      if (search.value.trim()) url.searchParams.set("q", search.value.trim());
      else url.searchParams.delete("q");
      history.replaceState(null, "", url);
      render();
    });
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-code]");
      if (!button || !filters.contains(button)) return;
      selected = button.dataset.code;
      filters.querySelectorAll("button[data-code]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      render();
    });
    render();
  }).catch((error) => {
    console.error(error);
    count.textContent = "용어를 불러오지 못했습니다.";
    results.innerHTML = '<div class="pages-empty" role="alert">연결을 확인한 뒤 새로고침해 주세요.</div>';
    results.setAttribute("aria-busy", "false");
  });
})();
