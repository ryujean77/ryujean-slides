/* 로그인 · 회원가입 · 내 계정 화면 */
const $ = (s) => document.querySelector(s);
const views = ["v-loading", "v-off", "v-guest", "v-verify", "v-member"];
const show = (id) => views.forEach((v) => { $("#" + v).hidden = v !== id; });
const msg = (t, bad) => { const m = $("#auth-msg"); m.textContent = t || ""; m.classList.toggle("bad", !!bad); };

// 로그인 뒤 돌아갈 곳: 이 사이트 안의 .html 만 (외부 주소로 보내는 오픈 리다이렉트 차단)
const next = new URLSearchParams(location.search).get("next") || "";
const safeNext = /^[a-z0-9-]+\.html(\?[\w=&%.-]*)?(#[\w-]*)?$/i.test(next) ? next : "";

const ERR = {
  "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않습니다.",
  "auth/wrong-password": "이메일 또는 비밀번호가 맞지 않습니다.",
  "auth/user-not-found": "이메일 또는 비밀번호가 맞지 않습니다.",
  "auth/email-already-in-use": "이미 가입된 이메일입니다. 로그인하거나 구글 계정으로 계속해 주세요.",
  "auth/weak-password": "비밀번호를 8자 이상, 영문과 숫자를 섞어 만들어 주세요.",
  "auth/invalid-email": "이메일 형식을 확인해 주세요.",
  "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 해 주세요.",
  "auth/popup-closed-by-user": "로그인 창이 닫혔습니다. 다시 눌러 주세요.",
  "auth/popup-blocked": "팝업이 막혔습니다. 주소창 오른쪽에서 팝업을 허용해 주세요.",
  "auth/requires-recent-login": "보안을 위해 다시 로그인한 뒤 탈퇴해 주세요.",
  "auth/network-request-failed": "인터넷 연결을 확인해 주세요.",
};
const say = (e) => msg(ERR[e && e.code] || "처리하지 못했습니다. 잠시 후 다시 해 주세요.", true);
const busy = async (btn, fn) => { btn.disabled = true; try { await fn(); } catch (e) { say(e); } finally { btn.disabled = false; } };

// 가입 화면에서 고른 [선택] 소식 받기 동의는 이메일 인증을 마친 뒤 서버에 저장된다
const MKT = "mw-mkt-intent"; // myway: 로 시작하면 학습 기록 키로 오인된다
const rememberMkt = (on) => { try { if (on) localStorage.setItem(MKT, "1"); else localStorage.removeItem(MKT); } catch (e) { /* 저장 막힘 */ } };
async function applyMkt(a, me) {
  let want = false;
  try { want = localStorage.getItem(MKT) === "1"; } catch (e) { /* 무시 */ }
  if (!want || !me || me.marketing) return me;
  try { const m = await a.setMarketing(true); rememberMkt(false); return m; } catch (e) { return me; } // 실패하면 다음에 다시
}

let applying = false;
async function render(user, me) {
  if (!user) { $("#auth-title").textContent = "로그인"; return show("v-guest"); }
  if (!user.emailVerified) { $("#auth-title").textContent = "이메일 인증"; $("#verify-email").textContent = user.email; return show("v-verify"); }
  if (!applying) { applying = true; me = await applyMkt(window.mwAuth, me); applying = false; }
  if (safeNext) { location.replace(safeNext); return; }
  $("#auth-title").textContent = "내 계정";
  $("#m-email").textContent = user.email;
  $("#m-name").textContent = (me && me.name) || user.displayName || "—";
  $("#m-tier").textContent = !me ? "확인하지 못함 (새로고침해 주세요)" : me.tier === "paid" ? "유료 회원 — 모든 강의 이용" : "무료 회원 — 무료 강의·맛보기·실습 자료 이용";
  $("#m-since").textContent = me && me.since ? me.since.slice(0, 10) : "—";
  $("#m-uid").textContent = user.uid;
  $("#m-mkt").checked = !!(me && me.marketing);
  $("#m-mkt-at").textContent = me && me.marketing_at ? ` (${me.marketing ? "동의" : "철회"} ${me.marketing_at.slice(0, 10)})` : "";
  $("#m-upgrade").hidden = !!(me && me.tier === "paid");
  $("#m-admin").hidden = !(me && me.admin);
  show("v-member");
}

async function main() {
  const a = window.mwAuth;
  if (!a || a.disabled) return show("v-off");
  const user = await a.ready;
  render(user, a.me);
  document.addEventListener("mw-auth", (e) => render(e.detail.user, e.detail.me));

  $("#btn-google").addEventListener("click", (e) => { rememberMkt($("#mkt-guest").checked); busy(e.currentTarget, () => a.google()); });
  $("#m-mkt").addEventListener("change", (e) => {
    const box = e.currentTarget;
    busy(box, async () => { const m = await a.setMarketing(box.checked); render(a.user, m); msg(box.checked ? "소식 받기에 동의했습니다." : "소식 받기를 철회했습니다."); });
  });
  $("#p-in").addEventListener("submit", (e) => { e.preventDefault(); busy(e.submitter, () => a.signIn($("#in-email").value.trim(), $("#in-pw").value)); });
  $("#p-up").addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = $("#up-pw").value;
    if (!(/[A-Za-z]/.test(pw) && /\d/.test(pw))) return msg("비밀번호에 영문과 숫자를 함께 넣어 주세요.", true);
    rememberMkt($("#mkt-up").checked);
    busy(e.submitter, async () => { await a.signUp($("#up-email").value.trim(), pw); msg("인증 메일을 보냈습니다. 메일함을 확인해 주세요."); });
  });
  $("#btn-reset").addEventListener("click", (e) => {
    const email = $("#in-email").value.trim();
    if (!email) return msg("위 이메일 칸에 주소를 적고 다시 눌러 주세요.", true);
    // 가입 여부와 관계없이 같은 안내 (가입된 이메일 추측 방지)
    busy(e.currentTarget, async () => { try { await a.reset(email); } catch (err) { if (err.code === "auth/invalid-email") throw err; } msg("가입된 이메일이면 비밀번호 재설정 메일이 갑니다."); });
  });
  $("#btn-verified").addEventListener("click", (e) => busy(e.currentTarget, async () => {
    const u = await a.refresh();
    if (!u.emailVerified) msg("아직 인증되지 않았습니다. 메일의 링크를 누른 뒤 다시 눌러 주세요.", true); else msg("인증되었습니다.");
  }));
  $("#btn-resend").addEventListener("click", (e) => busy(e.currentTarget, async () => { await a.resend(); msg("인증 메일을 다시 보냈습니다."); }));
  for (const id of ["#btn-out", "#btn-out2"]) $(id).addEventListener("click", (e) => busy(e.currentTarget, async () => { await a.signOut(); msg("로그아웃했습니다."); }));
  // 탈퇴: 한 번 더 눌러야 실행
  let armed = false;
  $("#btn-withdraw").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!armed) { armed = true; b.textContent = "정말 탈퇴하려면 한 번 더 누르세요"; setTimeout(() => { armed = false; b.textContent = "회원 탈퇴"; }, 6000); return; }
    busy(b, async () => { await a.withdraw(); msg("탈퇴했습니다. 회원 정보를 삭제했습니다."); });
  });
  for (const t of document.querySelectorAll('[role="tab"]')) {
    t.addEventListener("click", () => {
      for (const x of document.querySelectorAll('[role="tab"]')) {
        const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      }
      msg("");
    });
  }
}

if (window.mwAuth) main(); else document.addEventListener("mw-auth-ready", main, { once: true });
