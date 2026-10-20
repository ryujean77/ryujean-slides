/* 마이웨이 아카데미 — 회원 로그인 (Firebase Authentication) + 회원 API 호출.
   비밀번호는 Firebase(구글)가 보관한다. 이 사이트와 회원 API 는 비밀번호를 받지도 저장하지도 않는다.
   아래 설정값은 공개용 식별자라 화면 코드에 있어도 된다(권한은 회원 API 가 토큰으로 판단). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, deleteUser,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, reload,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { merge } from "./progress-merge.js";

const FIREBASE = {
  apiKey: "AIzaSyBYQ_H8DxVLZcZXTvA6ZA09tSsq5cw4SVg",
  authDomain: "myway-academy.firebaseapp.com",
  projectId: "myway-academy",
  appId: "1:202979424880:web:23da5e481909ddd97492b5",
};
const API = "https://myway-academy-api.ryujean77.workers.dev";

if (!FIREBASE) {
  window.mwAuth = { disabled: true, ready: Promise.resolve(null) };
} else {
  const auth = getAuth(initializeApp(FIREBASE));
  auth.languageCode = "ko";
  let me = null;
  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));

  async function api(path, opts = {}) {
    const u = auth.currentUser;
    if (!u) throw new Error("로그인이 필요합니다");
    const token = await u.getIdToken();
    return fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: "Bearer " + token } });
  }

  async function loadMe(user) {
    me = null;
    if (user && user.emailVerified) {
      try { const r = await api("/me"); if (r.ok) me = await r.json(); } catch (e) { /* 네트워크 오류: 비회원처럼 */ }
    }
  }

  /* ---------- 학습 기록 동기화 ----------
     화면은 지금처럼 localStorage("myway:<과목>")에 쓰고 읽는다. 로그인하면 그 기록을 계정(회원 서버)과 맞춘다.
     myway:owner 에 주인 uid 를 적어, 같은 PC를 다른 사람이 쓸 때 기록이 섞이지 않게 한다. */
  const KEY = (cid) => "myway:" + cid;
  const OWNER = "myway:owner";
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 막힘 */ } };
  // 학습 기록 키 = catalog.json 의 과목 id 뿐 (다른 myway: 키를 과목으로 오인하지 않게)
  let courseIds = null;
  const loadCourseIds = async () => { if (!courseIds) { try { courseIds = (await (await fetch("catalog.json", { cache: "no-cache" })).json()).courses.map((c) => c.id); } catch (e) { courseIds = []; } } return courseIds; };
  const courseKeys = () => (courseIds || []).map(KEY).filter((k) => { try { return localStorage.getItem(k) !== null; } catch (e) { return false; } });
  let token = null;
  const pending = new Set();
  let timer = null;

  async function push(cids, keepalive) {
    if (!auth.currentUser || !token) return;
    for (const cid of cids) {
      const data = lsGet(KEY(cid));
      if (!data) continue;
      try {
        await fetch(`${API}/progress/${encodeURIComponent(cid)}`, { method: "PUT", keepalive, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(data) });
      } catch (e) { pending.add(cid); }
    }
  }
  function flush(keepalive) { clearTimeout(timer); timer = null; const c = [...pending]; pending.clear(); if (c.length) push(c, keepalive); }
  // app.js 가 기록을 저장할 때마다 알림 → 20초 모아서 보낸다
  document.addEventListener("mw-progress", (e) => {
    if (!auth.currentUser) return;
    pending.add(e.detail.cid);
    if (!timer) timer = setTimeout(async () => { token = await auth.currentUser.getIdToken(); flush(false); }, 20000);
  });
  addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });

  async function syncDown(user) {
    token = await user.getIdToken();
    const r = await api("/progress");
    if (!r.ok) return;
    const server = (await r.json()).courses || {};
    const owner = localStorage.getItem(OWNER);
    const mine = !owner || owner === user.uid; // 로그인 전 기록이거나 내 기록이면 합친다
    let changed = false;
    const known = await loadCourseIds();
    const ids = new Set([...Object.keys(server), ...courseKeys().map((k) => k.slice(6))].filter((id) => known.includes(id)));
    const up = [];
    for (const cid of ids) {
      const local = lsGet(KEY(cid));
      const next = mine ? merge(local, server[cid]) : (server[cid] || null);
      if (JSON.stringify(next) !== JSON.stringify(local)) { changed = true; if (next) lsSet(KEY(cid), next); else localStorage.removeItem(KEY(cid)); }
      if (next && JSON.stringify(next) !== JSON.stringify(server[cid] || null)) up.push(cid);
    }
    try { localStorage.setItem(OWNER, user.uid); } catch (e) { /* 저장 막힘 */ }
    await push(up, false);
    // 다른 기기에서 쌓은 기록을 받아 왔으면 화면을 한 번 새로 그린다
    if (changed && !sessionStorage.getItem("myway:synced")) { sessionStorage.setItem("myway:synced", "1"); location.reload(); await new Promise(() => {}); } // 새로고침 중엔 더 진행하지 않음
  }

  // 로그아웃: 공용 PC에서 다음 사람에게 내 기록·노트가 보이지 않게 지운다(계정에는 남아 있음)
  async function clearLocal() {
    await loadCourseIds();
    for (const k of courseKeys()) localStorage.removeItem(k);
    for (const k of [OWNER, "myway:profile"]) { try { localStorage.removeItem(k); } catch (e) { /* 무시 */ } }
    sessionStorage.removeItem("myway:synced");
  }

  onAuthStateChanged(auth, async (user) => {
    await loadMe(user);
    if (user && user.emailVerified) { try { await syncDown(user); } catch (e) { /* 다음 접속 때 다시 */ } }
    resolveReady(user);
    document.dispatchEvent(new CustomEvent("mw-auth", { detail: { user, me } }));
  });

  window.mwAuth = {
    ready,
    api,
    get user() { return auth.currentUser; },
    get me() { return me; },
    google: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signUp: async (email, pw) => { const c = await createUserWithEmailAndPassword(auth, email, pw); await sendEmailVerification(c.user); return c.user; },
    signIn: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    resend: () => sendEmailVerification(auth.currentUser),
    reset: (email) => sendPasswordResetEmail(auth, email),
    // 인증 메일의 링크를 누른 뒤: 계정 상태와 토큰을 새로 받아 /me 를 다시 읽는다
    refresh: async () => {
      await reload(auth.currentUser);
      await auth.currentUser.getIdToken(true);
      await loadMe(auth.currentUser);
      document.dispatchEvent(new CustomEvent("mw-auth", { detail: { user: auth.currentUser, me } }));
      return auth.currentUser;
    },
    signOut: async () => { flush(false); await signOut(auth); await clearLocal(); },
    setMarketing: async (on) => {
      const r = await api("/me/consent", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marketing: !!on }) });
      if (!r.ok) throw new Error("동의 저장 실패");
      await loadMe(auth.currentUser);
      return me;
    },
    // 탈퇴: 회원 DB 행을 지운 뒤 Firebase 계정 삭제 (오래된 로그인이면 다시 로그인하라는 오류가 난다)
    withdraw: async () => {
      const r = await api("/me", { method: "DELETE" });
      if (!r.ok) throw new Error("탈퇴 처리 실패");
      await deleteUser(auth.currentUser);
      await clearLocal();
    },
  };
}
document.dispatchEvent(new Event("mw-auth-ready"));
