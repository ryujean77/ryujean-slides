/* 회원 관리: 목록·검색·등급 변경. 회원이 입력한 값(이름 등)은 textContent 로만 넣는다(HTML 해석 금지). */
const $ = (s) => document.querySelector(s);
const msg = (t, bad) => { const m = $("#adm-msg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
let users = [];

// 수신 동의는 2년마다 재확인 (정보통신망법)
const stale = (u) => u.marketing && u.marketing_at && Date.now() - Date.parse(u.marketing_at) > 2 * 365 * 864e5;

// CSV: 엑셀에서 수식으로 실행되지 않게 = + - @ 로 시작하는 칸은 ' 를 붙인다
function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function exportCsv(onlyMarketing) {
  const list = users.filter((u) => !onlyMarketing || (u.marketing && !stale(u)));
  const head = ["이메일", "이름", "등급", "소식동의", "동의일", "완료수업", "학습분", "과목별완료", "마지막학습", "가입일", "마지막접속"];
  const rows = list.map((u) => [u.email, u.name, u.tier, u.marketing ? "Y" : "N", u.marketing_at, u.done, u.minutes, u.courses, u.last_study, u.created_at, u.last_seen]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `academy_members_${onlyMarketing ? "marketing_" : ""}${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  msg(`${list.length}명을 내보냈습니다. 파일에 개인정보가 있으니 쓰고 나면 지워 주세요.`);
}

function cell(tr, text) { const td = document.createElement("td"); td.textContent = text ?? ""; tr.appendChild(td); return td; }

function draw() {
  const q = $("#adm-q").value.trim().toLowerCase();
  const list = users.filter((u) => !q || [u.email, u.name, u.uid].some((v) => String(v || "").toLowerCase().includes(q)));
  $("#adm-count").textContent = `${list.length}명 / 전체 ${users.length}명 · 유료 ${users.filter((u) => u.tier === "paid").length}명`;
  const body = $("#adm-rows");
  body.replaceChildren();
  for (const u of list) {
    const tr = document.createElement("tr");
    cell(tr, u.email); cell(tr, u.name);
    cell(tr, u.tier === "paid" ? "유료" : "무료").className = u.tier === "paid" ? "tier-paid-cell" : "";
    cell(tr, u.marketing ? `동의 ${(u.marketing_at || "").slice(0, 10)}${stale(u) ? " · 재확인 필요" : ""}` : "—");
    cell(tr, `${u.done || 0}개`).title = u.courses || "";
    cell(tr, `${u.minutes || 0}분`);
    cell(tr, (u.last_study || u.last_seen || "").slice(0, 16).replace("T", " "));
    cell(tr, (u.created_at || "").slice(0, 10));
    const code = document.createElement("code"); code.textContent = u.uid; cell(tr, "").appendChild(code);
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn small" + (u.tier === "paid" ? " ghost" : "");
    b.textContent = u.tier === "paid" ? "무료로 내리기" : "유료로 올리기";
    b.addEventListener("click", () => setTier(u, u.tier === "paid" ? "free" : "paid", b));
    cell(tr, "").appendChild(b);
    body.appendChild(tr);
  }
}

async function load(a) {
  const r = await a.api("/admin/users");
  if (r.status === 403) return msg("관리자 계정(구글 로그인)이 아닙니다.", true);
  if (!r.ok) return msg("목록을 불러오지 못했습니다.", true);
  users = (await r.json()).users;
  msg("");
  $("#adm-tools").hidden = false;
  draw();
}

async function setTier(u, tier, btn) {
  btn.disabled = true;
  try {
    const r = await window.mwAuth.api("/admin/tier", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: u.uid, tier }) });
    if (!r.ok) throw new Error(r.status);
    u.tier = tier;
    msg(`${u.email} → ${tier === "paid" ? "유료" : "무료"}로 바꿨습니다.`);
    draw();
  } catch (e) {
    msg("바꾸지 못했습니다. 새로고침 후 다시 해 주세요.", true);
    btn.disabled = false;
  }
}

async function main() {
  const a = window.mwAuth;
  if (!a || a.disabled) return msg("회원 기능이 아직 켜지지 않았습니다.", true);
  const user = await a.ready;
  if (!user) { location.replace("login.html?next=admin.html"); return; }
  $("#adm-q").addEventListener("input", draw);
  $("#csv-all").addEventListener("click", () => exportCsv(false));
  $("#csv-mkt").addEventListener("click", () => exportCsv(true));
  load(a);
}

if (window.mwAuth) main(); else document.addEventListener("mw-auth-ready", main, { once: true });
