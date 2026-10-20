/* 회원 관리: 목록·검색·등급 변경. 회원이 입력한 값(이름 등)은 textContent 로만 넣는다(HTML 해석 금지). */
const $ = (s) => document.querySelector(s);
const msg = (t, bad) => { const m = $("#adm-msg"); m.textContent = t; m.classList.toggle("bad", !!bad); };
let users = [];

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
    cell(tr, (u.created_at || "").slice(0, 10)); cell(tr, (u.last_seen || "").slice(0, 16).replace("T", " "));
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
  load(a);
}

if (window.mwAuth) main(); else document.addEventListener("mw-auth-ready", main, { once: true });
